import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('socket.io-client', () => ({
  io: vi.fn()
}));

vi.mock('@/lib/api-session', () => ({
  ensureApiSession: vi.fn()
}));

import { io } from 'socket.io-client';
import { ensureApiSession } from '@/lib/api-session';
import { resolveSocketUrl } from './socket';

describe('resolveSocketUrl', () => {
  it('strips the /api prefix to connect at the origin (same host/port as REST)', () => {
    expect(resolveSocketUrl('http://localhost:3000/api')).toBe('http://localhost:3000');
    expect(resolveSocketUrl('https://restosync-api.fly.dev/api')).toBe(
      'https://restosync-api.fly.dev'
    );
  });

  it('falls back to stripping the /api suffix when the URL is not absolute', () => {
    expect(resolveSocketUrl('/api')).toBe('');
  });
});

describe('getRealtimeSocket', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(io).mockReset();
    vi.mocked(ensureApiSession).mockReset();
  });

  it('connects with the access token from the shared API session, in handshake.auth', async () => {
    vi.mocked(ensureApiSession).mockResolvedValue({
      accessToken: 'tok-access',
      refreshToken: 'tok-refresh'
    });
    const fakeSocket = { connected: false, on: vi.fn(), off: vi.fn() };
    vi.mocked(io).mockReturnValue(fakeSocket as never);

    const { getRealtimeSocket } = await import('./socket');
    const socket = await getRealtimeSocket();

    expect(io).toHaveBeenCalledWith('http://localhost:3000', {
      auth: { token: 'tok-access' }
    });
    expect(socket).toBe(fakeSocket);
  });

  it('returns null (and never opens a socket) when there is no API session', async () => {
    vi.mocked(ensureApiSession).mockResolvedValue(null);

    const { getRealtimeSocket } = await import('./socket');
    const socket = await getRealtimeSocket();

    expect(socket).toBeNull();
    expect(io).not.toHaveBeenCalled();
  });

  it('reuses the same socket across calls once created', async () => {
    vi.mocked(ensureApiSession).mockResolvedValue({
      accessToken: 'tok-access',
      refreshToken: 'tok-refresh'
    });
    const fakeSocket = { connected: false, on: vi.fn(), off: vi.fn() };
    vi.mocked(io).mockReturnValue(fakeSocket as never);

    const { getRealtimeSocket } = await import('./socket');
    const first = await getRealtimeSocket();
    const second = await getRealtimeSocket();

    expect(first).toBe(fakeSocket);
    expect(second).toBe(first);
    expect(io).toHaveBeenCalledTimes(1);
  });
});
