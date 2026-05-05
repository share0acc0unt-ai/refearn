// Currency conversion utilities

const DEFAULT_RATE = 1000; // 1000 Naira = 1 USD

/**
 * Convert Naira to USD
 * @param nairaAmount Amount in Naira
 * @param rate Exchange rate (Naira per Dollar), defaults to 1000
 * @returns Amount in USD
 */
export function nairaToUSD(nairaAmount: number, rate: number = DEFAULT_RATE): number {
    return nairaAmount / rate;
}

/**
 * Convert USD to Naira
 * @param usdAmount Amount in USD
 * @param rate Exchange rate (Naira per Dollar), defaults to 1000
 * @returns Amount in Naira
 */
export function usdToNaira(usdAmount: number, rate: number = DEFAULT_RATE): number {
    return usdAmount * rate;
}

/**
 * Format amount in USD with $ symbol
 * @param nairaAmount Amount in Naira
 * @param rate Exchange rate (Naira per Dollar), defaults to 1000
 * @returns Formatted USD string (e.g., "$10.50")
 */
export function formatUSD(nairaAmount: number, rate: number = DEFAULT_RATE): string {
    const usdAmount = nairaToUSD(nairaAmount, rate);
    return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format amount in Naira with ₦ symbol
 * @param nairaAmount Amount in Naira
 * @returns Formatted Naira string (e.g., "₦10,000")
 */
export function formatNaira(nairaAmount: number): string {
    return `₦${nairaAmount.toLocaleString('en-US')}`;
}
