'use client';

import * as React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  ScanLine,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Healthy', 'Low', 'Critical', 'Out'];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { householdId } = useAuth();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Filter state
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([]);

  // Form state
  const [newProduct, setNewProduct] = React.useState({
    barcode: '',
    name: '',
    weight_g: '',
    volume_ml: '',
    category: '',
    stock: '',
    location: ''
  });

  React.useEffect(() => {
    if (!householdId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `households/${householdId}/products`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [householdId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;
    
    try {
      const productId = newProduct.barcode || `prod_${Date.now()}`;
      const productRef = doc(db, `households/${householdId}/products`, productId);
      
      await setDoc(productRef, {
        id: productId,
        barcode: newProduct.barcode,
        name: newProduct.name,
        weight_g: newProduct.weight_g ? parseInt(newProduct.weight_g) : null,
        volume_ml: newProduct.volume_ml ? parseInt(newProduct.volume_ml) : null,
        category: newProduct.category || 'other',
        currentStock: parseInt(newProduct.stock) || 0,
        location: newProduct.location,
        householdId: householdId
      });

      toast.success("Product added successfully!");
      setIsAddDialogOpen(false);
      setNewProduct({
        barcode: '',
        name: '',
        weight_g: '',
        volume_ml: '',
        category: '',
        stock: '',
        location: ''
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product.");
    }
  };

  const getStatus = React.useCallback((stock: any) => {
    const s = typeof stock === 'number' ? stock : parseInt(stock);
    if (isNaN(s)) return 'Healthy';
    if (s === 0) return 'Out';
    if (s <= 2) return 'Critical';
    if (s <= 5) return 'Low';
    return 'Healthy';
  }, []);

  const categories = React.useMemo(() => 
    Array.from(new Set(products.map(p => p.category || 'Uncategorized'))).sort()
  , [products]);

  const locations = React.useMemo(() => 
    Array.from(new Set(products.map(p => p.location || 'No Location'))).sort()
  , [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const status = getStatus(p.currentStock);
      
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch = search === '' || 
                           (p.name?.toLowerCase().includes(search) ?? false) ||
                           (p.category?.toLowerCase().includes(search) ?? false);
      
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(status);
      const matchesCategory = selectedCategories.length === 0 || 
                               (p.category && selectedCategories.includes(p.category)) ||
                               (!p.category && selectedCategories.includes('Uncategorized'));
      const matchesLocation = selectedLocations.length === 0 || 
                               (p.location && selectedLocations.includes(p.location)) ||
                               (!p.location && selectedLocations.includes('No Location'));

      return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [products, searchQuery, selectedStatuses, selectedCategories, selectedLocations, getStatus]);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(i => i !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSearchQuery('');
  };

  const activeFiltersCount = selectedStatuses.length + selectedCategories.length + selectedLocations.length;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Product Catalog</h1>
            <p className="text-muted-foreground mt-2">Manage your household supplies and stock levels.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl px-6">
              <ScanLine className="mr-2 h-4 w-4" />
              Scan Barcode
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="rounded-xl px-6 shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <form onSubmit={handleAddProduct}>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Enter product details or scan the barcode to auto-fill.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="barcode">Barcode (EAN-13)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="barcode" 
                          placeholder="Scan or type barcode..." 
                          className="rounded-xl"
                          value={newProduct.barcode}
                          onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                        />
                        <Button type="button" size="icon" variant="outline" className="rounded-xl shrink-0">
                          <ScanLine className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Liquid Hand Soap" 
                        className="rounded-xl"
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="weight_g">Weight (g)</Label>
                        <Input 
                          id="weight_g" 
                          type="number" 
                          placeholder="e.g. 500" 
                          className="rounded-xl"
                          value={newProduct.weight_g}
                          onChange={(e) => setNewProduct({...newProduct, weight_g: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="volume_ml">Volume (ml)</Label>
                        <Input 
                          id="volume_ml" 
                          type="number" 
                          placeholder="e.g. 500" 
                          className="rounded-xl"
                          value={newProduct.volume_ml}
                          onChange={(e) => setNewProduct({...newProduct, volume_ml: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        placeholder="e.g. body_soap" 
                        className="rounded-xl"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock *</Label>
                        <Input 
                          id="stock" 
                          type="number" 
                          placeholder="0" 
                          className="rounded-xl"
                          required
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g. Kitchen" 
                          className="rounded-xl"
                          value={newProduct.location}
                          onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full rounded-xl py-6 font-bold">Save Product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by name or category..." 
              className="pl-10 rounded-xl bg-muted/50 border-none focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger render={
              <Button variant="outline" className="rounded-xl px-6 relative">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full border-2 border-background font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            } />
            <SheetContent side="right" className="p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-2xl">Filters</SheetTitle>
                <SheetDescription>Refine your product catalog view.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-180px)] p-6">
                <div className="space-y-8">
                  {/* Status Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)}
                          className={cn(
                            "flex items-center justify-center px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                            selectedStatuses.includes(status) 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all",
                            selectedCategories.includes(category)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Locations Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Locations</h3>
                    <div className="flex flex-wrap gap-2">
                      {locations.map(location => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => toggleFilter(selectedLocations, setSelectedLocations, location)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all",
                            selectedLocations.includes(location)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <SheetFooter className="p-6 border-t bg-muted/30">
                <div className="flex gap-4 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl"
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>
                  <SheetClose render={<Button className="flex-1 rounded-xl">Apply Filters</Button>} />
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              className="rounded-xl px-4 text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Product Table */}
        <Card className="border-none shadow-md overflow-hidden">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[300px] font-bold">Product</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Stock</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No products found. Add a product or scan a barcode to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStatus(product.currentStock);
                    return (
                      <TableRow key={product.id} className="group hover:bg-accent/50 transition-colors border-border">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold">
                              {product.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.weight_g ? `${product.weight_g}g` : ''} {product.volume_ml ? `${product.volume_ml}ml` : ''}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg font-medium bg-background">
                            {product.category || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {product.location || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{product.currentStock}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold",
                            status === 'Healthy' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
                            status === 'Low' && "bg-amber-100 text-amber-700 hover:bg-amber-100",
                            status === 'Critical' && "bg-orange-100 text-orange-700 hover:bg-orange-100",
                            status === 'Out' && "bg-destructive/10 text-destructive hover:bg-destructive/10",
                          )}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </AppLayout>
  );
}
