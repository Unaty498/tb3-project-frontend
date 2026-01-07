<template>
    <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <nav class="admin-nav">
            <router-link to="/admin/users">Users</router-link>
            <router-link to="/admin/badges">Badges</router-link>
            <router-link to="/admin/doors">Doors</router-link>
            <router-link to="/admin/access-rules">Access Rules</router-link>
            <router-link to="/admin/access-logs">Access Logs</router-link>
            <button class="logout-btn" @click="handleLogout">Déconnexion</button>
        </nav>
        <div class="admin-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { logout } from '../services/keycloak';

function handleLogout() {
  logout();
}
</script>

<style scoped>
.admin-dashboard {
    padding: 20px;
}

.admin-nav {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
}

.admin-nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
}

.admin-nav a.router-link-active {
    color: #007bff;
}

.logout-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: #dc3545;
    font-weight: bold;
    cursor: pointer;
    text-decoration: underline;
}

.logout-btn:hover {
    color: #a71d2a;
}
</style>
