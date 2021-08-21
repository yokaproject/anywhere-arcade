const querystring = require("querystring");
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
    '<a href="/playFifteen">15パズルで遊ぶ</a><br>'+
    '<a href="/playTetris">テトリスで遊ぶ</a>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(body);
    response.end();
    return 'Hello Start';
};

const playFifteen = (response, postData) => {
    console.log('Request handler \'playFifteen\' was called');
    fs.readFile('pages/fifteen.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}

const playTetris = (response, postData) => {
    console.log('Request handler \'playTetris\' was called');
    fs.readFile('pages/tetris.html', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })
}

const getCss = (response, postData) => {
    console.log('Request handler \'getCss\' was called');
    fs.readFile('pages/style.css', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
    });
}
const getJs = (response, postData) => {
    console.log('Request handler \'getCss\' was called');
    fs.readFile('pages/main.js', 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();
    });
}

exports.start = start;
exports.playFifteen = playFifteen;
exports.playTetris = playTetris;
exports.getCss = getCss;
exports.getJs = getJs;
