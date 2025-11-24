import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

export const authRouter = express.Router();

const signToken = (userId) => {
	const secret = process.env.JWT_SECRET || "supersecretjwtkey";
	return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

// Register organisasi
authRouter.post("/register", async (req, res) => {
	try {
		const { namaOrganisasi, akunOrganisasi, email, password } = req.body;

		if (!namaOrganisasi || !akunOrganisasi || !email || !password) {
			return res.status(400).json({ message: "Semua field wajib diisi" });
		}

		const emailLower = email.toLowerCase();
		if (!emailLower.endsWith("@student.its.ac.id")) {
			return res
				.status(400)
				.json({
					message:
						"Email harus menggunakan domain @student.its.ac.id",
				});
		}

		const existingUser = await User.findOne({
			$or: [{ akunOrganisasi }, { email: emailLower }],
		});

		if (existingUser) {
			return res
				.status(400)
				.json({
					message: "Akun organisasi atau email sudah terdaftar",
				});
		}

		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		const user = await User.create({
			namaOrganisasi,
			akunOrganisasi,
			email: emailLower,
			passwordHash,
			status: "aktif",
		});

		const token = signToken(user._id);

		return res.status(201).json({
			message:
				"Registrasi berhasil. Silakan login dengan akun organisasi Anda.",
			token,
			user: {
				id: user._id,
				namaOrganisasi: user.namaOrganisasi,
				akunOrganisasi: user.akunOrganisasi,
				email: user.email,
				status: user.status,
			},
		});
	} catch (err) {
		console.error("Register error:", err);
		return res.status(500).json({ message: "Terjadi kesalahan server" });
	}
});

// Login
authRouter.post("/login", async (req, res) => {
	try {
		const { akunOrganisasi, password } = req.body;

		if (!akunOrganisasi || !password) {
			return res
				.status(400)
				.json({ message: "Akun organisasi dan password wajib diisi" });
		}

		const user = await User.findOne({ akunOrganisasi });
		if (!user) {
			return res
				.status(400)
				.json({ message: "Akun organisasi tidak ditemukan" });
		}

		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) {
			return res.status(400).json({ message: "Password salah" });
		}

		const token = signToken(user._id);

		return res.json({
			token,
			user: {
				id: user._id,
				namaOrganisasi: user.namaOrganisasi,
				akunOrganisasi: user.akunOrganisasi,
				email: user.email,
				status: user.status,
			},
		});
	} catch (err) {
		console.error("Login error:", err);
		return res.status(500).json({ message: "Terjadi kesalahan server" });
	}
});

// Get profile
authRouter.get("/me", authRequired, async (req, res) => {
	return res.json({ user: req.user });
});
