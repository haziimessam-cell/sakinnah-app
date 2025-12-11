
/**
 * Geo Location Service
 * Handles accurate country detection for pricing localization.
 * Strategy: IP-based API -> Fallback to Timezone.
 */

export const geoService = {
    async getCountryCode(): Promise<string> {
        try {
            // Layer 1: Accurate IP Detection
            // Using ipapi.co (Free tier, no key required for client-side low volume)
            // In high-traffic production, replace with a paid endpoint or own backend proxy.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch('https://ipapi.co/json/', { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('GeoIP fetch failed');
            
            const data = await response.json();
            return data.country_code; // Returns 'EG', 'SA', 'US', etc.
        } catch (error) {
            console.warn("GeoIP Service failed, falling back to Timezone heuristics.", error);
            return this.getTimezoneCountry();
        }
    },

    // Layer 2: Heuristic Fallback
    getTimezoneCountry(): string {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz.includes('Cairo') || tz.includes('Egypt')) return 'EG';
            if (tz.includes('Riyadh') || tz.includes('Saudi')) return 'SA';
            if (tz.includes('Dubai') || tz.includes('Muscat')) return 'AE';
            // Add more mappings as needed
            return 'US'; // Default Global
        } catch (e) {
            return 'US';
        }
    }
};
