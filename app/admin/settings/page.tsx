'use client';

import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types';
import { Save, Loader2, Settings, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<SiteSettings>({
    brandName: 'BUOGS',
    tagline: 'DJ / PRODUCER',
    genresText: 'VINAHOUSE · HOUSE LAK · VINATRANCE',
    about: '',
    phone: '',
    zaloUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    address: '',
    contactHeading: 'BOOKING / MUSIC / PROJECT / COURSE / EQUIPMENT',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu cài đặt');

      setSuccessMsg('Đã lưu cấu hình thông tin website thành công!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#b6ff2e]" />
        <span className="text-xs font-mono text-[#a3a3a3]">Đang tải cài đặt...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-heading text-3xl font-bold text-white uppercase">
          Cấu Hình Thông Tin Website (Site Settings)
        </h1>
        <p className="text-xs font-mono text-[#a3a3a3] mt-1">
          Quản lý tên thương hiệu, khẩu hiệu, thông tin giới thiệu và link mạng xã hội liên hệ (Zalo, Messenger, Hotline)
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111111] p-6 rounded-2xl border border-white/10">
          
          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Tên thương hiệu (Brand Name) *
            </label>
            <input
              type="text"
              required
              value={formData.brandName}
              onChange={(e) => handleChange('brandName', e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-bold focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Tagline phụ (Sub-title)
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="DJ / PRODUCER"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Dòng thể loại âm nhạc tiêu biểu (Genres Text)
            </label>
            <input
              type="text"
              value={formData.genresText}
              onChange={(e) => handleChange('genresText', e.target.value)}
              placeholder="VINAHOUSE · HOUSE LAK · VINATRANCE"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono text-[#b6ff2e] focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Giới thiệu thương hiệu (About Text)
            </label>
            <textarea
              rows={4}
              value={formData.about}
              onChange={(e) => handleChange('about', e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-4 text-white text-sm leading-relaxed focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

        </div>

        {/* Contact Links & Phone Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111111] p-6 rounded-2xl border border-white/10">
          <h2 className="md:col-span-2 font-heading text-xl font-bold text-white uppercase border-b border-white/10 pb-3">
            Thông Tin Liên Hệ & Chuyển Đổi CTA
          </h2>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Số Điện Thoại / Hotline
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="0988888888"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Link Zalo Official
            </label>
            <input
              type="text"
              value={formData.zaloUrl}
              onChange={(e) => handleChange('zaloUrl', e.target.value)}
              placeholder="https://zalo.me/0988888888"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Link Facebook Page / Profile
            </label>
            <input
              type="text"
              value={formData.facebookUrl}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/buogsofficial"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Link TikTok Channel
            </label>
            <input
              type="text"
              value={formData.tiktokUrl}
              onChange={(e) => handleChange('tiktokUrl', e.target.value)}
              placeholder="https://tiktok.com/@buogsofficial"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Địa chỉ Studio / Làm việc
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="TP. Hồ Chí Minh / Hà Nội, Việt Nam"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
              Tiêu đề Section Contact (Home Page)
            </label>
            <input
              type="text"
              value={formData.contactHeading}
              onChange={(e) => handleChange('contactHeading', e.target.value)}
              placeholder="BOOKING / MUSIC / PROJECT / COURSE / EQUIPMENT"
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white font-heading text-lg focus:border-[#b6ff2e] focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#9ee61a] transition-all flex items-center gap-2 shadow-lg shadow-[#b6ff2e]/20"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Lưu Cấu Hình Site</span>
          </button>
        </div>
      </form>
    </div>
  );
}
