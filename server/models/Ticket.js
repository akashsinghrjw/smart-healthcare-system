import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    msg: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "RESOLVED"], default: "PENDING" },
    adminReply: { type: String, default: "" },
    date: { type: String, default: () => new Date().toLocaleDateString() },
    time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    resolvedAt: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);