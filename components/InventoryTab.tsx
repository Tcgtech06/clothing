'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingDown, ShoppingCart, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface InventoryProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  inStock: boolean;
  category: string;
  loyaltyPoints: number;
  poll?: {
    best: number;
    good: number;
    average: number;
    worst: number;
  };
}

export default function InventoryTab() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartQuantities, setCartQuantities] = useState<{ [key: string]: number }>({});
  const [orderedQuantities, setOrderedQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      // Load products from Firestore
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      const productsSnapshot = await getDocs(productsQuery);
      
      const productsData: InventoryProduct[] = [];
      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          name: data.name || '',
          price: data.price || 0,
          images: data.images || [],
          stock: data.stock || 0,
          inStock: data.inStock !== false,
          category: data.category || '',
          loyaltyPoints: data.loyaltyPoints || 0,
          poll: data.poll || { best: 0, good: 0, average: 0, worst: 0 },
        });
      });
      
      setProducts(productsData);

      // Calculate cart quantities from localStorage
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartQty: { [key: string]: number } = {};
      cartData.forEach((item: any) => {
        const productId = item.firestoreId || item.id.toString();
        cartQty[productId] = (cartQty[productId] || 0) + (item.quantity || 1);
      });
      setCartQuantities(cartQty);

      // Calculate ordered quantities from Firestore orders
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      const orderedQty: { [key: string]: number } = {};
      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        // Only count orders that are not delivered
        if (orderData.status !== 'delivered') {
          // Parse product names to extract quantities
          if (orderData.products && Array.isArray(orderData.products)) {
            orderData.products.forEach((productStr: string) => {
              // Try to match product names with inventory
              productsData.forEach((product) => {
                if (productStr.includes(product.name)) {
                  // Extract quantity from string like "Product Name x2"
                  const qtyMatch = productStr.match(/x(\d+)/);
                  const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
                  orderedQty[product.id] = (orderedQty[product.id] || 0) + qty;
                }
              });
            });
          }
        }
      });
      setOrderedQuantities(orderedQty);

    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStock = (productId: string, totalStock: number) => {
    const inCart = cartQuantities[productId] || 0;
    const ordered = orderedQuantities[productId] || 0;
    return Math.max(0, totalStock - inCart - ordered);
  };

  const getTotalPollVotes = (poll?: { best: number; good: number; average: number; worst: number }) => {
    if (!poll) return 0;
    return poll.best + poll.good + poll.average + poll.worst;
  };

  const getTopPollColor = (poll?: { best: number; good: number; average: number; worst: number }) => {
    if (!poll) return 'gray';
    const votes = [
      { type: 'best', count: poll.best, color: 'green' },
      { type: 'good', count: poll.good, color: 'blue' },
      { type: 'average', count: poll.average, color: 'yellow' },
      { type: 'worst', count: poll.worst, color: 'red' },
    ];
    const top = votes.sort((a, b) => b.count - a.count)[0];
    return top.count > 0 ? top.color : 'gray';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
        <p className="text-sm text-gray-600 mt-1">Track product stock, cart quantities, and orders</p>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No products in inventory yet.</p>
          <p className="text-sm text-gray-500 mt-2">Add products from the Products tab to see them here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Cart
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poll Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const available = getAvailableStock(product.id, product.stock);
                const inCart = cartQuantities[product.id] || 0;
                const ordered = orderedQuantities[product.id] || 0;
                const pollVotes = getTotalPollVotes(product.poll);
                const topColor = getTopPollColor(product.poll);

                return (
                  <tr key={product.id} className={available === 0 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0] || '/placeholder.png'}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Package className="w-3 h-3" />
                            {product.loyaltyPoints} points
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${inCart > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {inCart}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-orange-500" />
                        <span className={`text-sm font-medium ${ordered > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {ordered}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${available > 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm font-bold ${
                          available === 0 ? 'text-red-600' : 
                          available < 10 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {available}
                        </span>
                      </div>
                      {available === 0 && (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                      {available > 0 && available < 10 && (
                        <span className="text-xs text-orange-600 font-medium">Low Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pollVotes > 0 ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full bg-${topColor}-500`}></div>
                            <span className="text-xs font-medium text-gray-700 capitalize">{topColor}</span>
                          </div>
                          <div className="text-xs text-gray-500">{pollVotes} votes</div>
                          <div className="flex gap-1 mt-1">
                            <div className="w-8 h-1.5 bg-green-500 rounded" style={{ width: `${(product.poll?.best || 0) / pollVotes * 32}px` }}></div>
                            <div className="w-8 h-1.5 bg-blue-500 rounded" style={{ width: `${(product.poll?.good || 0) / pollVotes * 32}px` }}></div>
                            <div className="w-8 h-1.5 bg-yellow-500 rounded" style={{ width: `${(product.poll?.average || 0) / pollVotes * 32}px` }}></div>
                            <div className="w-8 h-1.5 bg-red-500 rounded" style={{ width: `${(product.poll?.worst || 0) / pollVotes * 32}px` }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No votes yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {products.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Products</p>
              <p className="text-lg font-bold text-gray-800">{products.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Stock</p>
              <p className="text-lg font-bold text-gray-800">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">In Carts</p>
              <p className="text-lg font-bold text-blue-600">
                {Object.values(cartQuantities).reduce((sum, qty) => sum + qty, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Ordered</p>
              <p className="text-lg font-bold text-orange-600">
                {Object.values(orderedQuantities).reduce((sum, qty) => sum + qty, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
