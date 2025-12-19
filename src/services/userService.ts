import apiClient from "./api";

export interface User {
    id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: "ADMIN" | "USER" | "VISITOR";
    active: boolean;
}

export default {
    getUsers() {
        return apiClient.get<User[]>("/users");
    },
    getUser(id: string) {
        return apiClient.get<User>(`/users/${id}`);
    },
    createUser(user: User) {
        return apiClient.post<User>("/users", user);
    },
    updateUser(id: string, user: User) {
        return apiClient.put<User>(`/users/${id}`, user);
    },
    activateUser(id: string) {
        return apiClient.post(`/users/${id}/activate`);
    },
    deactivateUser(id: string) {
        return apiClient.post(`/users/${id}/deactivate`);
    },
    deleteUser(id: string) {
        return apiClient.delete(`/users/${id}`);
    },
};
