const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");

// Create product + serial
router.post("/create", controller.createProduct);

// Get barcode image
router.get("/barcode/:serial", controller.generateBarcode);

// Scan serial
router.post("/scan", controller.scanProduct);


router.post("/bulk", controller.bulkGenerate);

router.get("/scanned", controller.getScannedList);

router.post("/download-pdf", controller.downloadBarcodesPDF);

module.exports = router;
