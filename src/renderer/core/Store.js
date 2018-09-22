import ElectronStore from "electron-store";

export class Store {
    constructor(options) {
        this.store = new ElectronStore(options);
        console.log(this.store.path);
    }

    get refreshToken() {
        return this.store.get("refresh_token");
    }

    set refreshToken(refreshToken) {
        this.store.set("refresh_token", refreshToken);
    }
}
