const fs = require('fs');

const home = (response, postData) => {
    console.log('Request handler \'home\' was called');
    fs.readFile('pages/home.html', 'utf-8', (err, data) => {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });
    return 'Hello Start';
};
const homeCss = (response, postData) => {
    console.log('Request handler \'homeCss\' was called');
    fs.readFile('pages/css/home.css', 'utf-8', (err, data) => {
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.write(data);
        response.end();
    });
}
const homeJs = (response, postData) => {
    console.log('Request handler \'homeJs\' was called');
    fs.readFile('pages/js/home.js', 'utf-8', (err, data) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write(data);
        response.end();
    });
}
const chat = (response, postData) => {
    console.log('Request handler \'chat\' was called');
    fs.readFile('pages/chat.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}
const chatCss = (response, postData) => {
    console.log('Request handler \'chatCss\' was called');
    fs.readFile('pages/css/chat.css', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
    });
}
const chatJs = (response, postData) => {
    console.log('Request handler \'chatJs\' was called');
    fs.readFile('pages/js/chat.js', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();
    });
}
const slide = (response, postData) => {
    console.log('Request handler \'slide\' was called');
    fs.readFile('pages/slide.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}
const slideCss = (response, postData) => {
    console.log('Request handler \'slideCss\' was called');
    fs.readFile('pages/css/slide.css', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
    });
}
const slideJs = (response, postData) => {
    console.log('Request handler \'slideJs\' was called');
    fs.readFile('pages/js/slide.js', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();
    });
}
const tetris = (response, postData) => {
    console.log('Request handler \'tetris\' was called');
    fs.readFile('pages/tetris.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })
}
const tetrisCss = (response, postData) => {
    console.log('Request handler \'tetrisCss\' was called');
    fs.readFile('pages/css/tetris.css', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
    });
}
const tetrisJs = (response, postData) => {
    console.log('Request handler \'tetrisJs\' was called');
    fs.readFile('pages/js/tetris.js', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();
    });
}
const socket = (response, postData) => {
    const file = __dirname + '/node_modules/socket.io/client-dist/socket.io.js';
    console.log('Request handler \'socket\' was called');
    fs.readFile(file, 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();
    });
}

exports.home = home;
exports.homeCss = homeCss;
exports.homeJs = homeJs;
exports.chat = chat;
exports.chatCss = chatCss;
exports.chatJs = chatJs;
exports.slide = slide;
exports.slideCss = slideCss;
exports.slideJs = slideJs;
exports.tetris = tetris;
exports.tetrisCss = tetrisCss;
exports.tetrisJs = tetrisJs;
exports.socket = socket;
