import { connectDB, FilesModel } from "../../../_lib/db.js";
import { verifyTokenMiddleware } from "../../../_lib/jwt.js";
import { handleError, handleCors, setCorsHeaders } from "../../../_lib/errors.js";
import { buildAuditEntry } from "../../../_lib/audit.js";
import mongoose from "mongoose";

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (handleCors(req, res)) return;

    if (req.method !== "DELETE") {
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
            res.status(403).json({ error: "Unauthorized to delete this file" });
            return;
        }

        // Delete the file
        await FilesModel.findByIdAndDelete(id);

        // Log the deletion
        await buildAuditEntry({
            userId: user.id,
            action: "FILE_DELETE",
            details: `Deleted ${file.name}`,
        });

        res.json({ message: "File deleted successfully" });
    } catch (err) {
        handleError(err, res, "Delete");
    }
}
