'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Meh, Lock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, onSnapshot, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface PollProps {
  productId: string | number;
  firestoreId?: string;
  initialPoll?: {
    best: number;
    good: number;
    average: number;
    worst: number;
  };
  onVote?: (vote: 'best' | 'good' | 'average' | 'worst') => void;
}

export default function ProductPoll({ productId, firestoreId, initialPoll, onVote }: PollProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [poll, setPoll] = useState(initialPoll || { best: 0, good: 0, average: 0, worst: 0 });
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Check if user has received this product
  useEffect(() => {
    const checkVotingEligibility = async () => {
      if (!user || !firestoreId) {
        setCheckingEligibility(false);
        setCanVote(false);
        return;
      }

      try {
        console.log('🔍 Checking voting eligibility for product:', firestoreId);
        console.log('👤 User email:', user.email);
        
        // Query orders where user has received this product
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('customerEmail', '==', user.email),
          where('status', '==', 'delivered')
        );

        const querySnapshot = await getDocs(q);
        let hasProduct = false;

        console.log('📦 Found', querySnapshot.size, 'delivered orders');

        // Check if any delivered order contains this product
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          const productDetails = orderData.productDetails || [];
          
          console.log('🔎 Checking order:', doc.id, 'with', productDetails.length, 'products');
          console.log('📋 Product details:', productDetails);
          console.log('🎯 Looking for firestoreId:', firestoreId, 'or productId:', productId);
          
          // Check if this product is in the order
          const hasThisProduct = productDetails.some((item: any) => {
            console.log('  Comparing item:', {
              itemFirestoreId: item.firestoreId,
              itemId: item.id,
              targetFirestoreId: firestoreId,
              targetProductId: productId
            });
            
            const matches = item.firestoreId === firestoreId || 
                          String(item.id) === String(productId) ||
                          item.id === productId;
            if (matches) {
              console.log('✅ Found matching product in order!', item);
            }
            return matches;
          });

          if (hasThisProduct) {
            hasProduct = true;
          }
        });

        console.log('🎯 Can vote:', hasProduct);
        setCanVote(hasProduct);
      } catch (error) {
        console.error('❌ Error checking voting eligibility:', error);
        setCanVote(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkVotingEligibility();
  }, [user, user?.email, firestoreId, productId]);

  // Real-time listener for poll updates
  useEffect(() => {
    if (!firestoreId) return;

    const productRef = doc(db, 'products', firestoreId);
    const unsubscribe = onSnapshot(productRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.poll) {
          setPoll(data.poll);
        }
      }
    });

    return () => unsubscribe();
  }, [firestoreId]);

  // Check if user has already voted for this product from any of their delivered orders
  useEffect(() => {
    const checkExistingVotes = async () => {
      if (!user || !firestoreId) {
        setUserVote(null);
        return;
      }

      try {
        // Get all votes by this user for this product
        const userVotesRef = collection(db, 'userPollVotes');
        const voteQuery = query(
          userVotesRef,
          where('userId', '==', user.uid),
          where('productId', '==', firestoreId)
        );
        
        const voteSnapshot = await getDocs(voteQuery);
        
        // Get all delivered orders with this product
        const ordersRef = collection(db, 'orders');
        const ordersQuery = query(
          ordersRef,
          where('customerEmail', '==', user.email),
          where('status', '==', 'delivered')
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        
        // Get order IDs that contain this product
        const orderIdsWithProduct: string[] = [];
        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          const productDetails = orderData.productDetails || [];
          const hasThisProduct = productDetails.some((item: any) => 
            item.firestoreId === firestoreId || 
            String(item.id) === String(productId) ||
            item.id === productId
          );
          if (hasThisProduct) {
            orderIdsWithProduct.push(doc.id);
          }
        });
        
        // Get order IDs that user has already voted for
        const votedOrderIds: string[] = [];
        voteSnapshot.forEach((doc) => {
          const voteData = doc.data();
          if (voteData.orderId) {
            votedOrderIds.push(voteData.orderId);
          }
        });
        
        console.log('📊 Orders with this product:', orderIdsWithProduct);
        console.log('✅ Already voted for orders:', votedOrderIds);
        
        // Check if user has voted for ALL orders containing this product
        const hasUnvotedOrder = orderIdsWithProduct.some(orderId => !votedOrderIds.includes(orderId));
        
        if (!hasUnvotedOrder && orderIdsWithProduct.length > 0) {
          // User has voted for all orders with this product
          setUserVote('completed');
          console.log('🔒 User has already voted for all delivered orders with this product');
        } else {
          setUserVote(null);
          console.log('✅ User can vote (has unvoted orders)');
        }
        
      } catch (error) {
        console.error('Error checking existing votes:', error);
        setUserVote(null);
      }
    };

    checkExistingVotes();
  }, [user, user?.email, firestoreId, productId]);

  const totalVotes = poll.best + poll.good + poll.average + poll.worst;

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const handleVote = async (voteType: 'best' | 'good' | 'average' | 'worst') => {
    if (!user) {
      router.push('/signup');
      return;
    }

    if (!canVote) {
      alert('You can only vote for products you have received!');
      return;
    }

    if (!firestoreId) {
      alert('Cannot vote on static products. Please try a product added by admin.');
      return;
    }

    setIsVoting(true);

    try {
      // Find the first unvoted order with this product
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('customerEmail', '==', user.email),
        where('status', '==', 'delivered')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      
      // Get order IDs that contain this product
      const orderIdsWithProduct: string[] = [];
      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        const productDetails = orderData.productDetails || [];
        const hasThisProduct = productDetails.some((item: any) => 
          item.firestoreId === firestoreId || 
          String(item.id) === String(productId) ||
          item.id === productId
        );
        if (hasThisProduct) {
          orderIdsWithProduct.push(doc.id);
        }
      });
      
      // Get already voted order IDs
      const userVotesRef = collection(db, 'userPollVotes');
      const voteQuery = query(
        userVotesRef,
        where('userId', '==', user.uid),
        where('productId', '==', firestoreId)
      );
      const voteSnapshot = await getDocs(voteQuery);
      const votedOrderIds = voteSnapshot.docs.map(doc => doc.data().orderId).filter(Boolean);
      
      // Find first unvoted order
      const unvotedOrderId = orderIdsWithProduct.find(orderId => !votedOrderIds.includes(orderId));
      
      if (!unvotedOrderId) {
        alert('You have already voted for all your orders with this product!');
        setIsVoting(false);
        return;
      }
      
      // Update in Firestore
      const productRef = doc(db, 'products', firestoreId);
      await updateDoc(productRef, {
        [`poll.${voteType}`]: increment(1)
      });
      
      console.log('Vote saved to Firestore:', voteType);

      // Save vote record with orderId
      const voteId = `${user.uid}_${firestoreId}_${unvotedOrderId}`;
      await setDoc(doc(db, 'userPollVotes', voteId), {
        userId: user.uid,
        userEmail: user.email,
        productId: firestoreId,
        orderId: unvotedOrderId,
        vote: voteType,
        votedAt: new Date().toISOString()
      });

      setUserVote(voteType);

      // Show thank you message
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);

      // Call parent callback if provided
      if (onVote) {
        onVote(voteType);
      }
    } catch (error) {
      console.error('Error saving vote:', error);
      alert('Failed to save vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Poll</h3>
      
      {showThankYou && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center animate-fade-in">
          ✓ Thank you for your vote!
        </div>
      )}

      {/* Poll Results */}
      <div className="space-y-3 mb-6">
        {/* Best */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Best</span>
            <span className="text-sm text-gray-600">{poll.best} ({getPercentage(poll.best)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(poll.best)}%` }}
            />
          </div>
        </div>

        {/* Good */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Good</span>
            <span className="text-sm text-gray-600">{poll.good} ({getPercentage(poll.good)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(poll.good)}%` }}
            />
          </div>
        </div>

        {/* Average */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Average</span>
            <span className="text-sm text-gray-600">{poll.average} ({getPercentage(poll.average)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(poll.average)}%` }}
            />
          </div>
        </div>

        {/* Worst */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Worst</span>
            <span className="text-sm text-gray-600">{poll.worst} ({getPercentage(poll.worst)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(poll.worst)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Voting Buttons */}
      {checkingEligibility ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Checking eligibility...</p>
        </div>
      ) : !user ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <Lock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-800 font-medium mb-2">Login to vote</p>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Click here to login
          </button>
        </div>
      ) : !canVote ? (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
          <Lock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-800 font-medium">
            Only customers who have received this product can vote
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Purchase and receive this product to share your opinion!
          </p>
        </div>
      ) : userVote ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-sm text-green-800 font-medium">
            ✓ Vote submitted: <span className="font-bold capitalize">{userVote}</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            You can vote again on your next order!
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-3">Rate this product:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVote('best')}
              disabled={isVoting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsUp className="w-4 h-4" />
              Best
            </button>
            <button
              onClick={() => handleVote('good')}
              disabled={isVoting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsUp className="w-4 h-4" />
              Good
            </button>
            <button
              onClick={() => handleVote('average')}
              disabled={isVoting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Meh className="w-4 h-4" />
              Average
            </button>
            <button
              onClick={() => handleVote('worst')}
              disabled={isVoting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsDown className="w-4 h-4" />
              Worst
            </button>
          </div>
          {isVoting && (
            <p className="text-sm text-gray-500 mt-2 text-center">Saving your vote...</p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Total votes: {totalVotes}
      </p>
    </div>
  );
}
