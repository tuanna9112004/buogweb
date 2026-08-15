import { z } from 'zod';

export const MusicSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  artists: z.string().min(1, 'Tên nghệ sĩ không được để trống'),
  audio: z.string().min(1, 'File audio không được để trống'),
  cover: z.string().default(''),
  tags: z.array(z.string()).default([]),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày đăng phải có định dạng YYYY-MM-DD'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const MusicTagSchema = z.object({
  id: z.string().min(1, 'ID tag không được để trống'),
  name: z.string().min(1, 'Tên tag không được để trống'),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const ProjectSchema = z.object({
  slug: z.string().min(1, 'Slug không được để trống').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  thumbnail: z.string().default(''),
  demoAudio: z.string().default(''),
  tags: z.array(z.string()).default([]),
  bpm: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  priceText: z.string().default('Liên hệ'),
  shortDescription: z.string().default(''),
  content: z.string().default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const ProjectTagSchema = z.object({
  id: z.string().min(1, 'ID tag không được để trống'),
  name: z.string().min(1, 'Tên tag không được để trống'),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const CourseSchema = z.object({
  slug: z.string().min(1, 'Slug không được để trống').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  title: z.string().min(1, 'Tên khóa học không được để trống'),
  thumbnail: z.string().default(''),
  images: z.array(z.string()).default([]),
  price: z.number().nullable().optional(),
  priceText: z.string().default('Liên hệ'),
  shortDescription: z.string().default(''),
  content: z.string().min(1, 'Nội dung khóa học không được để trống'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const EquipmentSchema = z.object({
  slug: z.string().min(1, 'Slug không được để trống').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  title: z.string().min(1, 'Tên thiết bị không được để trống'),
  category: z.string().min(1, 'Danh mục không được để trống'),
  thumbnail: z.string().default(''),
  images: z.array(z.string()).default([]),
  price: z.number().nullable().optional(),
  priceText: z.string().default('Liên hệ'),
  shortDescription: z.string().default(''),
  content: z.string().default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const EquipmentCategorySchema = z.object({
  id: z.string().min(1, 'ID danh mục không được để trống'),
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const SiteSettingsSchema = z.object({
  brandName: z.string().min(1, 'Tên thương hiệu không được để trống'),
  tagline: z.string().default(''),
  genresText: z.string().default(''),
  about: z.string().default(''),
  phone: z.string().default(''),
  zaloUrl: z.string().default(''),
  facebookUrl: z.string().default(''),
  tiktokUrl: z.string().default(''),
  address: z.string().default(''),
  contactHeading: z.string().default(''),
  featuredMusicCount: z.number().int().min(1, 'Tối thiểu 1').max(3, 'Tối đa 3 (giao diện showcase chỉ hỗ trợ 3 ô)').default(3),
  featuredProjectsCount: z.number().int().min(1, 'Tối thiểu 1').max(12, 'Tối đa 12').default(3),
  featuredCoursesCount: z.number().int().min(1, 'Tối thiểu 1').max(12, 'Tối đa 12').default(3),
  featuredEquipmentCount: z.number().int().min(1, 'Tối thiểu 1').max(12, 'Tối đa 12').default(4),
});

export const LoginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});
