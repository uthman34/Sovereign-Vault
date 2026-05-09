import { connectDB, FilesModel, AuditModel } from "../../_lib/db.js";
import { verifyTokenMiddleware } from "../../_lib/jwt.js";
import { handleError, handleCors, setCorsHeaders } from "../../_lib/errors.js";

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

        // Fetch user's files
        const files = await FilesModel.find({ userId: user.id })
            .sort({ date: -1 })
            .lean();

        const formattedFiles = files.map((file) => ({
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
        }));

        res.json({ files: formattedFiles });
    } catch (err) {
        handleError(err, res, "Get files");
    }
}
