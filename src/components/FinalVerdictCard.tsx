import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface FinalVerdictCardProps {
  title: string;
  rating: number;
  description?: string;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : star <= rating + 0.5
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-muted text-muted-foreground'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}/5</span>
    </div>
  );
};

export const FinalVerdictCard: React.FC<FinalVerdictCardProps> = ({
  title,
  rating,
  description
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="ml-4">
          <StarRating rating={rating} />
        </div>
      </div>
    </Card>
  );
};