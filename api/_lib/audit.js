import crypto from "crypto";
import { AuditModel } from "./db.js";

export async function buildAuditEntry({ userId = null, action, details }) {
    try {
        const lastEntry = await AuditModel.findOne()
            .sort({ timestamp: -1, _id: -1 })
            .lean();
        const previousHash = lastEntry?.hash || "0000000000000000";
        const timestamp = new Date();
        const payload = {
            userId: userId ? String(userId) : null,
            action,
            details,
            timestamp: timestamp.toISOString(),
            previousHash,
        };
        const hash = crypto
            .createHash("sha256")
            .update(JSON.stringify(payload))
            .digest("hex");
        return AuditModel.create({ ...payload, hash, timestamp });
    } catch (err) {
        console.error("Audit entry creation error:", err);
        // Don't fail the request if audit logging fails
        return null;
    }
}
