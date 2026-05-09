import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

export function signToken(userId, email) {
    return jwt.sign({ id: userId, email }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
}

export function extractToken(authHeader) {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
}

export function verifyTokenMiddleware(req, res) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        res.status(401).json({ error: "Invalid or expired token" });
        return null;
    }

    return decoded;
}
