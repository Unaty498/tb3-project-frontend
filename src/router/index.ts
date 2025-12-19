import { createRouter, createWebHistory } from "vue-router";
import AdminDashboard from "../views/AdminDashboard.vue";
import UsersView from "../views/UsersView.vue";
import UserDetailView from "../views/UserDetailView.vue";
import BadgesView from "../views/BadgesView.vue";
import DoorsView from "../views/DoorsView.vue";
import DoorDetailView from "../views/DoorDetailView.vue";
import AccessRulesView from "../views/AccessRulesView.vue";
import AccessLogsView from "../views/AccessLogsView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "/admin/users",
        },
        {
            path: "/admin",
            component: AdminDashboard,
            children: [
                {
                    path: "users",
                    component: UsersView,
                },
                {
                    path: "users/:id",
                    component: UserDetailView,
                },
                {
                    path: "badges",
                    component: BadgesView,
                },
                {
                    path: "doors",
                    component: DoorsView,
                },
                {
                    path: "doors/:id",
                    components: { default: DoorDetailView, accessRules: AccessRulesView },
                },
                {
                    path: "access-rules",
                    component: AccessRulesView,
                },
                {
                    path: "access-logs",
                    component: AccessLogsView,
                },
            ],
        },
    ],
});

export default router;
