const http = require("http");
const server = require("restify").createServer();
const socketio = require("socket.io");
const JsonSync = require("json-sync");
const InMemoryDataAdapter = require("json-sync/src/adapter/InMemoryDataAdapter");

const PORT = process.env.PORT || 62019;

// setting up the diffsync server
const transport = socketio.listen(server.server);
// eslint-disable-next-line no-unused-vars
const jsonSyncServer = new JsonSync.Server(new InMemoryDataAdapter(), transport);

// starting the http server
server.listen(PORT, () => {
    console.log("server listening at %s", PORT);
});

process.once("SIGTERM", () => {
    http.close(() => {
        console.log("Server shutdown complete");
    });
});
