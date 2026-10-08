'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getReportCsv } from '../api/service';
import type { ReportKind } from '../api/types';
import { downloadTextFile } from '../lib/download';

export function ExportCsvButton({ kind, date }: { kind: ReportKind; date: string }) {
  const { mutate, isPending } = useMutation({
    mutationFn: () => getReportCsv(kind, date),
    onSuccess: ({ filename, content }) => downloadTextFile(filename, content),
    onError: () => toast.error('No se pudo exportar el reporte')
  });

  return (
    <Button variant='outline' size='sm' disabled={isPending} onClick={() => mutate()}>
      <Icons.download className='mr-2 h-4 w-4' />
      {isPending ? 'Exportando…' : 'Exportar CSV'}
    </Button>
  );
}
