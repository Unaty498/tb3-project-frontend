<template>
    <div class="user-detail-view" v-if="user">
        <div class="flex-between">
            <h2>User Details: {{ user.firstName }} {{ user.lastName }}</h2>
            <button class="secondary" @click="$router.push('/admin/users')">Back to Users</button>
        </div>

        <div class="card">
            <h3>Information</h3>
            <p><strong>ID:</strong> {{ user.id }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Role:</strong> {{ user.role }}</p>
            <p>
                <strong>Status:</strong>
                <StatusBadge :active="user.active" />
            </p>
            <div style="margin-top: 15px">
                <button @click="showEditModal = true">Edit User</button>
                <button :class="user.active ? 'danger' : 'success'" @click="toggleActive">
                    {{ user.active ? "Deactivate" : "Activate" }}
                </button>
            </div>
        </div>

        <div class="card">
            <h3>Assigned Badges</h3>
            <table v-if="badges.length > 0">
                <thead>
                    <tr>
                        <th>Badge Number</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Expiry</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="badge in badges" :key="badge.id">
                        <td>{{ badge.badgeNumber }}</td>
                        <td>{{ badge.type }}</td>
                        <td>
                            <StatusBadge :active="badge.active" />
                        </td>
                        <td>{{ badge.expiryDate }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else>No badges assigned.</p>
        </div>

        <div class="card">
            <h3>Accessible Doors</h3>
            <table v-if="accessRules.length > 0">
                <thead>
                    <tr>
                        <th>Door</th>
                        <th>Access Times</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="rule in accessRules"
                        :key="rule.id"
                        class="clickable-row"
                        @click="$router.push(`/admin/doors/${rule.doorId}`)"
                    >
                        <td>{{ getDoorName(rule.doorId) }}</td>
                        <td>
                            <span v-if="!rule.timeSlots || rule.timeSlots.length === 0">24/7</span>
                            <ul v-else style="margin: 0; padding-left: 20px">
                                <li v-for="(slot, idx) in rule.timeSlots" :key="idx">
                                    {{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else>No accessible doors.</p>
        </div>

        <div class="card">
            <h3>Recent Access Logs</h3>
            <table v-if="logs.length > 0">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Door</th>
                        <th>Result</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in logs" :key="log.id">
                        <td>{{ new Date(log.timestamp).toLocaleString() }}</td>
                        <td>{{ getDoorName(log.doorId) }}</td>
                        <td
                            :style="{
                                color: log.result === 'GRANTED' ? 'green' : 'red',
                                fontWeight: 'bold',
                            }"
                        >
                            {{ log.result }}
                        </td>
                        <td>{{ log.details }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else>No access logs found.</p>
        </div>

        <!-- Edit Modal -->
        <ModalDialog :show="showEditModal" title="Edit User">
            <form @submit.prevent="updateUser">
                <label>Email: <input v-model="editingUser.email" required /></label>
                <label>First Name: <input v-model="editingUser.firstName" /></label>
                <label>Last Name: <input v-model="editingUser.lastName" /></label>
                <label
                    >Role:
                    <select v-model="editingUser.role">
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="VISITOR">Visitor</option>
                    </select>
                </label>
                <div class="flex-row" style="justify-content: flex-end; margin-top: 15px">
                    <button type="button" class="secondary" @click="showEditModal = false">
                        Cancel
                    </button>
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </ModalDialog>
    </div>
    <div v-else>Loading user details...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import userService, { type User } from "../services/userService";
import badgeService, { type Badge } from "../services/badgeService";
import accessRuleService, { type AccessRule } from "../services/accessRuleService";
import accessLogService, { type AccessLog } from "../services/accessLogService";
import StatusBadge from "../components/StatusBadge.vue";
import ModalDialog from "../components/ModalDialog.vue";
import { useLookups } from "../composables/useLookups";

const route = useRoute();
const userId = String(route.params.id);

const { fetchDoors, getDoorName } = useLookups();

const user = ref<User | null>(null);
const badges = ref<Badge[]>([]);
const accessRules = ref<AccessRule[]>([]);
const logs = ref<AccessLog[]>([]);

const showEditModal = ref(false);
const editingUser = ref<User>({ email: "", role: "USER", active: false });

const fetchData = async () => {
    if (!userId) {
        return;
    }
    try {
        const [userRes, badgesRes, rulesRes, logsRes] = await Promise.all([
            userService.getUser(userId),
            badgeService.getBadgesByUser(userId),
            accessRuleService.getAccessRulesByUser(userId),
            accessLogService.getAccessLogsByUser(userId),
            fetchDoors(),
        ]);

        user.value = userRes.data;
        badges.value = badgesRes.data;
        accessRules.value = rulesRes.data;
        logs.value = logsRes.data
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // Last 10 logs

        editingUser.value = { ...user.value };
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
};

const toggleActive = async () => {
    if (!user.value?.id) return;
    try {
        if (user.value.active) {
            await userService.deactivateUser(user.value.id);
        } else {
            await userService.activateUser(user.value.id);
        }
        await fetchData();
    } catch (error) {
        console.error("Error toggling user status:", error);
    }
};

const updateUser = async () => {
    if (!user.value?.id) return;
    try {
        await userService.updateUser(user.value.id, editingUser.value);
        showEditModal.value = false;
        await fetchData();
    } catch (error) {
        console.error("Error updating user:", error);
    }
};

onMounted(fetchData);
</script>

<style scoped>
.user-detail-view {
    padding: 20px;
}
</style>
