"use client";

// ============================================================================
// KOMPONEN DASHBOARD
// Komponen ini HANYA bertanggung jawab untuk menampilkan UI Kartu Anggota
// setelah user berhasil tervalidasi oleh Smart Contract.
// ============================================================================

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

export default function Dashboard({ username, onLogout }: DashboardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 text-center">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
        🔓
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800">Akses Diberikan!</h1>
      <p className="text-slate-500 text-sm mt-1">Autentikasi Aman Berhasil Diverifikasi via Blockchain</p>

      {/* VISUAL: KARTU ANGGOTA DIGITAL WEB3 */}
      <div className="my-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-2xl text-left shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] text-white opacity-10 text-9xl font-bold font-serif">
          📚
        </div>
        <div className="flex justify-between items-center border-b border-blue-400/30 pb-3 mb-4">
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-blue-200">Kartu Anggota Digital</h4>
            <h2 className="text-lg font-bold">Perpustakaan Daerah</h2>
          </div>
          <span className="bg-emerald-500 text-xs px-2.5 py-1 rounded-full font-bold shadow">WEB3 ACTIVE</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-blue-200">Nama Anggota</p>
            {/* Menampilkan username yang dilempar dari komponen induk */}
            <p className="text-lg font-bold font-mono tracking-wide">{username}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-blue-200">Status Keamanan</p>
              <p className="text-sm font-semibold text-emerald-300">✓ Zero-Knowledge Secured</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-blue-200">Masa Berlaku</p>
              <p className="text-sm font-semibold font-mono">Permanen (On-Chain)</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-6 px-4">
        Selamat datang kembali di sistem perpustakaan, <span className="font-bold text-slate-800">{username}</span>. 
        Smart contract kami berhasil memvalidasi hak akses Anda menggunakan enkripsi ZKP 
        tanpa pernah mengetahui PIN rahasia Anda.
      </p>

      {/* TOMBOL LOGOUT: Akan memanggil fungsi onLogout dari komponen induk */}
      <button 
        onClick={onLogout}
        className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-900 transition-all active:scale-95 shadow-md hover:shadow-lg"
      >
        Keluar Sistem (Logout)
      </button>
    </div>
  );
}