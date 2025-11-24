import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";

export const ItemFormPage = () => {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();

	const [form, setForm] = useState({
		namaBarang: "",
		kategori: "",
		deskripsi: "",
		kondisiUmum: "Baik",
		jumlah: 0,
		lokasiPenyimpanan: "",
		fotoUrl: "",
		kontakNama: "",
		kontakWhatsapp: "",
		statusBarang: "Hibah",
		harga: 0,
	});

	const [file, setFile] = useState(null);
	const [error, setError] = useState("");
	const [loadingItem, setLoadingItem] = useState(false);

	useEffect(() => {
		if (isEdit) {
			const fetchItem = async () => {
				setLoadingItem(true);
				try {
					const res = await api.get(`/items/${id}`);
					const data = res.data;
					setForm({
						namaBarang: data.namaBarang,
						kategori: data.kategori,
						deskripsi: data.deskripsi || "",
						kondisiUmum: data.kondisiUmum || "Baik",
						jumlah: data.jumlah,
						lokasiPenyimpanan: data.lokasiPenyimpanan || "",
						fotoUrl: data.fotoUrl || "",
						kontakNama: data.kontakNama || "",
						kontakWhatsapp: data.kontakWhatsapp || "",
						statusBarang: data.statusBarang || "Hibah",
						harga: data.harga ?? 0,
					});
				} catch (err) {
					setError(
						err.response?.data?.message ||
							"Gagal mengambil data barang"
					);
				} finally {
					setLoadingItem(false);
				}
			};
			fetchItem();
		}
	}, [id, isEdit]);

	const handleChange = (e) => {
		const { name } = e.target;
		let { value } = e.target;

		if (name === "jumlah") {
			value = Number(value);
		}

		if (name === "kontakWhatsapp") {
			// hanya izinkan angka 0–9 di input
			value = value.replace(/[^0-9]/g, "");
		}

		if (name === "harga") {
			value = value === "" ? "" : Number(value);
		}

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleUpload = async () => {
		if (!file) return null;
		const formData = new FormData();
		formData.append("file", file);

		const res = await api.post("/upload", formData);
		return res.data.url;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			let fotoUrl = form.fotoUrl;

			if (file) {
				const uploadedUrl = await handleUpload();
				fotoUrl = uploadedUrl;
			}

			const payload = {
				...form,
				fotoUrl,
			};

			// Jika status bukan Jual, harga boleh di-nol-kan
			if (payload.statusBarang !== "Jual") {
				payload.harga = 0;
			}

			if (isEdit) {
				await api.put(`/items/${id}`, payload);
			} else {
				await api.post("/items", payload);
			}

			navigate("/");
		} catch (err) {
			setError(err.response?.data?.message || "Gagal menyimpan barang");
		}
	};

	if (loadingItem) {
		return (
			<div className="page-container">
				<p>Memuat data barang...</p>
			</div>
		);
	}

	const getPreviewUrl = () => {
		if (!form.fotoUrl) return null;
		if (import.meta.env.VITE_API_BASE_URL) {
			return (
				import.meta.env.VITE_API_BASE_URL.replace("/api", "") +
				form.fotoUrl
			);
		}
		return `http://localhost:5000${form.fotoUrl}`;
	};

	return (
		<div className="page-container">
			<h1>{isEdit ? "Edit Barang" : "Tambah Barang Baru"}</h1>
			<form onSubmit={handleSubmit} className="form">
				<label>
					Nama Barang
					<input
						type="text"
						name="namaBarang"
						value={form.namaBarang}
						onChange={handleChange}
						required
					/>
				</label>

				<label>
					Kategori
					<input
						type="text"
						name="kategori"
						value={form.kategori}
						onChange={handleChange}
						placeholder="contoh: Dekorasi, Elektronik, Logistik lomba"
						required
					/>
				</label>

				<label>
					Status Barang
					<select
						name="statusBarang"
						value={form.statusBarang}
						onChange={handleChange}
					>
						<option value="Hibah">Hibah (diberikan)</option>
						<option value="Pinjam">Pinjam</option>
						<option value="Jual">Jual</option>
					</select>
				</label>

				{form.statusBarang === "Jual" && (
					<label>
						Harga (Rp)
						<input
							type="number"
							name="harga"
							value={form.harga === "" ? "" : form.harga}
							min={0}
							onChange={handleChange}
							required={form.statusBarang === "Jual"}
						/>
					</label>
				)}

				<label>
					Deskripsi
					<textarea
						name="deskripsi"
						value={form.deskripsi}
						onChange={handleChange}
						rows={3}
					/>
				</label>

				<label>
					Kondisi Umum
					<select
						name="kondisiUmum"
						value={form.kondisiUmum}
						onChange={handleChange}
					>
						<option value="Baik">Baik</option>
						<option value="Perlu Perbaikan">Perlu Perbaikan</option>
						<option value="Rusak Ringan">Rusak Ringan</option>
					</select>
				</label>

				<label>
					Jumlah Barang
					<input
						type="number"
						name="jumlah"
						value={form.jumlah}
						min={0}
						onChange={handleChange}
						required
					/>
				</label>

				<label>
					Lokasi Penyimpanan
					<input
						type="text"
						name="lokasiPenyimpanan"
						value={form.lokasiPenyimpanan}
						onChange={handleChange}
						placeholder="contoh: Perpustakaan lantai 6"
					/>
				</label>

				<label>
					Nama PIC yang Bisa Dihubungi
					<input
						type="text"
						name="kontakNama"
						value={form.kontakNama}
						onChange={handleChange}
						placeholder="contoh: Faqih (Koordinator Perlengkapan)"
					/>
				</label>

				<label>
					Nomor WhatsApp PIC
					<input
						type="tel"
						name="kontakWhatsapp"
						value={form.kontakWhatsapp}
						onChange={handleChange}
						placeholder="contoh: 0812xxxxxxxx"
					/>
				</label>

				<label>
					Foto Barang
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setFile(e.target.files[0])}
					/>
				</label>

				{getPreviewUrl() && (
					<div className="preview-image">
						<p>Preview foto tersimpan:</p>
						<img src={getPreviewUrl()} alt="Foto barang" />
					</div>
				)}

				{error && <p className="error-text">{error}</p>}

				<button type="submit" className="btn btn-primary">
					{isEdit ? "Simpan Perubahan" : "Simpan Barang"}
				</button>
			</form>
		</div>
	);
};
