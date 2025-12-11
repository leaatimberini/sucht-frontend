import api from '@/lib/axios';

export const marketingService = {
    generateCopy: async (description: string, platform: 'IG' | 'FB') => {
        const response = await api.post('/marketing/generate-copy', { description, platform });
        return response.data;
    },

    quickCreateCampaign: async (eventId: string, budget: number, platform: string, endDate: string) => {
        const res = await api.post('/marketing/campaigns/quick-create', { eventId, budget, platform, endDate });
        return res.data;
    },

    createAccount: async (data: any) => {
        const res = await api.post('/marketing/accounts', data);
        return res.data;
    },

    getAccounts: async () => {
        const res = await api.get('/marketing/accounts');
        return res.data;
    },

    deleteAccount: async (id: string) => {
        await api.delete(`/marketing/accounts/${id}`);
    },

    getCampaigns: async () => {
        const res = await api.get('/marketing/campaigns');
        return res.data;
    },

    getCampaignDetails: async (id: string) => {
        const res = await api.get(`/marketing/campaigns/${id}/details`);
        return res.data;
    },

    deleteCampaign: async (id: string) => {
        const res = await api.delete(`/marketing/campaigns/${id}`);
        return res.data;
    },

    toggleCampaign: async (id: string) => {
        const res = await api.post(`/marketing/campaigns/${id}/toggle`);
        return res.data;
    },

    toggleAdSet: async (id: string) => {
        const res = await api.post(`/marketing/adsets/${id}/toggle`);
        return res.data;
    },

    toggleAd: async (id: string) => {
        const res = await api.post(`/marketing/ads/${id}/toggle`);
        return res.data;
    },

    getOptimizationLogs: async () => {
        const res = await api.get('/marketing/optimization-logs');
        return res.data;
    },

    analyzeCampaign: async (id: string) => {
        const res = await api.post(`/marketing/campaigns/${id}/analyze`);
        return res.data;
    },

    generateImage: async (prompt: string) => {
        const res = await api.post('/marketing/generate-image', { prompt });
        return res.data;
    },

    getAds: async () => {
        const res = await api.get('/marketing/ads');
        return res.data;
    },

    syncAds: async () => {
        const res = await api.post('/marketing/ads/sync');
        return res.data;
    },

    uploadVideo: async (formData: FormData) => {
        const res = await api.post('/marketing/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    }
};
