import apiClient from './api-client';

export interface IClip {
    _id: string;
    title: string;
    url: string;
    user: {
        _id: string;
        name: string;
        rank: string;
        avatar: string;
    };
    likes: number;
}

export interface IRankingUser {
    _id: string;
    name: string;
    rank: string;
    points: number;
    avatar: string;
}

export const getRankings = async () => {
    const response = await apiClient.get('/community/rankings');
    return response.data;
};

export const getClips = async () => {
    const response = await apiClient.get('/community/clips');
    return response.data;
};
