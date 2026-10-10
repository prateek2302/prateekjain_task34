import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import Post from "./models/Post.js";
import User from "./models/User.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/users", async (req, res, next) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

app.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.post("/posts", async (req, res, next) => {
  try {
    const { title, content, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "The selected user was not found." });
    }

    const post = await Post.create({ title, content, user: user._id });
    await post.populate("user", "name email");
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

app.get("/posts", async (_req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add it to backend/.env.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Schema Reference API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Unable to start the API:", error.message);
  process.exitCode = 1;
});
