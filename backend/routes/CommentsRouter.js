const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");

const router = express.Router();

/**
 * POST /commentsOfPhoto/:photo_id
 * Body: { comment: "..." }
 */
router.post("/:photo_id", async (request, response) => {
  const { photo_id } = request.params;
  const userId = request.session?.user?._id;

  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    return response.status(400).json({ error: `Invalid photo id: ${photo_id}` });
  }

  const commentText = request.body?.comment;
  if (typeof commentText !== "string" || commentText.trim() === "") {
    return response.status(400).send("comment must be a non-empty string");
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return response.status(400).json({ error: `Photo with id ${photo_id} not found` });
    }

    photo.comments = photo.comments.concat([
      { comment: commentText.trim(), user_id: userId, date_time: new Date() },
    ]);
    await photo.save();

    return response.status(200).json({ ok: true });
  } catch (err) {
    return response.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

module.exports = router;

