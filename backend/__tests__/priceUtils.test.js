const { computeAvgPrice } = require('../utils/priceUtils');

describe('computeAvgPrice', () => {
  test('partial depletion updates avg price correctly', () => {
    const stock = [
      { location: 'A', onHandQty: 100, issueQty: 0, recQty: 0 },
      { location: 'B', onHandQty: 50, issueQty: 0, recQty: 0 },
    ];

    const { avgPrice, updatedStock } = computeAvgPrice(
      stock,
      'A',
      30,
      12,
      10
    );

    // total onHand before = 150, existingValue=150*10=1500
    // newValue = 30*12 = 360 -> remainingValue = 1140
    // remainingQty = 120 -> avg = 1140/120 = 9.5
    expect(avgPrice).toBeCloseTo(9.5);

    const A = updatedStock.find((s) => s.location === 'A');
    expect(A.onHandQty).toBe(70); // 100 - 30
    expect(A.issueQty).toBe(30);
  });

  test('full depletion sets avg price to newPrice', () => {
    const stock = [{ location: 'A', onHandQty: 30, issueQty: 0, recQty: 0 }];

    const { avgPrice, updatedStock } = computeAvgPrice(
      stock,
      'A',
      30,
      12,
      10
    );

    expect(avgPrice).toBeCloseTo(12);

    const A = updatedStock.find((s) => s.location === 'A');
    expect(A.onHandQty).toBe(0);
    expect(A.issueQty).toBe(30);
  });

  test('no prior stock creates negative onHand and sets avg to newPrice', () => {
    const stock = [];

    const { avgPrice, updatedStock } = computeAvgPrice(stock, 'X', 10, 5, 0);

    expect(avgPrice).toBeCloseTo(5);

    const X = updatedStock.find((s) => s.location === 'X');
    expect(X.onHandQty).toBe(-10);
    expect(X.issueQty).toBe(10);
  });
});
