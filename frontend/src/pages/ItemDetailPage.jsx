import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";

export const ItemDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [item, setItem] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchItem = async () => {
			try {
				const res = await api.get(`/items/${id}`);
				setItem(res.data);
			} catch (err) {
				setError(
					err.response?.data?.message ||
						"Gagal mengambil detail barang"
				);
			} finally {
				setLoading(false);
			}
		};
		fetchItem();
	}, [id]);

	const handleDelete = async () => {
		if (!window.confirm("Yakin ingin menghapus barang ini?")) return;
		try {
			await api.delete(`/items/${id}`);
			navigate("/");
		} catch (err) {
			setError(err.response?.data?.message || "Gagal menghapus barang");
		}
	};

	const getImageUrl = () => {
		if (!item?.fotoUrl) return null;
		if (import.meta.env.VITE_API_BASE_URL) {
			return (
				import.meta.env.VITE_API_BASE_URL.replace("/api", "") +
				item.fotoUrl
			);
		}
		return `http://localhost:5000${item.fotoUrl}`;
	};

	const getWhatsappLink = () => {
		if (!item?.kontakWhatsapp) return null;
		const digits = item.kontakWhatsapp.replace(/[^0-9]/g, "");
		if (!digits) return null;
		return `https://wa.me/${digits}`;
	};

	const formatHarga = (harga) => {
		if (harga == null) return "";
		const num = Number(harga);
		if (Number.isNaN(num)) return "";
		return num.toLocaleString("id-ID");
	};

	if (loading) {
		return (
			<div className="page-container">
				<p>Memuat detail barang...</p>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="page-container">
				<p className="error-text">
					{error || "Barang tidak ditemukan"}
				</p>
				<Link to="/" className="btn btn-secondary">
					Kembali
				</Link>
			</div>
		);
	}

	return (
		<div className="page-container">
			<div className="detail-header">
				<div>
					<h1>{item.namaBarang}</h1>
					<p className="item-org">
						{item.pemilik?.namaOrganisasi} (
						{item.pemilik?.akunOrganisasi})
					</p>
					<p className="item-qty">Jumlah: {item.jumlah} unit</p>
					<p className="item-status">
						Status: {item.statusBarang || "Hibah"}
						{item.statusBarang === "Jual" &&
							item.harga != null &&
							formatHarga(item.harga) && (
								<> · Rp {formatHarga(item.harga)}</>
							)}
					</p>
				</div>
				<div className="detail-actions">
					<Link
						to={`/items/${item._id}/edit`}
						className="btn btn-primary"
					>
						Edit
					</Link>
					<button onClick={handleDelete} className="btn btn-danger">
						Hapus
					</button>
					<Link to="/" className="btn btn-secondary">
						Kembali
					</Link>
				</div>
			</div>

			<div className="detail-body">
				{getImageUrl() && (
					<div className="detail-image">
						<img src={getImageUrl()} alt={item.namaBarang} />
					</div>
				)}
				<div className="detail-info">
					<h3>Informasi Barang</h3>
					<p>
						<strong>Kategori:</strong> {item.kategori}
					</p>
					<p>
						<strong>Kondisi:</strong> {item.kondisiUmum}
					</p>
					{item.lokasiPenyimpanan && (
						<p>
							<strong>Lokasi Penyimpanan:</strong>{" "}
							{item.lokasiPenyimpanan}
						</p>
					)}
					{item.deskripsi && (
						<>
							<strong>Deskripsi:</strong>
							<p>{item.deskripsi}</p>
						</>
					)}

					{(item.kontakNama || item.kontakWhatsapp) && (
						<div className="contact-box">
							<strong>Kontak yang bisa dihubungi:</strong>
							{item.kontakNama && <p>{item.kontakNama}</p>}
							{item.kontakWhatsapp && (
								<p>
									WhatsApp:{" "}
									{getWhatsappLink() ? (
										<a
											href={getWhatsappLink()}
											target="_blank"
											rel="noreferrer"
											className="wa-link"
										>
											{item.kontakWhatsapp}
										</a>
									) : (
										item.kontakWhatsapp
									)}
								</p>
							)}
						</div>
					)}

					<p className="note">
						Catatan: Platform ini fokus pada pendataan barang.
						Mekanisme peminjaman maupun jual beli dilakukan langsung
						melalui kontak yang tertera.
					</p>
				</div>
			</div>

			{error && <p className="error-text">{error}</p>}
		</div>
	);
};
