import { useEffect, useRef } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from 'restosync-web';

// ContextMenu only opens on a real contextmenu event — fire one on mount so the
// preview card shows the open menu (the whole point of the component).
export const Open = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: r.left + r.width / 2,
        clientY: r.top + r.height / 2
      })
    );
  }, []);
  return (
    <ContextMenu>
      <ContextMenuTrigger
        ref={ref}
        className='flex h-28 w-64 items-center justify-center rounded-md border border-dashed text-sm'
      >
        Right-click a menu item
      </ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuLabel>Margherita Pizza</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          Edit<ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuItem variant='destructive'>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
