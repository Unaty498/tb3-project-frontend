<template>
    <div class="badges-view">
        <h2>Badges</h2>
        <button @click="showCreateModal = true">Create Badge</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Badge Number</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Active</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="badge in badges" :key="badge.id">
                    <td>{{ badge.id }}</td>
                    <td>{{ badge.badgeNumber }}</td>
                    <td>
                        <a
                            href="#"
                            v-if="badge.userId"
                            @click.prevent="$router.push(`/admin/users/${badge.userId}`)"
                        >
                            {{ getUserName(badge.userId) }}
                        </a>
                        <span v-else>-</span>
                    </td>
                    <td>{{ badge.type }}</td>
                    <td>
                        <StatusBadge :active="badge.active" />
                    </td>
                    <td>{{ badge.expiryDate }}</td>
                    <td>
                        <button @click="editBadge(badge)">Edit</button>
                        <button @click="toggleActive(badge)">
                            {{ badge.active ? "Deactivate" : "Activate" }}
                        </button>
                        <button class="danger" @click="deleteBadge(badge.id!)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Create Modal -->
        <ModalDialog :show="showCreateModal" title="Create Badge">
            <form @submit.prevent="createBadge">
                <label>Badge Number: <input v-model="newBadge.badgeNumber" required /></label>
                <label
                    >User:
                    <select v-model="newBadge.userId" required>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                        </option>
                    </select>
                </label>
                <label
                    >Type:
                    <select v-model="newBadge.type">
                        <option value="PHYSICAL">Physical</option>
                        <option value="MOBILE">Mobile</option>
                    </select>
                </label>
                <label>Expiry Date: <input v-model="newBadge.expiryDate" type="date" /></label>
                <button type="submit">Create</button>
                <button type="button" @click="showCreateModal = false">Cancel</button>
            </form>
        </ModalDialog>

        <!-- Edit Modal -->
        <ModalDialog :show="showEditModal" title="Edit Badge Expiry">
            <form @submit.prevent="updateBadge">
                <p>Badge: {{ editingBadge.badgeNumber }}</p>
                <label>Expiry Date: <input v-model="editingBadge.expiryDate" type="date" /></label>
                <button type="submit">Update</button>
                <button type="button" @click="showEditModal = false">Cancel</button>
            </form>
        </ModalDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import badgeService, { type Badge } from "../services/badgeService";
import StatusBadge from "../components/StatusBadge.vue";
import ModalDialog from "../components/ModalDialog.vue";
import { useLookups } from "../composables/useLookups";

const { users, fetchUsers, getUserName } = useLookups();

const badges = ref<Badge[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);

const newBadge = ref<Badge>({
    badgeNumber: "",
    userId: "",
    type: "PHYSICAL",
    active: true,
    expiryDate: "",
});

const editingBadge = ref<Badge>({
    badgeNumber: "",
    userId: "",
    type: "PHYSICAL",
    active: true,
    expiryDate: "",
});

const fetchBadges = async () => {
    try {
        const response = await badgeService.getBadges();
        badges.value = response.data;
    } catch (error) {
        console.error("Error fetching badges:", error);
    }
};

const toggleActive = async (badge: Badge) => {
    if (!badge.id) return;
    try {
        if (badge.active) {
            await badgeService.deactivateBadge(badge.id);
        } else {
            await badgeService.activateBadge(badge.id);
        }
        await fetchBadges();
    } catch (error) {
        console.error("Error toggling badge status:", error);
    }
};

const deleteBadge = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
        await badgeService.deleteBadge(id);
        await fetchBadges();
    } catch (error) {
        console.error("Error deleting badge:", error);
    }
};

const createBadge = async () => {
    try {
        await badgeService.createBadge(newBadge.value);
        showCreateModal.value = false;
        newBadge.value = {
            badgeNumber: "",
            userId: "",
            type: "PHYSICAL",
            active: true,
            expiryDate: "",
        };
        await fetchBadges();
    } catch (error) {
        console.error("Error creating badge:", error);
    }
};

const editBadge = (badge: Badge) => {
    editingBadge.value = { ...badge };
    showEditModal.value = true;
};

const updateBadge = async () => {
    if (!editingBadge.value.id || !editingBadge.value.expiryDate) return;
    try {
        // The backend only exposes updateExpiry for badges in the summary,
        // but let's check if there is a full update.
        // Looking at badgeService.ts, we have updateBadgeExpiry.
        await badgeService.updateBadgeExpiry(editingBadge.value.id, editingBadge.value.expiryDate);
        showEditModal.value = false;
        await fetchBadges();
    } catch (error) {
        console.error("Error updating badge:", error);
    }
};

onMounted(() => {
    fetchBadges();
    fetchUsers();
});
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
