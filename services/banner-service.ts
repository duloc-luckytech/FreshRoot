import apiClient from './api-client';

export interface IBanner {
    _id: string;
    title: string;
    image: string;
    link?: string;
    active: boolean;
}

export interface BannerResponse {
    success: boolean;
    count: number;
    data: IBanner[];
}

export const getBanners = async (): Promise<BannerResponse> => {
    const response = await apiClient.get<BannerResponse>('/banners');
    return response.data;
};
