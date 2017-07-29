// const diffpatch = require("./utils/diffpatch");
const DiffSyncClient = require("diffsync").Client;
const socket = require("socket.io-client");


class SyncService {

    constructor(id, dataService) {
        this.client = new DiffSyncClient(socket("http://localhost:3000"), id);

        dataService.on("afterUpdate", (event) => {
            console.log(`data changed @${event.pointer} -- send update`);
            this.data.data = dataService.get();
            this.client.sync();
        });

        this.client.on("connected", () => {
            // the initial data has been loaded, you can initialize your application
            this.data = this.client.getData();
            if (this.data.data == null) {
                this.data.data = dataService.get();
                this.client.sync();
            } else {
                dataService.set("#", this.data.data);
            }
        });

        this.client.on("error", console.error);

        this.client.on("synced", () => {
            // an update from the server has been applied, you can perform the updates in your application now
            dataService.set("#", this.data.data);
            // console.log("Client updated", this.data.data);
            // const currentData = dataService.get();
            // const diff = diffpatch.diff(currentData, this.data.data);
            // console.log("diff", diff);
        });

        this.client.initialize();
    }
}


module.exports = SyncService;
