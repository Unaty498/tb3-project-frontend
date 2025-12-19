import apiClient from "./api";

export interface TimeSlot {
    dayOfWeek: string; // 'MONDAY', 'TUESDAY', etc.
    startTime: string; // 'HH:mm'
    endTime: string; // 'HH:mm'
}

export interface AccessRule {
    id?: string;
    userId: string;
    doorId: string;
    timeSlots: TimeSlot[];
    active: boolean;
}

export default {
    getAccessRules() {
        return apiClient.get<AccessRule[]>("/access-rules");
    },
    getAccessRule(id: string) {
        return apiClient.get<AccessRule>(`/access-rules/${id}`);
    },
    getAccessRulesByUser(userId: string) {
        return apiClient.get<AccessRule[]>(`/access-rules/user/${userId}`);
    },
    getAccessRulesByDoor(doorId: string) {
        return apiClient.get<AccessRule[]>(`/access-rules/door/${doorId}`);
    },
    createAccessRule(rule: AccessRule) {
        return apiClient.post<AccessRule>("/access-rules", rule);
    },
    updateAccessRule(id: string, rule: AccessRule) {
        return apiClient.put<AccessRule>(`/access-rules/${id}`, rule);
    },
    activateAccessRule(id: string) {
        return apiClient.post(`/access-rules/${id}/activate`);
    },
    deactivateAccessRule(id: string) {
        return apiClient.post(`/access-rules/${id}/deactivate`);
    },
    deleteAccessRule(id: string) {
        return apiClient.delete(`/access-rules/${id}`);
    },
};
