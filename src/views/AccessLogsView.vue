<template>
    <div class="access-logs-view">
        <h2>Access Logs</h2>
        <div class="filters">
            <label>Start Date: <input type="datetime-local" v-model="startDate" /></label>
            <label>End Date: <input type="datetime-local" v-model="endDate" /></label>
            <button @click="fetchLogsByDate">Filter</button>
            <button @click="fetchLogs">Reset</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Badge</th>
                    <th>Door</th>
                    <th>Result</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in logs" :key="log.id">
                    <td>{{ log.id }}</td>
                    <td>{{ new Date(log.timestamp).toLocaleString() }}</td>
                    <td>
                        <a
                            href="#"
                            v-if="log.userId"
                            @click.prevent="$router.push(`/admin/users/${log.userId}`)"
                        >
                            {{ getUserName(log.userId) }}
                        </a>
                        <span v-else>-</span>
                    </td>
                    <td>{{ getBadgeNumber(log.badgeId) }}</td>
                    <td>
                        <a
                            href="#"
                            v-if="log.doorId"
                            @click.prevent="$router.push(`/admin/doors/${log.doorId}`)"
                        >
                            {{ getDoorName(log.doorId) }}
                        </a>
                        <span v-else>-</span>
                    </td>
                    <td :class="getResultClass(log.result)">{{ log.result }}</td>
                    <td>{{ log.details }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import accessLogService, { type AccessLog } from "../services/accessLogService";
import { useLookups } from "../composables/useLookups";

const { fetchAllLookups, getUserName, getDoorName, getBadgeNumber } = useLookups();

const logs = ref<AccessLog[]>([]);
const startDate = ref("");
const endDate = ref("");

const fetchLogs = async () => {
    try {
        const response = await accessLogService.getAccessLogs();
        logs.value = response.data;
    } catch (error) {
        console.error("Error fetching access logs:", error);
    }
};

const fetchLogsByDate = async () => {
    if (!startDate.value || !endDate.value) return;
    try {
        const response = await accessLogService.getAccessLogsByDateRange(
            startDate.value,
            endDate.value,
        );
        logs.value = response.data;
    } catch (error) {
        console.error("Error fetching access logs by date:", error);
    }
};

const getResultClass = (result: string) => {
    return result === "GRANTED" ? "granted" : "denied";
};

onMounted(() => {
    fetchLogs();
    fetchAllLookups();
});
</script>

<style scoped>
.filters {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
}
.granted {
    color: green;
    font-weight: bold;
}
.denied {
    color: red;
    font-weight: bold;
}
</style>
