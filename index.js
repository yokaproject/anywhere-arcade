const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

let handle = {};
handle['/'] = requestHandlers.home;
handle['/home'] = requestHandlers.home;
handle['/css/home.css'] = requestHandlers.getCSS;
handle['/js/home.js'] = requestHandlers.getJS;

handle['/chat'] = requestHandlers.getHTML;
handle['/css/chat.css'] = requestHandlers.getCSS;
handle['/js/chat.js'] = requestHandlers.getJS;

handle['/slide'] = requestHandlers.getHTML;
handle['/css/slide.css'] = requestHandlers.getCSS;
handle['/js/slide.js'] = requestHandlers.getJS;

handle['/tetris'] = requestHandlers.getHTML;
handle['/css/tetris.css'] = requestHandlers.getCSS;
handle['/js/tetris.js'] = requestHandlers.getJS;

handle['/tetrisVS'] = requestHandlers.getHTML;
handle['/css/tetrisVS.css'] = requestHandlers.getCSS;
handle['/js/tetrisVS.js'] = requestHandlers.getJS;
handle['/tetrisVS/css/tetrisVS.css'] = requestHandlers.getCSS;
handle['/tetrisVS/js/tetrisVS.js'] = requestHandlers.getJS;

handle['/images/slide.png'] = requestHandlers.getImage;
handle['/images/tetris.png'] = requestHandlers.getImage;
handle['/images/tetrisVS.png'] = requestHandlers.getImage;
handle['/images/chat.png'] = requestHandlers.getImage;

server.start(router.route, handle);
