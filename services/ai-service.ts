import apiClient from './api-client';

export interface IAIResponse {
    reply: string;
    sender: string;
    timestamp: string;
}

export const askAI = (message: string) => apiClient.post('/ai/ask', { message });
