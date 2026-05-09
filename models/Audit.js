import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  previousHash: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true,
  },
});

auditSchema.index({ timestamp: 1, _id: 1 });

const Audit = mongoose.model("Audit", auditSchema);

export default Audit;