import apiClient from "./api";

export interface AccessLog {
    id: number;
    timestamp: string;
    userId?: string;
    badgeId?: string;
    doorId?: string;
    result: string; // 'GRANTED', 'DENIED_...'
    details?: string;
}

export default {
    getAccessLogs() {
        return apiClient.get<AccessLog[]>("/access-logs");
    },
    getAccessLog(id: string) {
        return apiClient.get<AccessLog>(`/access-logs/${id}`);
    },
    getAccessLogsByUser(userId: string) {
        return apiClient.get<AccessLog[]>(`/access-logs/user/${userId}`);
    },
    getAccessLogsByDoor(doorId: string) {
        return apiClient.get<AccessLog[]>(`/access-logs/door/${doorId}`);
    },
    getAccessLogsByDateRange(start: string, end: string) {
        return apiClient.get<AccessLog[]>(`/access-logs/date-range`, {
            params: { start, end },
        });
    },
};
