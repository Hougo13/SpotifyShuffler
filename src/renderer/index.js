import Vue from "vue";
import VueRouter from "vue-router";
import { router } from "./router";
//import { StoreService, SpotifyService } from "./services";
import CorePlugin from "./CorePlugin";

import "./style.scss";

Vue.use(VueRouter);
Vue.use(CorePlugin, {
    spotify: {
        clientId: "6ad472bb911648ad9e8379dfbb9a2fac",
        clientSecret: "3587ae59ef534d97bda7895b5b25617c",
    },
});
/*Vue.use(new StoreService());
Vue.use(
    new SpotifyService({
        clientId: "6ad472bb911648ad9e8379dfbb9a2fac",
        clientSecret: "3587ae59ef534d97bda7895b5b25617c",
    })
);*/

const app = new Vue({
    template: `
        <div class="container">
            <router-link to="/home">Home</router-link>
            <router-link to="/login">Login</router-link>
            <router-view></router-view>
        </div>
    `,
    router,
});

app.$mount("#app");
