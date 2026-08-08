'use client';

import { Icon } from '@iconify/react';
import { SplitFlapText } from './SplitFlapText';
import { CountUp } from './CountUp';
import { LetterGlitch } from './LetterGlitch';

interface HeroSectionProps {
  stats: {
    openEvents: number;
    organizers: number;
    regions: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-black px-4 py-16 border-b border-border/10">
      {/* Glitch text background overlay */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth
          speed={10}
          colors={["#2b4539","#61dca3","#61b3dc"]}
          showCenterVignette={false}
          showOuterVignette
        />
      </div>

      <div className="container mx-auto flex max-w-3xl flex-col items-center text-center relative z-10">
        <div className="mb-6 flex justify-center w-full overflow-hidden">
          <SplitFlapText
            words={["DISCOVER THE", "PHILIPPINE HACKATHON"]}
            flipDuration={0.12}
            stagger={0.06}
            cycleDelay={2400}
            charset="alphanumeric"
            flipsPerChar={8}
            tileColor="#111827"
            textColor="#f8fafc"
            tileRadius={8}
            gap={6}
            fontSize="clamp(1.1rem, 4.5vw, 2.5rem)"
            loop
            padTo={20}
          />
        </div>
        <p className="mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Browse tech competitions from government agencies, universities, and private organizers across all regions.
        </p>
 
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Icon icon="fluent:trophy-16-regular" width={24} />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                <CountUp
                  from={0}
                  to={stats.openEvents}
                  separator=","
                  direction="up"
                  duration={1.2}
                  delay={0.1}
                />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Open Events</div>
            </div>
          </div>
 
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Icon icon="fluent:people-community-16-regular" width={24} />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                <CountUp
                  from={0}
                  to={stats.organizers}
                  separator=","
                  direction="up"
                  duration={1.2}
                  delay={0.2}
                />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Organizers</div>
            </div>
          </div>
 
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Icon icon="fluent:map-16-regular" width={24} />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                <CountUp
                  from={0}
                  to={stats.regions}
                  separator=","
                  direction="up"
                  duration={1.2}
                  delay={0.3}
                />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Regions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
