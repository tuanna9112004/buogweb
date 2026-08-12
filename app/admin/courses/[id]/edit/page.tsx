import { notFound } from 'next/navigation';
import { getCourseById } from '@/lib/storage/repository';
import CourseForm from '@/components/admin/CourseForm';

export const revalidate = 0;

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    notFound();
  }

  return <CourseForm initialData={course} isEdit={true} />;
}
