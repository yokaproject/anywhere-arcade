const connect = (server) => {
    const io = require('socket.io')(server);

    let rooms = {}; // ルームIDとそのクライアント数を格納する辞書型配列

    io.on('connection', (socket) => {

        const myId = socket.id;
        let myRoomId = '';

        socket.emit('init');

        // オーナーの場合
        socket.on('makeRoom', () => {

            // ランダムな文字列を生成し、roomIdとして設定
            const { nanoid } = require('nanoid');
            const roomId = nanoid();
            console.log('Created room ' + roomId);
            
            // roomsに新しいキーを追加
            rooms[roomId] = 0;
            console.log(rooms);
            
            socket.emit('setInvitationUrl', roomId);
        });

        socket.on('joinRoom', (roomId) => {

            // その時点での部屋の入室状況によって判断
            switch (rooms[roomId]) {
                case 0:
                case 1:
                    // console.log('able to join');
                    break;
                case 2:
                    // console.log('room is full');
                    io.to(socket.id).emit('alertIllegalness', 1);
                    return;
                default:
                    // console.log('illegal room');
                    io.to(socket.id).emit('alertIllegalness', 0);
                    return;
            }

            // 入室可能な場合
            myRoomId = roomId;
            rooms[myRoomId] += 1;
            socket.join(myRoomId);

            // ユーザー2人が入室したら、接続完了を双方へ通知
            if (rooms[myRoomId] === 2) {
                io.to(myRoomId).emit('alertConnection');
            }

            // 待機通知
            socket.on('sendRequest', (roomId, senderId) => {
                io.to(roomId).emit('recieveRequest', senderId);
            });
            
            // メッセージ
            socket.on('sendMessage', (roomId, messageData) => {
                io.to(roomId).emit('recieveMessage', messageData);
            });

            // 攻撃
            socket.on('sendAttack', (roomId, attackData) => {
                io.to(roomId).emit('recieveAttack', attackData);
            });

            socket.on('sendSurrender', (roomId) => {
                io.to(roomId).emit('recieveSurrender');
            });

            socket.on('sendCanReplay', (roomId, senderId) => {
                io.to(roomId).emit('recieveCanReplay', senderId);
            });

        });
        
        socket.on('disconnect', () => {
            // 表示用
            console.log(myId + ' disconnected and leaving room ' + myRoomId);

            // 入室している部屋がなければ処理を終了
            if (myRoomId === '') {
                return;
            }

            // 部屋リストのデータを変更
            rooms[myRoomId] -= 1;
            if (rooms[myRoomId]) {
                io.to(myRoomId).emit('alertDisconnection');
            } else {
                delete rooms[myRoomId];
            }
        });
    });
}

exports.connect = connect;
