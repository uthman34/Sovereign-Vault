import { connectDB, AuditModel } from "../../_lib/db.js";
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

        // Fetch audit logs
        const logs = await AuditModel.find()
            .sort({ timestamp: 1, _id: 1 })
            .lean();

        res.json(logs);
    } catch (err) {
        handleError(err, res, "Get logs");
    }
}
