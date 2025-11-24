import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

export const uploadRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", "..", "uploads"));
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + "-" + uniqueSuffix + ext);
	},
});

const upload = multer({ storage });

uploadRouter.post("/", upload.single("file"), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ message: "File tidak ditemukan" });
	}
	const filePath = `/uploads/${req.file.filename}`;
	res.status(201).json({ url: filePath });
});
