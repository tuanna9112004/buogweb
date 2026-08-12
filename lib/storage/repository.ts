import { readJSON, writeJSONAtomic } from './json-db';
import {
  Music, MusicTag, Project, ProjectTag, Course, Equipment, EquipmentCategory, SiteSettings
} from '@/types';
import fs from 'fs';
import path from 'path';

// Storage filenames
const FILES = {
  MUSIC: 'music.json',
  MUSIC_TAGS: 'music-tags.json',
  PROJECTS: 'projects.json',
  PROJECT_TAGS: 'project-tags.json',
  COURSES: 'courses.json',
  EQUIPMENT: 'equipment.json',
  EQUIPMENT_CATEGORIES: 'equipment-categories.json',
  SETTINGS: 'settings.json',
};

// Media Orphan Cleanup Helper
export function cleanupOrphanMediaFile(mediaUrl: string, excludeCollection?: string) {
  if (!mediaUrl || !mediaUrl.startsWith('/media/')) return;
  
  const relativePath = mediaUrl.replace('/media/', '');
  const physicalPath = path.join(process.cwd(), 'storage', 'media', relativePath);

  if (!fs.existsSync(physicalPath)) return;

  // Check if any other entity still references this file
  const isReferencedInMusic = readJSON<Music[]>(FILES.MUSIC, []).some(
    m => m.audio === mediaUrl || m.cover === mediaUrl
  );
  const isReferencedInProjects = readJSON<Project[]>(FILES.PROJECTS, []).some(
    p => p.thumbnail === mediaUrl || p.demoAudio === mediaUrl || (p.images && p.images.includes(mediaUrl))
  );
  const isReferencedInCourses = readJSON<Course[]>(FILES.COURSES, []).some(
    c => c.thumbnail === mediaUrl || (c.images && c.images.includes(mediaUrl))
  );
  const isReferencedInEquipment = readJSON<Equipment[]>(FILES.EQUIPMENT, []).some(
    e => e.thumbnail === mediaUrl || (e.images && e.images.includes(mediaUrl))
  );

  if (!isReferencedInMusic && !isReferencedInProjects && !isReferencedInCourses && !isReferencedInEquipment) {
    try {
      fs.unlinkSync(physicalPath);
      console.log(`Cleaned up orphaned media file: ${physicalPath}`);
    } catch (e) {
      console.error(`Failed to delete orphan file ${physicalPath}:`, e);
    }
  }
}

