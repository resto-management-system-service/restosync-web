import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TableStatus } from '../api/types';
import { STATUS_LABEL, STATUS_ORDER } from '../lib/layout';

const STATUS_BADGE_CLASS: Record<TableStatus, { badge: string; dot: string }> = {
  AVAILABLE: { badge: 'bg-green-500/15 text-green-700 border-green-500/30', dot: 'bg-green-500' },
  RESERVED: { badge: 'bg-amber-500/15 text-amber-700 border-amber-500/30', dot: 'bg-amber-500' },
  OCCUPIED: { badge: 'bg-red-500/15 text-red-700 border-red-500/30', dot: 'bg-red-500' }
};

/** Small legend of the three table statuses (Libre / Reservada / Ocupada). */
export default function StatusLegend() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {STATUS_ORDER.map((status) => (
        <Badge
          key={status}
          variant='outline'
          className={cn('gap-1.5', STATUS_BADGE_CLASS[status].badge)}
        >
          <span className={cn('size-1.5 rounded-full', STATUS_BADGE_CLASS[status].dot)} />
          {STATUS_LABEL[status]}
        </Badge>
      ))}
    </div>
  );
}
