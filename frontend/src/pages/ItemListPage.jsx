import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

export const ItemListPage = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const fetchItems = async () => {
			try {
				const res = await api.get("/items");
				setItems(res.data);
			} catch (err) {
				setError(
					err.response?.data?.message || "Gagal mengambil data barang"
				);
			} finally {
				setLoading(false);
			}
		};
		fetchItems();
	}, []);

	const filteredItems = items.filter((item) =>
		item.namaBarang.toLowerCase().includes(search.toLowerCase())
	);

	const getImageUrl = (item) => {
		if (!item.fotoUrl) return null;
		if (import.meta.env.VITE_API_BASE_URL) {
			return (
				import.meta.env.VITE_API_BASE_URL.replace("/api", "") +
				item.fotoUrl
			);
		}
		return `http://localhost:5000${item.fotoUrl}`;
	};

	const formatHarga = (harga) => {
		if (harga == null) return "";
		const num = Number(harga);
		if (Number.isNaN(num)) return "";
		return num.toLocaleString("id-ID");
	};

	return (
		<div className="page-container">
			<div className="page-header">
				<h1>Daftar Barang</h1>
				<p className="subtitle">
					Cari barang inventaris milik organisasi di ITS sebelum
					memutuskan membeli baru.
				</p>
				<input
					type="text"
					placeholder="Cari barang..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="search-input"
				/>
			</div>

			{loading && <p>Memuat data...</p>}
			{error && <p className="error-text">{error}</p>}

			{!loading && filteredItems.length === 0 && (
				<p>Belum ada barang yang terdaftar.</p>
			)}

			<div className="grid">
				{filteredItems.map((item) => (
					<Link
						to={`/items/${item._id}`}
						key={item._id}
						className="card item-card"
					>
						{getImageUrl(item) && (
							<img
								src={getImageUrl(item)}
								alt={item.namaBarang}
								className="item-image"
							/>
						)}
						<div className="item-info">
							<h3>{item.namaBarang}</h3>
							<p className="item-org">
								{item.pemilik?.namaOrganisasi ||
									"Organisasi ITS"}
							</p>
							<p className="item-qty">
								Jumlah: {item.jumlah} unit
							</p>
							{item.kontakNama && (
								<p className="item-contact">
									PIC: {item.kontakNama}
								</p>
							)}
							<p className="item-kategori">{item.kategori}</p>
							<p className="item-status">
								Status: {item.statusBarang || "Hibah"}
								{item.statusBarang === "Jual" &&
									item.harga != null &&
									formatHarga(item.harga) && (
										<> · Rp {formatHarga(item.harga)}</>
									)}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};
