import { z } from 'zod';
import { REGIONS, FORMATS, ORGANIZER_TYPES } from './constants';

export const submissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
  organizer_name: z.string().min(2, 'Organizer name must be at least 2 characters').max(100, 'Organizer name cannot exceed 100 characters'),
  organizer_type: z.enum(ORGANIZER_TYPES, { message: 'Invalid organizer type' }),
  region: z.enum(REGIONS, { message: 'Invalid region' }),
  format: z.enum(FORMATS, { message: 'Invalid format' }),
  source_url: z.string().url('Must be a valid URL').startsWith('https://', 'URL must start with https://'),
  redirect_url: z.string().url('Must be a valid URL').startsWith('https://', 'URL must start with https://'),
  deadline: z.string().datetime({ message: 'Invalid deadline date' }),
  event_start: z.string().datetime({ message: 'Invalid event start date' }).optional().nullable(),
  event_end: z.string().datetime({ message: 'Invalid event end date' }).optional().nullable(),
  contact_email: z.string().email('Invalid email address'),
  poster_image_url: z.string().url('Must be a valid URL').optional().nullable(),
});
