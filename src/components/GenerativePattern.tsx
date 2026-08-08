'use client';

import { useMemo } from 'react';

interface GenerativePatternProps {
  seed: string;
  organizerType?: 'government' | 'university' | 'private';
  className?: string;
}

/**
 * Deterministic generative geometric pattern.
 * Given the same seed string, it always produces the same unique visual.
 * Color palette is driven by organizerType.
 */
export function GenerativePattern({
  seed,
  organizerType = 'private',
  className,
}: GenerativePatternProps) {
  const pattern = useMemo(() => generatePattern(seed, organizerType), [seed, organizerType]);

  return (
    <svg
      viewBox="0 0 400 225"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${pattern.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={pattern.bgStart} />
          <stop offset="100%" stopColor={pattern.bgEnd} />
        </linearGradient>
        <linearGradient id={`accent-${pattern.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={pattern.accentStart} />
          <stop offset="100%" stopColor={pattern.accentEnd} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="400" height="225" fill={`url(#bg-${pattern.id})`} />

      {/* Grid of geometric shapes */}
      {pattern.shapes.map((shape, i) => (
        <g
          key={i}
          transform={`translate(${shape.x}, ${shape.y}) rotate(${shape.rotation}, 0, 0)`}
          opacity={shape.opacity}
        >
          {shape.type === 'hexagon' && (
            <polygon
              points={hexagonPoints(shape.size)}
              fill={shape.filled ? `url(#accent-${pattern.id})` : 'none'}
              stroke={shape.filled ? 'none' : pattern.strokeColor}
              strokeWidth={1.5}
            />
          )}
          {shape.type === 'triangle' && (
            <polygon
              points={trianglePoints(shape.size)}
              fill={shape.filled ? `url(#accent-${pattern.id})` : 'none'}
              stroke={shape.filled ? 'none' : pattern.strokeColor}
              strokeWidth={1.5}
            />
          )}
          {shape.type === 'diamond' && (
            <polygon
              points={diamondPoints(shape.size)}
              fill={shape.filled ? `url(#accent-${pattern.id})` : 'none'}
              stroke={shape.filled ? 'none' : pattern.strokeColor}
              strokeWidth={1.5}
            />
          )}
          {shape.type === 'circle' && (
            <circle
              r={shape.size / 2}
              fill={shape.filled ? `url(#accent-${pattern.id})` : 'none'}
              stroke={shape.filled ? 'none' : pattern.strokeColor}
              strokeWidth={1.5}
            />
          )}
          {shape.type === 'cross' && (
            <>
              <line
                x1={-shape.size / 2}
                y1={0}
                x2={shape.size / 2}
                y2={0}
                stroke={pattern.strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={0}
                y1={-shape.size / 2}
                x2={0}
                y2={shape.size / 2}
                stroke={pattern.strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          )}
          {shape.type === 'circuit' && (
            <>
              <circle r={3} fill={pattern.strokeColor} />
              <line
                x1={3}
                y1={0}
                x2={shape.size}
                y2={0}
                stroke={pattern.strokeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <line
                x1={0}
                y1={3}
                x2={0}
                y2={shape.size}
                stroke={pattern.strokeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      ))}

      {/* Floating accent dots */}
      {pattern.dots.map((dot, i) => (
        <circle
          key={`dot-${i}`}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={pattern.accentStart}
          opacity={dot.opacity}
        />
      ))}

      {/* Subtle noise overlay for texture */}
      <rect
        width="400"
        height="225"
        fill="transparent"
        style={{ mixBlendMode: 'overlay' }}
        opacity={0.03}
      />
    </svg>
  );
}

// ─── Shape point generators ───────────────────────────────────

function hexagonPoints(size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${(size / 2) * Math.cos(angle)},${(size / 2) * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function trianglePoints(size: number): string {
  const h = (size * Math.sqrt(3)) / 2;
  return `0,${-h / 2} ${size / 2},${h / 2} ${-size / 2},${h / 2}`;
}

function diamondPoints(size: number): string {
  const half = size / 2;
  return `0,${-half} ${half},0 0,${half} ${-half},0`;
}

// ─── Deterministic hash → pattern generation ─────────────────

interface Shape {
  type: 'hexagon' | 'triangle' | 'diamond' | 'circle' | 'cross' | 'circuit';
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  filled: boolean;
}

interface Dot {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

interface Pattern {
  id: string;
  bgStart: string;
  bgEnd: string;
  accentStart: string;
  accentEnd: string;
  strokeColor: string;
  shapes: Shape[];
  dots: Dot[];
}

// Color palettes per organizer type
const PALETTES = {
  government: {
    bgStart: '#0c1929',
    bgEnd: '#0f2744',
    accentStart: '#3b82f6',
    accentEnd: '#1d4ed8',
    strokeColor: 'rgba(59, 130, 246, 0.35)',
  },
  university: {
    bgStart: '#1a0f2e',
    bgEnd: '#1e1145',
    accentStart: '#a855f7',
    accentEnd: '#7c3aed',
    strokeColor: 'rgba(168, 85, 247, 0.35)',
  },
  private: {
    bgStart: '#0c1f1f',
    bgEnd: '#0f2d2d',
    accentStart: '#14b8a6',
    accentEnd: '#0d9488',
    strokeColor: 'rgba(20, 184, 166, 0.35)',
  },
} as const;

const SHAPE_TYPES: Shape['type'][] = [
  'hexagon',
  'triangle',
  'diamond',
  'circle',
  'cross',
  'circuit',
];

// Simple deterministic hash (djb2)
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // ensure unsigned
}

// Seeded pseudo-random number generator (mulberry32)
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePattern(
  seed: string,
  organizerType: 'government' | 'university' | 'private'
): Pattern {
  const h = hashString(seed);
  const rng = createRng(h);
  const palette = PALETTES[organizerType];

  // Generate a unique short ID for gradient references
  const id = `gp-${(h % 99999).toString(36)}`;

  // Generate 12-20 shapes in a semi-random grid
  const shapeCount = 12 + Math.floor(rng() * 9);
  const shapes: Shape[] = [];

  // Use a grid-based placement to ensure good distribution
  const cols = 6;
  const rows = 4;
  const cellW = 400 / cols;
  const cellH = 225 / rows;

  for (let i = 0; i < shapeCount; i++) {
    const gridCol = i % cols;
    const gridRow = Math.floor(i / cols) % rows;

    // Jitter within cell
    const x = gridCol * cellW + cellW * 0.2 + rng() * cellW * 0.6;
    const y = gridRow * cellH + cellH * 0.2 + rng() * cellH * 0.6;

    const typeIndex = Math.floor(rng() * SHAPE_TYPES.length);
    const size = 14 + rng() * 22;
    const rotation = Math.floor(rng() * 6) * 30; // 0, 30, 60, 90...
    const opacity = 0.3 + rng() * 0.5;
    const filled = rng() > 0.65; // ~35% filled, rest are outlines

    shapes.push({
      type: SHAPE_TYPES[typeIndex],
      x,
      y,
      size,
      rotation,
      opacity,
      filled,
    });
  }

  // Generate 6-12 accent dots
  const dotCount = 6 + Math.floor(rng() * 7);
  const dots: Dot[] = [];
  for (let i = 0; i < dotCount; i++) {
    dots.push({
      x: rng() * 400,
      y: rng() * 225,
      r: 1.5 + rng() * 3,
      opacity: 0.15 + rng() * 0.25,
    });
  }

  return {
    id,
    ...palette,
    shapes,
    dots,
  };
}
