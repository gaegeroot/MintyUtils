export const PRICING = {
    sqftTiers: [
        { max: 800, price: 126, label: 'Studio/1 Bedroom' },
        { max: 1200, price: 146, label: '2 Bedroom Apartment' },
        { max: 1700, price: 166, label: '3 Bedroom Apt/Townhome' },
        { max: 2000, price: 206, label: '3-4 Bedroom House' },
        { max: 2500, price: 216, label: '2000-2499 sqft' },
        { max: 3000, price: 251, label: '2500-2999 sqft' },
        { max: 3500, price: 299, label: '3000-3499 sqft' },
        { max: 4000, price: 349, label: '3500-3999 sqft' },
        { max: 4500, price: 399, label: '4000-4499 sqft' },
        { max: 5000, price: 449, label: '4500-4999 sqft' },
        { max: 5500, price: 499, label: '5000-5499 sqft' },
        { max: 9999999, price: 499, extraPerUnit: 50, extraUnitSize: 500, label: '5500+ sqft' }
    ],
    bathrooms: { fullBathPrice: 24, halfBathPrice: 12, firstIncluded: true },
    addOns: {
        firstTimeClean: { price: 125, label: 'First Time Clean' },
        insideOven: { price: 45, label: 'Inside Oven' },
        emptyFridge: { price: 25, label: 'Inside Empty Fridge' },
        fullFridge: { price: 45, label: 'Inside Full Fridge' }
    },
    conditionFees: {
        urgentTimeline: { price: 75, label: 'Rush Fee (within 7 days)' },
        pets: { price: 40, label: 'Pets Present' },
        moveInOut: { price: 225, label: 'Move In/Out' },
        fragileItems: { price: 50, label: 'Fragile Items/Clutter' }
    },
    accessDifficulty: {
        4814194: { price: 0, label: 'Easy Access' },
        4814195: { price: 30, label: 'Moderate Access' },
        4814196: { price: 60, label: 'Difficult Access' }
    },
    scheduleDiscounts: {
        'One-time': 0,
        'Weekly': 0.20,
        'Bi-weekly': 0.15,
        'Monthly': 0.10
    },
    taxRate: 0
};

// Helper to calculate quote
export function calculateQuote({ property, addOns, conditions, schedule }) {
    // Base price
    const tier = PRICING.sqftTiers.find(t => property.sqft <= t.max);
    let basePrice = tier.price;
    if (tier.extraPerUnit && property.sqft > PRICING.sqftTiers[PRICING.sqftTiers.length - 2].max) {
        const extraSqft = property.sqft - PRICING.sqftTiers[PRICING.sqftTiers.length - 2].max;
        basePrice += Math.ceil(extraSqft / tier.extraUnitSize) * tier.extraPerUnit;
    }

    // Bathrooms
    const fullBaths = Math.floor(property.bathrooms);
    const halfBath = property.bathrooms % 1 !== 0;
    const additionalFullBaths = PRICING.bathrooms.firstIncluded ? Math.max(0, fullBaths - 1) : fullBaths;
    const bathroomCharge = additionalFullBaths * PRICING.bathrooms.fullBathPrice + (halfBath ? PRICING.bathrooms.halfBathPrice : 0);

    // Add-ons
    const addOnsTotal = Object.entries(addOns).reduce((sum, [key, val]) => val ? sum + PRICING.addOns[key].price : sum, 0);

    // Conditions
    const conditionFeesTotal = Object.entries(conditions)
        .filter(([key]) => key !== 'smokePestsMold')
        .reduce((sum, [key, val]) => val ? sum + PRICING.conditionFees[key].price : sum, 0);

    // Access difficulty
    const accessFee = PRICING.accessDifficulty[property.accessDifficulty]?.price || 0;

    const subtotal = basePrice + bathroomCharge + addOnsTotal + conditionFeesTotal + accessFee;
    const tax = subtotal * PRICING.taxRate;
    const total = subtotal + tax;
    const discount = PRICING.scheduleDiscounts[schedule] || 0;
    const recurringTotal = total * (1 - discount);

    return { basePrice, bathroomCharge, addOnsTotal, conditionFeesTotal, accessFee, subtotal, tax, total, discount, recurringTotal };
}