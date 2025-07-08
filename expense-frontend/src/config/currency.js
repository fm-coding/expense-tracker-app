// Make sure this file exists at: src/config/currency.js
export const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'EGP', symbol: '£', name: 'Egyptian Pound', flag: '🇪🇬' }
];

export const getExchangeRates = async (baseCurrency = 'USD') => {
    try {
        // Using exchangerate-api.com (free tier available)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        console.log('Fetched exchange rates:', data.rates);
        return data.rates;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Return default rates as fallback
        return {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.0,
            CAD: 1.25,
            AUD: 1.35,
            CHF: 0.92,
            CNY: 6.45,
            INR: 74.5,
            KRW: 1180.0,
            BRL: 5.25,
            ZAR: 15.0,
            KES: 110.0,
            NGN: 411.0,
            EGP: 15.7
        };
    }
};