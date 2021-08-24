const fs = require('fs');

const start = (response, postData) => {
    console.log('Request handler \'start\' was called');

    const body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<h1>どこでもアーケード</h1>'+
    '<h2>Anywhere Arcade</h2>'+
    '<a href="/slide">15パズルで遊ぶ</a><br>'+
    '<a href="/tetris">テトリスで遊ぶ</a><br>'+
    '<a href="/chat">チャット</a>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(body);
    response.end();
    return 'Hello Start';
};
const chat = (response, postData) => {
    console.log('Request handler \'chat\' was called');
    fs.readFile('pages/chat.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
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
const tetris = (response, postData) => {
    console.log('Request handler \'tetris\' was called');
    fs.readFile('pages/tetris.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })
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

exports.start = start;
exports.chat = chat;
exports.slide = slide;
exports.tetris = tetris;
exports.slideCss = slideCss;
exports.slideJs = slideJs;
exports.tetrisCss = tetrisCss;
exports.tetrisJs = tetrisJs;
exports.socket = socket;
