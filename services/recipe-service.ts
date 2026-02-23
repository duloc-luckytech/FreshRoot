import apiClient from './api-client';

export interface IIngredient {
    name: string;
    amount?: string;
    price?: number;
}

export interface IRecipe {
    _id: string;
    title: string;
    description: string;
    category: string;
    foodGroup?: string;
    ingredients: IIngredient[];
    instructions: string[];
    image: string;
    costEstimate?: number;
    riskAlerts?: string[];
    shopId?: string;
}

export const getRecipes = async (category?: string, maxPrice?: number, search?: string, foodGroup?: string, shopId?: string) => {
    const params: any = {};
    if (category) params.category = category;
    if (foodGroup) params.foodGroup = foodGroup;
    if (maxPrice) params.maxPrice = maxPrice;
    if (search) params.search = search;
    if (shopId) params.shopId = shopId;

    const response = await apiClient.get('/recipes', { params });
    return response.data;
};

export const getRecipeById = async (id: string) => {
    const response = await apiClient.get(`/recipes/${id}`);
    return response.data;
};