// ----------------------------------------------------
// MUSIC REPOSITORY
// ----------------------------------------------------
export function getMusicList(publishedOnly = false): Music[] {
  const list = readJSON<Music[]>(FILES.MUSIC, []);
  const filtered = publishedOnly ? list.filter(m => m.published) : list;
  // Sort publishDate descending
  return filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

export function getMusicById(id: string): Music | undefined {
  const list = getMusicList(false);
  return list.find(m => m.id === id);
}

export async function saveMusic(item: Partial<Music> & { id?: string }): Promise<Music> {
  const list = getMusicList(false);
  const nowStr = new Date().toISOString();
  
  // Format today's date in Asia/Ho_Chi_Minh (YYYY-MM-DD)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

  if (item.id) {
    // Edit mode
    const index = list.findIndex(m => m.id === item.id);
    if (index === -1) throw new Error('Track music không tồn tại');
    
    const existing = list[index];
    const updated: Music = {
      ...existing,
      ...item,
      publishDate: item.publishDate || existing.publishDate || today,
      updatedAt: nowStr,
    };
    list[index] = updated;
    await writeJSONAtomic(FILES.MUSIC, list);
    return updated;
  } else {
    // Create mode
    const newId = `music-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newTrack: Music = {
      id: newId,
      title: item.title || '',
      artists: item.artists || 'BUOGS',
      audio: item.audio || '',
      cover: item.cover || '',
      tags: item.tags || [],
      publishDate: item.publishDate || today,
      featured: item.featured ?? false,
      published: item.published ?? true,
      sortOrder: item.sortOrder ?? (list.length + 1),
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    list.unshift(newTrack);
    await writeJSONAtomic(FILES.MUSIC, list);
    return newTrack;
  }
}

export async function deleteMusic(id: string): Promise<boolean> {
  const list = getMusicList(false);
  const target = list.find(m => m.id === id);
  if (!target) return false;

  const newList = list.filter(m => m.id !== id);
  await writeJSONAtomic(FILES.MUSIC, newList);

  // Orphan cleanup for audio and cover
  if (target.audio) cleanupOrphanMediaFile(target.audio);
  if (target.cover) cleanupOrphanMediaFile(target.cover);

  return true;
}

// ----------------------------------------------------
// MUSIC TAGS REPOSITORY
// ----------------------------------------------------
export function getMusicTags(publishedOnly = false): MusicTag[] {
  const tags = readJSON<MusicTag[]>(FILES.MUSIC_TAGS, []);
  const filtered = publishedOnly ? tags.filter(t => t.published) : tags;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveMusicTag(tag: MusicTag): Promise<MusicTag> {
  const tags = getMusicTags(false);
  const index = tags.findIndex(t => t.id === tag.id);
  if (index >= 0) {
    tags[index] = tag;
  } else {
    tags.push(tag);
  }
  await writeJSONAtomic(FILES.MUSIC_TAGS, tags);
  return tag;
}

export async function deleteMusicTag(id: string): Promise<{ success: boolean; message?: string }> {
  // Check if tag is used by any music item
  const musicList = getMusicList(false);
  const usedCount = musicList.filter(m => m.tags.includes(id)).length;
  if (usedCount > 0) {
    return {
      success: false,
      message: `Tag đang được sử dụng bởi ${usedCount} bài nhạc. Vui lòng gỡ liên kết trước khi xóa.`
    };
  }

  const tags = getMusicTags(false);
  const newTags = tags.filter(t => t.id !== id);
  await writeJSONAtomic(FILES.MUSIC_TAGS, newTags);
  return { success: true };
}

// ----------------------------------------------------
// PROJECTS REPOSITORY
// ----------------------------------------------------
export function getProjects(publishedOnly = false): Project[] {
  const list = readJSON<Project[]>(FILES.PROJECTS, []);
  const filtered = publishedOnly ? list.filter(p => p.published) : list;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getProjectBySlug(slug: string, publishedOnly = true): Project | undefined {
  const list = getProjects(publishedOnly);
  return list.find(p => p.slug === slug);
}

export function getProjectById(id: string): Project | undefined {
  const list = getProjects(false);
  return list.find(p => p.id === id);
}

export async function saveProject(item: Partial<Project> & { id?: string }): Promise<Project> {
  const list = getProjects(false);
  const nowStr = new Date().toISOString();

  if (item.id) {
    const index = list.findIndex(p => p.id === item.id);
    if (index === -1) throw new Error('Project không tồn tại');

    const existing = list[index];
    const updated: Project = {
      ...existing,
      ...item,
      updatedAt: nowStr,
    };
    list[index] = updated;
    await writeJSONAtomic(FILES.PROJECTS, list);
    return updated;
  } else {
    const newId = `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newProject: Project = {
      id: newId,
      slug: item.slug || `project-${Date.now()}`,
      title: item.title || '',
      thumbnail: item.thumbnail || '',
      images: item.images || [],
      demoAudio: item.demoAudio || '',
      tags: item.tags || [],
      bpm: item.bpm ?? null,
      price: item.price ?? null,
      priceText: item.priceText || 'Liên hệ',
      shortDescription: item.shortDescription || '',
      content: item.content || '',
      featured: item.featured ?? false,
      published: item.published ?? true,
      sortOrder: item.sortOrder ?? (list.length + 1),
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    list.push(newProject);
    await writeJSONAtomic(FILES.PROJECTS, list);
    return newProject;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  const list = getProjects(false);
  const target = list.find(p => p.id === id);
  if (!target) return false;

  const newList = list.filter(p => p.id !== id);
  await writeJSONAtomic(FILES.PROJECTS, newList);

  if (target.thumbnail) cleanupOrphanMediaFile(target.thumbnail);
  if (target.demoAudio) cleanupOrphanMediaFile(target.demoAudio);
  if (target.images) target.images.forEach(img => cleanupOrphanMediaFile(img));

  return true;
}

// ----------------------------------------------------
// PROJECT TAGS REPOSITORY
// ----------------------------------------------------
export function getProjectTags(publishedOnly = false): ProjectTag[] {
  const tags = readJSON<ProjectTag[]>(FILES.PROJECT_TAGS, []);
  const filtered = publishedOnly ? tags.filter(t => t.published) : tags;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveProjectTag(tag: ProjectTag): Promise<ProjectTag> {
  const tags = getProjectTags(false);
  const index = tags.findIndex(t => t.id === tag.id);
  if (index >= 0) {
    tags[index] = tag;
  } else {
    tags.push(tag);
  }
  await writeJSONAtomic(FILES.PROJECT_TAGS, tags);
  return tag;
}

export async function deleteProjectTag(id: string): Promise<{ success: boolean; message?: string }> {
  const projects = getProjects(false);
  const usedCount = projects.filter(p => p.tags.includes(id)).length;
  if (usedCount > 0) {
    return {
      success: false,
      message: `Tag đang được sử dụng bởi ${usedCount} project. Vui lòng gỡ liên kết trước khi xóa.`
    };
  }

  const tags = getProjectTags(false);
  const newTags = tags.filter(t => t.id !== id);
  await writeJSONAtomic(FILES.PROJECT_TAGS, newTags);
  return { success: true };
}

// ----------------------------------------------------
// COURSES REPOSITORY
// ----------------------------------------------------
export function getCourses(publishedOnly = false): Course[] {
  const list = readJSON<Course[]>(FILES.COURSES, []);
  const filtered = publishedOnly ? list.filter(c => c.published) : list;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCourseBySlug(slug: string, publishedOnly = true): Course | undefined {
  const list = getCourses(publishedOnly);
  return list.find(c => c.slug === slug);
}

export function getCourseById(id: string): Course | undefined {
  const list = getCourses(false);
  return list.find(c => c.id === id);
}

export async function saveCourse(item: Partial<Course> & { id?: string }): Promise<Course> {
  const list = getCourses(false);
  const nowStr = new Date().toISOString();

  if (item.id) {
    const index = list.findIndex(c => c.id === item.id);
    if (index === -1) throw new Error('Khóa học không tồn tại');

    const existing = list[index];
    const updated: Course = {
      ...existing,
      ...item,
      updatedAt: nowStr,
    };
    list[index] = updated;
    await writeJSONAtomic(FILES.COURSES, list);
    return updated;
  } else {
    const newId = `course-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newCourse: Course = {
      id: newId,
      slug: item.slug || `course-${Date.now()}`,
      title: item.title || '',
      thumbnail: item.thumbnail || '',
      images: item.images || [],
      price: item.price ?? null,
      priceText: item.priceText || 'Liên hệ',
      shortDescription: item.shortDescription || '',
      content: item.content || '',
      featured: item.featured ?? false,
      published: item.published ?? true,
      sortOrder: item.sortOrder ?? (list.length + 1),
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    list.push(newCourse);
    await writeJSONAtomic(FILES.COURSES, list);
    return newCourse;
  }
}

export async function deleteCourse(id: string): Promise<boolean> {
  const list = getCourses(false);
  const target = list.find(c => c.id === id);
  if (!target) return false;

  const newList = list.filter(c => c.id !== id);
  await writeJSONAtomic(FILES.COURSES, newList);

  if (target.thumbnail) cleanupOrphanMediaFile(target.thumbnail);
  if (target.images) target.images.forEach(img => cleanupOrphanMediaFile(img));

  return true;
}

// ----------------------------------------------------
// EQUIPMENT REPOSITORY
// ----------------------------------------------------
export function getEquipment(publishedOnly = false): Equipment[] {
  const list = readJSON<Equipment[]>(FILES.EQUIPMENT, []);
  const filtered = publishedOnly ? list.filter(e => e.published) : list;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getEquipmentBySlug(slug: string, publishedOnly = true): Equipment | undefined {
  const list = getEquipment(publishedOnly);
  return list.find(e => e.slug === slug);
}

export function getEquipmentById(id: string): Equipment | undefined {
  const list = getEquipment(false);
  return list.find(e => e.id === id);
}

export async function saveEquipment(item: Partial<Equipment> & { id?: string }): Promise<Equipment> {
  const list = getEquipment(false);
  const nowStr = new Date().toISOString();

  if (item.id) {
    const index = list.findIndex(e => e.id === item.id);
    if (index === -1) throw new Error('Thiết bị không tồn tại');

    const existing = list[index];
    const updated: Equipment = {
      ...existing,
      ...item,
      updatedAt: nowStr,
    };
    list[index] = updated;
    await writeJSONAtomic(FILES.EQUIPMENT, list);
    return updated;
  } else {
    const newId = `equipment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newEq: Equipment = {
      id: newId,
      slug: item.slug || `equipment-${Date.now()}`,
      title: item.title || '',
      category: item.category || 'general',
      thumbnail: item.thumbnail || '',
      images: item.images || [],
      price: item.price ?? null,
      priceText: item.priceText || 'Liên hệ',
      shortDescription: item.shortDescription || '',
      content: item.content || '',
      featured: item.featured ?? false,
      published: item.published ?? true,
      sortOrder: item.sortOrder ?? (list.length + 1),
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    list.push(newEq);
    await writeJSONAtomic(FILES.EQUIPMENT, list);
    return newEq;
  }
}

export async function deleteEquipment(id: string): Promise<boolean> {
  const list = getEquipment(false);
  const target = list.find(e => e.id === id);
  if (!target) return false;

  const newList = list.filter(e => e.id !== id);
  await writeJSONAtomic(FILES.EQUIPMENT, newList);

  if (target.thumbnail) cleanupOrphanMediaFile(target.thumbnail);
  if (target.images) target.images.forEach(img => cleanupOrphanMediaFile(img));

  return true;
}

// ----------------------------------------------------
// EQUIPMENT CATEGORIES REPOSITORY
// ----------------------------------------------------
export function getEquipmentCategories(publishedOnly = false): EquipmentCategory[] {
  const cats = readJSON<EquipmentCategory[]>(FILES.EQUIPMENT_CATEGORIES, []);
  const filtered = publishedOnly ? cats.filter(c => c.published) : cats;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveEquipmentCategory(cat: EquipmentCategory): Promise<EquipmentCategory> {
  const cats = getEquipmentCategories(false);
  const index = cats.findIndex(c => c.id === cat.id);
  if (index >= 0) {
    cats[index] = cat;
  } else {
    cats.push(cat);
  }
  await writeJSONAtomic(FILES.EQUIPMENT_CATEGORIES, cats);
  return cat;
}

export async function deleteEquipmentCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const items = getEquipment(false);
  const usedCount = items.filter(e => e.category === id).length;
  if (usedCount > 0) {
    return {
      success: false,
      message: `Danh mục đang được sử dụng bởi ${usedCount} thiết bị. Vui lòng gỡ liên kết trước khi xóa.`
    };
  }

  const cats = getEquipmentCategories(false);
  const newCats = cats.filter(c => c.id !== id);
  await writeJSONAtomic(FILES.EQUIPMENT_CATEGORIES, newCats);
  return { success: true };
}

// ----------------------------------------------------
// SITE SETTINGS REPOSITORY
// ----------------------------------------------------
export function getSettings(): SiteSettings {
  return readJSON<SiteSettings>(FILES.SETTINGS, {
    brandName: 'BUOGS',
    tagline: 'DJ / PRODUCER',
    genresText: 'VINAHOUSE · HOUSE LAK · VINATRANCE',
    about: 'Nội dung giới thiệu BUOGS',
    phone: '',
    zaloUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    address: '',
    contactHeading: 'BOOKING / MUSIC / PROJECT / COURSE / EQUIPMENT'
  });
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getSettings();
  const updated: SiteSettings = {
    ...current,
    ...data,
  };
  await writeJSONAtomic(FILES.SETTINGS, updated);
  return updated;
}
