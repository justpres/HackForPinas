import { NextRequest, NextResponse } from 'next/server';
import { submissionSchema } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitize';
import { validateRedirectUrl } from '@/lib/redirect-validator';
import { rateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    
    // Rate limit check
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();

    // Validate with Zod
    const validated = submissionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: validated.error.flatten().fieldErrors }, 
        { status: 400 }
      );
    }

    const data = validated.data;

    // Sanitize texts
    const sanitizedTitle = sanitizeText(data.title);
    const sanitizedDescription = sanitizeText(data.description);
    const sanitizedOrgName = sanitizeText(data.organizer_name);

    // Validate URLs
    const isRedirectValid = await validateRedirectUrl(data.redirect_url);
    if (!isRedirectValid.valid) {
      return NextResponse.json({ error: isRedirectValid.reason || 'Invalid redirect URL' }, { status: 400 });
    }

    if (data.source_url) {
      const isSourceValid = await validateRedirectUrl(data.source_url);
      if (!isSourceValid.valid) {
        return NextResponse.json({ error: isSourceValid.reason || 'Invalid source URL' }, { status: 400 });
      }
    }

    if (data.poster_image_url) {
      // Must use secure https protocol
      if (!data.poster_image_url.startsWith('https://')) {
        return NextResponse.json({ error: 'Poster image URL must use secure HTTPS protocol' }, { status: 400 });
      }
      // Validate image extension or secure content domains
      const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(data.poster_image_url);
      const isSecureDomain = /^(https:\/\/images\.unsplash\.com|https:\/\/res\.cloudinary\.com|https:\/\/[\w.-]+\.supabase\.co|https:\/\/[\w.-]+\.githubusercontent\.com|https:\/\/[\w.-]+\.fbcdn\.net)/i.test(data.poster_image_url);
      if (!hasImageExtension && !isSecureDomain) {
        return NextResponse.json({ error: 'Poster image URL must link to a valid image source' }, { status: 400 });
      }
    }

    const supabase = await createAdminClient();

    // Insert or get organizer
    const { data: existingOrg } = await supabase
      .from('organizers')
      .select()
      .eq('name', sanitizedOrgName)
      .single();

    let organizerId;
    if (existingOrg) {
      organizerId = existingOrg.id;
    } else {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizers')
        .insert({ 
          name: sanitizedOrgName, 
          organizer_type: data.organizer_type 
        })
        .select()
        .single();
        
      if (orgError) throw orgError;
      organizerId = newOrg?.id;
    }

    // Insert hackathon
    const { data: newHackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .insert({
        title: sanitizedTitle,
        description: sanitizedDescription,
        organizer_id: organizerId,
        redirect_url: data.redirect_url,
        source_url: data.source_url,
        region: data.region,
        format: data.format,
        deadline: data.deadline,
        event_start: data.event_start,
        event_end: data.event_end,
        source_type: 'community_submitted',
        status: 'published',
        poster_image_url: data.poster_image_url
      })
      .select()
      .single();

    if (hackathonError) throw hackathonError;

    // Insert audit log
    await supabase.from('submissions_audit_log').insert({
      hackathon_id: newHackathon.id,
      action: 'submitted',
      actor: 'community',
      notes: `Submitted from IP: ${ip}`
    });

    return NextResponse.json({ success: true, id: newHackathon.id }, { status: 201 });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
