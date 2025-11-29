// models/Portfolio.js (ESM, export default)
import mongoose from "mongoose";
const { Schema } = mongoose;

const PortfolioSchema = new Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  sections: { type: Array, default: [] }, // can be array of objects in your real schema
  themeId: { type: mongoose.Schema.Types.ObjectId, default: null },
  contactButtonEnabled: { type: Boolean, default: false },
  contactEmail: { type: String, default: null },
  isExample: { type: Boolean, default: false },
  copiedFromPortfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Portfolio ||
  mongoose.model("Portfolio", PortfolioSchema);
