import Form from '@/app/course/_component/Form';
import { isAuthorized } from '@/utils/requiredRole';
import { redirect } from 'next/navigation';

export default async function Page() {
  const allowed = await isAuthorized(['INSTRUCTOR', 'ADMIN']);
  if (!allowed) {
    return redirect('/');
  }
  return (
    <div className='w-full md:w-[60%] mx-auto p-4  text-secondary-foreground'>
      <h1 className='pl-4 text-3xl'>Create Course</h1>
      <Form page="create" />
    </div>
  );
}