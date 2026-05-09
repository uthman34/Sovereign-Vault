import mongoose from "mongoose";

const filesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    size: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        default: "application/octet-stream",
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
    storedName: {
        type: String,
        required: true,
        trim: true,
    },
    encryptedSize: {
        type: Number,
        required: true,
        min: 0,
    },
    storagePath: {
        type: String,
        required: false,
        trim: true,
    },
    encryptedData: {
        type: Buffer,
        required: false,
    },
});

filesSchema.index({ userId: 1, date: -1 });

const Files = mongoose.model("Files", filesSchema);

export default Files;