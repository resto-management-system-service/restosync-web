import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from '@/mocks/server';
import { resetDb } from '@/mocks/db';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});

afterAll(() => server.close());

// next/navigation is not available in jsdom — stub the hooks components use.
const push = vi.fn();
const replace = vi.fn();
const back = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, back, refresh, prefetch: vi.fn(), forward: vi.fn() }),
  usePathname: () => '/dashboard/menu',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  redirect: vi.fn()
}));

export const routerMock = { push, replace, back, refresh };
