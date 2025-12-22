<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
    <router-link to="/" class="home-link">Go to Home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  color: var(--color-text);
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: var(--color-heading);
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.home-link {
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-border);
  color: var(--color-text);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: var(--color-border-hover);
}
</style>
