import apiClient from "./api";

export interface Door {
    id?: string;
    deviceId: string;
    location: string;
    active: boolean;
}

export default {
    getDoors() {
        return apiClient.get<Door[]>("/doors");
    },
    getDoor(id: string) {
        return apiClient.get<Door>(`/doors/${id}`);
    },
    createDoor(door: Door) {
        return apiClient.post<Door>("/doors", door);
    },
    updateDoor(id: string, door: Door) {
        return apiClient.put<Door>(`/doors/${id}`, door);
    },
    activateDoor(id: string) {
        return apiClient.post(`/doors/${id}/activate`);
    },
    deactivateDoor(id: string) {
        return apiClient.post(`/doors/${id}/deactivate`);
    },
    deleteDoor(id: string) {
        return apiClient.delete(`/doors/${id}`);
    },
};
