'use client';

import { useState, useEffect } from 'react';
import {
  Users, ShoppingBag, Package, RotateCcw, TrendingUp,
  DollarSign, ArrowUp, ArrowDown, Star, BarChart2, PieChart, Activity
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalProductsSold: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  ordersByStatus: { status: string; count: number; color: string }[];
  revenueByCategory: { category: string; revenue: number; count: number }[];
  recentActivity: { label: string; value: string; time: string; type: 'order' | 'user' | 'product' }[];
  dailyOrders: { date: string; count: number; revenue: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3B82F6',
  accepted: '#8B5CF6',
  processing: '#F59E0B',
  shipped: '#6366F1',
  nearby: '#EC4899',
  'out-for-delivery': '#F97316',
  delivered: '#10B981',
  returned: '#EF4444',
};

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0, totalOrders: 0, deliveredOrders: 0, returnedOrders: 0,
    pendingOrders: 0, totalRevenue: 0, avgOrderValue: 0, totalProductsSold: 0,
    topProducts: [], ordersByStatus: [], revenueByCategory: [],
    recentActivity: [], dailyOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Live orders
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snap) => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
      () => {}
    );
    return () => unsub();
  }, []);

  // Live users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  // Live products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  // Compute analytics whenever data changes
  useEffect(() => {
    if (orders.length === 0 && users.length === 0) { setLoading(false); return; }

    const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
    const delivered = orders.filter((o: any) => o.status === 'delivered').length;
    const returned = orders.filter((o: any) => o.status === 'returned').length;
    const pending = orders.filter((o: any) => !['delivered', 'returned'].includes(o.status)).length;
    const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    // Products sold count
    let totalSold = 0;
    const productSales: Record<string, { name: string; qty: number; revenue: number; category: string }> = {};
    orders.forEach((o: any) => {
      if (Array.isArray(o.productDetails)) {
        o.productDetails.forEach((item: any) => {
          totalSold += item.quantity || 1;
          const key = item.name || 'Unknown';
          if (!productSales[key]) productSales[key] = { name: key, qty: 0, revenue: 0, category: item.category || '' };
          productSales[key].qty += item.quantity || 1;
          productSales[key].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Orders by status
    const statusCount: Record<string, number> = {};
    orders.forEach((o: any) => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({
      status, count, color: STATUS_COLORS[status] || '#6B7280',
    }));

    // Revenue by category
    const catRevenue: Record<string, { revenue: number; count: number }> = {};
    orders.forEach((o: any) => {
      if (Array.isArray(o.productDetails)) {
        o.productDetails.forEach((item: any) => {
          const cat = item.category || 'Other';
          if (!catRevenue[cat]) catRevenue[cat] = { revenue: 0, count: 0 };
          catRevenue[cat].revenue += (item.price || 0) * (item.quantity || 1);
          catRevenue[cat].count += item.quantity || 1;
        });
      }
    });
    const revenueByCategory = Object.entries(catRevenue)
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily orders (last 7 days)
    const dailyMap: Record<string, { count: number; revenue: number }> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dailyMap[key] = { count: 0, revenue: 0 };
    }
    orders.forEach((o: any) => {
      if (o.createdAt) {
        const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (dailyMap[key]) {
          dailyMap[key].count += 1;
          dailyMap[key].revenue += o.total || 0;
        }
      }
    });
    const dailyOrders = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

    // Recent activity
    const recentActivity = orders.slice(0, 5).map((o: any) => ({
      label: `Order from ${o.customerName || 'Customer'}`,
      value: `₹${(o.total || 0).toLocaleString('en-IN')}`,
      time: o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN') : 'Recently',
      type: 'order' as const,
    }));

    setData({
      totalUsers: users.length,
      totalOrders: orders.length,
      deliveredOrders: delivered,
      returnedOrders: returned,
      pendingOrders: pending,
      totalRevenue,
      avgOrderValue: avgOrder,
      totalProductsSold: totalSold,
      topProducts,
      ordersByStatus,
      revenueByCategory,
      recentActivity,
      dailyOrders,
    });
    setLoading(false);
  }, [orders, users, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyOrders.map(d => d.count), 1);
  const maxRevenue = Math.max(...data.revenueByCategory.map(c => c.revenue), 1);
  const totalStatusCount = data.ordersByStatus.reduce((s, o) => s + o.count, 0);

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
          { label: 'Products Sold', value: data.totalProductsSold, icon: Package, color: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
          { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, color, light, text }) => (
          <div key={label} className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${light} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Order Status + Delivery Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Orders by Status</h3>
          </div>
          {data.ordersByStatus.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data.ordersByStatus.map(({ status, count, color }) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-gray-700 capitalize">{status.replace(/-/g, ' ')}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / totalStatusCount) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Delivery Analytics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Delivered', value: data.deliveredOrders, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Pending', value: data.pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Returned', value: data.returnedOrders, icon: RotateCcw, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Avg Order', value: `₹${data.avgOrderValue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-lg p-4`}>
                <Icon className={`w-6 h-6 ${color} mb-2`} />
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
          {data.totalOrders > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Delivery Rate</span>
                <span className="font-bold text-green-600">{Math.round((data.deliveredOrders / data.totalOrders) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${(data.deliveredOrders / data.totalOrders) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Orders Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-gray-800">Orders - Last 7 Days</h3>
        </div>
        <div className="flex items-end gap-3 h-40">
          {data.dailyOrders.map(({ date, count, revenue }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">{count}</span>
              <div className="w-full relative group">
                <div
                  className="w-full bg-primary rounded-t-md transition-all duration-500 cursor-pointer hover:bg-primary/80"
                  style={{ height: `${Math.max((count / maxDaily) * 100, count > 0 ? 8 : 2)}px` }}
                />
                {count > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                    {count} orders · ₹{revenue.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">{date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products + Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.qty} units · ₹{p.revenue.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600">{p.qty}</span>
                    <p className="text-xs text-gray-400">sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Revenue by Category</h3>
          </div>
          {data.revenueByCategory.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>
          ) : (
            <div className="space-y-3">
              {data.revenueByCategory.map(({ category, revenue, count }) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-bold text-gray-800">₹{revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{count} items sold</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>
                <span className="text-sm font-bold text-green-600">{a.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Missing imports used inside component
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
