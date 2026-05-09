import { connectDB, UserModel } from "../../_lib/db.js";
import { signToken } from "../../_lib/jwt.js";
import { handleError, handleCors, setCorsHeaders } from "../../_lib/errors.js";

function validateSignin(data) {
    const errors = [];

    if (!data.email || !data.email.includes("@")) {
        errors.push("Valid email is required");
    }

    if (!data.password) {
        errors.push("Password is required");
    }

    return errors;
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
        const { email, password } = req.body;

        // Validate input
        const errors = validateSignin({ email, password });
        if (errors.length > 0) {
            res.status(400).json({ error: errors[0] });
            return;
        }

        // Find user and verify password
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const token = signToken(user._id, user.email);
        res.json({
            message: "Signed in successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (err) {
        handleError(err, res, "Signin");
    }
}
