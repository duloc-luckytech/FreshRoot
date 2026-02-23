import axios from 'axios';

// IMPORTANT: Replace with a real Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

export interface IDistanceResult {
    distance: string; // e.g., "5.2 km"
    duration: string; // e.g., "12 mins"
    distanceValue: number; // in meters
    durationValue: number; // in seconds
}

/**
 * Service to handle Google Maps API interactions, specifically Distance Matrix.
 * This provides road-distance calculation similar to Grab/Xanh SM.
 */
export const googleMapsService = {
    /**
     * Calculates distance and duration between two points using Google Distance Matrix API.
     */
    getDistanceMatrix: async (
        originLat: number,
        originLng: number,
        destLat: number,
        destLng: number
    ): Promise<IDistanceResult | null> => {
        try {
            // If no API key, fallback or return null
            if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
                console.warn('Google Maps API Key not set. Using straight-line distance fallback.');
                const dist = calculateHaversineDistance(originLat, originLng, destLat, destLng);
                return {
                    distance: `${dist.toFixed(1)} km`,
                    duration: `${Math.round(dist * 2)} phút`, // Rough estimate (2 mins per km)
                    distanceValue: dist * 1000,
                    durationValue: dist * 120,
                };
            }

            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`
            );

            if (response.data.rows[0].elements[0].status === 'OK') {
                const element = response.data.rows[0].elements[0];
                return {
                    distance: element.distance.text,
                    duration: element.duration.text,
                    distanceValue: element.distance.value,
                    durationValue: element.duration.value,
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching distance matrix:', error);
            return null;
        }
    },
};

/**
 * Fallback Haversine formula for straight-line distance
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
