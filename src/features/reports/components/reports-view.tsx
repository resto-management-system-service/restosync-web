'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatPriceCents } from '@/lib/format';
import {
  bestSellingQueryOptions,
  dailySummaryQueryOptions,
  paymentBreakdownQueryOptions
} from '../api/queries';
import { isValidISODate, todayISO } from '../lib/download';
import { ExportCsvButton } from './export-csv-button';

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta'
};

const paymentLabel = (method: string) => PAYMENT_LABELS[method] ?? method;

function SectionError({ message }: { message: string }) {
  return <p className='text-destructive text-sm'>{message}</p>;
}

function SectionSkeleton() {
  return (
    <div className='space-y-2'>
      <Skeleton className='h-6 w-full' />
      <Skeleton className='h-6 w-full' />
      <Skeleton className='h-6 w-2/3' />
    </div>
  );
}

function SummaryCards({ date }: { date: string }) {
  const { data, isPending, isError } = useQuery(dailySummaryQueryOptions(date));

  const cards = [
    { label: 'Ventas totales', value: data && formatPriceCents(data.totalSalesCents) },
    { label: 'Tickets', value: data && String(data.ticketCount) },
    { label: 'Ticket promedio', value: data && formatPriceCents(data.averageTicketCents) }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de ventas</CardTitle>
        <CardDescription>Ventas cerradas del día seleccionado.</CardDescription>
        <CardAction>
          <ExportCsvButton kind='daily-summary' date={date} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isError ? (
          <SectionError message='No se pudo cargar el resumen de ventas.' />
        ) : (
          <div className='grid gap-4 sm:grid-cols-3'>
            {cards.map((card) => (
              <div key={card.label} className='rounded-lg border p-4'>
                <p className='text-muted-foreground text-sm'>{card.label}</p>
                {isPending ? (
                  <Skeleton className='mt-2 h-8 w-24' />
                ) : (
                  <p className='mt-1 text-2xl font-semibold tabular-nums'>{card.value}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BestSellingCard({ date }: { date: string }) {
  const { data, isPending, isError } = useQuery(bestSellingQueryOptions(date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos más vendidos</CardTitle>
        <CardDescription>Ranking por cantidad vendida.</CardDescription>
        <CardAction>
          <ExportCsvButton kind='best-selling' date={date} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <SectionSkeleton />
        ) : isError ? (
          <SectionError message='No se pudo cargar el ranking de productos.' />
        ) : data.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Sin ventas en esta fecha.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>#</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className='text-right'>Cantidad</TableHead>
                <TableHead className='text-right'>Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product, index) => (
                <TableRow key={product.menuItemId}>
                  <TableCell className='text-muted-foreground'>{index + 1}</TableCell>
                  <TableCell className='font-medium'>{product.name}</TableCell>
                  <TableCell className='text-right tabular-nums'>{product.quantitySold}</TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPriceCents(product.revenueCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentBreakdownCard({ date }: { date: string }) {
  const { data, isPending, isError } = useQuery(paymentBreakdownQueryOptions(date));
  const rows = Object.entries(data ?? {});
  const total = rows.reduce((sum, [, cents]) => sum + cents, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de pagos</CardTitle>
        <CardDescription>Monto cobrado por método de pago.</CardDescription>
        <CardAction>
          <ExportCsvButton kind='payment-methods' date={date} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <SectionSkeleton />
        ) : isError ? (
          <SectionError message='No se pudo cargar el desglose de pagos.' />
        ) : rows.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Sin pagos en esta fecha.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método</TableHead>
                <TableHead className='text-right'>Monto</TableHead>
                <TableHead className='text-right'>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([method, cents]) => (
                <TableRow key={method}>
                  <TableCell className='font-medium'>{paymentLabel(method)}</TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPriceCents(cents)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {total > 0 ? `${Math.round((cents / total) * 100)}%` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportsView() {
  const [dateParam, setDateParam] = useQueryState('date', parseAsString.withDefault(todayISO()));
  const date = isValidISODate(dateParam) ? dateParam : todayISO();

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <label htmlFor='report-date' className='text-sm font-medium'>
          Fecha
        </label>
        <Input
          id='report-date'
          type='date'
          className='w-44'
          value={date}
          max={todayISO()}
          onChange={(e) => e.target.value && setDateParam(e.target.value)}
        />
      </div>
      <SummaryCards date={date} />
      <div className='grid gap-4 lg:grid-cols-2'>
        <BestSellingCard date={date} />
        <PaymentBreakdownCard date={date} />
      </div>
    </div>
  );
}
