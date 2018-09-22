import SpotifyWebApi from "spotify-web-api-node";
import { Store, Auth, Shuffler, DataFetcher } from "./core";
import { setTimeout } from "timers";

export default {
    install: (Vue, options) => {
        const store = new Store(options.store);
        const spotifyApi = new SpotifyWebApi(options.spotify);

        const auth = new Auth({
            store,
            spotifyApi,
            config: {
                port: 3000,
                scopes: [
                    "playlist-modify-private",
                    "user-library-read",
                    "user-follow-read",
                ],
                state: "state",
            },
        });

        //const shuffler = new Shuffler({ spotifyApi, auth });

        const dataFetcher = new DataFetcher({ auth, spotifyApi });

        dataFetcher.on("start", () => console.log("Loading..."));
        dataFetcher.on("done", res => console.log("done", res));
        dataFetcher.on("progress", p => console.log(p + "%"));
        dataFetcher.on("error", err => console.error(err));

        dataFetcher.run();

        Vue.prototype.$store = store;
        Vue.prototype.$auth = auth;
        //Vue.prototype.$shuffler = shuffler;
    },
};
