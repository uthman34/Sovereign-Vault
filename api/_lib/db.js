import mongoose from "mongoose";
import UserModel from "../../models/User.js";
import FilesModel from "../../models/Files.js";
import AuditModel from "../../models/Audit.js";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose
            .connect(process.env.MONGODB_URI || "", opts)
            .then((mongoose) => mongoose);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export { UserModel, FilesModel, AuditModel };
