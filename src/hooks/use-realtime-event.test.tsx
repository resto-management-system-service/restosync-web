import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getRealtimeSocket } from '@/lib/realtime/socket';
import { useRealtimeEvent } from './use-realtime-event';

vi.mock('@/lib/realtime/socket', () => ({
  getRealtimeSocket: vi.fn()
}));

type FakeSocket = { on: ReturnType<typeof vi.fn>; off: ReturnType<typeof vi.fn> };

function makeSocket(): FakeSocket {
  return { on: vi.fn(), off: vi.fn() };
}

describe('useRealtimeEvent', () => {
  it('subscribes to the named event on the shared socket and calls the handler on receipt', async () => {
    const socket = makeSocket();
    vi.mocked(getRealtimeSocket).mockResolvedValue(socket as never);

    const handler = vi.fn();
    renderHook(() => useRealtimeEvent('table.status_changed', handler));

    await waitFor(() =>
      expect(socket.on).toHaveBeenCalledWith('table.status_changed', expect.any(Function))
    );

    const listener = socket.on.mock.calls[0][1];
    act(() => listener({ tableId: 't1', status: 'OCCUPIED' }));

    expect(handler).toHaveBeenCalledWith({ tableId: 't1', status: 'OCCUPIED' });
  });

  it('always invokes the latest handler without resubscribing', async () => {
    const socket = makeSocket();
    vi.mocked(getRealtimeSocket).mockResolvedValue(socket as never);

    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useRealtimeEvent('table.status_changed', handler),
      {
        initialProps: { handler: first }
      }
    );

    await waitFor(() => expect(socket.on).toHaveBeenCalledTimes(1));
    rerender({ handler: second });

    const listener = socket.on.mock.calls[0][1];
    act(() => listener({ tableId: 't1' }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ tableId: 't1' });
    expect(socket.on).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes the same listener on unmount (no leak / stale handler)', async () => {
    const socket = makeSocket();
    vi.mocked(getRealtimeSocket).mockResolvedValue(socket as never);

    const handler = vi.fn();
    const { unmount } = renderHook(() => useRealtimeEvent('table.status_changed', handler));

    await waitFor(() => expect(socket.on).toHaveBeenCalled());
    const listener = socket.on.mock.calls[0][1];

    unmount();

    expect(socket.off).toHaveBeenCalledWith('table.status_changed', listener);
  });

  it('does not subscribe if no socket is available (unauthenticated)', async () => {
    const socket = makeSocket();
    vi.mocked(getRealtimeSocket).mockResolvedValue(null as never);

    renderHook(() => useRealtimeEvent('table.status_changed', vi.fn()));

    // Give the resolved promise a chance to (not) subscribe.
    await act(async () => {});
    expect(socket.on).not.toHaveBeenCalled();
  });
});
