const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();

/**
 * GET /user/list
 * Returns the list of users with only _id, first_name, last_name.
 * Also includes photo_count and comment_count for Extra Credit.
 */
router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name");

    const allPhotos = await Photo.find({}, "user_id comments.user_id");

    const userList = users.map((user) => {
      const userId = user._id;

      const photoCount = allPhotos.filter(
        (photo) => photo.user_id.toString() === userId.toString()
      ).length;

      let commentCount = 0;
      allPhotos.forEach((photo) => {
        if (photo.comments) {
          photo.comments.forEach((comment) => {
            if (
              comment.user_id &&
              comment.user_id.toString() === userId.toString()
            ) {
              commentCount++;
            }
          });
        }
      });

      return {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_count: photoCount,
        comment_count: commentCount,
      };
    });

    response.status(200).json(userList);
  } catch (error) {
    response.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

/**
 * GET /user/:id
 * Returns detailed information of a specific user.
 */
router.get("/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: `Invalid user id: ${id}` });
  }

  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation");

    if (!user) {
      return response.status(400).json({ error: `User with id ${id} not found` });
    }

    response.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
  } catch (error) {
    response.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

/**
 * POST /user
 * Register a new user.
 */
router.post("/", async (request, response) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = request.body || {};

  if (typeof login_name !== "string" || login_name.trim() === "") {
    return response.status(400).send("login_name must be a non-empty string");
  }
  if (typeof password !== "string" || password.trim() === "") {
    return response.status(400).send("password must be a non-empty string");
  }
  if (typeof first_name !== "string" || first_name.trim() === "") {
    return response.status(400).send("first_name must be a non-empty string");
  }
  if (typeof last_name !== "string" || last_name.trim() === "") {
    return response.status(400).send("last_name must be a non-empty string");
  }

  try {
    const existing = await User.findOne({ login_name: login_name.trim() }, "_id");
    if (existing) {
      return response.status(400).send("login_name already exists");
    }

    const user = await User.create({
      login_name: login_name.trim(),
      password,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: typeof location === "string" ? location : "",
      description: typeof description === "string" ? description : "",
      occupation: typeof occupation === "string" ? occupation : "",
    });

    return response.status(200).json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    return response.status(500).json({ error: "Internal server error", detail: error.message });
  }
});

module.exports = router;
