import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { getToken, initKeycloak } from "./services/keycloak";

const app = createApp(App);

app.use(router);

initKeycloak()
    .then(async (authenticated) => {
        if (!authenticated) {
            window.location.reload();
        } else {
            try {
                // Appel au backend pour synchroniser l'utilisateur
                await fetch('/api/me', {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
            } catch (error) {
                console.error("Failed to synchronize user with backend", error);
            }
            console.log("Authenticated");
            app.mount("#app");
        }
    })
    .catch((err) => {
        console.error("Keycloak init failed", err);
    });
