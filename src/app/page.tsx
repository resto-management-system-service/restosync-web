import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AUTH_DISABLED } from '@/lib/auth';

export default async function Page() {
  if (AUTH_DISABLED) {
    redirect('/dashboard/overview');
  }

  const { userId } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
