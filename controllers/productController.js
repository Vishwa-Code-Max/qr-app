const Product = require("../models/product.model");
const bwipjs = require("bwip-js");
const { v4: uuidv4 } = require("uuid");
const ScanLog = require("../models/scanlog.model");

// ✅ Create Product + Generate Serial
exports.createProduct = async (req, res) => {
  try {
    const serial = "PRD-" + uuidv4().slice(0, 8).toUpperCase();

    const product = await Product.create({
      serialNumber: serial
    });

    res.json({
      message: "Product created",
      product
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Generate Barcode Image
exports.generateBarcode = async (req, res) => {
  try {
    const { serial } = req.params;

    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: serial,
      scale: 3,
      height: 10,
      includetext: true,
    });

    res.set("Content-Type", "image/png");
    res.send(png);

  } catch (error) {
    res.status(500).json({ error: "Barcode generation failed" });
  }
};


// ✅ Scan & Detect Duplicate
exports.scanProduct = async (req, res) => {
  try {
    const { serialNumber } = req.body;

    const product = await Product.findOne({ serialNumber });

    if (!product) {
      return res.status(404).json({ message: "Serial not found" });
    }

    // 🔴 If already scanned → send previous data
    if (product.isScanned) {
      return res.json({
        duplicate: true,
        message: "Duplicate Scan",
        previous: {
          serialNumber: product.serialNumber,
          scannedAt: product.scannedAt,
          ticketNumber: product.ticketNumber || null, // optional
        },
      });
    }

    // 🟢 First time scan
    product.isScanned = true;
    product.scannedAt = new Date();
    await product.save();

    await ScanLog.create({
      serialNumber,
      scannedAt: product.scannedAt,
    });

    res.json({
      duplicate: false,
      message: "Scan Successful",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// 🔹 Bulk Generate
exports.bulkGenerate = async (req, res) => {
  try {
    const { count } = req.body;

    if (!count || count <= 0) {
      return res.status(400).json({ message: "Invalid count" });
    }

    let products = [];

    for (let i = 0; i < count; i++) {
      const serial = "PRD-" + uuidv4().slice(0, 8).toUpperCase();

      const product = await Product.create({
        serialNumber: serial
      });

      products.push(product);
    }

    res.json({
      message: `${count} barcodes generated`,
      products
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScannedList = async (req, res) => {
  const logs = await ScanLog.find().sort({ scannedAt: -1 });
  res.json(logs);
};


const PDFDocument = require("pdfkit");


exports.downloadBarcodesPDF = async (req, res) => {
  try {
    const { serials } = req.body;

    if (!serials || serials.length === 0) {
      return res.status(400).json({ message: "No serials provided" });
    }

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=barcodes.pdf"
    );

    doc.pipe(res);

    for (let i = 0; i < serials.length; i++) {
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: "code128",
        text: serials[i],
        scale: 3,
        height: 10,
        includetext: true,
      });

      doc.image(barcodeBuffer, {
        fit: [250, 100],
        align: "left",
      });

      doc.moveDown(2);

      // Add new page every 6 barcodes
      if ((i + 1) % 6 === 0) {
        doc.addPage();
      }
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
