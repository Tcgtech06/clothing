import { Award, Gift, Star, TrendingUp } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LoyaltyPage() {
  const userPoints = 2450;
  const nextTier = 3000;
  const progress = (userPoints / nextTier) * 100;

  const rewards = [
    { id: 1, name: '10% Off Coupon', points: 500, icon: Gift },
    { id: 2, name: 'Free Shipping', points: 300, icon: TrendingUp },
    { id: 3, name: '$25 Gift Card', points: 1000, icon: Award },
    { id: 4, name: 'Premium Member (1 Month)', points: 2000, icon: Star },
  ];

  const history = [
    { id: 1, action: 'Purchase', points: 150, date: '2026-04-15' },
    { id: 2, action: 'Review Product', points: 50, date: '2026-04-12' },
    { id: 3, action: 'Purchase', points: 200, date: '2026-04-08' },
    { id: 4, action: 'Referral Bonus', points: 100, date: '2026-04-05' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Loyalty Points</h1>

          {/* Points Summary Card */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-6 md:p-8 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Your Points</p>
                <h2 className="text-4xl md:text-5xl font-bold">{userPoints.toLocaleString()}</h2>
              </div>
              <Award className="w-16 h-16 opacity-80" />
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to Gold Tier</span>
                <span>{nextTier - userPoints} points to go</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Redeem Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rewards.map((reward) => {
                const Icon = reward.icon;
                const canRedeem = userPoints >= reward.points;
                
                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition ${
                      canRedeem ? 'cursor-pointer' : 'opacity-60'
                    }`}
                  >
                    <Icon className="w-10 h-10 text-primary mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">{reward.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{reward.points} points</p>
                    <button
                      disabled={!canRedeem}
                      className={`w-full py-2 rounded-lg font-semibold transition ${
                        canRedeem
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Redeem' : 'Not Enough Points'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points History */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Points History</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== history.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{item.action}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{item.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
