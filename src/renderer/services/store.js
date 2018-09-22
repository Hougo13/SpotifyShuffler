import Store from "electron-store";

export default class StoreService {
    constructor(options) {
        this.store = new Store(options);
    }

    install(Vue, options) {
        Vue.prototype.$store = this.store;
    }
}
