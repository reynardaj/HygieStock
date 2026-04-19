'use client';

import * as React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ScanLine, 
  History, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BarcodeScanner } from '@/components/inventory/barcode-scanner';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '@/components/auth/auth-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ScanPage() {
  const { householdId } = useAuth();
  const [isScanning, setIsScanning] = React.useState(false);
  const [scannedProduct, setScannedProduct] = React.useState<any>(null);
  const [scanType, setScanType] = React.useState<'in' | 'out'>('out');
  const [quantity, setQuantity] = React.useState(1);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  const fetchProductDetailsFromGemini = async (barcode: string) => {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      });
      const config = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["weight_g", "volume_ml", "product_name", "category"],
          properties: {
            product_name: {
              type: Type.STRING,
            },
            weight_g: {
              type: Type.INTEGER,
            },
            volume_ml: {
              type: Type.INTEGER,
            },
            category: {
              type: Type.STRING,
              enum: ["body_soap", "dishwash_soap", "shampoo", "detergent", "toothpaste", "facewash", "sunscreen", "other"],
            },
          },
        },
        systemInstruction: [
            {
              text: `you are a indonesian product researcher, i provide you with indonesian product id (barcode), and you search for the following product details:
- product name
- weight / volume / both
- category (can be derived from product name/product description).`,
            }
        ],
        tools: [
          { googleSearch: {} }
        ],
      };
      const model = 'gemini-flash-latest';
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: barcode,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model,
        config,
        contents,
      });
      
      if (response.text) {
        const data = JSON.parse(response.text);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Gemini API error:", error);
      return null;
    }
  };

  const onScanSuccess = React.useCallback(async (decodedText: string) => {
    setIsScanning(false);
    setIsProcessing(true);
    
    try {
      if (!householdId) {
        toast.error("You must be logged in to scan products.");
        setIsProcessing(false);
        return;
      }

      // 1. Search in database
      const productsRef = collection(db, `households/${householdId}/products`);
      const q = query(productsRef, where('barcode', '==', decodedText));
      const querySnapshot = await getDocs(q);
      
      let productData = null;
      
      if (!querySnapshot.empty) {
        // Product found in DB
        const docSnap = querySnapshot.docs[0];
        productData = {
          id: docSnap.id,
          ...docSnap.data()
        };
        toast.success("Product found in inventory!");
      } else {
        // Mock DB lookup failure
        toast.info("Product not found in database. Searching online...");
        const geminiData = await fetchProductDetailsFromGemini(decodedText);
        
        if (geminiData) {
          productData = {
            id: 'new_' + Date.now(),
            barcode: decodedText,
            name: geminiData.product_name,
            weight_g: geminiData.weight_g,
            volume_ml: geminiData.volume_ml,
            category: geminiData.category,
            currentStock: 0,
            isNew: true // Flag to know we need to create it
          };
          toast.success("Product details found online!");
        } else {
          toast.error("Could not find product details.");
          setIsProcessing(false);
          return;
        }
      }

      setScannedProduct(productData);
    } catch (error) {
      console.error("Scan processing error:", error);
      toast.error("An error occurred while processing the scan.");
    } finally {
      setIsProcessing(false);
    }
  }, [householdId]);

  const onScanFailure = React.useCallback((error: any) => {
    // console.warn(`Code scan error = ${error}`);
  }, []);

  const handleConfirm = async () => {
    if (!householdId || !scannedProduct) return;

    try {
      const change = scanType === 'in' ? quantity : -quantity;
      const newStock = Math.max(0, (scannedProduct.currentStock || 0) + change);
      
      if (scannedProduct.isNew) {
        // Create new product
        const productId = scannedProduct.barcode || `prod_${Date.now()}`;
        const productRef = doc(db, `households/${householdId}/products`, productId);
        
        await setDoc(productRef, {
          id: productId,
          barcode: scannedProduct.barcode,
          name: scannedProduct.name,
          weight_g: scannedProduct.weight_g || null,
          volume_ml: scannedProduct.volume_ml || null,
          category: scannedProduct.category || 'other',
          currentStock: newStock,
          householdId: householdId
        });
      } else {
        // Update existing product
        const productRef = doc(db, `households/${householdId}/products`, scannedProduct.id);
        await updateDoc(productRef, {
          name: scannedProduct.name,
          weight_g: scannedProduct.weight_g || null,
          volume_ml: scannedProduct.volume_ml || null,
          category: scannedProduct.category || 'other',
          currentStock: newStock
        });
      }

      toast.success(`Stock updated! New level: ${newStock}`);
      setScannedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold tracking-tight">Barcode Scanner</h1>
          <p className="text-muted-foreground">Scan a product barcode to update stock levels instantly.</p>
        </div>

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden">
                <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                    <Loader2 size={48} className="animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Identifying Product...</h2>
                    <p className="text-primary-foreground/70">Searching database and online sources.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : !isScanning && !scannedProduct ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden">
                <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <ScanLine size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Ready to Scan?</h2>
                    <p className="text-primary-foreground/70">Point your camera at any product barcode.</p>
                  </div>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="w-full py-8 text-xl font-bold rounded-2xl bg-white text-primary hover:bg-white/90"
                    onClick={() => setIsScanning(true)}
                  >
                    Start Scanning
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : isScanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="overflow-hidden rounded-3xl border-4 border-primary shadow-2xl bg-black aspect-square">
                <BarcodeScanner onScan={onScanSuccess} onError={onScanFailure} />
              </div>
              <Button 
                variant="outline" 
                className="w-full py-6 rounded-2xl font-bold"
                onClick={() => setIsScanning(false)}
              >
                <X className="mr-2 h-5 w-5" />
                Cancel Scan
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-accent/50 pb-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <Badge variant="outline" className="bg-background font-mono text-[10px] tracking-widest uppercase">
                        {scannedProduct.barcode}
                      </Badge>
                      {isEditing ? (
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Product Name</Label>
                            <Input 
                              id="edit-name"
                              value={scannedProduct.name}
                              onChange={(e) => setScannedProduct({...scannedProduct, name: e.target.value})}
                              className="bg-background"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-weight">Weight (g)</Label>
                              <Input 
                                id="edit-weight"
                                type="number"
                                value={scannedProduct.weight_g || ''}
                                onChange={(e) => setScannedProduct({...scannedProduct, weight_g: e.target.value ? parseInt(e.target.value) : null})}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-volume">Volume (ml)</Label>
                              <Input 
                                id="edit-volume"
                                type="number"
                                value={scannedProduct.volume_ml || ''}
                                onChange={(e) => setScannedProduct({...scannedProduct, volume_ml: e.target.value ? parseInt(e.target.value) : null})}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Input 
                              id="edit-category"
                              value={scannedProduct.category || ''}
                              onChange={(e) => setScannedProduct({...scannedProduct, category: e.target.value})}
                              className="bg-background"
                            />
                          </div>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setIsEditing(false)}
                            className="w-full mt-2"
                          >
                            Done Editing
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            {scannedProduct.name}
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setIsEditing(true)}>
                              Edit
                            </Button>
                          </CardTitle>
                          <CardDescription>
                            {scannedProduct.category} • {scannedProduct.weight_g ? `${scannedProduct.weight_g}g` : ''} {scannedProduct.volume_ml ? `${scannedProduct.volume_ml}ml` : ''}
                          </CardDescription>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0 ml-4" onClick={() => {
                      setScannedProduct(null);
                      setIsEditing(false);
                    }}>
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant={scanType === 'in' ? 'default' : 'outline'} 
                      className={cn(
                        "h-24 rounded-2xl flex flex-col gap-2 font-bold",
                        scanType === 'in' && "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20"
                      )}
                      onClick={() => setScanType('in')}
                    >
                      <Plus size={24} />
                      Stock In
                    </Button>
                    <Button 
                      variant={scanType === 'out' ? 'default' : 'outline'} 
                      className={cn(
                        "h-24 rounded-2xl flex flex-col gap-2 font-bold",
                        scanType === 'out' && "bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
                      )}
                      onClick={() => setScanType('out')}
                    >
                      <Minus size={24} />
                      Stock Out
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-8">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-12 h-12 rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus size={20} />
                    </Button>
                    <div className="text-center">
                      <p className="text-4xl font-bold">{quantity}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Qty</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-12 h-12 rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus size={20} />
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Stock:</span>
                    <span className="font-bold">{scannedProduct.currentStock}</span>
                  </div>

                  <Button 
                    className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20"
                    onClick={handleConfirm}
                  >
                    Confirm Update
                    <CheckCircle2 className="ml-2 h-6 w-6" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Recent Scans
            </h3>
            <Button variant="link" size="sm" className="text-primary font-bold">View All</Button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Shampoo', type: 'out', qty: 1, time: '2 mins ago', user: 'Joshua' },
              { name: 'Dishwashing Liquid', type: 'in', qty: 3, time: '1 hour ago', user: 'Reynard' },
            ].map((scan, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white",
                    scan.type === 'in' ? "bg-emerald-500" : "bg-orange-500"
                  )}>
                    {scan.type === 'in' ? <Plus size={14} /> : <Minus size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{scan.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{scan.user} • {scan.time}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-lg font-bold">
                  {scan.type === 'in' ? '+' : '-'}{scan.qty}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
