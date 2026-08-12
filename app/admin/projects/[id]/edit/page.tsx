import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/storage/repository';
import ProjectForm from '@/components/admin/ProjectForm';

export const revalidate = 0;

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectForm initialData={project} isEdit={true} />;
}
