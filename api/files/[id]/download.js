import { connectDB, FilesModel } from "../../../_lib/db.js";
import { verifyTokenMiddleware } from "../../../_lib/jwt.js";
import { handleError, handleCors, setCorsHeaders } from "../../../_lib/errors.js";
import { buildAuditEntry } from "../../../_lib/audit.js";
import mongoose from "mongoose";

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (handleCors(req, res)) return;

    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        await connectDB();

        // Verify token
        const user = verifyTokenMiddleware(req, res);
        if (!user) return;

        const { id } = req.query;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid file ID" });
            return;
        }

        // Find file
        const file = await FilesModel.findById(id);

        if (!file) {
            res.status(404).json({ error: "File not found" });
            return;
        }

        // Check authorization
        if (file.userId.toString() !== user.id) {
            res.status(403).json({ error: "Unauthorized to access this file" });
            return;
        }

        // Check if encrypted data exists
        if (!file.encryptedData) {
            res.status(404).json({ error: "File data is missing" });
            return;
        }

        // Log the download
        await buildAuditEntry({
            userId: user.id,
            action: "FILE_DOWNLOAD",
            details: `Downloaded ${file.name}`,
        });

        // Set response headers for file download
        res.setHeader("Content-Type", file.type || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${file.storedName}"`);
        res.setHeader("Content-Length", file.encryptedData.length);

        // Send the encrypted file data directly as binary
        res.status(200).end(file.encryptedData);
    } catch (err) {
        handleError(err, res, "Download");
    }
}
