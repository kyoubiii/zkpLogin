"use client";

import { useState } from "react";
// Mengimpor sub-komponen yang sudah dipisah
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

// ============================================================================
// HALAMAN UTAMA (ROOT)
// Mengatur "State" global aplikasi: Apakah sedang di halaman Login atau Dashboard?
// ============================================================================

export default function Home() {
  // State untuk melacak status login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State untuk menyimpan nama user yang berhasil masuk
  const [activeUser, setActiveUser] = useState("");

  // Fungsi ini akan dipanggil oleh komponen <Auth /> jika ZKP valid
  const handleLoginSuccess = (username: string) => {
    setActiveUser(username);
    setIsLoggedIn(true);
  };

  // Fungsi ini akan dipanggil oleh komponen <Dashboard /> jika user klik Logout
  const handleLogout = () => {
    setActiveUser("");
    setIsLoggedIn(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-black p-4">
      {/* TERNARY OPERATOR: 
          Jika 'isLoggedIn' bernilai TRUE, tampilkan Dashboard.
          Jika 'isLoggedIn' bernilai FALSE, tampilkan form Auth. 
      */}
      {isLoggedIn ? (
        <Dashboard username={activeUser} onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}