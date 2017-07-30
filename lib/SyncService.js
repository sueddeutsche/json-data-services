const diffpatch = require("./utils/diffpatch");
const JsonSyncClient = require("json-sync").Client;
const socket = require("socket.io-client");


class SyncService {

    constructor(url, dataService, id) {
        if (id == null) {
            console.error("SyncService abort -- invalid id given", id);
            return;
        }

        this.id = id;
        this.dataService = dataService;
        this.connected = false;

        this.client = new JsonSyncClient(socket(url), id, diffpatch.options);

        this.onUpdate = this.onUpdate.bind(this);
        this.onSynched = this.onSynched.bind(this);
        this.onError = this.onError.bind(this);
        this.onConnect = this.onConnect.bind(this);

        this.client.on("connected", this.onConnect);
        this.client.on("error", this.onError);
        this.client.on("synced", this.onSynched);
        console.log(`SyncServer build connection ${id} to`, url);
        this.client.initialize();

        dataService.on("afterUpdate", this.onUpdate);
    }

    onSynched() {
        // console.log("sync apply changes");
        // an update from the server has been applied, you can perform the updates in your application now
        this.dataService.set("#", this.data.data, true);
    }

    onError(error) {
        console.error("SyncServer failed to connect", error);
    }

    onConnect() {
        this.connected = true;
        console.info(`SyncServer connected on id ${this.id}`);
        // console.log("connected to sync server");
        // the initial data has been loaded, you can initialize your application
        this.data = this.client.getData();
        if (this.data.data == null) {
            this.data.data = this.dataService.get();
            this.client.sync();
        } else {
            this.dataService.set("#", this.data.data, true);
        }
    }

    onUpdate(event) {
        if (this.connected) {
            this.data.data = this.dataService.get();
            this.client.sync();
        }
    }
}


module.exports = SyncService;
