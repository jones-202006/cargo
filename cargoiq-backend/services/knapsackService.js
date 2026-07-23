const VOLUME_SCALE = 10; // Scale factor to convert decimal volumes to integers

function optimizeCargo(items, maxWeight, maxVolume) {
    const n = items.length;

    // If maxVolume is not provided or invalid, fall back to weight-only optimization
    if (!maxVolume || maxVolume < 0.1) {
        return optimizeCargoWeightOnly(items, maxWeight);
    }

    // Scale volume to integer for DP (e.g., 2.5 → 25)
    const maxVolumeScaled = Math.round(maxVolume * VOLUME_SCALE);

    // Build 3D DP table: dp[i][w][v] = max profit using first i items
    // with weight ≤ w and volume ≤ v
    const dp = Array.from({ length: n + 1 }, () =>
        Array.from({ length: maxWeight + 1 }, () =>
            new Int32Array(maxVolumeScaled + 1)
        )
    );

    let dpOps = 0;

    for (let i = 1; i <= n; i++) {
        const item = items[i - 1];
        const itemWeight = item.weight;
        const itemProfit = item.profit;
        const itemVolumeScaled = Math.round((item.volume || 0) * VOLUME_SCALE);

        for (let w = 0; w <= maxWeight; w++) {
            const prevRow = dp[i - 1][w];
            const currRow = dp[i][w];

            if (itemWeight > w) {
                // Item too heavy — copy previous row at same weight
                for (let v = 0; v <= maxVolumeScaled; v++) {
                    currRow[v] = prevRow[v];
                    dpOps++;
                }
            } else {
                const prevRowDiff = dp[i - 1][w - itemWeight];
                for (let v = 0; v <= maxVolumeScaled; v++) {
                    dpOps++;
                    if (itemVolumeScaled > v) {
                        // Item volume too large for this capacity
                        currRow[v] = prevRow[v];
                    } else {
                        // Max of excluding or including the item
                        const includeProfit = itemProfit + prevRowDiff[v - itemVolumeScaled];
                        currRow[v] = includeProfit > prevRow[v] ? includeProfit : prevRow[v];
                    }
                }
            }
        }
    }

    // Traceback to find selected items
    let w = maxWeight;
    let v = maxVolumeScaled;

    const selectedItems = [];
    const selectedIds = [];

    for (let i = n; i > 0; i--) {
        if (dp[i][w][v] !== dp[i - 1][w][v]) {
            const item = items[i - 1];
            selectedItems.push(item);
            selectedIds.push(item._id.toString());
            w -= item.weight;
            v -= Math.round((item.volume || 0) * VOLUME_SCALE);
        }
    }

    selectedItems.reverse();

    const rejectedItems = items.filter(
        item => !selectedIds.includes(item._id.toString())
    );

    const totalWeight = selectedItems.reduce(
        (sum, item) => sum + item.weight,
        0
    );

    const totalVolume = selectedItems.reduce(
        (sum, item) => sum + (item.volume || 0),
        0
    );

    const totalProfit = selectedItems.reduce(
        (sum, item) => sum + item.profit,
        0
    );

    // Efficiency based on weighted average of weight and volume usage
    const weightRatio = maxWeight > 0 ? totalWeight / maxWeight : 0;
    const volumeRatio = maxVolume > 0 ? totalVolume / maxVolume : 0;
    const efficiency = Number(((weightRatio * 0.5 + volumeRatio * 0.5) * 100).toFixed(2));

    return {
        selectedItems,
        rejectedItems,
        selectedIds,
        totalWeight,
        totalVolume,
        totalProfit,
        efficiency,
        dpOps
    };
}

/**
 * Fallback: weight-only 0/1 knapsack (original implementation)
 */
function optimizeCargoWeightOnly(items, maxWeight) {
    const n = items.length;
    const dp = Array.from({ length: n + 1 }, () =>
        new Int32Array(maxWeight + 1)
    );

    let dpOps = 0;

    for (let i = 1; i <= n; i++) {
        const weight = items[i - 1].weight;
        const profit = items[i - 1].profit;

        for (let w = 0; w <= maxWeight; w++) {
            dpOps++;

            if (weight <= w) {
                dp[i][w] = Math.max(
                    profit + dp[i - 1][w - weight],
                    dp[i - 1][w]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let w = maxWeight;

    const selectedItems = [];
    const selectedIds = [];

    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selectedItems.push(items[i - 1]);
            selectedIds.push(items[i - 1]._id.toString());
            w -= items[i - 1].weight;
        }
    }

    selectedItems.reverse();

    const rejectedItems = items.filter(
        item => !selectedIds.includes(item._id.toString())
    );

    const totalWeight = selectedItems.reduce(
        (sum, item) => sum + item.weight,
        0
    );

    const totalVolume = selectedItems.reduce(
        (sum, item) => sum + (item.volume || 0),
        0
    );

    const totalProfit = selectedItems.reduce(
        (sum, item) => sum + item.profit,
        0
    );

    const efficiency =
        maxWeight > 0
            ? Number(((totalWeight / maxWeight) * 100).toFixed(2))
            : 0;

    return {
        selectedItems,
        rejectedItems,
        selectedIds,
        totalWeight,
        totalVolume,
        totalProfit,
        efficiency,
        dpOps
    };
}

module.exports = optimizeCargo;
