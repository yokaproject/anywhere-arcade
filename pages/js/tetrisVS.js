const socket = io();


// Vueオブジェクト
const vm = new Vue({
    el: '#app',

    data: {
        /* data */
        saveData: '', // 初期状態
        yetReachedAccessLimit: true,
        canInvite: false,
        invitation: 'https://anywhere-arcade.herokuapp.com/tetrisVS/', // heroku
        // invitation: 'localhost:3000/tetrisVS/', // local
        myId: '',
        friendsId: '',

        /* chat */
        textInput: '',
        messages: [],

        /* user config */
        width: 10, // 幅
        height: 20, // 高さ
        speed: 0.7, // 速さ

        /* game info */
        isReady: false,
        isReady_friend: false,
        player: -1,
        score: 0,
        edit: false,
        paused: false,
        timerID: null,
        gameStarted: false,
        gameOver: false,
        win: false,

        /* display */
        board: [], // board
        comingBlock: [], // 次のブロック表示用
        holdingBlock: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ], // ホールドしているブロック表示用

        /* block info */
        block: [], //今動かしているブロック
        blockX: 0, // X座標
        blockY: 0, // Y座標
        blockType: 0, // 種類
        holdingBlockType: -1, // ホールドの種類
        blockRotate: true, // 回転2通り用の右回転、左回転判断
        blockMemo: [], // 今動かしているブロックの変化前の位置
        pendingBlockList: [], // 7個で一巡
        nextPendingBlockList: [],
        blocks: [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0] // I
            ], [
                [0, 0, 0, 0],
                [0, 2, 2, 0],
                [0, 2, 2, 0],
                [0, 0, 0, 0] // O
            ], [
                [0, 0, 0, 0],
                [0, 3, 3, 0],
                [3, 3, 0, 0],
                [0, 0, 0, 0] // S
            ], [
                [0, 0, 0, 0],
                [4, 4, 0, 0],
                [0, 4, 4, 0],
                [0, 0, 0, 0] // Z
            ], [
                [0, 0, 0, 0],
                [5, 0, 0, 0],
                [5, 5, 5, 0],
                [0, 0, 0, 0] // J
            ], [
                [0, 0, 0, 0],
                [0, 0, 6, 0],
                [6, 6, 6, 0],
                [0, 0, 0, 0] // L
            ], [
                [0, 0, 0, 0],
                [0, 7, 0, 0],
                [7, 7, 7, 0],
                [0, 0, 0, 0] // T
            ]
        ],
        color: ['white', 'deepskyblue', 'gold', 'red', 'lawngreen', 'royalblue', 'darkorange', 'blueviolet', 'gray', 'black'],

        /* attack */
        appendRowNum: 0,
        prevOpenColumn: -1,
    },
    
    methods: {
        readyFn: function(){
            if (this.friendsId === '' || this.isReady) {
                return;
            }
            this.isReady = true;
            socket.emit('isReady', this.friendsId);
        },

        // ゲームスタート
        startFn: function () {
            this.saveData = JSON.stringify(this.$data); // セーブデータ?
            while (this.board.length < this.height) {
                this.board.push('0'.repeat(this.width).split('').map(Number)); // 盤面作成
            }
            while (this.comingBlock.length < 3) {
                this.comingBlock.push('0'.repeat(4).split('').map(Number)); // ネクストの盤面作成
            }
            this.gameStarted = true;

            this.createFn(); // ブロック生成
            this.timerID = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnが呼び出される
        },

        // ブロックの形を編集する
        editFn: function() {
        },

        // キー入力を受け取る
        keydownFn: function(rotate, dx, dy) {
            if (!this.gameOver && this.checkFn(rotate, dx, dy)) {
                this.drawFn(rotate, dx, dy);
            }
        },

        // 一時停止する
        pauseFn: function() {
            if (!this.gameOver && this.paused == false) {
                this.paused = true;
                clearInterval(this.timerID);

            } else if (!this.gameOver && this.paused == true) {
                this.paused = false;
                this.timerID = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnが呼び出される
            }
        },

        // 操作が可能かを確かめる
        checkFn: function(rotate, dx, dy) {
            let board = this.board.map(v => v.slice()); // 盤面のコピーを作成
            let block = this.block.map(v => v.slice()); // ブロックのコピーを作成
            this.blockMemo.forEach(v => { board[v[0]][v[1]] = 0 }); // 元々操作中のブロックが存在した盤面のブロックを消す
            if (rotate) {
                if (this.blockType <= 1) { // I,Oブロックの場合
                    for (let i = 0; i < 4; i++) {
                        for (let j = 0; j < 4; j++) {
                            block[i][j] = this.block[3 - j][i];
                        }
                    }
                } else {
                    for (let i = 1; i < 4; i++) {
                        for (let j = 0; j < 3; j++) {
                            block[i][j] = this.block[3 - j][i - 1];
                        }
                    }
                }
            }
            let flag = true;
            for (let i=0; i<4; i++) {
                for (let j=0; j<4; j++) {
                    if (block[i][j] != 0) {
                        let x = j + this.blockX + dx;
                        let y = i + this.blockY + dy;
                        if (!(y >= 0 && y < this.height && x >= 0 && x < this.width && board[y][x] == 0)) {
                            flag = false;
                        }
                    }
                }
            }
            return flag;
        },

        // 描画する
        drawFn: function (rotate, dx, dy) {
            this.blockMemo.forEach(v => { this.board[v[0]][v[1]] = 0 }); // 操作中のブロックの位置の盤面の値を0にする？
            this.blockMemo = [];
            let block = this.block.map(v => v.slice());
            if (rotate) { // 回転
                if (this.blockType <= 1) { // I,Oブロックの場合
                    for (let i=0; i<4; i++) {
                        for (let j=0; j<4; j++) {
                            this.block[i][j] = block[3-j][i];
                        }
                    }
                } else {
                    for (let i=1; i<4; i++) {
                        for (let j=0; j<3; j++) {
                            this.block[i][j] = block[3-j][i-1];
                        }
                    }
                }
            }
            this.blockX += dx;
            this.blockY += dy;
            for (let i=0; i<4; i++) {
                for (let j=0; j<4; j++) {
                    if(this.block[i][j] != 0) {
                        if (this.board[i + this.blockY][j + this.blockX] != 0) { // 最上段までブロックが積まれたら終了
                            this.gameOver = true;
                            socket.emit('endGame', this.friendsId);
                        }
                        this.board[i + this.blockY][j + this.blockX] = this.blockType + 1;
                        this.blockMemo.push([i + this.blockY, j + this.blockX]); // 操作中のブロックが盤面上で存在する位置の配列
                    }
                }
            }
            if (this.gameOver) {
                clearInterval(this.timerID);
            }
//             this.board.push();
               this.score += 1;
        },

        // ブロックの生成
        createFn: function() {

            if (this.block.length != 0) {
                this.deleteFn();
            }
            this.blockMemo = []; // 現在操作中のブロックを消す
            if (this.pendingBlockList.length == 0) {
                for (let i = 0; i < this.blocks.length; i++) { // 7種一巡のブロック配列を作成
                    while (true) {
                        let tmp = Math.floor(Math.random() * this.blocks.length);;
                        if (!this.pendingBlockList.includes(tmp)) {
                            this.pendingBlockList.push(tmp);
                            break;
                        }
                    }
                }
            }
            if (this.nextPendingBlockList.length == 0) {
                for (let i = 0; i < this.blocks.length; i++) { // 7種一巡のブロック配列を作成
                    while (true) {
                        let tmp = Math.floor(Math.random() * this.blocks.length);;
                        if (!this.nextPendingBlockList.includes(tmp)) {
                            this.nextPendingBlockList.push(tmp);
                            break;
                        }
                    }
                }
            }
            this.blockType = this.pendingBlockList.shift();
            this.pendingBlockList.push(this.nextPendingBlockList.shift());

            this.nextDrawFn(); // 次のブロックを描画
            this.blockX = Math.ceil(this.width / 2) - 1;
            this.blockY = 1;
            this.blockRotate = true;
            this.block = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
            for (let i=0; i<4; i++) {
                for (let j=0; j<4; j++) {
                    this.block[i][j] = this.blocks[this.blockType][i][j];
                }
            }
            this.drawFn(false, 0, 0);
        },

        // 揃った列を消す
        deleteFn: function () {
            this.board = this.board.filter(v => /0/.test(v.join(''))); // 盤面内の揃った列を消す
            const rowNum = this.height - this.board.length;
            if (rowNum === 0) {
                return;
            }
            this.score += rowNum * 100; // スコアを記録
            // alert(rowNum);
            while (this.board.length < this.height) { // 盤面の高さを揃える
                this.board.unshift('0'.repeat(this.width).split('').map(Number));
            }
            const data = {
                to: this.friendsId,
                rowNum: rowNum
            }
            socket.emit('attack', data);
        },

        // ブロックを1マス分落とす
        fallFn: function () {
            if (this.checkFn(false, 0, 1)) {
                this.drawFn(false, 0, 1);
            } else {
                this.appendRow();
                console.log(this.board); ///////////// ボードの描画 /////////////////
                this.createFn();
            }
        },

        // ハードドロップ
        hardDropFn: function () {
            if (this.gameOver) {
                return;
            }
            let i = 0;
            while (this.checkFn(false, 0, i)) {
                i++;
            }
            if (i != 0) {
                this.drawFn(false, 0, i - 1);
            }
        },

        // リセット
        resetFn: function () {
            if (!confirm('Are you sure to quit the game to reset configurations?')) {
                return;
            }
            clearInterval(this.timerID);
            const obj = JSON.parse(this.saveData);
            for (var k in obj) {
                if (k === 'messages') {
                    continue;
                }
                this[k] = obj[k];
            }
        },

        // 次のブロックの描画
        nextDrawFn: function () {
            this.comingBlock = [[]]
            for (let i=0; i<5; i++) {
                let tmp = this.blocks[this.pendingBlockList[i]].map(v => v.slice());
                this.comingBlock.push(tmp);
            }
        },

        holdFn: function() {
            this.blockMemo.forEach(v => { this.board[v[0]][v[1]] = 0 });
            this.blockMemo = [];
            if (this.holdingBlockType == -1) {
                this.holdingBlockType = this.blockType;
                this.createFn();
            } else {
                tmp = this.holdingBlockType;
                this.holdingBlockType = this.blockType;
                this.blockType = tmp;
                this.block = this.holdingBlock.map(v => v.slice());
                this.blockX = Math.ceil(this.width / 2) - 1;
                this.blockY = 1;
            }
            this.holdingBlock = this.blocks[this.holdingBlockType].map(v => v.slice());
        },

        appendRow: function() {
            if (this.appendRowNum === 0) {
                return;
            }
            // おじゃま列の空き行をきめる
            let openColumn = this.prevOpenColumn;
            while (openColumn === this.prevOpenColumn) {
                openColumn = Math.floor(Math.random() * 10);
            }
            this.prevOpenColumn = openColumn; // 保存
            //おじゃま列をつくる
            let attackRow = '8'.repeat(this.width).split('').map(Number);
            attackRow[openColumn] = 0;
            // おじゃま列を(appendRowNum)回挿入する
            let i = 0;
            while (i < this.appendRowNum) {
                this.board.shift();
                this.board.push(attackRow);
                i += 1;
            }
            this.appendRowNum = 0; //　初期化
        },

        // send chat message
        sendMessage() {
            const message = this.textInput.trim();
            this.textInput = '';
            if (message == '') return;
            const data = {
                id: socket.id,
                friendsId: this.friendsId,
                isMine: false,
                msg: message
            }
            socket.emit('post', data);
        },
    },

    mounted() {
        socket.on('init', () => {
            this.myId = socket.id;
            const friendsId = document.getElementById('friendsId').textContent;
            if (friendsId === 'start') { // オーナー（部屋を立てたユーザ）の場合
                this.invitation += socket.id;
                this.canInvite = true;

            } else { //　招待されたユーザの場合
                this.friendsId = friendsId;
                const data = {
                    isGuest: true,
                    friendsId: friendsId
                };
                socket.emit('connectWithFriend', data);
            }
        });
        socket.on('passId', (friendsId) => { // オーナーのみ
            this.friendsId = friendsId;
            const data = {
                isGuest: false,
                friendsId: friendsId
            };
            socket.emit('connectWithFriend', data);
        });
        
        socket.on('alertFull', () => {
            setTimeout(() => {
                alert('Illegal access');
            }, 100);
            this.yetReachedAccessLimit = false;
        });
        socket.on('recievePost', (data) => {
            if (data.id === this.myId) {
                data.isMine = true;
            }
            this.messages.push(data);

            if (!data.isMine && !isScrolled()) {
                return notify();
            }
            setTimeout(() => { scrollToEnd(); }, 10);
        });

        socket.on('isReady_friend', (friendsId) => {
            if (friendsId === this.myId) {
                this.isReady_friend = true;
            }
            
            // 自分も相手もisReadyの場合
            if (this.isReady && this.isReady_friend) {
                this.startFn();
                return;
            }

            // 自分のみisReadyの場合
            if (this.isReady) {
                const data = {
                    id: socket.id,
                    friendsId: this.friendsId,
                    isMine: false,
                    msg: 'Ready!'
                };
                socket.emit('post', data);
                return;
            }
            // 相手のみisReadyの場合
            // alert('Your friend is ready!');
        });
        socket.on('addRowNum', (data) => {
            // 攻撃先(to)が自分自身だったら処理をパス
            if (data.to != this.myId) {
                return;
            }

            // 挿入する列を(rowNum)増やす
            this.appendRowNum += data.rowNum;
        });
        socket.on('win', (winner) => {
            if (winner == this.myId) {
                this.win = true;
                clearInterval(this.timerID);
                alert('YOU WIN!')
            }
        });
    }
});

