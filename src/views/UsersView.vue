<template>
    <div class="users-view">
        <h2>Users</h2>
        <button @click="showCreateModal = true">Create User</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="user in users"
                    :key="user.id"
                    class="clickable-row"
                    @click="user.id && $router.push(`/admin/users/${user.id}`)"
                >
                    <td>{{ user.id }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.firstName }}</td>
                    <td>{{ user.lastName }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                        <StatusBadge :active="user.active" />
                    </td>
                    <td @click.stop>
                        <button @click="viewDoors(user)">View Doors</button>
                        <button @click="editUser(user)">Edit</button>
                        <button @click="toggleActive(user)">
                            {{ user.active ? "Deactivate" : "Activate" }}
                        </button>
                        <button class="danger" @click="deleteUser(user.id!)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Create Modal -->
        <ModalDialog :show="showCreateModal" title="Create User">
            <form @submit.prevent="createUser">
                <label>Email: <input v-model="newUser.email" required /></label>
                <label>First Name: <input v-model="newUser.firstName" /></label>
                <label>Last Name: <input v-model="newUser.lastName" /></label>
                <label
                    >Role:
                    <select v-model="newUser.role">
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="VISITOR">Visitor</option>
                    </select>
                </label>
                <button type="submit">Create</button>
                <button type="button" @click="showCreateModal = false">Cancel</button>
            </form>
        </ModalDialog>

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
                <button type="submit">Update</button>
                <button type="button" @click="showEditModal = false">Cancel</button>
            </form>
        </ModalDialog>

        <!-- View Doors Modal -->
        <ModalDialog :show="showDoorsModal" :title="`Accessible Doors for ${selectedUser?.email}`">
            <ul v-if="userRules.length > 0">
                <li v-for="rule in userRules" :key="rule.id">
                    <strong>{{ getDoorName(rule.doorId) }}</strong> (ID: {{ rule.doorId }})
                    <span v-if="rule.timeSlots && rule.timeSlots.length > 0">
                        - {{ rule.timeSlots.length }} time slots
                    </span>
                    <span v-else> - 24/7 Access</span>
                </li>
            </ul>
            <p v-else>No accessible doors found.</p>
            <button type="button" @click="showDoorsModal = false">Close</button>
        </ModalDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import userService, { type User } from "../services/userService";
import accessRuleService, { type AccessRule } from "../services/accessRuleService";
import StatusBadge from "../components/StatusBadge.vue";
import ModalDialog from "../components/ModalDialog.vue";
import { useLookups } from "../composables/useLookups";

const { users, fetchUsers, fetchDoors, getDoorName } = useLookups();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDoorsModal = ref(false);

const newUser = ref<User>({
    email: "",
    firstName: "",
    lastName: "",
    role: "USER",
    active: true,
});

const editingUser = ref<User>({
    email: "",
    firstName: "",
    lastName: "",
    role: "USER",
    active: true,
});

const selectedUser = ref<User | null>(null);
const userRules = ref<AccessRule[]>([]);

const toggleActive = async (user: User) => {
    if (!user.id) return;
    try {
        if (user.active) {
            await userService.deactivateUser(user.id);
        } else {
            await userService.activateUser(user.id);
        }
        await fetchUsers();
    } catch (error) {
        console.error("Error toggling user status:", error);
    }
};

const deleteUser = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
        await userService.deleteUser(id);
        await fetchUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
    }
};

const createUser = async () => {
    try {
        await userService.createUser(newUser.value);
        showCreateModal.value = false;
        newUser.value = { email: "", firstName: "", lastName: "", role: "USER", active: true };
        await fetchUsers();
    } catch (error) {
        console.error("Error creating user:", error);
    }
};

const editUser = (user: User) => {
    editingUser.value = { ...user };
    showEditModal.value = true;
};

const updateUser = async () => {
    if (!editingUser.value.id) return;
    try {
        await userService.updateUser(editingUser.value.id, editingUser.value);
        showEditModal.value = false;
        await fetchUsers();
    } catch (error) {
        console.error("Error updating user:", error);
    }
};

const viewDoors = async (user: User) => {
    if (!user.id) return;
    selectedUser.value = user;
    try {
        const response = await accessRuleService.getAccessRulesByUser(user.id);
        userRules.value = response.data;
        showDoorsModal.value = true;
    } catch (error) {
        console.error("Error fetching user rules:", error);
    }
};

onMounted(() => {
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
</style>
