const fs = require('fs');

const home = (response, pathname, postData) => {
    console.log('Request handler \'home\' was called');
    fs.readFile('pages/home.html', 'utf-8', (err, filedata) => {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(filedata);
        response.end();
    });
};

// common handlers
const getHTML = (response, pathname, postData) => {
    console.log('Request handler \'getHTML\' was called');
    const file = 'pages' + pathname + '.html';
    fs.readFile(file, 'utf-8', (err, filedata) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('<span id="roomid" style="display: none;">' + postData + '</span>');
        response.write(filedata);
        response.end();
    })
};
const getCSS = (response, pathname, postData) => {
    console.log('Request handler \'getCSS\' was called');
    const file = 'pages' + pathname;
    fs.readFile(file, 'utf-8', (err, filedata) => {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(filedata);
        response.end();
    });
};
const getJS = (response, pathname, postData) => {
    console.log('Request handler \'getJS\' was called');
    const file = 'pages' + pathname;
    fs.readFile(file, 'utf-8', (err, filedata) => {
        response.writeHead(200, {'Content-Type': 'text/javascript'});
        response.write(filedata);
        response.end();
    });
};
const getImage = (response, pathname, postData) => {
    console.log('Request handler \'getImage\' was called');
    const file = 'pages' + pathname;
    fs.readFile(file, (err, filedata) => {
        response.writeHead(200, {'Content-Type': 'image/png'});
        response.write(filedata);
        response.end();
    });
};

exports.home = home;

exports.getHTML = getHTML;
exports.getCSS = getCSS;
exports.getJS = getJS;
exports.getImage = getImage;
