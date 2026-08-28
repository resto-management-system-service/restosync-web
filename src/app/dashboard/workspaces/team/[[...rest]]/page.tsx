'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationProfile } from '@clerk/nextjs';
import { AuthDisabledNotice } from '@/components/auth/auth-disabled-notice';
import { AUTH_DISABLED } from '@/lib/auth';
import { teamInfoContent } from '@/config/infoconfig';

export default function TeamPage() {
  if (AUTH_DISABLED) {
    return (
      <PageContainer pageTitle='Team Management'>
        <AuthDisabledNotice feature='Team management' />
      </PageContainer>
    );
  }
  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <OrganizationProfile />
    </PageContainer>
  );
}
