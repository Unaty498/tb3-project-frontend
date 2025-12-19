import { ref } from "vue";
import userService, { type User } from "../services/userService";
import doorService, { type Door } from "../services/doorService";
import badgeService, { type Badge } from "../services/badgeService";

export function useLookups() {
    const users = ref<User[]>([]);
    const doors = ref<Door[]>([]);
    const badges = ref<Badge[]>([]);

    const fetchUsers = async () => {
        try {
            const response = await userService.getUsers();
            users.value = response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchDoors = async () => {
        try {
            const response = await doorService.getDoors();
            doors.value = response.data;
        } catch (error) {
            console.error("Error fetching doors:", error);
        }
    };

    const fetchBadges = async () => {
        try {
            const response = await badgeService.getBadges();
            badges.value = response.data;
        } catch (error) {
            console.error("Error fetching badges:", error);
        }
    };

    const fetchAllLookups = async () => {
        await Promise.all([fetchUsers(), fetchDoors(), fetchBadges()]);
    };

    const getUserName = (userId?: string) => {
        if (!userId) return "-";
        const user = users.value.find((u) => u.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : `User ${userId}`;
    };

    const getUserEmail = (userId?: string) => {
        if (!userId) return "-";
        const user = users.value.find((u) => u.id === userId);
        return user ? user.email : "";
    };

    const getDoorName = (doorId?: string) => {
        if (!doorId) return "-";
        const door = doors.value.find((d) => d.id === doorId);
        return door ? `${door.location} (${door.deviceId})` : `Door ${doorId}`;
    };

    const getBadgeNumber = (badgeId?: string) => {
        if (!badgeId) return "-";
        const badge = badges.value.find((b) => b.id === badgeId);
        return badge ? badge.badgeNumber : `Badge ${badgeId}`;
    };

    return {
        users,
        doors,
        badges,
        fetchUsers,
        fetchDoors,
        fetchBadges,
        fetchAllLookups,
        getUserName,
        getUserEmail,
        getDoorName,
        getBadgeNumber,
    };
}
