-- Database trigger to keep daily_matched_jobs_count in sync when matches are deleted
-- This ensures the counter stays accurate even when posts are manually deleted

-- Function to decrement counter when a match is deleted
CREATE OR REPLACE FUNCTION decrement_daily_match_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement if the match was counted (not applied and was created today)
  IF OLD.applied = false AND OLD.created_at::date = CURRENT_DATE THEN
    UPDATE "User"
    SET daily_matched_jobs_count = GREATEST(0, daily_matched_jobs_count - 1)
    WHERE id = OLD.user_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on ScrapedPostMatch table
DROP TRIGGER IF EXISTS sync_daily_count_on_delete ON "ScrapedPostMatch";
CREATE TRIGGER sync_daily_count_on_delete
  BEFORE DELETE ON "ScrapedPostMatch"
  FOR EACH ROW
  EXECUTE FUNCTION decrement_daily_match_count();

-- Also handle updates (when applied status changes)
CREATE OR REPLACE FUNCTION update_daily_match_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If match was just marked as applied, decrement counter
  IF OLD.applied = false AND NEW.applied = true THEN
    IF OLD.created_at::date = CURRENT_DATE THEN
      UPDATE "User"
      SET daily_matched_jobs_count = GREATEST(0, daily_matched_jobs_count - 1)
      WHERE id = OLD.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_daily_count_on_update ON "ScrapedPostMatch";
CREATE TRIGGER sync_daily_count_on_update
  BEFORE UPDATE ON "ScrapedPostMatch"
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_match_count();
