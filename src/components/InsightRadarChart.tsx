import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface InsightRadarChartProps {
  data: {
    studentEngagement: number;
    contentQuality: number;
    conceptConnectivity: number;
    clarityOfExplanation: number;
    practicalExamples: number;
    visualDiagramMentions: number;
    studentInteraction: number;
    educationalDepth: number;
    retentionTechniques: number;
    targetAudience: string;
  };
}

export const InsightRadarChart: React.FC<InsightRadarChartProps> = ({ data }) => {
  const chartData = {
    labels: [
      'Student Engagement',
      'Content Quality',
      'Concept Connectivity',
      'Clarity',
      'Practical Examples',
      'Visual References',
      'Interaction',
      'Educational Depth',
      'Retention Techniques'
    ],
    datasets: [
      {
        label: 'Educational Insights',
        data: [
          data.studentEngagement,
          data.contentQuality,
          data.conceptConnectivity,
          data.clarityOfExplanation,
          data.practicalExamples,
          data.visualDiagramMentions,
          data.studentInteraction,
          data.educationalDepth,
          data.retentionTechniques
        ],
        backgroundColor: 'hsla(358, 85%, 56%, 0.2)',
        borderColor: 'hsl(358, 85%, 56%)',
        borderWidth: 2,
        pointBackgroundColor: 'hsl(358, 85%, 56%)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'hsl(358, 85%, 56%)',
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
            return `${context.label}: ${context.parsed.r}%`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: 'hsla(220, 13%, 20%, 0.3)',
        },
        angleLines: {
          color: 'hsla(220, 13%, 20%, 0.3)',
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <Radar data={chartData} options={options} />
    </div>
  );
};