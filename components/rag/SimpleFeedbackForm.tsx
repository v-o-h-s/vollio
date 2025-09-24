'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SimpleFeedbackFormProps {
  feedbackType: 'quiz' | 'search' | 'general';
  targetId: string;
  onSubmitted?: () => void;
}

export function SimpleFeedbackForm({ 
  feedbackType, 
  targetId, 
  onSubmitted 
}: SimpleFeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/rag/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'feedback',
          data: {
            feedbackType,
            targetId,
            rating,
            feedback: feedback.trim()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Feedback submitted successfully');
      
      // Reset form
      setRating(0);
      setFeedback('');
      
      onSubmitted?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm font-medium">
            Rate your experience (1-5 stars)
          </Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`w-8 h-8 text-lg transition-colors ${
                  star <= rating
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="feedback" className="text-sm font-medium">
            Your feedback
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us about your experience..."
            className="mt-2"
            rows={3}
          />
        </div>

        <Button 
          type="submit" 
          disabled={submitting || rating === 0 || !feedback.trim()}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </Card>
  );
}