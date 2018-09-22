import { shell } from "electron";
import { ExpressServer } from "./";
import { setInterval } from "timers";

export class Auth {
    constructor({ store, spotifyApi, config }) {
        this.spotifyApi = spotifyApi;
        this.store = store;

        this.PORT = config.port;
        this.SCOPES = config.scopes;
        this.STATE = config.state;

        this.expressServer = null;
        this.isConnected = false;

        const refreshToken = this.store.refreshToken;

        if (refreshToken) {
            this.spotifyApi.setRefreshToken(refreshToken);

            this.spotifyApi.refreshAccessToken().then(
                data => {
                    console.log("The access token has been refreshed!");

                    // Save the access token so that it's used in future calls
                    this.spotifyApi.setAccessToken(data.body["access_token"]);
                    this.isConnected = true;
                },
                err => {
                    console.log("Could not refresh access token", err);
                }
            );
        }
    }

    connected() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
            } else {
                const interval = setInterval(() => {
                    if (this.isConnected) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 500);
            }
        });
    }

    login(callback) {
        if (this.isConnected) return;

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

                                    this.store.refreshToken =
                                        data.body["refresh_token"];

                                    this.isConnected = true;

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
