-- Drop the trigger enforcing pending_review
drop trigger if exists trg_enforce_pending_review on hackathons;

-- Drop the trigger helper function
drop function if exists enforce_pending_review_on_insert();

-- Alter default column value for status to 'published'
alter table hackathons alter column status set default 'published';
