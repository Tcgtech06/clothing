'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Meh, X } from 'lucide-react';

interface PollProps {
  productId: string | number;
  initialPoll?: {
    best: number;
    good: number;
    average: number;
    worst: number;
  };
  onVote?: (vote: 'best' | 'good' | 'average' | 'worst') => void;
}

export default function ProductPoll({ productId, initialPoll, onVote }: PollProps) {
  const [poll, setPoll] = useState(initialPoll || { best: 0, good: 0, average: 0, worst: 0 });
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const totalVotes = poll.best + poll.good + poll.average + poll.worst;

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const handleVote = (voteType: 'best' | 'good' | 'average' | 'worst') => {
    // Check if user already voted (stored in localStorage)
    const votedProducts = JSON.parse(localStorage.getItem('votedProducts') || '{}');
    
    if (votedProducts[productId]) {
      alert('You have already voted for this product!');
      return;
    }

    // Update poll
    const newPoll = { ...poll, [voteType]: poll[voteType] + 1 };
    setPoll(newPoll);
    setUserVote(voteType);

    // Save vote to localStorage
    votedProducts[productId] = voteType;
    localStorage.setItem('votedProducts', JSON.stringify(votedProducts));

    // Show thank you message
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);

    // Call parent callback if provided
    if (onVote) {
      onVote(voteType);
    }
  };

  // Check if user already voted
  const votedProducts = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('votedProducts') || '{}')
    : {};
  const hasVoted = votedProducts[productId];

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
      {!hasVoted ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">Rate this product:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVote('best')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
            >
              <ThumbsUp className="w-4 h-4" />
              Best
            </button>
            <button
              onClick={() => handleVote('good')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              <ThumbsUp className="w-4 h-4" />
              Good
            </button>
            <button
              onClick={() => handleVote('average')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-medium"
            >
              <Meh className="w-4 h-4" />
              Average
            </button>
            <button
              onClick={() => handleVote('worst')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
            >
              <ThumbsDown className="w-4 h-4" />
              Worst
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            You voted: <span className="font-bold capitalize">{hasVoted}</span>
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Total votes: {totalVotes}
      </p>
    </div>
  );
}
