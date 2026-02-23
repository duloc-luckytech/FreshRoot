import apiClient from './api-client';

export interface IShop {
    _id: string;
    name: string;
    image: string;
    address: string;
    location: {
        type: string;
        coordinates: number[];
    };
    rating: number;
    isVerified: boolean;
    discountLabel?: string;
    isFeatured: boolean;
    categories: string[];
}

export interface ShopResponse {
    success: boolean;
    count: number;
    data: IShop[];
}

export const getShops = async (
    params?: {
        isFeatured?: boolean;
        lat?: number;
        lng?: number;
        radius?: number;
        search?: string;
        onSale?: boolean;
    }
): Promise<ShopResponse> => {
    const response = await apiClient.get<ShopResponse>('/shops', { params });
    return response.data;
};
export const getShopById = async (id: string): Promise<{ success: boolean; data: IShop }> => {
    const response = await apiClient.get<{ success: boolean; data: IShop }>(`/shops/${id}`);
    return response.data;
};
