const PORT = process.env.PORT || 3000;
const server = require("restify").createServer();
const http = require("http");
const socketio = require("socket.io");
const JsonSync = require("json-sync");
const InMemoryDataAdapter = require("json-sync/src/adapter/InMemoryDataAdapter");

// setting up the diffsync server
const jsonSyncServer = new JsonSync.Server(new InMemoryDataAdapter(), socketio.listen(server.server));


// starting the http server
server.listen(PORT, () => {
    console.log("server listening at %s", PORT);
});

process.once("SIGTERM", () => {
    http.close(() => {
        console.log("Server shutdown complete");
    });
});
