const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

router.post("/login", async (request, response) => {
  const { login_name, password } = request.body || {};

  if (typeof login_name !== "string" || login_name.trim() === "") {
    return response.status(400).send("login_name is required");
  }

  try {
    const user = await User.findOne(
      { login_name: login_name.trim() },
      "_id login_name first_name last_name password"
    );
    if (!user) {
      return response.status(400).send("Invalid login_name");
    }
    if (typeof password !== "string" || password.trim() === "") {
      return response.status(400).send("Password is required");
    }
    if (user.password !== password) {
      return response.status(400).send("Invalid password");
    }

    request.session.user = { _id: user._id.toString(), login_name: user.login_name };

    return response.status(200).json({
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (err) {
    return response.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

router.post("/logout", (request, response) => {
  if (!request.session?.user?._id) {
    return response.status(400).send("Not logged in");
  }
  request.session.user = null;
  return response.status(200).json({ ok: true });
});

router.get("/session", async (request, response) => {
  if (!request.session?.user?._id) {
    return response.status(200).json({ loggedIn: false });
  }
  try {
    const user = await User.findById(request.session.user._id, "_id login_name first_name last_name");
    if (!user) {
      request.session.user = null;
      return response.status(200).json({ loggedIn: false });
    }
    return response.status(200).json({
      loggedIn: true,
      user: { _id: user._id, login_name: user.login_name, first_name: user.first_name, last_name: user.last_name },
    });
  } catch (err) {
    return response.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

module.exports = router;

