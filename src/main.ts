import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initKeycloak } from "./services/keycloak";

const app = createApp(App);

app.use(router);

// Try to restore session
initKeycloak().then(() => {
    app.mount("#app");
});
