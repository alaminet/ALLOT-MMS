function computeAvgPrice(
  stock = [],
  location,
  newQty,
  newPrice,
  existingAvgPrice = 0
) {
  const existingPrice = Number(existingAvgPrice || 0);
  const parsedNewQty = Number(newQty || 0);
  const parsedNewPrice = Number(newPrice || 0);

  // Sum all on-hand quantity across locations BEFORE the update
  const totalOnHandBefore = (stock || []).reduce(
    (sum, s) => sum + Number(s.onHandQty || 0),
    0
  );

  // Compute values according to weighted-average logic
  const newValue = parsedNewQty * parsedNewPrice;
  const existingValue = totalOnHandBefore * existingPrice;
  const remainingQty = totalOnHandBefore - parsedNewQty;
  const remainingValue = existingValue - newValue;

  // Update stock for the specified location
  const index = stock.findIndex((s) => s.location === location);
  if (index !== -1) {
    const existingLoc = stock[index];
    const existingIssueQty = Number(existingLoc.issueQty || 0);

    stock[index] = {
      location,
      recQty: existingLoc.recQty || 0,
      issueQty: existingIssueQty + parsedNewQty,
      onHandQty: Number(existingLoc.onHandQty || 0) - parsedNewQty,
    };
  } else {
    stock.push({
      location,
      recQty: 0,
      issueQty: parsedNewQty,
      onHandQty: -parsedNewQty,
    });
  }

  let avgPrice;
  if (remainingQty > 0) {
    avgPrice = remainingValue / remainingQty;
  } else {
    // No stock left — set avgPrice to last known issue price
    avgPrice = parsedNewPrice;
  }

  return { avgPrice, updatedStock: stock };
}

module.exports = { computeAvgPrice };
