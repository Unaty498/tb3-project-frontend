<template>
    <div class="doors-view">
        <h2>Doors</h2>
        <button @click="showCreateModal = true">Create Door</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Device ID</th>
                    <th>Location</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="door in doors"
                    :key="door.id"
                    class="clickable-row"
                    @click="door.id && $router.push(`/admin/doors/${door.id}`)"
                >
                    <td>{{ door.id }}</td>
                    <td>{{ door.deviceId }}</td>
                    <td>{{ door.location }}</td>
                    <td>
                        <StatusBadge :active="door.active" />
                    </td>
                    <td @click.stop>
                        <button @click="viewUsers(door)">View Users</button>
                        <button @click="editDoor(door)">Edit</button>
                        <button @click="toggleActive(door)">
                            {{ door.active ? "Deactivate" : "Activate" }}
                        </button>
                        <button class="danger" @click="deleteDoor(door.id!)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Create Modal -->
        <ModalDialog :show="showCreateModal" title="Create Door">
            <form @submit.prevent="createDoor">
                <label>Device ID: <input v-model="newDoor.deviceId" required /></label>
                <label>Location: <input v-model="newDoor.location" required /></label>
                <button type="submit">Create</button>
                <button type="button" @click="showCreateModal = false">Cancel</button>
            </form>
        </ModalDialog>

        <!-- Edit Modal -->
        <ModalDialog :show="showEditModal" title="Edit Door">
            <form @submit.prevent="updateDoor">
                <label>Device ID: <input v-model="editingDoor.deviceId" required /></label>
                <label>Location: <input v-model="editingDoor.location" required /></label>
                <button type="submit">Update</button>
                <button type="button" @click="showEditModal = false">Cancel</button>
            </form>
        </ModalDialog>

        <!-- View Users Modal -->
        <ModalDialog
            :show="showUsersModal"
            :title="`Authorized Users for ${selectedDoor?.location}`"
        >
            <ul v-if="doorRules.length > 0">
                <li v-for="rule in doorRules" :key="rule.id">
                    <strong>{{ getUserName(rule.userId) }}</strong> (ID: {{ rule.userId }})
                    <span v-if="rule.timeSlots && rule.timeSlots.length > 0">
                        - {{ rule.timeSlots.length }} time slots
                    </span>
                    <span v-else> - 24/7 Access</span>
                </li>
            </ul>
            <p v-else>No authorized users found.</p>
            <button type="button" @click="showUsersModal = false">Close</button>
        </ModalDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import doorService, { type Door } from "../services/doorService";
import accessRuleService, { type AccessRule } from "../services/accessRuleService";
import StatusBadge from "../components/StatusBadge.vue";
import ModalDialog from "../components/ModalDialog.vue";
import { useLookups } from "../composables/useLookups";

const { doors, fetchDoors, fetchUsers, getUserName } = useLookups();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showUsersModal = ref(false);

const newDoor = ref<Door>({
    deviceId: "",
    location: "",
    active: true,
});

const editingDoor = ref<Door>({
    deviceId: "",
    location: "",
    active: true,
});

const selectedDoor = ref<Door | null>(null);
const doorRules = ref<AccessRule[]>([]);

const toggleActive = async (door: Door) => {
    if (!door.id) return;
    try {
        if (door.active) {
            await doorService.deactivateDoor(door.id);
        } else {
            await doorService.activateDoor(door.id);
        }
        await fetchDoors();
    } catch (error) {
        console.error("Error toggling door status:", error);
    }
};

const deleteDoor = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
        await doorService.deleteDoor(id);
        await fetchDoors();
    } catch (error) {
        console.error("Error deleting door:", error);
    }
};

const createDoor = async () => {
    try {
        await doorService.createDoor(newDoor.value);
        showCreateModal.value = false;
        newDoor.value = { deviceId: "", location: "", active: true };
        await fetchDoors();
    } catch (error) {
        console.error("Error creating door:", error);
    }
};

const editDoor = (door: Door) => {
    editingDoor.value = { ...door };
    showEditModal.value = true;
};

const updateDoor = async () => {
    if (!editingDoor.value.id) return;
    try {
        await doorService.updateDoor(editingDoor.value.id, editingDoor.value);
        showEditModal.value = false;
        await fetchDoors();
    } catch (error) {
        console.error("Error updating door:", error);
    }
};

const viewUsers = async (door: Door) => {
    if (!door.id) return;
    selectedDoor.value = door;
    try {
        const response = await accessRuleService.getAccessRulesByDoor(door.id);
        doorRules.value = response.data;
        showUsersModal.value = true;
    } catch (error) {
        console.error("Error fetching door rules:", error);
    }
};

onMounted(() => {
    fetchDoors();
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
