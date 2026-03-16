const cron = require('node-cron');
const { getSkillDemand, getTrendingSkills } = require('../services/marketAnalyzer');

/**
 * Simple scheduled job to refresh market skill demand/trending snapshot.
 * Runs every 24 hours (midnight).
 */
function scheduleMarketUpdater() {
  cron.schedule('0 0 * * *', async () => {
    try {
      await getSkillDemand();
      await getTrendingSkills();
      // In a real system, cache or store the snapshot for faster reads.
      // Here we just ensure recalculation happens regularly.
      // eslint-disable-next-line no-console
      console.log('[marketUpdater] Refreshed market skill demand/trending');
    } catch (err) {
      console.error('[marketUpdater] Failed to refresh market data', err.message);
    }
  });
}

module.exports = { scheduleMarketUpdater };
