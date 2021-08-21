const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

let handle = {};
handle['/'] = requestHandlers.start;
handle['/start'] = requestHandlers.start;
handle['/playFifteen'] = requestHandlers.playFifteen;
handle['/playTetris'] = requestHandlers.playTetris;
handle['/style.css'] = requestHandlers.getCss;
handle['/main.js'] = requestHandlers.getJs;

server.start(router.route, handle);
