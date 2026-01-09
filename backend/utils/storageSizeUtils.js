/**
 * Utility to calculate count and storage size for multiple models
 * @param {Array} models - Array of Mongoose models
 * @param {Object} query - MongoDB query filter (e.g. { orgId: "1001" })
 * @returns {Object} results keyed by model name
 * // Suppose you have 3 models
 * @const models = [Model1, Model2, Model3];
 * @const orgId= "1001";
 * @const stats = await getStorageStats(models, { orgId });
 */
async function getStorageStats(models, query) {
  const results = {};

  for (const model of models) {
    const stats = await model.aggregate([
      { $match: query },
      { $project: { size: { $bsonSize: "$$ROOT" } } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" },
          avgSize: { $avg: "$size" },
          count: { $sum: 1 },
        },
      },
    ]);

    results[model.modelName] = stats.length
      ? {
          count: stats[0].count,
          totalSizeBytes: stats[0].totalSize,
          avgSizeBytes: stats[0].avgSize,
        }
      : { count: 0, totalSizeBytes: 0, avgSizeBytes: 0 };
  }

  return results;
}
module.exports = { getStorageStats };
