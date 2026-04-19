import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  size: number;
  unit: string;
  category: string;
  currentStock: number;
  minStock: number;
  location: string;
  householdId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Scan {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  userId: string;
  timestamp: any;
  householdId: string;
}

export async function updateStock(
  productId: string, 
  householdId: string, 
  userId: string, 
  type: 'in' | 'out', 
  quantity: number
) {
  const productRef = doc(db, 'households', householdId, 'products', productId);
  const change = type === 'in' ? quantity : -quantity;

  // Update product stock
  await updateDoc(productRef, {
    currentStock: increment(change),
    updatedAt: Timestamp.now()
  });

  // Record scan
  await addDoc(collection(db, 'households', householdId, 'scans'), {
    productId,
    type,
    quantity,
    userId,
    timestamp: Timestamp.now(),
    householdId
  });
}

export async function predictReplenishment(productId: string, householdId: string) {
  // Simple prediction logic:
  // 1. Get last 30 days of 'out' scans
  // 2. Calculate average daily consumption
  // 3. Estimate days remaining: currentStock / avgDailyConsumption
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const q = query(
    collection(db, 'households', householdId, 'scans'),
    where('productId', '==', productId),
    where('type', '==', 'out'),
    where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  let totalOut = 0;
  snapshot.forEach(doc => {
    totalOut += doc.data().quantity;
  });

  const avgDailyConsumption = totalOut / 30;
  
  const productDoc = await getDoc(doc(db, 'households', householdId, 'products', productId));
  const currentStock = productDoc.data()?.currentStock || 0;

  if (avgDailyConsumption === 0) return Infinity;
  return Math.floor(currentStock / avgDailyConsumption);
}
