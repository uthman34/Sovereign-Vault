import { connectDB } from "../../_lib/db.js";
import { handleCors, setCorsHeaders } from "../../_lib/errors.js";
import mongoose from "mongoose";

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (handleCors(req, res)) return;

    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const conn = await connectDB();

        res.json({
            status: "ok",
            timestamp: new Date(),
            environment: process.env.NODE_ENV || "production",
            database: {
                connected: !!conn && mongoose.connection.readyState === 1,
                readyState: mongoose.connection.readyState,
            },
        });
    } catch (err) {
        res.status(503).json({
            status: "error",
            timestamp: new Date(),
            error: "Database connection failed",
        });
    }
}
