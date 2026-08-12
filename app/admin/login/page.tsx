'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#b6ff2e]/10 blur-[90px] rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-2xl bg-[#161616] border border-[#b6ff2e]/40 mx-auto overflow-hidden shadow-lg shadow-[#b6ff2e]/10">
            <Image
              src="/fav-logo.png"
              alt="BUOGS Admin"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-wider">
            ADMIN CMS LOGIN
          </h1>
          <p className="text-xs font-mono text-[#a3a3a3]">
            BUOGS PORTFOLIO CMS • QUẢN TRỊ NỘI DUNG
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username"
                className="w-full bg-[#161616] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#b6ff2e] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full bg-[#161616] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#b6ff2e] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#9ee61a] transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#b6ff2e]/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <span>Đăng Nhập Admin</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
