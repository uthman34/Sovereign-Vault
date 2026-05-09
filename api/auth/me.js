import { connectDB } from "../../_lib/db.js";
import { verifyTokenMiddleware } from "../../_lib/jwt.js";
import { UserModel } from "../../_lib/db.js";
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

        // Get user from database
        const userData = await UserModel.findById(user.id).select(
            "-password -resetToken -resetTokenExpiry"
        );

        if (!userData) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({ user: userData });
    } catch (err) {
        handleError(err, res, "Get user");
    }
}
