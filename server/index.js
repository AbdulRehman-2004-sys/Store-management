import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import orderRoute from "./routes/orderRoute.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://taimoor-akram-brothers.netlify.app", // frontend URL
  credentials: true, // allow credentials (cookies, authorization headers, etc.)
}));

// DB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Routes properly defined
app.use("/api/sessions", orderRoute);
app.use("/api/auth", authRoute);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
