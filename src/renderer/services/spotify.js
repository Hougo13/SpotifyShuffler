import SpotifyWebApi from "spotify-web-api-node";
import express from "express";
import BodyParser from "body-parser";
import { shell } from "electron";

export default class SpotifyService {
    constructor(options) {
        this.spotifyApi = new SpotifyWebApi(options);

        this.PORT = 3000;
        this.SCOPES = [
            "playlist-modify-private",
            "user-library-read",
            "user-follow-read",
        ];
        this.STATE = "state";

        this.expressServer = null;
    }

    install(Vue, options) {
        Vue.prototype.$spotifyService = this;
        this.store = Vue.prototype.$store;

        const refreshToken = this.store.get("refresh_token");
        if (refreshToken) {
            this.spotifyApi.setRefreshToken(refreshToken);

            this.spotifyApi.refreshAccessToken().then(
                data => {
                    console.log("The access token has been refreshed!");

                    // Save the access token so that it's used in future calls
                    this.spotifyApi.setAccessToken(data.body["access_token"]);
                },
                err => {
                    console.log("Could not refresh access token", err);
                }
            );
        }
    }

    isConnected() {
        return this.store.get("refresh_token") ? true : false;
    }

    login(callback) {
        this.loginCallback = callback;

        if (!this.expressServer) {
            this.expressServer = new ExpressServer(
                this.PORT,
                ({ code, error }) => {
                    return new Promise((resolve, reject) => {
                        if (code) {
                            this.spotifyApi
                                .authorizationCodeGrant(code)
                                .then(data => {
                                    console.log(
                                        `The token expires in ${
                                            data.body["expires_in"]
                                        }The access token is ${
                                            data.body["access_token"]
                                        }The refresh token is ${
                                            data.body["refresh_token"]
                                        }`
                                    );

                                    // Set the access token on the API object to use it in later calls
                                    this.spotifyApi.setAccessToken(
                                        data.body["access_token"]
                                    );
                                    this.spotifyApi.setRefreshToken(
                                        data.body["refresh_token"]
                                    );

                                    this.store.set(
                                        "refresh_token",
                                        data.body["refresh_token"]
                                    );

                                    setTimeout(
                                        () =>
                                            this.expressServer.stop(() => {
                                                console.log("server stopped");
                                                this.loginCallback = undefined;
                                            }),
                                        2000
                                    );

                                    this.loginCallback.complete();
                                    resolve("Success !");
                                })
                                .catch(err => reject("Error"));
                        } else {
                            if (error) console.error(error);
                            this.loginCallback.error("Error");
                            reject("Error");
                        }
                    });
                }
            );

            this.expressServer.start(() => {
                console.log("Server started");
                shell.openExternal(this.authUrl);
            });
        }
    }

    get redirectUri() {
        return `http://localhost:${this.PORT}/callback`;
    }

    get authUrl() {
        this.spotifyApi.setRedirectURI(this.redirectUri);
        return this.spotifyApi.createAuthorizeURL(this.SCOPES, this.STATE);
    }
}

class ExpressServer {
    constructor(port, callback) {
        this.port = port;
        this.app = express();
        this.server = null;

        this.app.get("/callback", (req, res) => {
            let promise;

            console.log(req.query);

            if (req.query.code) {
                promise = callback({ code: req.query.code });
            } else if (req.query.error) {
                promise = callback({ error: req.query.error });
            } else {
                promise = callback({ error: "No body" });
            }

            promise.then(text => res.send(text)).catch(text => res.send(text));
        });
    }

    start(callback) {
        if (this.server) {
            return false;
        }

        this.server = this.app.listen(this.port, callback);

        return true;
    }

    stop(callback) {
        if (this.server) {
            console.log(this.server);
            this.server.stop(callback);
            return true;
        }

        return false;
    }
}
