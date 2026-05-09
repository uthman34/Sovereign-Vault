import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import UserModel from "./models/User.js";
import FilesModel from "./models/Files.js";
import AuditModel from "./models/Audit.js";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { initializeEmailService, sendPasswordResetEmail, verifyEmailService } from "./lib/emailService.js";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import cors from "cors";
import multer from "multer";
import net from "net";
import { MongoMemoryServer } from "mongodb-memory-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(process.cwd(), "uploads");

let mongoMemoryServer = null;

const databaseHealth = {
  mode: "Disconnected",
  status: "disconnected",
};

fs.mkdirSync(uploadsDir, { recursive: true });

const isPortAvailable = (port, host = "0.0.0.0") => {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();
    const hasRemoteUri = Boolean(uri)
      && !uri.includes("<password>")
      && !uri.includes("[password]")
      && !uri.includes("replace_me")
      && /^mongodb(\+srv)?:\/\//i.test(uri);

    const connectionUri = hasRemoteUri
      ? uri
      : (mongoMemoryServer || (mongoMemoryServer = await MongoMemoryServer.create({ instance: { dbName: "sovereign_archive" } }))).getUri();

    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    databaseHealth.mode = hasRemoteUri ? "Remote" : "Memory";
    databaseHealth.status = "connected";
    console.log(`MongoDB connected successfully (${databaseHealth.mode})`);
  } catch (err) {
    databaseHealth.mode = "Disconnected";
    databaseHealth.status = "disconnected";
    if (err.message.includes("auth failed") || err.message.includes("bad auth")) {
      console.error("❌ MongoDB Auth Failed: Please check your username and password in the MONGODB_URI.");
      console.error("Ensure special characters in the password are URL-encoded (e.g., '@' as '%40').");
    } else {
      console.error("❌ MongoDB connection error:", err.message);
    }
    console.log("⚠️ App will continue with limited functionality for development.");
  }
};

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);

  if (!(await isPortAvailable(PORT))) {
    throw new Error(`Port ${PORT} is already in use. Stop the process using it or set PORT to a free port, then try again.`);
  }

  await connectDB();
  initializeEmailService();
  await verifyEmailService();
  const app = express();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // CORS Configuration
  const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
  app.use(cors(corsOptions));

  // Use JSON middleware for API routes (with size limit)
  app.use(express.json({ limit: "10kb" }));
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname) || ".bin";
      cb(null, `${crypto.randomUUID()}${extension}`);
    },
  });

  const upload = multer({
    storage: fileStorage,
    limits: {
      fileSize: 500 * 1024 * 1024,
    },
  });

  // Rate limiters
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: "Too many authentication attempts, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: "Too many password reset attempts, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: "Too many password reset attempts, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Validation error handler middleware
  const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  };

  // JWT helper to sign tokens
  const signToken = (userId, email) => {
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );
  };

  // Middleware to verify JWT
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const buildAuditEntry = async ({ userId = null, action, details }) => {
    const lastEntry = await AuditModel.findOne().sort({ timestamp: -1, _id: -1 }).lean();
    const previousHash = lastEntry?.hash || "0000000000000000";
    const timestamp = new Date();
    const payload = {
      userId: userId ? String(userId) : null,
      action,
      details,
      timestamp: timestamp.toISOString(),
      previousHash,
    };
    const hash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    return AuditModel.create({ ...payload, hash, timestamp });
  };

  // --- Authentication API ---
  app.post(
    "/api/auth/signup",
    authLimiter,
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email, password, name } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const user = new UserModel({ email, password, name });
        await user.save();

        const token = signToken(user._id, user.email);
        res.status(201).json({
          message: "Account created successfully",
          token,
          user: { id: user._id, email: user.email, name: user.name }
        });
      } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Registration failed" });
      }
    }
  );

  app.post(
    "/api/auth/signin",
    authLimiter,
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = signToken(user._id, user.email);
        res.json({
          message: "Signed in successfully",
          token,
          user: { id: user._id, email: user.email, name: user.name }
        });
      } catch (err) {
        console.error("Signin error:", err);
        res.status(500).json({ error: "Authentication failed" });
      }
    }
  );

  app.post(
    "/api/auth/forgot-password",
    forgotPasswordLimiter,
    body("email").isEmail().normalizeEmail(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
          // Don't reveal whether email exists (security best practice)
          return res.status(200).json({ message: "If this email exists, a password reset link has been sent" });
        }

        // Generate a secure reset token (valid for 1 hour)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send password reset email
        const emailSent = await sendPasswordResetEmail(user.email, resetToken, user.name);

        if (emailSent) {
          res.json({ message: "If this email exists, a password reset link has been sent" });
        } else {
          res.status(500).json({ error: "Failed to send email. Please try again later" });
        }
      } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Failed to process password reset request" });
      }
    }
  );

  app.post(
    "/api/auth/reset-password",
    resetPasswordLimiter,
    body("email").isEmail().normalizeEmail(),
    body("resetToken").notEmpty().isLength({ min: 64 }).withMessage("Invalid reset token"),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    handleValidationErrors,
    async (req, res) => {
      try {
        const { email, resetToken, newPassword } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: "Invalid reset token" });
        }

        // Validate token and expiry
        if (user.resetToken !== resetToken || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
          return res.status(401).json({ error: "Invalid or expired reset token" });
        }

        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: "Password updated successfully. Please sign in with your new password." });
      } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Password reset failed" });
      }
    }
  );

  // Protected route example
  app.get("/api/auth/me", authLimiter, verifyToken, async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id).select("-password -resetToken -resetTokenExpiry").lean();
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user });
    } catch (err) {
      console.error("Get user error:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Recovery key endpoints
  app.post("/api/auth/generate-recovery-key", verifyToken, async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate a secure random recovery key (12 words style, but hex for simplicity)
      const recoveryKey = crypto.randomBytes(16).toString("hex").toUpperCase();
      const hashedRecoveryKey = crypto.createHash("sha256").update(recoveryKey).digest("hex");

      user.recoveryKey = hashedRecoveryKey;
      user.recoveryKeyUsed = false;
      user.recoveryKeyCreatedAt = new Date();
      await user.save();

      // Return unhashed key only once to user
      res.json({
        message: "Recovery key generated successfully",
        recoveryKey: recoveryKey,
        warning: "Save this key in a safe place. It will not be shown again."
      });
    } catch (err) {
      console.error("Generate recovery key error:", err);
      res.status(500).json({ error: "Failed to generate recovery key" });
    }
  });

  app.get("/api/auth/recovery-key-status", verifyToken, async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id).select("recoveryKey recoveryKeyUsed recoveryKeyCreatedAt");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        hasRecoveryKey: !!user.recoveryKey,
        isUsed: user.recoveryKeyUsed,
        createdAt: user.recoveryKeyCreatedAt
      });
    } catch (err) {
      console.error("Get recovery key status error:", err);
      res.status(500).json({ error: "Failed to fetch recovery key status" });
    }
  });

  app.post("/api/auth/use-recovery-key", async (req, res) => {
    try {
      const { email, recoveryKey } = req.body;

      if (!email || !recoveryKey) {
        return res.status(400).json({ error: "Email and recovery key are required" });
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or recovery key" });
      }

      // Verify recovery key
      const hashedInputKey = crypto.createHash("sha256").update(recoveryKey.trim()).digest("hex");
      if (user.recoveryKey !== hashedInputKey) {
        return res.status(401).json({ error: "Invalid email or recovery key" });
      }

      // Check if recovery key has already been used
      if (user.recoveryKeyUsed) {
        return res.status(401).json({ error: "Recovery key has already been used" });
      }

      // Mark recovery key as used
      user.recoveryKeyUsed = true;
      await user.save();

      // Issue a special token that allows passphrase reset only
      const resetToken = jwt.sign(
        { id: user._id, email: user.email, recoveryMode: true },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Recovery key validated successfully",
        resetToken: resetToken,
        note: "You can now set a new master passphrase for future uploads"
      });
    } catch (err) {
      console.error("Use recovery key error:", err);
      res.status(500).json({ error: "Failed to process recovery key" });
    }
  });

  // API logs endpoints
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await AuditModel.find().sort({ timestamp: 1, _id: 1 }).lean();
      res.json(logs);
    } catch (err) {
      console.error("Logs lookup error:", err);
      res.status(500).json({ error: "Failed to load audit logs" });
    }
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const { action, details, previousHash, hash, timestamp, userId } = req.body || {};

      if (!action || !details) {
        return res.status(400).json({ error: "Invalid log entry" });
      }

      const lastEntry = await AuditModel.findOne().sort({ timestamp: -1, _id: -1 }).lean();
      const resolvedPreviousHash = previousHash || lastEntry?.hash || "0000000000000000";
      const resolvedTimestamp = timestamp ? new Date(timestamp) : new Date();
      const payload = {
        userId: userId || null,
        action,
        details,
        timestamp: resolvedTimestamp.toISOString(),
        previousHash: resolvedPreviousHash,
      };
      const resolvedHash = hash || crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");

      const entry = await AuditModel.create({
        userId: userId || null,
        action,
        details,
        timestamp: resolvedTimestamp,
        previousHash: resolvedPreviousHash,
        hash: resolvedHash,
      });

      res.status(201).json(entry);
    } catch (err) {
      console.error("Save log error:", err);
      res.status(500).json({ error: "Failed to save audit log" });
    }
  });

  app.post("/api/upload", verifyToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Encrypted file is required" });
      }

      const originalName = (req.body.originalName || req.file.originalname || "encrypted-asset").toString();
      const originalSize = Number(req.body.originalSize || req.file.size || 0);
      const mimeType = (req.body.mimeType || "application/octet-stream").toString();

      const storedAsset = await FilesModel.create({
        userId: req.user.id,
        name: originalName,
        size: originalSize,
        type: mimeType,
        date: new Date(),
        storedName: req.file.filename,
        encryptedSize: req.file.size,
        storagePath: req.file.path,
      });

      await buildAuditEntry({
        userId: req.user.id,
        action: "FILE_UPLOAD",
        details: `Uploaded ${originalName}`,
      });

      res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: storedAsset._id,
          name: storedAsset.name,
          size: storedAsset.size,
          type: storedAsset.type,
          date: storedAsset.date,
          originalName: storedAsset.name,
          originalSize: storedAsset.size,
          mimeType: storedAsset.type,
          encryptedSize: storedAsset.encryptedSize,
          uploadDate: storedAsset.date,
          downloadUrl: `/api/files/${storedAsset._id}/download`,
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to store encrypted file" });
    }
  });

  app.get("/api/files", verifyToken, async (req, res) => {
    try {
      const files = await FilesModel.find({ userId: req.user.id }).sort({ date: -1 }).lean();
      res.json({
        files: files.map((file) => ({
          id: file._id,
          name: file.name,
          size: file.size,
          type: file.type,
          date: file.date,
          originalName: file.name,
          originalSize: file.size,
          mimeType: file.type,
          encryptedSize: file.encryptedSize,
          uploadDate: file.date,
          downloadUrl: `/api/files/${file._id}/download`,
        })),
      });
    } catch (err) {
      console.error("Files lookup error:", err);
      res.status(500).json({ error: "Failed to load uploaded files" });
    }
  });

  app.get("/api/files/:id/download", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const file = await FilesModel.findById(id);

      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      if (file.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to access this file" });
      }

      if (!fs.existsSync(file.storagePath)) {
        return res.status(404).json({ error: "File is missing from disk" });
      }

      await buildAuditEntry({
        userId: req.user.id,
        action: "FILE_DOWNLOAD",
        details: `Downloaded ${file.name}`,
      });

      return res.download(file.storagePath, file.storedName);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  app.delete("/api/files/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const file = await FilesModel.findById(id);

      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      if (file.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to delete this file" });
      }

      try {
        await fs.promises.unlink(file.storagePath);
      } catch (unlinkError) {
        if (unlinkError.code !== "ENOENT") {
          throw unlinkError;
        }
      }

      await FilesModel.findByIdAndDelete(id);

      await buildAuditEntry({
        userId: req.user.id,
        action: "FILE_DELETE",
        details: `Deleted ${file.name}`,
      });

      res.json({ message: "File deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // API health endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      database: {
        mode: databaseHealth.mode,
        status: databaseHealth.status,
        readyState: mongoose.connection.readyState,
      },
    });
  });

  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });

  // Vite middleware for development (must come before 404 handler)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || "")
      }
    });
    app.use(vite.middlewares);
    console.log("Vite development server connected to Express with injected environment");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 404 handler (after Vite middleware)
  app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (WebSocket enabled)`);
  });

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Stop the existing process or change PORT, then restart.`);
      process.exit(1);
    }

    console.error("HTTP server error:", err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err.message || err);
  process.exit(1);
});
