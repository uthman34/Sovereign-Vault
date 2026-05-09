export function handleError(err, res, context = "Operation") {
    console.error(`${context} error:`, err);

    if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
    }

    if (err.name === "CastError") {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ error: `${field} already exists` });
    }

    res.status(500).json({ error: `${context} failed` });
}

export function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json",
    };
}

export function setCorsHeaders(res) {
    Object.entries(corsHeaders()).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
}

// Handle OPTIONS preflight requests
export function handleCors(req, res) {
    if (req.method === "OPTIONS") {
        setCorsHeaders(res);
        res.status(200).end();
        return true;
    }
    return false;
}
