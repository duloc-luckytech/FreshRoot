import apiClient from './api-client';

export interface IDeal {
    _id: string;
    title: string;
    shopName: string;
    description?: string;
    tag: 'Ưu đãi' | 'Mua chung' | 'Voucher';
    location: {
        type: 'Point';
        coordinates: [number, number];
        formattedAddress?: string;
    };
    discountPercentage?: number;
    expiresAt?: Date;
}

export const getDeals = async (lat?: number, lng?: number, distance?: number) => {
    const params: any = {};
    if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        if (distance) params.distance = distance;
    }

    const response = await apiClient.get('/deals', { params });
    return response.data;
};
