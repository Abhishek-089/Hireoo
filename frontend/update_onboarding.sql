-- Update existing users to have onboarding_step = 7
-- This allows all existing users to use the extension immediately
UPDATE "User"
SET onboarding_step = 7
WHERE onboarding_step < 7;
