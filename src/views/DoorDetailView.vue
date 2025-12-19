<template>
    <div class="door-detail-view" v-if="door">
        <div class="flex-between">
            <h2>Door Details: {{ door.location }}</h2>
            <button class="secondary" @click="$router.push('/admin/doors')">Back to Doors</button>
        </div>

        <div class="card">
            <h3>Information</h3>
            <p><strong>ID:</strong> {{ door.id }}</p>
            <p><strong>Device ID:</strong> {{ door.deviceId }}</p>
            <p><strong>Location:</strong> {{ door.location }}</p>
            <p>
                <strong>Status:</strong>
                <StatusBadge :active="door.active" />
            </p>
            <div style="margin-top: 15px">
                <button @click="showEditModal = true">Edit Door</button>
                <button :class="door.active ? 'danger' : 'success'" @click="toggleActive">
                    {{ door.active ? "Deactivate" : "Activate" }}
                </button>
            </div>
        </div>

        <div class="card">
            <h3>Authorized Users</h3>
            <table v-if="accessRules.length > 0">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Access Times</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="rule in accessRules"
                        :key="rule.id"
                        class="clickable-row"
                        @click="$router.push(`/admin/users/${rule.userId}`)"
                    >
                        <td>{{ getUserName(rule.userId) }}</td>
                        <td>{{ getUserEmail(rule.userId) }}</td>
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
            <p v-else>No authorized users.</p>
        </div>

        <div class="card">
            <h3>Recent Access Logs</h3>
            <table v-if="logs.length > 0">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Result</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in logs" :key="log.id">
                        <td>{{ new Date(log.timestamp).toLocaleString() }}</td>
                        <td>{{ getUserName(log.userId) }}</td>
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
        <ModalDialog :show="showEditModal" title="Edit Door">
            <form @submit.prevent="updateDoor">
                <label>Device ID: <input v-model="editingDoor.deviceId" required /></label>
                <label>Location: <input v-model="editingDoor.location" required /></label>
                <div class="flex-row" style="justify-content: flex-end; margin-top: 15px">
                    <button type="button" class="secondary" @click="showEditModal = false">
                        Cancel
                    </button>
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </ModalDialog>
    </div>
    <div v-else>Loading door details...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import doorService, { type Door } from "../services/doorService";
import accessRuleService, { type AccessRule } from "../services/accessRuleService";
import accessLogService, { type AccessLog } from "../services/accessLogService";
import StatusBadge from "../components/StatusBadge.vue";
import ModalDialog from "../components/ModalDialog.vue";
import { useLookups } from "../composables/useLookups";

const route = useRoute();
const doorId = String(route.params.id);

const { fetchUsers, getUserName, getUserEmail } = useLookups();

const door = ref<Door | null>(null);
const accessRules = ref<AccessRule[]>([]);
const logs = ref<AccessLog[]>([]);

const showEditModal = ref(false);
const editingDoor = ref<Door>({ deviceId: "", location: "", active: false });

const fetchData = async () => {
    if (!doorId) {
        return;
    }
    try {
        const [doorRes, rulesRes, logsRes] = await Promise.all([
            doorService.getDoor(doorId),
            accessRuleService.getAccessRulesByDoor(doorId),
            accessLogService.getAccessLogsByDoor(doorId),
            fetchUsers(),
        ]);

        door.value = doorRes.data;
        accessRules.value = rulesRes.data;
        logs.value = logsRes.data
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // Last 10 logs

        editingDoor.value = { ...door.value };
    } catch (error) {
        console.error("Error fetching door details:", error);
    }
};

const toggleActive = async () => {
    if (!door.value?.id) return;
    try {
        if (door.value.active) {
            await doorService.deactivateDoor(door.value.id);
        } else {
            await doorService.activateDoor(door.value.id);
        }
        await fetchData();
    } catch (error) {
        console.error("Error toggling door status:", error);
    }
};

const updateDoor = async () => {
    if (!door.value?.id) return;
    try {
        await doorService.updateDoor(door.value.id, editingDoor.value);
        showEditModal.value = false;
        await fetchData();
    } catch (error) {
        console.error("Error updating door:", error);
    }
};

onMounted(fetchData);
</script>

<style scoped>
.door-detail-view {
    padding: 20px;
}
</style>
