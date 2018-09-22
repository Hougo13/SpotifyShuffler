import express from "express";

export class ExpressServer {
    constructor(port, callback) {
        this.port = port;
        this.app = express();
        this.server = null;

        this.app.get("/callback", (req, res) => {
            let promise;

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
