import apiClient from './api-client';

export interface IAddress {
    label: string;
    detail: string;
    coordinates?: [number, number];
}

export interface IEmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

export const getProfile = async () => {
    return await apiClient.get('/account/profile');
};

export const updateProfile = async (data: { name?: string; phone?: string; bio?: string; avatar?: string }) => {
    return await apiClient.put('/account/profile', data);
};

export const updatePassword = async (data: { currentPassword: string; newPassword: any }) => {
    return await apiClient.put('/account/security/password', data);
};

export const updateAddresses = async (addresses: IAddress[]) => {
    return await apiClient.post('/account/addresses', { addresses });
};

export const updateEmergencyContacts = async (contacts: IEmergencyContact[]) => {
    return await apiClient.post('/account/emergency-contacts', { emergencyContacts: contacts });
};

export const toggleBiometrics = async (enabled: boolean) => {
    return await apiClient.put('/account/security/biometrics', { enabled });
};

export const deactivateAccount = async () => {
    return await apiClient.delete('/account');
};
