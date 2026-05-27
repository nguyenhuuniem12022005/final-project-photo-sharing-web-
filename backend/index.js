const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const CommentsRouter = require("./routes/CommentsRouter");
const PhotosRouter = require("./routes/PhotosRouter");

dbConnect();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    name: "photo-sharing.sid",
    secret: process.env.SESSION_SECRET || "photo-sharing-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

// Authentication guard: everything requires login except login/logout + registration.
app.use((request, response, next) => {
  const p = request.path || "";
  const isLogin = request.method === "POST" && p === "/admin/login";
  const isLogout = request.method === "POST" && p === "/admin/logout";
  const isRegister = request.method === "POST" && p === "/user";
  const isRoot = request.method === "GET" && p === "/";
  if (isLogin || isLogout || isRegister) return next();
  if (isRoot) return next();

  if (!request.session?.user?._id) {
    return response.status(401).send("Unauthorized");
  }
  return next();
});

app.use("/admin", AdminRouter);
app.use("/user", UserRouter);
app.use("/photosOfUser", PhotoRouter);
app.use("/commentsOfPhoto", CommentsRouter);
app.use("/photos", PhotosRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
