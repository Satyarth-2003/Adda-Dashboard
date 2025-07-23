import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, value, icon: Icon, description }) => {
  const getColorClass = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className={`text-2xl font-bold ${getColorClass(value)}`}>
            {value}%
          </div>
          <Progress 
            value={value} 
            className="h-2" 
            style={{
              background: `hsl(var(--muted))`,
            }}
          />
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};