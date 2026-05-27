const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

/**
 * GET /photosOfUser/:id
 * Returns all photos of a user with populated comment data.
 * Each comment includes the user object { _id, first_name, last_name }.
 */
router.get("/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: `Invalid user id: ${id}` });
  }

  try {
    const user = await User.findById(id, "_id");
    if (!user) {
      return response.status(400).json({ error: `User with id ${id} not found` });
    }

    const photos = await Photo.find({ user_id: id });

    const allUserIds = new Set();
    photos.forEach((photo) => {
      if (photo.comments) {
        photo.comments.forEach((comment) => {
          if (comment.user_id) {
            allUserIds.add(comment.user_id.toString());
          }
        });
      }
    });

    const usersArray = await User.find(
      { _id: { $in: Array.from(allUserIds) } },
      "_id first_name last_name"
    );
    const userMap = {};
    usersArray.forEach((u) => {
      userMap[u._id.toString()] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

    const result = photos.map((photo) => {
      const comments = (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userMap[comment.user_id ? comment.user_id.toString() : ""] || null,
      }));

      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments,
      };
    });

    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

module.exports = router;
