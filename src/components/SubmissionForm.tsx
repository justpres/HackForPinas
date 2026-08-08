'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { REGIONS, FORMATS, ORGANIZER_TYPES } from '@/lib/constants';
import { submissionSchema } from '@/lib/validation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/SearchableSelect';

export function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    organizer_name: '',
    description: '',
    organizer_type: '',
    region: '',
    format: '',
    source_url: '',
    redirect_url: '',
    registration_deadline: '',
    event_start: '',
    event_end: '',
    contact_email: '',
    poster_url: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      // Map form field names to schema fields and convert values
      const payload = {
        title: formData.title,
        organizer_name: formData.organizer_name,
        description: formData.description,
        organizer_type: formData.organizer_type,
        region: formData.region,
        format: formData.format,
        source_url: formData.source_url,
        redirect_url: formData.redirect_url,
        deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : '',
        event_start: formData.event_start ? new Date(formData.event_start).toISOString() : null,
        event_end: formData.event_end ? new Date(formData.event_end).toISOString() : null,
        contact_email: formData.contact_email,
        poster_image_url: formData.poster_url || null,
      };

      const parsed = submissionSchema.parse(payload);
      setIsSubmitting(true);
      
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit event');
      }
      
      setIsSubmitted(true);
      toast.success('Event submitted successfully');
    } catch (error: any) {
      if (error.errors) {
        // Zod error
        const nextErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            const field = err.path[0];
            const mappedField = field === 'deadline' ? 'registration_deadline' :
                                field === 'poster_image_url' ? 'poster_url' : field;
            nextErrors[mappedField] = err.message;
          }
        });
        setErrors(nextErrors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error(error.message || 'Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-center" style={{ boxShadow: 'var(--shadow-resting)' }}>
        <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-600">
          <Icon icon="fluent:checkmark-circle-24-filled" width={48} />
        </div>
        <h2 className="text-xl font-semibold">Event submitted for review</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Thank you for contributing to HackForPinas! Your submission will be reviewed by our moderators shortly.
        </p>
        <Link href="/">
          <Button variant="default" className="mt-4">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6" style={{ boxShadow: 'var(--shadow-resting)' }}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizer_name">Organizer Name <span className="text-destructive">*</span></Label>
          <input
            id="organizer_name"
            name="organizer_name"
            type="text"
            value={formData.organizer_name}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.organizer_name && <p className="text-sm text-destructive">{errors.organizer_name}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="space-y-2 flex flex-col justify-start">
          <Label htmlFor="organizer_type">Organizer Type <span className="text-destructive">*</span></Label>
          <SearchableSelect
            value={formData.organizer_type}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, organizer_type: val }));
              if (errors.organizer_type) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.organizer_type;
                  return next;
                });
              }
            }}
            options={ORGANIZER_TYPES}
            placeholder="Select type..."
            searchPlaceholder="Search organizer types..."
            fullWidth
          />
          {errors.organizer_type && <p className="text-sm text-destructive">{errors.organizer_type}</p>}
        </div>

        <div className="space-y-2 flex flex-col justify-start">
          <Label htmlFor="region">Region <span className="text-destructive">*</span></Label>
          <SearchableSelect
            value={formData.region}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, region: val }));
              if (errors.region) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.region;
                  return next;
                });
              }
            }}
            options={REGIONS}
            placeholder="Select region..."
            searchPlaceholder="Search regions..."
            fullWidth
          />
          {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
        </div>

        <div className="space-y-2 flex flex-col justify-start">
          <Label htmlFor="format">Format <span className="text-destructive">*</span></Label>
          <SearchableSelect
            value={formData.format}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, format: val }));
              if (errors.format) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.format;
                  return next;
                });
              }
            }}
            options={FORMATS}
            placeholder="Select format..."
            searchPlaceholder="Search formats..."
            fullWidth
          />
          {errors.format && <p className="text-sm text-destructive">{errors.format}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration_deadline">Registration Deadline <span className="text-destructive">*</span></Label>
          <input
            id="registration_deadline"
            name="registration_deadline"
            type="datetime-local"
            value={formData.registration_deadline}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.registration_deadline && <p className="text-sm text-destructive">{errors.registration_deadline}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source_url">Source URL (Information Page)</Label>
          <input
            id="source_url"
            name="source_url"
            type="url"
            value={formData.source_url}
            onChange={handleChange}
            placeholder="https://..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.source_url && <p className="text-sm text-destructive">{errors.source_url}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirect_url">Redirect URL (Registration Page) <span className="text-destructive">*</span></Label>
          <input
            id="redirect_url"
            name="redirect_url"
            type="url"
            value={formData.redirect_url}
            onChange={handleChange}
            placeholder="https://..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.redirect_url && <p className="text-sm text-destructive">{errors.redirect_url}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_start">Event Start (Optional)</Label>
          <input
            id="event_start"
            name="event_start"
            type="datetime-local"
            value={formData.event_start}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.event_start && <p className="text-sm text-destructive">{errors.event_start}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_end">Event End (Optional)</Label>
          <input
            id="event_end"
            name="event_end"
            type="datetime-local"
            value={formData.event_end}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.event_end && <p className="text-sm text-destructive">{errors.event_end}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email (Optional)</Label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            placeholder="hello@example.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="poster_url">Poster Image URL (Optional)</Label>
          <input
            id="poster_url"
            name="poster_url"
            type="url"
            value={formData.poster_url}
            onChange={handleChange}
            placeholder="https://..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.poster_url && <p className="text-sm text-destructive">{errors.poster_url}</p>}
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        className="w-full md:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <Icon icon="fluent:spinner-ios-16-regular" className="mr-2 h-4 w-4 animate-spin" />
        )}
        Submit Event
      </Button>
    </form>
  );
}
