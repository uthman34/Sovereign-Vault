import { connectDB, FilesModel, AuditModel } from "../../_lib/db.js";
import { verifyTokenMiddleware } from "../../_lib/jwt.js";
import { handleError, handleCors, setCorsHeaders } from "../../_lib/errors.js";
import { buildAuditEntry } from "../../_lib/audit.js";
import mongoose from "mongoose";

// Parse multipart form data
async function parseFormData(req) {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
        throw new Error("Content-Type must be multipart/form-data");
    }

    // For now, we'll expect the body to be a Buffer
    // In production, you might want to use a library like formidable or multipart
    return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0);

        req.on("data", (chunk) => {
            data = Buffer.concat([data, chunk]);

            // Prevent extremely large uploads
            if (data.length > 500 * 1024 * 1024) {
                req.pause();
                reject(new Error("File too large"));
            }
        });

        req.on("end", () => resolve(data));
        req.on("error", reject);
    });
}

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (handleCors(req, res)) return;

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        await connectDB();

        // Verify token
        const user = verifyTokenMiddleware(req, res);
        if (!user) return;

        // Get form data from request body
        const { originalName, originalSize, mimeType, encryptedData } = req.body;

        if (!originalName || !originalSize || !encryptedData) {
            res.status(400).json({ error: "Missing required fields: originalName, originalSize, encryptedData" });
            return;
        }

        // Convert base64 string to Buffer if needed
        let fileBuffer;
        if (typeof encryptedData === "string") {
            fileBuffer = Buffer.from(encryptedData, "base64");
        } else {
            fileBuffer = encryptedData;
        }

        // Create file record in MongoDB with binary data stored
        const storedAsset = await FilesModel.create({
            userId: user.id,
            name: originalName,
            size: originalSize,
            type: mimeType || "application/octet-stream",
            date: new Date(),
            encryptedSize: fileBuffer.length,
            encryptedData: fileBuffer,
            storedName: `${Date.now()}-${originalName}`,
        });

        // Log the upload
        await buildAuditEntry({
            userId: user.id,
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
        handleError(err, res, "Upload");
    }
}
