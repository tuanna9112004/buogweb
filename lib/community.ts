import { z } from 'zod';
import { readJSON, writeJSONAtomic } from './storage/json-db';

export const CommunitySchema = z.object({
  enabled: z.boolean(),
  title: z.string().trim().min(1).max(100),
  summary: z.string().trim().max(250),
  description: z.string().trim().max(1000),
  benefits: z.array(z.string().trim().min(1).max(250)).max(12),
  priceText: z.string().trim().max(60),
  membershipText: z.string().trim().max(80),
  groupUrl: z.union([z.literal(''), z.url().refine(value => value.startsWith('https://'), 'Link phải dùng HTTPS')]),
  qrImage: z.union([z.literal(''), z.string().regex(/^\/media\/community\/images\/[a-zA-Z0-9-]+\.(png|jpg|jpeg|webp)$/)]),
}).refine(value => !value.enabled || !!value.groupUrl, { message: 'Nhập link nhóm trước khi bật popup', path: ['groupUrl'] });
export type CommunitySettings = z.infer<typeof CommunitySchema>;
export const defaultCommunity: CommunitySettings = {
  enabled: false, title: 'GROUP FLP – SAMPLE',
  summary: 'Kho Sample Pack, FLP Full, cộng đồng hỏi đáp và giao lưu làm nhạc.',
  description: 'Kết nối cùng cộng đồng producer, chia sẻ tài nguyên và kinh nghiệm sản xuất âm nhạc.',
  benefits: ['28 project FLP', '45 bộ sample pack', 'Tham gia vĩnh viễn, tiếp tục được cập nhật', 'Cộng đồng hơn 400 thành viên, hỏi đáp và giao lưu làm nhạc'],
  priceText: '399.999 VNĐ', membershipText: 'Vĩnh viễn', groupUrl: '', qrImage: '',
};
export function getCommunity(): CommunitySettings { return { ...defaultCommunity, ...readJSON<Partial<CommunitySettings>>('community.json', {}) }; }
export async function saveCommunity(data: CommunitySettings) { await writeJSONAtomic('community.json', data); return data; }
