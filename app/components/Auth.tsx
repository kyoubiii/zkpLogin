"use client";

import { useState } from "react";
// @ts-ignore
import * as snarkjs from "snarkjs";
import { ethers } from "ethers";

// ============================================================================
// KOMPONEN AUTH
// Menangani semua urusan kriptografi ZKP, koneksi MetaMask, dan UI Form.
// ============================================================================

// PASTE ALAMAT CONTRACT AUTH YANG BARU DI SINI
const CONTRACT_ADDRESS = "0xEB34880904EC30808f2eF0559869B547f83753aD"; 

// ABI DIUPDATE: Mengubah parameter '_username' menjadi 'bytes32 _usernameHash'
const AuthABI = [
  "function register(bytes32 _usernameHash, uint256 _passwordHash) public",
  "function login(bytes32 _usernameHash, uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[1] calldata input) public view returns (bool)",
  "function resetPIN(bytes32 _usernameHash, uint256 _newPasswordHash) public"
];

function stringToNumericString(str: string) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(10);
  }
  return result.substring(0, 30);
}

interface AuthProps {
  onLoginSuccess: (username: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<"register" | "login" | "reset">("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask tidak terdeteksi!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setStatus("❌ Username dan PIN tidak boleh kosong!");
      return;
    }
    setStatus("1/3: Menghitung Hash Kriptografi...");
    try {
      const numericPassword = stringToNumericString(password);
      const { publicSignals } = await snarkjs.groth16.fullProve(
        { password: numericPassword }, "/circuit.wasm", "/circuit_final.zkey"
      );

      setStatus("2/3: Silakan konfirmasi pendaftaran di MetaMask...");
      const signer = await connectWallet();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuthABI, signer);

      // KUNCI PRIVASI: Mengubah string Username menjadi Hash lokal (anonim)
      const usernameHash = ethers.id(username);

      // Mengirim 'usernameHash' ke Blockchain
      const tx = await contract.register(usernameHash, publicSignals[0]);
      setStatus("3/3: Transaksi dikirim. Menunggu konfirmasi Blockchain...");
      
      await tx.wait(); 
      setMode("login");
      setPassword("");
      setStatus("✅ Pendaftaran Berhasil! Silakan masuk menggunakan PIN Anda.");
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ Gagal: ${error.reason || "Terjadi kesalahan (Cek console)"}`);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setStatus("❌ Username dan PIN tidak boleh kosong!");
      return;
    }
    setStatus("1/3: Menghitung Bukti ZKP (Proof) secara offline...");
    try {
      const numericPassword = stringToNumericString(password);
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { password: numericPassword }, "/circuit.wasm", "/circuit_final.zkey"
      );

      setStatus("2/3: Menghubungkan ke Smart Contract...");
      const signer = await connectWallet();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuthABI, signer);

      const a = [proof.pi_a[0], proof.pi_a[1]];
      const b = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ];
      const c = [proof.pi_c[0], proof.pi_c[1]];
      const input = [publicSignals[0]];

      // KUNCI PRIVASI: Hash Username sebelum verifikasi ke Smart Contract
      const usernameHash = ethers.id(username);

      const isValid = await contract.login(usernameHash, a, b, c, input);
      
      if (isValid) {
        // Tetap melempar string username asli ke Dashboard agar tampilannya bagus
        onLoginSuccess(username);
      }
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ Gagal Login: PIN salah atau Akun Anda belum terdaftar!`);
    }
  };

  const handleReset = async () => {
    if (!username.trim() || !password.trim()) {
      setStatus("❌ Username dan PIN Baru tidak boleh kosong!");
      return;
    }
    setStatus("1/3: Menghitung Hash PIN Baru...");
    try {
      const numericPassword = stringToNumericString(password);
      const { publicSignals } = await snarkjs.groth16.fullProve(
        { password: numericPassword }, "/circuit.wasm", "/circuit_final.zkey"
      );

      setStatus("2/3: Konfirmasi MetaMask (Harus Wallet Pemilik Asli)...");
      const signer = await connectWallet();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AuthABI, signer);

      // KUNCI PRIVASI: Hash Username
      const usernameHash = ethers.id(username);

      const tx = await contract.resetPIN(usernameHash, publicSignals[0]);
      setStatus("3/3: Transaksi dikirim. Menunggu konfirmasi Blockchain...");
      
      await tx.wait(); 
      setMode("login");
      setPassword("");
      setStatus("✅ PIN Baru Berhasil Disimpan! Silakan mencoba login kembali.");
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ Gagal Reset: Pastikan Anda menggunakan dompet MetaMask yang sama saat daftar!`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">📚</div>
        <h1 className="text-2xl font-extrabold text-slate-800">Perpustakaan Daerah</h1>
        <p className="text-slate-500 text-sm mt-1">Sistem Keanggotaan Berbasis Web3 (ZKP)</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-bold text-slate-700">Username Anggota</label>
        <input
          type="text"
          className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan username Anda..."
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-bold text-slate-700">
          {mode === "register" ? "Buat PIN Rahasia Baru" : mode === "login" ? "Masukkan PIN Anggota" : "Masukkan PIN Baru"}
        </label>
        <input
          type="password"
          className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium tracking-widest"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "login" ? "••••••" : "Buat PIN baru..."}
        />
      </div>

      <button 
        onClick={mode === "register" ? handleRegister : mode === "login" ? handleLogin : handleReset}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-md hover:shadow-lg"
      >
        {mode === "register" ? "Daftar (Koneksi MetaMask)" : mode === "login" ? "Akses Perpustakaan" : "Simpan PIN Baru (MetaMask)"}
      </button>

      <div className="flex flex-col gap-2 text-center mt-6 border-t border-slate-100 pt-4">
        {mode !== "login" && (
          <button onClick={() => { setMode("login"); setStatus(""); setPassword(""); setUsername(""); }} className="text-sm text-blue-600 font-semibold hover:underline">
            Sudah ingat PIN / Punya akun? Masuk di sini
          </button>
        )}
        {mode !== "register" && (
          <button onClick={() => { setMode("register"); setStatus(""); setPassword(""); setUsername(""); }} className="text-sm text-blue-600 font-semibold hover:underline">
            Belum punya akun? Daftar sekarang
          </button>
        )}
        {mode !== "reset" && (
          <button onClick={() => { setMode("reset"); setStatus(""); setPassword(""); setUsername(""); }} className="text-xs text-slate-400 font-medium hover:text-slate-600 hover:underline mt-1">
            Lupa PIN? Reset dengan Kunci Dompet
          </button>
        )}
      </div>

      {status && (
        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className={`text-center text-xs font-bold ${status.includes('❌') ? 'text-red-600' : 'text-emerald-600'}`}>
            {status}
          </p>
        </div>
      )}
    </div>
  );
}