document.onkeydown = function(e) { // キー入力
    const key = e.key;
    if (!vm.paused) {
        switch (key) {
            case 'ArrowUp':
                vm.hardDropFn(); //up
                break;
            case 'ArrowLeft':
                vm.keydownFn(false, -1, 0); //left
                break;
            case 'ArrowDown':
                vm.keydownFn(false, 0, 1); //down
                break;
            case 'ArrowRight':
                vm.keydownFn(false, 1, 0); //right
                break;
            case 'f':
                vm.keydownFn(true, 0, 0); //shift
                break;
            case 's':
                vm.holdFn(); //shift
        }
    }
    if (e.key == ' ' && !vm.gameStarted) vm.startFn();
    if (e.key == 'p') vm.pauseFn();
    if (e.key == 'r' && vm.gameStarted) vm.resetFn();
};

const board = document.getElementById('chatBoard');
const isScrolled = () => {
    const scroll = board.scrollTop + board.offsetHeight;
    const height = board.scrollHeight;
    return scroll === height;
}
const scrollToEnd = () => {
    board.scrollTop = board.scrollHeight;
}
board.addEventListener('scroll', function(){
    unnotify();
});

const notification = document.getElementById('chatNotification');
const notify = () => {
    notification.style.display = 'block';
}
const unnotify = () => {
    notification.style.display = 'none';
}
notification.addEventListener('click', function(){
    unnotify();
    scrollToEnd();
});
