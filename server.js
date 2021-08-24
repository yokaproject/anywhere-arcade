const http = require('http');

const start = (route, handle) => {
  const onRequest = (request, response) => {
      const pathname = request.url;
      let postData = "";
      console.log('Request for ' + pathname + ' received.');

      request.setEncoding('utf8');

      request.addListener('data', (postDataChunk) => {
        postData += postDataChunk;
        console.log('Received POST data chunk \''+ postDataChunk + '\'.');
      });

      request.addListener('end', () => {
        route(handle, pathname, response, postData);
      });
  };
  
  const server = http.createServer(onRequest);
  server.listen(process.env.PORT || 3000);
  console.log('Server has started.');

  const io = require('socket.io')(server);

  io.on("connection", (socket)=>{
    console.log("Connected");
  
    socket.on("post", (msg)=>{
      io.emit("member-post", msg);
    });
  });
};

exports.start = start;
