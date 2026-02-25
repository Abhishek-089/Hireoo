import { prisma } from '../lib/prisma.js'

async function applyTriggers() {
  console.log('Applying database triggers to keep daily counter in sync...')

  try {
    // Function to decrement counter when a match is deleted
    // Note: We decrement for ALL deletes, not just today's, because the counter
    // represents total unapplied matches regardless of when they were created
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION decrement_daily_match_count()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only decrement if the match was not applied
        IF OLD.applied = false THEN
          UPDATE "User"
          SET daily_matched_jobs_count = GREATEST(0, daily_matched_jobs_count - 1)
          WHERE id = OLD.user_id;
        END IF;
        
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Created decrement_daily_match_count function')

    // Create trigger on ScrapedPostMatch table for DELETE
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS sync_daily_count_on_delete ON "ScrapedPostMatch";
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER sync_daily_count_on_delete
        BEFORE DELETE ON "ScrapedPostMatch"
        FOR EACH ROW
        EXECUTE FUNCTION decrement_daily_match_count();
    `)
    console.log('✅ Created sync_daily_count_on_delete trigger')

    // Function to update counter when applied status changes
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_daily_match_count()
      RETURNS TRIGGER AS $$
      BEGIN
        -- If match was just marked as applied, decrement counter
        IF OLD.applied = false AND NEW.applied = true THEN
          UPDATE "User"
          SET daily_matched_jobs_count = GREATEST(0, daily_matched_jobs_count - 1)
          WHERE id = OLD.user_id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Created update_daily_match_count function')

    // Create trigger on ScrapedPostMatch table for UPDATE
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS sync_daily_count_on_update ON "ScrapedPostMatch";
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER sync_daily_count_on_update
        BEFORE UPDATE ON "ScrapedPostMatch"
        FOR EACH ROW
        EXECUTE FUNCTION update_daily_match_count();
    `)
    console.log('✅ Created sync_daily_count_on_update trigger')

    console.log('\n✅ All triggers applied successfully!')
    console.log('The daily counter will now stay in sync when matches are deleted or marked as applied.')
  } catch (error) {
    console.error('❌ Error applying triggers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyTriggers()
