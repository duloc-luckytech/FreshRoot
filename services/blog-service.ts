import apiClient from './api-client';

export interface IBlog {
    _id: string;
    title: string;
    description: string;
    content: string;
    image: string;
    category: 'Cooking Guide' | 'Ingredient Screening' | 'Risk Warning';
    author: {
        _id: string;
        name: string;
        avatar: string;
    };
    riskAlerts?: string[];
    ingredientInfo?: {
        name: string;
        quality: 'Good' | 'Average' | 'Bad';
        warning?: string;
    }[];
    createdAt: string;
}

export const getBlogs = () => apiClient.get('/blogs');
export const getBlog = (id: string) => apiClient.get(`/blogs/${id}`);
