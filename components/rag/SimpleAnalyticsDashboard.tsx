'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SimpleAnalytics {
  totalEmbeddings: number;
  totalQuizzes: number;
  totalSearches: number;
  averageRating: number;
  recentFeedback: Array<{
    id: string;
    feedbackType: string;
    rating: number;
    feedback: string;
    timestamp: Date;
  }>;
}

export function SimpleAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SimpleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rag/monitoring');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-muted-foreground">No analytics data available</p>
        </Card>
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">RAG System Analytics</h2>
        <p className="text-muted-foreground">Simple monitoring dashboard for RAG operations</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalEmbeddings}
          </div>
          <div className="text-sm text-muted-foreground">Total Embeddings</div>
        </Card>

        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.totalQuizzes}
          </div>
          <div className="text-sm text-muted-foreground">Total Quizzes</div>
        </Card>

        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.totalSearches}
          </div>
          <div className="text-sm text-muted-foreground">Total Searches</div>
        </Card>

        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {analytics.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
        
        {analytics.recentFeedback.length === 0 ? (
          <p className="text-muted-foreground">No feedback available</p>
        ) : (
          <div className="space-y-3">
            {analytics.recentFeedback.map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {feedback.feedbackType}
                    </Badge>
                    <Badge className={getRatingColor(feedback.rating)}>
                      {feedback.rating}/5
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm">{feedback.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Simple Status Indicators */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Embeddings: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Quiz Generation: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Search: Active</span>
          </div>
        </div>
      </Card>
    </div>
  );
}