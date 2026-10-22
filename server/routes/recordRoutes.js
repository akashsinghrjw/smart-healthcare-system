
const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");
const { protect } = require("../middleware/authMiddleware");

// GET: Admin gets all reports; patient gets only own reports
router.get("/", protect, async (req, res) => {
  try {
    const isAdmin =
      String(req.user.role || "").toLowerCase() === "admin";

    const filter = isAdmin ? {} : { user: req.user._id };

    const records = await MedicalRecord.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(
      records.map((record) => ({
        ...record,
        id: String(record._id),
        patientName: record.patientName || "Patient",
        patientEmail: record.patientEmail || "",
        title: record.title || "Medical Report",
        fileName: record.fileName || "",
      }))
    );
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ message: "Unable to load reports." });
  }
});

// POST: Save report in MongoDB
router.post("/", protect, async (req, res) => {
  try {
    const { title, type, date, fileName, fileData } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        message: "Report title is required.",
      });
    }

    if (!fileData) {
      return res.status(400).json({
        message: "Report file is required.",
      });
    }

    const record = await MedicalRecord.create({
      user: req.user._id,
      patientEmail: req.user.email,
      patientName: req.user.name || "Patient",
      title: String(title).trim(),
      type: type || "Other",
      date: date || new Date(),
      fileName: fileName || "",
      fileData,
    });

    res.status(201).json({
      message: "Report uploaded successfully.",
      record: {
        ...record.toObject(),
        id: String(record._id),
      },
    });
  } catch (err) {
    console.error("Save report error:", err);
    res.status(500).json({ message: "Unable to save report." });
  }
});

// DELETE: Admin can delete any report; patient only own report
router.delete("/:id", protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Report not found." });
    }

    const isAdmin =
      String(req.user.role || "").toLowerCase() === "admin";
    const isOwner =
      String(record.user) === String(req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    await record.deleteOne();

    res.status(200).json({
      message: "Report deleted successfully.",
    });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ message: "Unable to delete report." });
  }
});

module.exports = router;
