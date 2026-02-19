const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema({
  serialNumber: String,
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ScanLog", scanLogSchema);
