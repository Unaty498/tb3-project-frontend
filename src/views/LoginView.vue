<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Connexion</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Utilisateur</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" :disabled="loading">
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, hasRole, logout, getToken } from '../services/keycloak';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    const success = await login(username.value, password.value);
    if (success) {
      if (hasRole('ADMIN')) {
          try {
            await fetch('/api/me', {
              headers: {
                'Authorization': `Bearer ${getToken()}`
              }
            });
          } catch (syncError) {
            console.error("Failed to sync user with backend", syncError);
          }
          router.push('/');
      } else {
          error.value = "Vous n'avez pas les droits d'administration";
          logout();
      }
    } else {
      error.value = 'Identifiants incorrects';
    }
  } catch (e) {
    error.value = 'Erreur de connexion';
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #9e9e9e;
}

.error {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
