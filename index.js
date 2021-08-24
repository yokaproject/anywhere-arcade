const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

let handle = {};
handle['/'] = requestHandlers.start;
handle['/start'] = requestHandlers.start;
handle['/chat'] = requestHandlers.chat;
handle['/slide'] = requestHandlers.slide;
handle['/tetris'] = requestHandlers.tetris;
handle['/css/slide.css'] = requestHandlers.slideCss;
handle['/js/slide.js'] = requestHandlers.slideJs;
handle['/css/tetris.css'] = requestHandlers.tetrisCss;
handle['/js/tetris.js'] = requestHandlers.tetrisJs;
handle['/node_modules/socket.io/client-dist/socket.io.js'] = requestHandlers.socket;

server.start(router.route, handle);
