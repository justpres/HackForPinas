---
title: Data and API reference
description: Understand the public event data model and the review workflow that keeps listings useful.
category: API Reference
order: 1
---

HackForPinas is designed as a public event directory. The interface presents approved events and their core details while the review workflow protects the quality of submissions.

## Event record

An event listing generally includes the fields below.

| Field | Description |
| --- | --- |
| `title` | The public event name. |
| `organizer` | The institution or team running the event. |
| `deadline` | The latest known application or registration deadline. |
| `source_url` | Official link for confirmation and applications. |

## Review workflow

Submitted events enter a review queue before they appear publicly. Reviewers check whether the source is credible, details are complete, and the opportunity is relevant to the Philippine tech community.

### Example event payload

```json
{
  "title": "Sample Build Weekend",
  "organizer": "Tambayan Community",
  "deadline": "2026-09-30",
  "source_url": "https://example.org/events/build-weekend"
}
```

## Integration guidance

Use the public interface for discovery, but treat organizer links as the source of truth. Application rules, eligibility, and schedules can change after a listing has been reviewed.
