const fs = require('fs');

const home = (response, pathname) => {
    console.log('Request handler \'home\' was called');
    fs.readFile('pages/home.html', 'utf-8', (err, data) => {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });
};

// common handlers
const getHTML = (response, pathname) => {
    console.log('Request handler \'getHTML\' was called');
    const file = 'pages' + pathname + '.html';
    fs.readFile(file, 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })
};
const getCSS = (response, pathname) => {
    console.log('Request handler \'getCSS\' was called');
    const file = 'pages' + pathname;
    fs.readFile(file, 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
    });
};
const getJS = (response, pathname) => {
    console.log('Request handler \'getJS\' was called');
    const file = 'pages' + pathname;
    fs.readFile(file, 'utf-8', (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/javascript'});
        response.write(data);
        response.end();
    });
};
const getImage = (response, pathname) => {
    console.log('Request handler \'getImage\' was called');
    const file = 'pages' + pathname;
    fs.readFile(file, (err, data) => {
        response.writeHead(200, {'Content-Type': 'image/png'});
        response.write(data);
        response.end();
    });
};

exports.home = home;

exports.getHTML = getHTML;
exports.getCSS = getCSS;
exports.getJS = getJS;
exports.getImage = getImage;
