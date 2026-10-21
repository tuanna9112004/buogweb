import { z } from 'zod';
import { readJSON, writeJSONAtomic } from './storage/json-db';

export const CommunitySchema = z.object({
  enabled: z.boolean(),
  delaySeconds: z.number().int().min(0).max(120).default(4),
  displayPages: z.array(z.enum(['/', '/music', '/demos', '/projects', '/courses', '/equipment'])).default([]),
  rememberHours: z.number().int().min(1).max(720).default(24),
  title: z.string().trim().min(1).max(100),
  summary: z.string().trim().max(250),
  description: z.string().trim().max(1000),
  benefits: z.array(z.string().trim().min(1).max(250)).max(12),
  priceText: z.string().trim().max(60),
  membershipText: z.string().trim().max(80),
  monthlyPlan: z.object({
    title: z.string().trim().min(1).max(100).default('THAM GIA GROUP NHẠC'),
    priceText: z.string().trim().max(60).default('Liên hệ'),
    membershipText: z.string().trim().max(80).default('Theo tháng'),
    description: z.string().trim().max(1000).default('Nhận 3 bài nhạc ỉm mỗi ngày, 3–4 bài do BUOGS tự làm mỗi tháng và bonus thêm các pack nhạc khác.'),
    benefits: z.array(z.string().trim().min(1).max(250)).max(12).default([]),
    groupUrl: z.union([z.literal(''), z.url().refine(value => value.startsWith('https://'), 'Link phải dùng HTTPS')]).default(''),
    qrImage: z.union([z.literal(''), z.string().regex(/^\/media\/community\/images\/[a-zA-Z0-9-]+\.(png|jpg|jpeg|webp)$/)]).default(''),
  }).default({ title: 'THAM GIA GROUP NHẠC', priceText: 'Liên hệ', membershipText: 'Theo tháng', description: 'Nhận 3 bài nhạc ỉm mỗi ngày, 3–4 bài do BUOGS tự làm mỗi tháng và bonus thêm các pack nhạc khác.', benefits: ['Mỗi ngày nhận 3 bài nhạc ỉm.', 'Mỗi tháng nhận 3–4 bài do BUOGS tự làm.', 'Bonus thêm các pack nhạc khác.', 'Tổng kho dự kiến 150–180 bài/tháng.', 'Gói nhận nhạc ngay 999K: 25 bài nhạc ỉm, bonus 1 bài do BUOGS làm.', 'Gói nhận nhạc ngay 1.999K: 40 bài nhạc ỉm, bonus 3 bài do BUOGS làm.', 'Gói nhận nhạc ngay 2.999K: 50 bài, bonus 4 bài do BUOGS làm.'], groupUrl: '', qrImage: '' }),
  groupUrl: z.union([z.literal(''), z.url().refine(value => value.startsWith('https://'), 'Link phải dùng HTTPS')]),
  qrImage: z.union([z.literal(''), z.string().regex(/^\/media\/community\/images\/[a-zA-Z0-9-]+\.(png|jpg|jpeg|webp)$/)]),
}).refine(value => !value.enabled || !!value.groupUrl, { message: 'Nhập link nhóm trước khi bật popup', path: ['groupUrl'] });
export type CommunitySettings = z.infer<typeof CommunitySchema>;
export const defaultCommunity: CommunitySettings = {
  delaySeconds: 4, displayPages: [], rememberHours: 24,
  enabled: false, title: 'GROUP FLP – SAMPLE',
  summary: 'Kho Sample Pack, FLP Full, cộng đồng hỏi đáp và giao lưu làm nhạc.',
  description: 'Kết nối cùng cộng đồng producer, chia sẻ tài nguyên và kinh nghiệm sản xuất âm nhạc.',
  benefits: ['28 project FLP', '45 bộ sample pack', 'Tham gia vĩnh viễn, tiếp tục được cập nhật', 'Cộng đồng hơn 400 thành viên, hỏi đáp và giao lưu làm nhạc'],
  priceText: '399.999 VNĐ', membershipText: 'Vĩnh viễn', groupUrl: '', qrImage: '',
  monthlyPlan: { title: 'THAM GIA GROUP NHẠC', priceText: 'Liên hệ', membershipText: 'Theo tháng', description: 'Nhận 3 bài nhạc ỉm mỗi ngày, 3–4 bài do BUOGS tự làm mỗi tháng và bonus thêm các pack nhạc khác.', benefits: ['Mỗi ngày nhận 3 bài nhạc ỉm.', 'Mỗi tháng nhận 3–4 bài do BUOGS tự làm.', 'Bonus thêm các pack nhạc khác.', 'Tổng kho dự kiến 150–180 bài/tháng.', 'Gói nhận nhạc ngay 999K: 25 bài nhạc ỉm, bonus 1 bài do BUOGS làm.', 'Gói nhận nhạc ngay 1.999K: 40 bài nhạc ỉm, bonus 3 bài do BUOGS làm.', 'Gói nhận nhạc ngay 2.999K: 50 bài, bonus 4 bài do BUOGS làm.'], groupUrl: '', qrImage: '' },
};
export function getCommunity(): CommunitySettings {
  const stored = readJSON<Partial<CommunitySettings>>('community.json', {});
  return { ...defaultCommunity, ...stored, monthlyPlan: { ...defaultCommunity.monthlyPlan, ...stored.monthlyPlan } };
}
export async function saveCommunity(data: CommunitySettings) { await writeJSONAtomic('community.json', data); return data; }
