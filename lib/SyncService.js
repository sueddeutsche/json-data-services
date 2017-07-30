const diffpatch = require("./utils/diffpatch");
const JsonSyncClient = require("json-sync").Client;
const socket = require("socket.io-client");


class SyncService {

    constructor(url, dataService, id) {
        this.id = id;
        this.dataService = dataService;

        this.client = new JsonSyncClient(socket(url), id, diffpatch.options);

        this.onUpdate = this.onUpdate.bind(this);
        this.onSynched = this.onSynched.bind(this);
        this.onConnect = this.onConnect.bind(this);

        this.client.on("connected", this.onConnect);
        this.client.on("error", console.error);
        this.client.on("synced", this.onSynched);
        this.client.initialize();

        dataService.on("afterUpdate", this.onUpdate);
    }

    onSynched() {
        console.log("sync apply changes");
        // an update from the server has been applied, you can perform the updates in your application now
        this.dataService.set("#", this.data.data);
    }

    onConnect() {
        console.log("connected to sync server");
        // the initial data has been loaded, you can initialize your application
        this.data = this.client.getData();
        if (this.data.data == null) {
            this.data.data = this.dataService.get();
            this.client.sync();
        } else {
            this.dataService.set("#", this.data.data);
        }
    }

    onUpdate(event) {
        console.log(`sync data @${event.pointer}`);
        this.data.data = this.dataService.get();
        this.client.sync();
    }
}


module.exports = SyncService;
