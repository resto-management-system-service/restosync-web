import { useState } from 'react';
import { Kanban, KanbanBoard, KanbanColumn, KanbanItem } from 'restosync-web';

const initial: Record<string, string[]> = {
  New: ['#1042 · Table 4', '#1043 · Pickup'],
  'In kitchen': ['#1039 · Table 9', '#1040 · Delivery'],
  Ready: ['#1037 · Table 2']
};

export const OrderBoard = () => {
  const [columns] = useState(initial);
  return (
    <Kanban value={columns} onValueChange={() => {}} getItemValue={(i) => i}>
      <KanbanBoard className='grid grid-cols-3 gap-3'>
        {Object.entries(columns).map(([name, items]) => (
          <KanbanColumn key={name} value={name} className='bg-muted/40 rounded-lg p-2'>
            <div className='px-1 pb-2 text-sm font-medium'>{name}</div>
            <div className='flex flex-col gap-2'>
              {items.map((item) => (
                <KanbanItem
                  key={item}
                  value={item}
                  className='rounded-md border bg-white p-2 text-sm shadow-sm'
                >
                  {item}
                </KanbanItem>
              ))}
            </div>
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </Kanban>
  );
};
