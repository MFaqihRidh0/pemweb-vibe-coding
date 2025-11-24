import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
	{
		pemilik: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		namaBarang: { type: String, required: true },
		kategori: { type: String, required: true },
		deskripsi: { type: String },
		kondisiUmum: { type: String, default: "Baik" },
		jumlah: { type: Number, required: true, min: 0 },
		lokasiPenyimpanan: { type: String },
		fotoUrl: { type: String },

		// Kontak
		kontakNama: { type: String },
		kontakWhatsapp: { type: String },

		// Status barang: Hibah / Pinjam / Jual
		statusBarang: {
			type: String,
			enum: ["Hibah", "Pinjam", "Jual"],
			default: "Hibah",
		},

		// Harga (hanya dipakai kalau statusBarang = "Jual")
		harga: {
			type: Number,
			min: 0,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const Item = mongoose.model("Item", itemSchema);
