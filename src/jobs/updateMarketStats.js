const cron = require('node-cron');
const { calculateSkillDemand } = require('../services/marketStatsService');

/**
 * Daily job to refresh market skill demand snapshot.
 * (In a real system, you'd cache/store the result; here we just recompute.)
 */
function scheduleMarketStatsJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      await calculateSkillDemand();
      console.log('[marketStats] refreshed skill demand snapshot');
    } catch (err) {
      console.error('[marketStats] refresh failed', err.message);
    }
  });
}

module.exports = { scheduleMarketStatsJob };
