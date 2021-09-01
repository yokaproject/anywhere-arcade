const connect = (server) => {
    const io = require('socket.io')(server);
    let connectedUsers = new Set();

    io.on('connection', (socket) => {
        console.log('Connected');
        socket.emit('init');

        socket.on('connectWithFriend', (data) => {
            const friendsId = data.friendsId;
            if (data.isGuest) {
                if (connectedUsers.has(friendsId)) {
                    console.log('This user has already conncted with another user.');
                    io.to(socket.id).emit('alertFull');
                    return;
                }
                io.to(friendsId).emit('passId', socket.id);
            }
            socket.join(friendsId);
            connectedUsers.add(friendsId);
            console.log('isGuest: ' + data.isGuest);
            console.log(socket.rooms);

            socket.on('post', (data) => {
                io.to(data.to).emit('recievePost', data);
            });
    
            socket.on('isReady', (friendsId) => {
                console.log('is ready called by ' + socket.id);
                console.log('called friend is ready for ' + friendsId);
                io.to(friendsId).emit('isReady_friend', friendsId);
            });

            socket.on('attack', (data) => {
                io.to(data.to).emit('addRowNum', data);
            });
            socket.on('endGame', (winner) => {
                io.to(winner).emit('win', winner);
            });
        });
        
        socket.on('disconnect', (socket) => {
            console.log('Disconnected');
            const id = socket.id;
            if (connectedUsers.has(id)) {
                connectedUsers.delete(id);
                console.log('deleted' + id);
            }
            console.log('Current connected users: ' + connectedUsers.size);
            for (var userId of connectedUsers) {
                console.log('- ' + userId);
            }
        });
    });
}

exports.connect = connect;