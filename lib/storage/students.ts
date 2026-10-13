import { randomUUID } from 'crypto';
import { Student } from '@/types';
import { readJSON, writeJSONAtomic } from './json-db';
import { cleanupOrphanMediaFile } from './repository';

export function getStudents(publishedOnly = false): Student[] {
  return readJSON<Student[]>('students.json', []).filter(s => !publishedOnly || s.published)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export async function saveStudent(data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>, id?: string) {
  const list = getStudents();
  const existing = id ? list.find(s => s.id === id) : undefined;
  if (id && !existing) return null;
  const now = new Date().toISOString();
  const student: Student = { ...data, id: id || randomUUID(), createdAt: existing?.createdAt || now, updatedAt: now };
  await writeJSONAtomic('students.json', existing ? list.map(s => s.id === id ? student : s) : [...list, student]);
  if (existing && existing.photo !== student.photo) cleanupOrphanMediaFile(existing.photo);
  return student;
}

export async function deleteStudent(id: string) {
  const list = getStudents();
  const student = list.find(s => s.id === id);
  if (!student) return false;
  await writeJSONAtomic('students.json', list.filter(s => s.id !== id));
  cleanupOrphanMediaFile(student.photo);
  return true;
}
