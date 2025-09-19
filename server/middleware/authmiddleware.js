import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import dotenv from "dotenv";
dotenv.config();

// Protect middleware
export const protect = async (req, res, next) => {
  let token;

  // ✅ Check token from cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // ✅ OR from Bearer header (optional fallback)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
