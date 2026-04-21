'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingDown, ShoppingCart, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useCart } from '@/lib/cart-context';

interface InventoryProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  inStock: boolean;
  category: string;
  loyaltyPoints: number;
  poll?: { best: number; good: number; average: number; worst: number };
}

export default function InventoryTab() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderedQuantities, setOrderedQuantities] = useState<{ [key: string]: number }>({});
  const { cart } = useCart();

  // Live products from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snap) => {
        setProducts(snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || '',
            price: data.price || 0,
            images: data.images || [],
            stock: data.stock || 0,
            inStock: data.inStock !== false,
            category: data.category || '',
            loyaltyPoints: data.loyaltyPoints || 0,
            poll: data.poll || { best: 0, good: 0, average: 0, worst: 0 },
          };
        }));
        setLoading(false);
      },
      (error) => {
        console.warn('Products listener error:', error.code);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Live orders from Firestore
  useEffect(() => {
    const auth = (db as any).app.options;
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      const orderedQty: { [key: string]: number } = {};
      snap.docs.forEach(d => {
        const order = d.data();
        if (order.status !== 'delivered' && Array.isArray(order.productDetails)) {
          order.productDetails.forEach((item: any) => {
            const pid = item.firestoreId || (item.id != null ? String(item.id) : null);
            if (pid) orderedQty[pid] = (orderedQty[pid] || 0) + (item.quantity || 1);
          });
        }
      });
      setOrderedQuantities(orderedQty);
    }, (error) => {
      console.warn('Orders listener error (user may not be authenticated):', error.code);
    });
    return () => unsub();
  }, []);

  // Compute live cart quantities from CartContext
  const cartQuantities: { [key: string]: number } = {};
  cart.forEach(item => {
    const pid = (item.product as any).firestoreId || (item.product.id != null ? String(item.product.id) : null);
    if (pid) cartQuantities[pid] = (cartQuantities[pid] || 0) + item.quantity;
  });

  const getAvailable = (id: string, stock: number) =>
    Math.max(0, stock - (cartQuantities[id] || 0) - (orderedQuantities[id] || 0));

  const getTopPoll = (poll?: { best: number; good: number; average: number; worst: number }) => {
    if (!poll) return { color: 'gray', votes: 0 };
    const total = poll.best + poll.good + poll.average + poll.worst;
    if (total === 0) return { color: 'gray', votes: 0 };
    const top = [
      { color: 'green', count: poll.best },
      { color: 'blue', count: poll.good },
      { color: 'yellow', count: poll.average },
      { color: 'red', count: poll.worst },
    ].sort((a, b) => b.count - a.count)[0];
    return { color: top.color, votes: total };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  const totalInCart = Object.values(cartQuantities).reduce((s, v) => s + v, 0);
  const totalOrdered = Object.values(orderedQuantities).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
        <p className="text-sm text-gray-600 mt-1">Track product stock, cart quantities, and orders — live updates</p>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No products in inventory yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Category', 'Price', 'Total Stock', 'In Cart', 'Ordered', 'Available', 'Poll Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => {
                const inCart = cartQuantities[product.id] || 0;
                const ordered = orderedQuantities[product.id] || 0;
                const available = getAvailable(product.id, product.stock);
                const { color: topColor, votes: pollVotes } = getTopPoll(product.poll);

                return (
                  <tr key={product.id} className={available === 0 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img className="h-12 w-12 rounded-lg object-cover" src={product.images[0] || ''} alt={product.name} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.loyaltyPoints} pts</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${inCart > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{inCart}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-orange-500" />
                        <span className={`text-sm font-medium ${ordered > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{ordered}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${available > 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm font-bold ${available === 0 ? 'text-red-600' : available < 10 ? 'text-orange-600' : 'text-green-600'}`}>{available}</span>
                      </div>
                      {available === 0 && <p className="text-xs text-red-600">Out of Stock</p>}
                      {available > 0 && available < 10 && <p className="text-xs text-orange-600">Low Stock</p>}
                    </td>
                    <td className="px-6 py-4">
                      {pollVotes > 0 ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <div className={`w-3 h-3 rounded-full ${
                              topColor === 'green' ? 'bg-green-500' :
                              topColor === 'blue' ? 'bg-blue-500' :
                              topColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs font-medium text-gray-700 capitalize">{topColor}</span>
                          </div>
                          <p className="text-xs text-gray-500">{pollVotes} votes</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No votes</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {products.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-600">Total Products</p><p className="text-lg font-bold text-gray-800">{products.length}</p></div>
          <div><p className="text-xs text-gray-600">Total Stock</p><p className="text-lg font-bold text-gray-800">{products.reduce((s, p) => s + p.stock, 0)}</p></div>
          <div><p className="text-xs text-gray-600">In Carts</p><p className="text-lg font-bold text-blue-600">{totalInCart}</p></div>
          <div><p className="text-xs text-gray-600">Ordered</p><p className="text-lg font-bold text-orange-600">{totalOrdered}</p></div>
        </div>
      )}
    </div>
  );
}
