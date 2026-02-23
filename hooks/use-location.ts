import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface ILocation {
    latitude: number;
    longitude: number;
}

export function useLocation() {
    const [location, setLocation] = useState<ILocation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                // Get last known position first (fast)
                const lastKnown = await Location.getLastKnownPositionAsync();
                if (lastKnown) {
                    setLocation({
                        latitude: lastKnown.coords.latitude,
                        longitude: lastKnown.coords.longitude,
                    });
                }

                // Get current position (accurate)
                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            } catch (error) {
                console.error('Error getting location:', error);
                setErrorMsg('Error getting location');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { location, errorMsg, loading };
}
