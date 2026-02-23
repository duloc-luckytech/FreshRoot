import apiClient from './api-client';

export interface IShopData {
    name: string;
    image: string;
    address: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    categories: string[];
}

export interface IRecipeData {
    title: string;
    description: string;
    image: string;
    costEstimate: number;
    category: string;
    ingredients: { name: string; amount: string; unit: string }[];
    instructions: string[];
}

export interface IVoucherData {
    code: string;
    discountAmount: number;
    discountType: 'flat' | 'percentage';
    minOrderAmount: number;
    expiryDate: string;
}

export const getMyShop = () => apiClient.get('/agent/shop');
export const upsertShop = (data: IShopData) => apiClient.post('/agent/shop', data);
export const getMyRecipes = () => apiClient.get('/agent/recipes');
export const createRecipe = (data: IRecipeData) => apiClient.post('/agent/recipes', data);
export const updateRecipe = (id: string, data: Partial<IRecipeData>) => apiClient.put(`/agent/recipes/${id}`, data);
export const deleteRecipe = (id: string) => apiClient.delete(`/agent/recipes/${id}`);

export const getMyVouchers = () => apiClient.get('/agent/vouchers');
export const createVoucher = (data: IVoucherData) => apiClient.post('/agent/vouchers', data);
export const updateVoucher = (id: string, data: Partial<IVoucherData>) => apiClient.put(`/agent/vouchers/${id}`, data);
export const deleteVoucher = (id: string) => apiClient.delete(`/agent/vouchers/${id}`);

