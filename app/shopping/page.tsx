'use client';

import * as React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  ShoppingCart,
  Printer,
  FileText,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

const mockShoppingList = [
  { id: '1', name: 'Laundry Detergent', brand: 'Rinso', qty: 2, unit: 'bags', reason: 'Out of stock', priority: 'High' },
  { id: '2', name: 'Shampoo', brand: 'Pantene', qty: 1, unit: 'bottle', reason: 'Critical level (1 left)', priority: 'High' },
  { id: '3', name: 'Liquid Hand Soap', brand: 'Lifebuoy', qty: 3, unit: 'refills', reason: 'Low stock (15%)', priority: 'Medium' },
  { id: '4', name: 'Dishwashing Liquid', brand: 'Sunlight', qty: 1, unit: 'bottle', reason: 'Low stock (8%)', priority: 'Medium' },
];

export default function ShoppingListPage() {
  const [items, setItems] = React.useState(mockShoppingList);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('StockFlow Shopping List', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let y = 45;
    items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} (${item.brand}) - Qty: ${item.qty} ${item.unit}`, 20, y);
      y += 10;
    });
    
    doc.save('shopping-list.pdf');
    toast.success("Shopping list exported as PDF");
  };

  const markAsBought = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Item marked as bought!");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Shopping List</h1>
            <p className="text-muted-foreground mt-2">Auto-generated based on your current stock and predictions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl px-6" onClick={exportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button className="rounded-xl px-6 shadow-lg shadow-primary/20">
              <Share2 className="mr-2 h-4 w-4" />
              Share List
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <Card key={item.id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={cn(
                        "w-2",
                        item.priority === 'High' ? "bg-destructive" : "bg-amber-500"
                      )} />
                      <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold tracking-wider">
                              {item.brand}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <FileText size={14} />
                            {item.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{item.qty}</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                              onClick={() => markAsBought(item.id)}
                            >
                              <CheckCircle2 size={20} />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-xl text-muted-foreground hover:text-destructive">
                              <Trash2 size={20} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-muted/30 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <ShoppingCart size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">All stocked up!</h3>
                  <p className="text-muted-foreground">Your shopping list is currently empty.</p>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-md bg-accent/30">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-bold">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">High Priority</span>
                  <span className="font-bold text-destructive">{items.filter(i => i.priority === 'High').length}</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    &quot;Recommended purchase quantities are calculated to last you for the next 4 months.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  <Printer className="mr-2 h-4 w-4" />
                  Print List
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  <FileText className="mr-2 h-4 w-4" />
                  Copy as Text
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear List
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
