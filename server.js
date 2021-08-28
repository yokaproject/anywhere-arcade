const http = require('http');
const socket = require('./socket');

const start = (route, handle) => {
  const onRequest = (request, response) => {
      let pathname = request.url;
      let postData = '';

      // tetrisVSのpathnameは末尾の値にかかわらず/tetrisVSとする
      if (pathname.indexOf('/tetrisVS/') === 0) {
        const roomid = pathname.slice(10);
        postData += roomid;
        console.log(roomid);
        pathname = '/tetrisVS';
      }

      console.log('Request for ' + pathname + ' received.');

      request.setEncoding('utf8');

      request.addListener('data', (postDataChunk) => {
        postData += postDataChunk;
        console.log('Received POST data chunk \''+ postDataChunk + '\'.');
      });

      request.addListener('end', () => {
        route(handle, response, pathname, postData);
      });
  };
  
  const server = http.createServer(onRequest);
  server.listen(process.env.PORT || 3000);
  console.log('Server has started.');
  
  socket.connect(server);
};

exports.start = start;
