import express from "express";
import { Item } from "../models/Item.js";
import { authRequired } from "../middleware/auth.js";

export const itemRouter = express.Router();

const STATUS_LIST = ["Hibah", "Pinjam", "Jual"];

// List semua barang (semua organisasi)
itemRouter.get("/", authRequired, async (req, res) => {
	try {
		const items = await Item.find()
			.populate("pemilik", "namaOrganisasi akunOrganisasi")
			.sort({ createdAt: -1 });

		res.json(items);
	} catch (err) {
		console.error("Get items error:", err);
		res.status(500).json({ message: "Gagal mengambil data barang" });
	}
});

// List barang milik organisasi yang sedang login
itemRouter.get("/mine", authRequired, async (req, res) => {
	try {
		const items = await Item.find({ pemilik: req.user._id }).sort({
			createdAt: -1,
		});
		res.json(items);
	} catch (err) {
		console.error("Get my items error:", err);
		res.status(500).json({ message: "Gagal mengambil data barang" });
	}
});

// Detail 1 barang
itemRouter.get("/:id", authRequired, async (req, res) => {
	try {
		const item = await Item.findById(req.params.id).populate(
			"pemilik",
			"namaOrganisasi akunOrganisasi"
		);

		if (!item) {
			return res.status(404).json({ message: "Barang tidak ditemukan" });
		}

		res.json(item);
	} catch (err) {
		console.error("Get item error:", err);
		res.status(500).json({ message: "Gagal mengambil detail barang" });
	}
});

// Tambah barang baru
itemRouter.post("/", authRequired, async (req, res) => {
	try {
		const {
			namaBarang,
			kategori,
			deskripsi,
			kondisiUmum,
			jumlah,
			lokasiPenyimpanan,
			fotoUrl,
			kontakNama,
			kontakWhatsapp,
			statusBarang,
			harga,
		} = req.body;

		if (!namaBarang || !kategori || jumlah == null) {
			return res
				.status(400)
				.json({ message: "Nama, kategori, dan jumlah wajib diisi" });
		}

		const jumlahNumber = Number(jumlah);
		if (Number.isNaN(jumlahNumber) || jumlahNumber < 0) {
			return res
				.status(400)
				.json({
					message:
						"Jumlah harus berupa angka lebih besar atau sama dengan 0",
				});
		}

		// Validasi nomor WhatsApp: hanya boleh angka 0-9 jika diisi
		if (kontakWhatsapp) {
			const digitsOnly = kontakWhatsapp.replace(/[^0-9]/g, "");
			if (digitsOnly.length !== kontakWhatsapp.length) {
				return res
					.status(400)
					.json({
						message: "Nomor WhatsApp hanya boleh berisi angka 0-9",
					});
			}
		}

		// Validasi status barang
		let finalStatus = statusBarang || "Hibah";
		if (!STATUS_LIST.includes(finalStatus)) {
			return res
				.status(400)
				.json({ message: "Status barang tidak valid" });
		}

		// Validasi harga kalau status = Jual
		let finalHarga = 0;
		if (finalStatus === "Jual") {
			if (harga == null || harga === "") {
				return res
					.status(400)
					.json({
						message:
							"Harga wajib diisi untuk barang dengan status Jual",
					});
			}
			const hargaNumber = Number(harga);
			if (Number.isNaN(hargaNumber) || hargaNumber < 0) {
				return res
					.status(400)
					.json({
						message:
							"Harga harus berupa angka lebih besar atau sama dengan 0",
					});
			}
			finalHarga = hargaNumber;
		}

		const item = await Item.create({
			pemilik: req.user._id,
			namaBarang,
			kategori,
			deskripsi,
			kondisiUmum,
			jumlah: jumlahNumber,
			lokasiPenyimpanan,
			fotoUrl,
			kontakNama,
			kontakWhatsapp,
			statusBarang: finalStatus,
			harga: finalHarga,
		});

		res.status(201).json(item);
	} catch (err) {
		console.error("Create item error:", err);
		res.status(500).json({ message: "Gagal menambah barang" });
	}
});

// Edit barang
itemRouter.put("/:id", authRequired, async (req, res) => {
	try {
		const item = await Item.findById(req.params.id);
		if (!item) {
			return res.status(404).json({ message: "Barang tidak ditemukan" });
		}

		// Hanya pemilik yang boleh edit
		if (item.pemilik.toString() !== req.user._id.toString()) {
			return res
				.status(403)
				.json({ message: "Anda tidak berhak mengubah barang ini" });
		}

		const updateData = { ...req.body };

		// Validasi jumlah jika diubah
		if (updateData.jumlah != null) {
			const jumlahNumber = Number(updateData.jumlah);
			if (Number.isNaN(jumlahNumber) || jumlahNumber < 0) {
				return res
					.status(400)
					.json({
						message:
							"Jumlah harus berupa angka lebih besar atau sama dengan 0",
					});
			}
			updateData.jumlah = jumlahNumber;
		}

		// Validasi nomor WhatsApp jika diubah
		if (updateData.kontakWhatsapp) {
			const digitsOnly = updateData.kontakWhatsapp.replace(/[^0-9]/g, "");
			if (digitsOnly.length !== updateData.kontakWhatsapp.length) {
				return res
					.status(400)
					.json({
						message: "Nomor WhatsApp hanya boleh berisi angka 0-9",
					});
			}
		}

		// Validasi statusBarang jika diubah
		if (updateData.statusBarang) {
			if (!STATUS_LIST.includes(updateData.statusBarang)) {
				return res
					.status(400)
					.json({ message: "Status barang tidak valid" });
			}
		}

		// Jika status jadi Jual → harga wajib valid
		if (updateData.statusBarang === "Jual") {
			if (updateData.harga == null || updateData.harga === "") {
				return res
					.status(400)
					.json({
						message:
							"Harga wajib diisi untuk barang dengan status Jual",
					});
			}
			const hargaNumber = Number(updateData.harga);
			if (Number.isNaN(hargaNumber) || hargaNumber < 0) {
				return res
					.status(400)
					.json({
						message:
							"Harga harus berupa angka lebih besar atau sama dengan 0",
					});
			}
			updateData.harga = hargaNumber;
		}

		// Jika status bukan Jual dan tidak kirim harga → bisa biarkan apa adanya
		if (updateData.statusBarang && updateData.statusBarang !== "Jual") {
			// opsional: bisa nol-kan harga
			if (updateData.harga == null) {
				updateData.harga = 0;
			}
		}

		const updated = await Item.findByIdAndUpdate(
			req.params.id,
			updateData,
			{
				new: true,
			}
		);

		res.json(updated);
	} catch (err) {
		console.error("Update item error:", err);
		res.status(500).json({ message: "Gagal mengupdate barang" });
	}
});

// Hapus barang
itemRouter.delete("/:id", authRequired, async (req, res) => {
	try {
		const item = await Item.findById(req.params.id);
		if (!item) {
			return res.status(404).json({ message: "Barang tidak ditemukan" });
		}

		// Hanya pemilik yang boleh hapus
		if (item.pemilik.toString() !== req.user._id.toString()) {
			return res
				.status(403)
				.json({ message: "Anda tidak berhak menghapus barang ini" });
		}

		await item.deleteOne();
		res.json({ message: "Barang berhasil dihapus" });
	} catch (err) {
		console.error("Delete item error:", err);
		res.status(500).json({ message: "Gagal menghapus barang" });
	}
});
