'use client';

import * as React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft,
  User,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const mockHistory = [
  { id: '1', product: 'Shampoo', brand: 'Pantene', type: 'out', qty: 1, user: 'Joshua', time: '2026-04-12 09:15', location: 'Bathroom' },
  { id: '2', product: 'Dishwashing Liquid', brand: 'Sunlight', type: 'in', qty: 3, user: 'Reynard', time: '2026-04-12 08:30', location: 'Pantry' },
  { id: '3', product: 'Liquid Hand Soap', brand: 'Lifebuoy', type: 'out', qty: 1, user: 'Joshua', time: '2026-04-11 18:45', location: 'Kitchen' },
  { id: '4', product: 'Laundry Detergent', brand: 'Rinso', type: 'in', qty: 2, user: 'Reynard', time: '2026-04-11 10:20', location: 'Laundry Room' },
  { id: '5', product: 'Body Wash', brand: 'Dove', type: 'out', qty: 1, user: 'Joshua', time: '2026-04-10 21:10', location: 'Bathroom' },
];

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Usage History</h1>
          <p className="text-muted-foreground mt-2">A complete log of all stock movements in your household.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by product, user, or location..." 
              className="pl-10 rounded-xl bg-muted/50 border-none focus-visible:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl px-6">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" className="rounded-xl px-6">
              <Filter className="mr-2 h-4 w-4" />
              Type
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-md overflow-hidden">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold">Movement</TableHead>
                  <TableHead className="font-bold">Product</TableHead>
                  <TableHead className="font-bold">Quantity</TableHead>
                  <TableHead className="font-bold">User</TableHead>
                  <TableHead className="font-bold">Time</TableHead>
                  <TableHead className="text-right font-bold">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((log) => (
                  <TableRow key={log.id} className="hover:bg-accent/50 transition-colors border-border">
                    <TableCell>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white",
                        log.type === 'in' ? "bg-emerald-500" : "bg-orange-500"
                      )}>
                        {log.type === 'in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.product}</p>
                        <p className="text-xs text-muted-foreground">{log.brand}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg font-bold">
                        {log.type === 'in' ? '+' : '-'}{log.qty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <User size={12} className="text-accent-foreground" />
                        </div>
                        <span className="text-sm font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.time}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {log.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </AppLayout>
  );
}
