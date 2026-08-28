import { UserProfile } from '@clerk/nextjs';
import { AuthDisabledNotice } from '@/components/auth/auth-disabled-notice';
import { AUTH_DISABLED } from '@/lib/auth';

export default function ProfileViewPage() {
  if (AUTH_DISABLED) {
    return <AuthDisabledNotice feature='Your profile' />;
  }
  return (
    <div className='flex w-full flex-col p-4'>
      <UserProfile />
    </div>
  );
}
