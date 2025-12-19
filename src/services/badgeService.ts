import apiClient from "./api";

export interface Badge {
    id?: string;
    badgeNumber: string;
    userId: string;
    type: "PHYSICAL" | "MOBILE";
    active: boolean;
    expiryDate?: string;
}

export default {
    getBadges() {
        return apiClient.get<Badge[]>("/badges");
    },
    getBadge(id: string) {
        return apiClient.get<Badge>(`/badges/${id}`);
    },
    getBadgesByUser(userId: string) {
        return apiClient.get<Badge[]>(`/badges/user/${userId}`);
    },
    createBadge(badge: Badge) {
        return apiClient.post<Badge>("/badges", badge);
    },
    updateBadgeExpiry(id: string, expiryDate: string) {
        return apiClient.put(`/badges/${id}/expiry`, { expiryDate });
    },
    activateBadge(id: string) {
        return apiClient.post(`/badges/${id}/activate`);
    },
    deactivateBadge(id: string) {
        return apiClient.post(`/badges/${id}/deactivate`);
    },
    deleteBadge(id: string) {
        return apiClient.delete(`/badges/${id}`);
    },
};
