import React from 'react';

interface KeywordWordCloudProps {
  words: Array<{ text: string; value: number }>;
}

export const KeywordWordCloud: React.FC<KeywordWordCloudProps> = ({ words }) => {
  const maxValue = Math.max(...words.map(w => w.value));
  
  const getWordSize = (value: number) => {
    const minSize = 12;
    const maxSize = 48;
    const ratio = value / maxValue;
    return minSize + (maxSize - minSize) * ratio;
  };

  const getWordColor = (index: number) => {
    const colors = [
      'hsl(358, 85%, 56%)',
      'hsl(47, 96%, 53%)',
      'hsl(142, 76%, 46%)',
      'hsl(217, 91%, 70%)',
      'hsl(270, 95%, 75%)',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 p-8 min-h-[300px] bg-gradient-to-br from-muted/20 to-background rounded-lg">
      {words.map((word, index) => (
        <span
          key={word.text}
          className="font-semibold cursor-default hover:scale-110 transition-transform duration-200"
          style={{
            fontSize: `${getWordSize(word.value)}px`,
            color: getWordColor(index),
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          title={`${word.text}: ${word.value} mentions`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};