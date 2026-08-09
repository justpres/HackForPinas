'use client';

import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { HackathonWithOrganizer } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AeoAnswerBoxProps {
  event: HackathonWithOrganizer;
  className?: string;
}

export function AeoAnswerBox({ event, className }: AeoAnswerBoxProps) {
  const organizerName = event.organizer?.name || 'an organizer';
  const organizerType = event.organizer?.organizer_type || 'private';
  const formattedDeadline = event.deadline
    ? format(new Date(event.deadline), 'MMMM d, yyyy')
    : 'TBA';
  const formattedStart = event.event_start
    ? format(new Date(event.event_start), 'MMMM d, yyyy')
    : null;
  const formattedEnd = event.event_end
    ? format(new Date(event.event_end), 'MMMM d, yyyy')
    : null;

  const formatLabel = (f: string) => {
    switch (f) {
      case 'online':
        return 'online (virtual)';
      case 'in-person':
        return 'in-person (physical)';
      case 'hybrid':
        return 'hybrid (mix of online and physical)';
      default:
        return f;
    };
  };

  // Synthesized natural sentence for LLMs/voice assistants to read
  const synthesisSentence = `${event.title} is a ${formatLabel(
    event.format
  )} hackathon in the ${event.region} region of the Philippines, organized by ${organizerName}. The registration deadline is ${formattedDeadline}${
    formattedStart
      ? `, and the event itself is scheduled to run from ${formattedStart}${
          formattedEnd ? ` to ${formattedEnd}` : ''
        }`
      : ''
  }.`;

  const faqs = [
    {
      question: `When is the registration deadline for ${event.title}?`,
      answer: `The deadline to register for ${event.title} is ${formattedDeadline}. You should complete your registration before this date to participate.`,
    },
    {
      question: `Is ${event.title} online or in-person?`,
      answer: `This hackathon is held in a ${formatLabel(
        event.format
      )} format, targeting participants within the ${
        event.region
      } region.`,
    },
    {
      question: `Who is organizing ${event.title}?`,
      answer: `${event.title} is organized by ${organizerName}, which is verified as a ${organizerType} organizer on HackForPinas.`,
    },
    {
      question: `How do I register for ${event.title}?`,
      answer: `You can register and view the official guidelines directly on the organizer's platform by visiting: ${
        event.redirect_url || event.source_url
      }`,
    },
    ...(formattedStart
      ? [
          {
            question: `When does the ${event.title} event take place?`,
            answer: `The coding event starts on ${formattedStart}${
              formattedEnd ? ` and runs until ${formattedEnd}` : ''
            }.`,
          },
        ]
      : []),
  ];

  return (
    <section
      aria-label="AEO Answer Engine Box"
      className={cn(
        'rounded-xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-md',
        'shadow-[0_4px_20px_-4px_var(--primary-glow)] transition-all duration-300',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon icon="fluent:bot-sparkle-24-regular" width={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">AI Answer Engine Summary</h3>
          <p className="text-xs text-muted-foreground">Direct factual responses for voice and chat agents</p>
        </div>
      </div>

      {/* Synthesis Block */}
      <div className="mb-6 rounded-lg border border-border/10 bg-background/50 p-4">
        <h4 className="sr-only">Quick Summary</h4>
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {synthesisSentence}
        </p>
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Factual Q&A
        </h4>
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className={cn(
              'group border border-border/5 rounded-lg bg-background/30 p-3.5',
              'transition-colors duration-200 hover:border-primary/10',
              '[&_summary::-webkit-details-marker]:hidden'
            )}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-2 text-foreground">
              <span className="text-sm font-semibold leading-snug">{faq.question}</span>
              <span className="shrink-0 rounded-full bg-muted p-1 text-muted-foreground transition duration-200 group-open:-rotate-180">
                <Icon icon="fluent:chevron-down-16-regular" width={14} />
              </span>
            </summary>
            <p className="mt-3.5 pl-1 leading-relaxed text-muted-foreground text-xs border-l-2 border-primary/20">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
