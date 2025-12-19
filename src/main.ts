import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initKeycloak } from "./services/keycloak";

const app = createApp(App);

app.use(router);

initKeycloak()
    .then((authenticated) => {
        if (!authenticated) {
            window.location.reload();
        } else {
            console.log("Authenticated");
            app.mount("#app");
        }
    })
    .catch((err) => {
        console.error("Keycloak init failed", err);
    });
