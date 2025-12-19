<template>
    <div class="access-rules-view">
        <h2>Access Rules</h2>
        <button @click="showCreateModal = true">Create Access Rule</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Door</th>
                    <th>Time Slots</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="rule in rules" :key="rule.id">
                    <td>{{ rule.id }}</td>
                    <td>
                        <a
                            href="#"
                            v-if="rule.userId"
                            @click.prevent="$router.push(`/admin/users/${rule.userId}`)"
                        >
                            {{ getUserName(rule.userId) }}
                        </a>
                        <span v-else>-</span>
                    </td>
                    <td>
                        <a
                            href="#"
                            v-if="rule.doorId"
                            @click.prevent="$router.push(`/admin/doors/${rule.doorId}`)"
                        >
                            {{ getDoorName(rule.doorId) }}
                        </a>
                        <span v-else>-</span>
                    </td>
                    <td>
                        <ul v-if="rule.timeSlots && rule.timeSlots.length > 0">
                            <li v-for="(slot, index) in rule.timeSlots" :key="index">
                                {{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}
                            </li>
                        </ul>
                        <span v-else>24/7</span>
                    </td>
                    <td>
                        <StatusBadge :active="rule.active" />
                    </td>
                    <td>
                        <button @click="editRule(rule)">Edit</button>
                        <button @click="toggleActive(rule)">
                            {{ rule.active ? "Deactivate" : "Activate" }}
                        </button>
                        <button class="danger" @click="deleteRule(rule.id!)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Create Modal -->
        <ModalDialog :show="showCreateModal" title="Create Access Rule">
            <form @submit.prevent="createRule">
                <label
                    >User:
                    <select v-model="newRule.userId" required>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                        </option>
                    </select>
                </label>
                <label
                    >Door:
                    <select v-model="newRule.doorId" required>
                        <option v-for="door in doors" :key="door.id" :value="door.id">
                            {{ door.location }} ({{ door.deviceId }})
                        </option>
                    </select>
                </label>

                <!-- Simple Time Slot Input for Demo -->
                <div class="time-slots">
                    <h4>Time Slots (Leave empty for 24/7)</h4>
                    <div v-for="(slot, index) in newRule.timeSlots" :key="index" class="time-slot">
                        <select v-model="slot.dayOfWeek">
                            <option value="MONDAY">Monday</option>
                            <option value="TUESDAY">Tuesday</option>
                            <option value="WEDNESDAY">Wednesday</option>
                            <option value="THURSDAY">Thursday</option>
                            <option value="FRIDAY">Friday</option>
                            <option value="SATURDAY">Saturday</option>
                            <option value="SUNDAY">Sunday</option>
                        </select>
                        <input v-model="slot.startTime" type="time" />
                        <input v-model="slot.endTime" type="time" />
                        <button type="button" @click="removeTimeSlot(newRule, index)">
                            Remove
                        </button>
                    </div>
                    <button type="button" @click="addTimeSlot(newRule)">Add Time Slot</button>
                </div>

                <button type="submit">Create</button>
                <button type="button" @click="showCreateModal = false">Cancel</button>
            </form>
        </ModalDialog>

        <!-- Edit Modal -->
        <ModalDialog :show="showEditModal" title="Edit Access Rule">
            <form @submit.prevent="updateRule">
                <p>User: {{ getUserName(editingRule.userId) }}</p>
                <p>Door: {{ getDoorName(editingRule.doorId) }}</p>

                <div class="time-slots">
                    <h4>Time Slots (Leave empty for 24/7)</h4>
                    <div
                        v-for="(slot, index) in editingRule.timeSlots"
                        :key="index"
                        class="time-slot"
                    >
                        <select v-model="slot.dayOfWeek">
                            <option value="MONDAY">Monday</option>
                            <option value="TUESDAY">Tuesday</option>
                            <option value="WEDNESDAY">Wednesday</option>
                            <option value="THURSDAY">Thursday</option>
                            <option value="FRIDAY">Friday</option>
                            <option value="SATURDAY">Saturday</option>
                            <option value="SUNDAY">Sunday</option>
                        </select>
                        <input v-model="slot.startTime" type="time" />
                        <input v-model="slot.endTime" type="time" />
                        <button type="button" @click="removeTimeSlot(editingRule, index)">
                            Remove
                        </button>
                    </div>
                    <button type="button" @click="addTimeSlot(editingRule)">Add Time Slot</button>
                </div>

                <button type="submit">Update</button>
                <button type="button" @click="showEditModal = false">Cancel</button>
            </form>
        </ModalDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import accessRuleService, { type AccessRule } from "../services/accessRuleService";
import StatusBadge from "../components/StatusBadge.vue";
import ModalDialog from "../components/ModalDialog.vue";
import { useLookups } from "../composables/useLookups";

const { users, doors, fetchUsers, fetchDoors, getUserName, getDoorName } = useLookups();

const rules = ref<AccessRule[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);

const newRule = ref<AccessRule>({
    userId: "",
    doorId: "",
    timeSlots: [],
    active: true,
});

const editingRule = ref<AccessRule>({
    userId: "",
    doorId: "",
    timeSlots: [],
    active: true,
});

const fetchRules = async () => {
    try {
        const response = await accessRuleService.getAccessRules();
        rules.value = response.data;
    } catch (error) {
        console.error("Error fetching access rules:", error);
    }
};

const toggleActive = async (rule: AccessRule) => {
    if (!rule.id) return;
    try {
        if (rule.active) {
            await accessRuleService.deactivateAccessRule(rule.id);
        } else {
            await accessRuleService.activateAccessRule(rule.id);
        }
        await fetchRules();
    } catch (error) {
        console.error("Error toggling access rule status:", error);
    }
};

const deleteRule = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
        await accessRuleService.deleteAccessRule(id);
        await fetchRules();
    } catch (error) {
        console.error("Error deleting access rule:", error);
    }
};

const addTimeSlot = (rule: AccessRule) => {
    if (!rule.timeSlots) rule.timeSlots = [];
    rule.timeSlots.push({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" });
};

const removeTimeSlot = (rule: AccessRule, index: number) => {
    if (rule.timeSlots) {
        rule.timeSlots.splice(index, 1);
    }
};

const createRule = async () => {
    try {
        await accessRuleService.createAccessRule(newRule.value);
        showCreateModal.value = false;
        newRule.value = { userId: "", doorId: "", timeSlots: [], active: true };
        await fetchRules();
    } catch (error) {
        console.error("Error creating access rule:", error);
    }
};

const editRule = (rule: AccessRule) => {
    // Deep copy to avoid modifying the original rule in the list while editing
    editingRule.value = JSON.parse(JSON.stringify(rule));
    showEditModal.value = true;
};

const updateRule = async () => {
    if (!editingRule.value.id) return;
    try {
        await accessRuleService.updateAccessRule(editingRule.value.id, editingRule.value);
        showEditModal.value = false;
        await fetchRules();
    } catch (error) {
        console.error("Error updating access rule:", error);
    }
};

onMounted(() => {
    fetchRules();
    fetchUsers();
    fetchDoors();
});
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.time-slot {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
}
</style>
