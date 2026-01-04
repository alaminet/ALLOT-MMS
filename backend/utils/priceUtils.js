function computeAvgPrice(stock = [], location, newQty, newPrice, existingAvgPrice = 0) {
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

  // Clone stock so caller can use it
  const updatedStock = (stock || []).map((s) => ({ ...s }));

  const index = updatedStock.findIndex((s) => s.location === location);
  if (index !== -1) {
    const existingLoc = updatedStock[index];
    const existingIssueQty = Number(existingLoc.issueQty || 0);

    updatedStock[index] = {
      location,
      recQty: existingLoc.recQty || 0,
      issueQty: existingIssueQty + parsedNewQty,
      onHandQty: Number(existingLoc.onHandQty || 0) - parsedNewQty,
    };
  } else {
    updatedStock.push({
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

  return { avgPrice, updatedStock };
}

module.exports = { computeAvgPrice };
