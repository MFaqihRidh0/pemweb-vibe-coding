import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { itemRouter } from "./routes/itemRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
	cors({
		origin: CLIENT_URL,
		credentials: true,
	})
);
app.use(express.json());

// ➜ tambahkan ini supaya foto di /uploads bisa diakses dari frontend
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// routes API utama
app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);

// ➜ MOUNT route upload di /api/upload
app.use("/api/upload", uploadRouter);

app.get("/", (req, res) => {
	res.json({ message: "Bagibarang ITS API" });
});

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`);
	});
});
