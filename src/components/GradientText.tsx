import React from 'react';
import { cn } from '@/lib/utils';
import './GradientText.css';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientString = colors.join(', ');

  return (
    <div className={cn("animated-gradient-text", showBorder && "with-border", className)}>
      {showBorder && (
        <div
          className="gradient-overlay"
          style={{
            background: `linear-gradient(to right, ${gradientString})`,
            backgroundSize: '300% 100%',
            animation: `gradientMove ${animationSpeed}s ease infinite`,
          }}
        />
      )}
      <span
        className="text-content"
        style={{
          background: `linear-gradient(to right, ${gradientString})`,
          backgroundSize: '300% 100%',
          animation: `gradientMove ${animationSpeed}s ease infinite`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
    </div>
  );
}
