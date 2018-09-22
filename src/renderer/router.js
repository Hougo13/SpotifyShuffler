import VueRouter from "vue-router";
import { LoginPage, HomePage } from "./pages";

export const routes = [
    { path: "/login", component: LoginPage },
    { path: "/home", component: HomePage },
];

export const router = new VueRouter({
    routes,
});
