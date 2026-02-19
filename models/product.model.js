const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  isScanned: {
    type: Boolean,
    default: false,
  },
  scannedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
