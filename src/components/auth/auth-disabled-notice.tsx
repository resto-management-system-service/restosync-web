import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

/**
 * Placeholder shown in place of Clerk-only screens (workspaces, billing,
 * profile, auth) while `NEXT_PUBLIC_DISABLE_AUTH=true`.
 */
export function AuthDisabledNotice({ feature }: { feature: string }) {
  return (
    <div className='flex min-h-[300px] items-center justify-center p-4'>
      <Alert className='max-w-md'>
        <Icons.lock className='h-5 w-5' />
        <AlertTitle>{feature} is unavailable in dev</AlertTitle>
        <AlertDescription>
          Auth is disabled (`NEXT_PUBLIC_DISABLE_AUTH=true`). Unset it and add Clerk keys to use
          this screen.
        </AlertDescription>
      </Alert>
    </div>
  );
}
