import mongoose from "mongoose";

const fileAssetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    originalName: {
        type: String,
        required: true,
        trim: true,
    },
    originalSize: {
        type: Number,
        required: true,
        min: 0,
    },
    mimeType: {
        type: String,
        default: "application/octet-stream",
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
        required: true,
        trim: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

const FileAsset = mongoose.model("FileAsset", fileAssetSchema);

export default FileAsset;