'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationList } from '@clerk/nextjs';
import { AuthDisabledNotice } from '@/components/auth/auth-disabled-notice';
import { AUTH_DISABLED } from '@/lib/auth';
import { workspacesInfoContent } from '@/config/infoconfig';

export default function WorkspacesPage() {
  if (AUTH_DISABLED) {
    return (
      <PageContainer pageTitle='Workspaces'>
        <AuthDisabledNotice feature='Workspaces' />
      </PageContainer>
    );
  }
  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <OrganizationList
        appearance={{
          elements: {
            organizationListBox: 'space-y-2',
            organizationPreview: 'rounded-lg border p-4 hover:bg-accent',
            organizationPreviewMainIdentifier: 'text-lg font-semibold',
            organizationPreviewSecondaryIdentifier: 'text-sm text-muted-foreground'
          }
        }}
        afterSelectOrganizationUrl='/dashboard/workspaces/team'
        afterCreateOrganizationUrl='/dashboard/workspaces/team'
      />
    </PageContainer>
  );
}
