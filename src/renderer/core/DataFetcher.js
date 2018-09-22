import { setInterval, clearInterval } from "timers";
import { EventEmitter } from "events";

export class DataFetcher extends EventEmitter {
    constructor({ spotifyApi, auth }) {
        super();

        this.spotifyApi = spotifyApi;
        this.auth = auth;

        this._total = 0;
        this._loaded = 0;
        this.prevLoading = 0;

        this.artists = [];

        this.on("artists", artists => {
            artists.forEach(artist => {
                this.getAlbums(artist);
            });
        });
    }

    get loading() {
        let res = this.loaded * 100 / this.total;
        return res | 0;
    }

    set total(t) {
        this._total = t;
        this.calculProgress();
    }

    get total() {
        return this._total;
    }

    set loaded(l) {
        this._loaded = l;
        this.calculProgress();
    }

    get loaded() {
        return this._loaded;
    }

    calculProgress() {
        let currentLoading = this.loading;

        if (currentLoading != this.prevLoading) {
            this.emit("progress", currentLoading);
        }

        if (currentLoading == 100) {
            this.emit("done", this.artists);
        }

        this.prevLoading = currentLoading;
    }

    async run() {
        await this.auth.connected();
        this.loaded = 0;
        this.emit("start");
        this.getArtists();
    }

    getArtists(options = {}) {
        this.spotifyApi
            .getFollowedArtists(options)
            .then(({ body }) => {
                let items = body.artists.items;

                this.artists.push(...items);

                this.emit("artists", items);

                this.total = body.artists.total;

                if (body.artists.next) {
                    options.after = body.artists.cursors.after;
                    this.getArtists(options);
                }
            })
            .catch(err => this.emit("error", err));
    }

    async getAlbums(artist, options = {}) {
        this.spotifyApi
            .getArtistAlbums(artist.id, options)
            .then(({ body }) => {
                this.loaded += 1;
                //console.log(body);
                artist.albums = body.items;
            })
            .catch(err => this.emit("error", err));
    }
}
