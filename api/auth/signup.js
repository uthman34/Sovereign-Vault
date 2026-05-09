import { connectDB, UserModel } from "../_lib/db.js";
import { signToken } from "../_lib/jwt.js";
import { handleError, handleCors, setCorsHeaders } from "../_lib/errors.js";
import { body, validationResult } from "express-validator";

// Simple validation helper (express-validator middleware won't work in serverless)
function validateSignup(data) {
    const errors = [];

    if (!data.email || !data.email.includes("@")) {
        errors.push("Valid email is required");
    }

    if (!data.password || data.password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (!data.name || data.name.length < 2) {
        errors.push("Name must be at least 2 characters");
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
        const { email, password, name } = req.body;

        // Validate input
        const errors = validateSignup({ email, password, name });
        if (errors.length > 0) {
            res.status(400).json({ error: errors[0] });
            return;
        }

        // Check if user exists
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ error: "Email already registered" });
            return;
        }

        // Create user
        const user = new UserModel({
            email: email.toLowerCase(),
            password,
            name,
        });
        await user.save();

        const token = signToken(user._id, user.email);
        res.status(201).json({
            message: "Account created successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (err) {
        handleError(err, res, "Signup");
    }
}
