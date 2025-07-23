import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SentimentTimelineProps {
  data: Array<{ time: number; sentiment: number }>;
}

export const SentimentTimeline: React.FC<SentimentTimelineProps> = ({ data }) => {
  const chartData = {
    labels: data.map(point => `${point.time}%`),
    datasets: [
      {
        label: 'Student Engagement',
        data: data.map(point => point.sentiment * 100),
        borderColor: 'hsl(358, 85%, 56%)',
        backgroundColor: 'hsla(358, 85%, 56%, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'hsl(358, 85%, 56%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Engagement: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: 'hsla(220, 13%, 20%, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Video Progress'
        },
        grid: {
          color: 'hsla(220, 13%, 20%, 0.1)',
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
};