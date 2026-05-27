const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Photo = require("../db/photoModel");

const router = express.Router();

const imagesDir = path.join(__dirname, "..", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, imagesDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

/**
 * POST /photos/new
 * multipart/form-data with field name "file"
 */
router.post("/new", upload.single("file"), async (request, response) => {
  const userId = request.session?.user?._id;

  if (!request.file) {
    return response.status(400).send("No file uploaded");
  }

  try {
    const photo = await Photo.create({
      file_name: request.file.filename,
      date_time: new Date(),
      user_id: userId,
      comments: [],
    });
    return response.status(200).json({ _id: photo._id, file_name: photo.file_name });
  } catch (err) {
    return response.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

module.exports = router;

