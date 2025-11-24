import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    namaOrganisasi: { type: String, required: true },
    akunOrganisasi: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["pending", "aktif"], default: "aktif" }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
