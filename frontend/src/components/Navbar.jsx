import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<nav className="navbar">
			<div className="navbar-left">
				<span className="logo">Inventaris ITS Bersama</span>
				<Link to="/">Barang</Link>
				<Link to="/items/new">Tambah Barang</Link>
			</div>
			<div className="navbar-right">
				{user && (
					<>
						<span className="org-name">{user.namaOrganisasi}</span>
						<button
							onClick={handleLogout}
							className="btn btn-secondary"
						>
							Logout
						</button>
					</>
				)}
			</div>
		</nav>
	);
};
