export interface Music {
  id: string;
  title: string;
  artists: string;
  audio: string;
  cover: string;
  tags: string[];
  publishDate: string; // YYYY-MM-DD
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MusicTag {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  demoAudio: string;
  tags: string[];
  bpm?: number | null;
  price?: number | null;
  priceText: string;
  shortDescription: string;
  content: string; // Markdown
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectTag {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  images: string[];
  price?: number | null;
  priceText: string;
  shortDescription: string;
  content: string; // Markdown
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Equipment {
  id: string;
  slug: string;
  title: string;
  category: string;
  thumbnail: string;
  images: string[];
  price?: number | null;
  priceText: string;
  shortDescription: string;
  content: string; // Markdown
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  published: boolean;
  sortOrder: number;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  genresText: string;
  about: string;
  phone: string;
  zaloUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  address: string;
  contactHeading: string;
  featuredMusicCount: number;
  featuredProjectsCount: number;
  featuredCoursesCount: number;
  featuredEquipmentCount: number;
}
