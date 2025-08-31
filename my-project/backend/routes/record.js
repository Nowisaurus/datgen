const express = require("express");
const pool = require("../config/db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Simple health/test
router.get("/test", (req, res) => res.json({ ok: true }));

// List with pagination (?page=1&pageSize=20)
router.get("/", auth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
    const offset = (page - 1) * pageSize;

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM records");
    const [rows] = await pool.query(
      "SELECT * FROM records ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [pageSize, offset]
    );

    return res.json({ page, pageSize, total, rows });
  } catch (e) {
    console.error("[records/list]", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create a record
router.post("/", auth, async (req, res) => {
  try {
    const { fieldName, fieldType, fieldValue } = req.body || {};
    if (!fieldName || !fieldType || typeof fieldValue === "undefined") {
      return res.status(400).json({ message: "fieldName, fieldType, fieldValue are required" });
    }

    await pool.query(
      "INSERT INTO records (fieldName, fieldType, fieldValue) VALUES (?, ?, ?)",
      [fieldName, fieldType, String(fieldValue)]
    );
    return res.json({ message: "Created" });
  } catch (e) {
    console.error("[records/create]", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update
router.put("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fieldName, fieldType, fieldValue } = req.body || {};
    if (!id) return res.status(400).json({ message: "Invalid id" });

    await pool.query(
      "UPDATE records SET fieldName=?, fieldType=?, fieldValue=? WHERE id=?",
      [fieldName, fieldType, String(fieldValue), id]
    );
    return res.json({ message: "Updated" });
  } catch (e) {
    console.error("[records/update]", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    await pool.query("DELETE FROM records WHERE id=?", [id]);
    return res.json({ message: "Deleted" });
  } catch (e) {
    console.error("[records/delete]", e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
