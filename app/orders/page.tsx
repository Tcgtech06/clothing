import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const orders = [
  {
    id: 'ORD-2026-001',
    date: '2026-04-15',
    status: 'delivered',
    total: 299.99,
    items: 2,
    products: ['Premium Headphones', 'USB-C Cable'],
  },
  {
    id: 'ORD-2026-002',
    date: '2026-04-12',
    status: 'shipped',
    total: 149.99,
    items: 1,
    products: ['Wireless Earbuds'],
  },
  {
    id: 'ORD-2026-003',
    date: '2026-04-08',
    status: 'processing',
    total: 579.98,
    items: 3,
    products: ['Smart Watch', 'Laptop Stand', 'Mechanical Keyboard'],
  },
  {
    id: 'ORD-2026-004',
    date: '2026-04-05',
    status: 'delivered',
    total: 89.99,
    items: 1,
    products: ['Wireless Mouse'],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'shipped':
      return <Truck className="w-5 h-5 text-blue-600" />;
    case 'processing':
      return <Clock className="w-5 h-5 text-yellow-600" />;
    default:
      return <Package className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{order.id}</h3>
                    <p className="text-sm text-gray-500">Placed on {order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items} {order.items === 1 ? 'item' : 'items'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.products.map((product, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold text-gray-800">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (hidden when orders exist) */}
        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold">
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
