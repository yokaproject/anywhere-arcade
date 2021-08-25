const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

let handle = {};
handle['/'] = requestHandlers.home;
handle['/home'] = requestHandlers.home;
handle['/css/home.css'] = requestHandlers.homeCss;
handle['/js/home.js'] = requestHandlers.homeJs;
handle['/chat'] = requestHandlers.chat;
handle['/css/chat.css'] = requestHandlers.chatCss;
handle['/js/chat.js'] = requestHandlers.chatJs;
handle['/slide'] = requestHandlers.slide;
handle['/css/slide.css'] = requestHandlers.slideCss;
handle['/js/slide.js'] = requestHandlers.slideJs;
handle['/tetris'] = requestHandlers.tetris;
handle['/css/tetris.css'] = requestHandlers.tetrisCss;
handle['/js/tetris.js'] = requestHandlers.tetrisJs;
handle['/node_modules/socket.io/client-dist/socket.io.js'] = requestHandlers.socket;

server.start(router.route, handle);
