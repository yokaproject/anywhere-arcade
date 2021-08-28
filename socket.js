const connect = (server) => {
    const io = require('socket.io')(server);
    const fullrooms = new Set();
    io.on('connection', (socket) => {
        console.log('Connected');
        console.log(socket.rooms);
        socket.emit('init', socket.id);

        socket.on('joinRoom', (roomid) => {
            if (roomid != 'start' && fullrooms.has(roomid)) {
                console.log('The room is full.');
                socket.emit('alertFull');
                return;
            }
            socket.join(roomid);
            fullrooms.add(roomid);

            socket.on('post', (data) => {
                io.to(data.roomid).emit('recievePost', data);
            });
        });
        socket.on('disconnect', (socket) => {
            console.log('Disconnected');
            const id = socket.id;
            if (fullrooms.has(id)) {
                fullrooms.delete(id);
                console.log('deleted' + id);
            }
            console.log('------- size: ' + fullrooms.size);
        });
    });
}

exports.connect = connect;