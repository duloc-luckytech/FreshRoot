import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export interface BiometricCredentials {
    email: string;
    password: string;
}

export const BiometricService = {
    /**
     * Check if the device has biometric hardware and if any biometrics are enrolled
     */
    isSupported: async (): Promise<boolean> => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    },

    /**
     * Get the supported authentication types (Face ID, Fingerprint, etc.)
     */
    getAuthenticationTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
        return await LocalAuthentication.supportedAuthenticationTypesAsync();
    },

    /**
     * Authenticate the user using biometrics
     */
    authenticate: async (promptMessage: string = 'Xác thực để tiếp tục'): Promise<boolean> => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            disableDeviceFallback: true,
        });
        return result.success;
    },

    /**
     * Save credentials securely
     */
    saveCredentials: async (credentials: BiometricCredentials): Promise<void> => {
        await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
    },

    /**
     * Retrieve securely stored credentials
     */
    getCredentials: async (): Promise<BiometricCredentials | null> => {
        const credentialsStr = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
        if (!credentialsStr) return null;
        try {
            return JSON.parse(credentialsStr);
        } catch (e) {
            console.error('Error parsing biometric credentials:', e);
            return null;
        }
    },

    /**
     * Clear securely stored credentials
     */
    clearCredentials: async (): Promise<void> => {
        await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    }
};
