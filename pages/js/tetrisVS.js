const socket = io();

// Vueオブジェクト
const vm = new Vue({
    el: '#app',

    data: {
        /* data */
        saveData: '', // 初期状態
        yetReachedAccessLimit: true,
        canInvite: false,
        // invitation: 'https://anywhere-arcade.herokuapp.com/tetrisVS/', // heroku
        invitation: 'localhost:3000/tetrisVS/', // local
        myId: '',
        friendsId: '',

        /* chat */
        textInput: '',
        messages: [],

        /* user config */
        width: 10, // 幅
        height: 20, // 高さ
        speed: 0.5, // 速さ

        /* game info */
        isReady: false,
        isReady_friend: false,
        player: -1,
        score: -2000,
        edit: false,
        paused: false,
        timer: null,
        gameStarted: false,
        gameOver: false,

        /* display */
        board: [], // board
        nextDisplay: [], // ネクストブロック表示用
        nextDisplayNum: 5, // ネクストブロックとして表示するブロック数
        holdDisplay: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ], // ホールドしているブロック表示用
        hold: {can: true, firstTime: true},

        /* currentBlock info */
        currentBlock: [], //今動かしているブロック
        blockX: 0, // X座標
        blockY: 0, // Y座標
        currentBlockType: 0, // 種類
        holdingBlockType: -1, // ホールドの種類
        blockRotate: true, // 回転2通り用の右回転、左回転判断
        blockMemo: [], // 今動かしているブロックの変化前の位置
        nextBlocks: [], // 7個で一巡
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
        win: false,
        winNum: 0,
    },
    
    methods: {
        /** 準備完了 */
        readyFn: function(){
            // 相手が未アクセスの場合と、すでにSTARTした場合は処理をスキップ
            if (this.friendsId === '' || this.isReady) {
                return;
            }
            this.isReady = true;
            socket.emit('isReady', this.friendsId);
        },

        /** ゲーム開始 */
        startFn: function () {
            this.saveData = JSON.stringify(this.$data); // 初期状態を保存
            this.height += 2;
            this.gameStarted = true;
            this.dropNextBlockFn(); // ブロック生成
        },

        dropNextBlockFn: function() {
            // 盤面の処理
            clearInterval(this.timer);
            this.appendRowFn();
            this.deleteFullRowFn();
            this.judge();

            if (this.gameOver) {
                return;
            }
            // 次のブロックを落とす
            this.changeSpeed();
            this.releaseHold();
            this.createBlockFn();
            this.getNextBlockFn();
            this.drawNextBlockFn();
            this.drawBoardFn(false, 0, 0);
            this.timer = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnを呼び出す
        },

        /** おじゃま列を追加する */
        appendRowFn: function() {
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
            const rowNumList = [0, 0, 1, 2, 4];
            let i = 0;
            while (i < rowNumList[this.appendRowNum]) {
                this.board.shift();
                this.board.push(attackRow.concat());
                i += 1;
            }
            this.appendRowNum = 0; // 初期化
        },
        
        /** 揃った列を消す */
        deleteFullRowFn: function () {
            this.board = this.board.filter(v => /0/.test(v.join(''))); // 盤面内の揃った列を消す
            const rowNum = this.height - this.board.length;
            if (rowNum === 0) {
                return;
            }
            this.score += rowNum * 100; // スコアを記録
            
            while (this.board.length < this.height) { // 盤面の高さを揃える
                this.board.unshift('0'.repeat(this.width).split('').map(Number));
            }
            const data = {
                to: this.friendsId,
                rowNum: rowNum
            }
            socket.emit('attack', data);
        },

        /** 速度を変える */
        changeSpeed: function() {
            
        },

        releaseHold: function() {
            if (this.hold.firstTime && !this.hold.can) {
                this.hold.firstTime = false;
            } else {
                this.hold.can = true;
            }
        },

        /** ブロックを生成する */
        createBlockFn: function() {
            // 待機ブロックが表示する数より少なくなったら
            if (this.nextBlocks.length <= this.nextDisplayNum) {
                let blockNums = this.blocks.length; // ブロックの種類数
                // 0から(ブロックの種類数-1)までの数が順に格納された配列を作成
                let shuffledBlocks = Array.from({ length: blockNums }).map((_, index) => index);
                // shuffledBlocksをランダムソートする（Fisher–Yates shuffle）
                for (let i = blockNums - 1; i >= 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledBlocks[i], shuffledBlocks[j]] = [shuffledBlocks[j], shuffledBlocks[i]];
                }
                // nextBlocksの末尾にshuffledBlocksを追加する
                this.nextBlocks = this.nextBlocks.concat(shuffledBlocks);
            }
        },

        getNextBlockFn: function() {
            this.blockMemo = []; // 現在操作中のブロックを消す
            this.currentBlockType = this.nextBlocks.shift();
            this.currentBlock = this.blocks[this.currentBlockType].map(v => v.slice());
            // 位置の初期化
            this.blockY = -1;
            this.blockX = Math.ceil(this.width / 2) - 1;
            // this.blockRotate = true;
        },

        /** ネクストブロックを描画する */
        drawNextBlockFn: function () {
            // 初期状態から
            if (this.nextDisplay.length === 0) {
                for (let i=0; i<this.nextDisplayNum; i++) {
                    this.nextDisplay.push(this.blocks[this.nextBlocks[i]].map(v => v.slice()));
                }
                return;
            }
            // 先頭の要素を消して、最後尾に追加
            this.nextDisplay.shift();
            this.nextDisplay.push(this.blocks[this.nextBlocks[this.nextDisplayNum - 1]].map(v => v.slice()));
            return;
        },

        /** 盤面の状態を描画する */
        drawBoardFn: function (rotate, dx, dy) {
            this.blockMemo.forEach(v => { this.board[v[0]][v[1]] = 0 }); // 表示しているブロックを消す
            this.blockMemo = [];
            let currentBlock = this.currentBlock.map(v => v.slice());

            if (rotate) { // 回転
                if (this.currentBlockType <= 1) { // I,Oブロックの場合
                    for (let i=0; i<4; i++) {
                        for (let j=0; j<4; j++) {
                            this.currentBlock[i][j] = currentBlock[3-j][i];
                        }
                    }
                } else {
                    for (let i=1; i<4; i++) {
                        for (let j=0; j<3; j++) {
                            this.currentBlock[i][j] = currentBlock[3-j][i-1];
                        }
                    }
                }
            }
            this.blockX += dx;
            this.blockY += dy;

            for (let i=0; i<4; i++) {
                for (let j=0; j<4; j++) {
                    if(this.currentBlock[i][j] === 0) {
                        continue;
                    }
                    this.board[i + this.blockY][j + this.blockX] = this.currentBlockType + 1;
                    this.blockMemo.push([i + this.blockY, j + this.blockX]); // 操作中のブロックが盤面上で存在する位置の配列
                }
            }
            this.board.push();
        },
        
        /** ブロックを1マス分落とす */
        fallFn: function () {
            if (this.checkFn(false, 0, 1)) {
                this.drawBoardFn(false, 0, 1);
            } else {
                this.dropNextBlockFn();
            }
        },

        judge: function() {
            if (this.win) {
                return
            }
            for (let judgeLine of this.board[1]) {
                if (judgeLine > 0) { // 最上段までブロックが積まれたら終了
                    this.gameOver = true;
                    socket.emit('endGame', this.friendsId);
                }
            }
        },


        /** キー入力を受け取る */
        getKeyCommandFn: function(key) {
            switch (key) {
                case ' ' :
                    this.readyFn(); // 開始
                    break;
                case 'p':
                    // this.pauseFn(); //ポーズ
                    break;
                case 'r':
                    this.resetFn(); // リセット
                    break;
                default:
                    // スタート前、ポーズ中、ゲーム終了後はブロックの操作を禁止
                    if (!this.gameStarted || this.paused || this.gameOver) {
                        return;
                    }
                    let rotate = false; // 回転の有無
                    let dx = 0; // x座標の移動マス数
                    let dy = 0; // y座標の移動マス数
                    switch (key) {
                        case 'f':
                            rotate = true;
                            break;
                        case 'ArrowLeft':
                            dx = -1;
                            break;
                        case 'ArrowDown':
                            dy = 1;
                            break;
                        case 'ArrowRight':
                            dx = 1;
                            break;
                        case 'ArrowUp':
                            this.hardDropFn(); //up
                            break;
                        case 's':
                            this.holdFn(); //shift
                    }
    
                    if (this.checkFn(rotate, dx, dy)) {
                        this.drawBoardFn(rotate, dx, dy);
                    }
            }
        },

        /** 操作が可能かを確かめる */
        checkFn: function(rotate, dx, dy) {
            let copiedBoard = this.board.map(v => v.slice()); // 盤面のコピーを作成
            let copiedBlock = this.currentBlock.map(v => v.slice()); // ブロックのコピーを作成
            this.blockMemo.forEach(v => { copiedBoard[v[0]][v[1]] = 0 }); // 元々操作中のブロックが存在した盤面のブロックを消す
            // 回転する
            if (rotate) {
                if (this.currentBlockType <= 1) { // I,Oブロックの場合
                    for (let i = 0; i < 4; i++) {
                        for (let j = 0; j < 4; j++) {
                            copiedBlock[i][j] = this.currentBlock[3 - j][i];
                        }
                    }
                } else {
                    for (let i = 1; i < 4; i++) {
                        for (let j = 0; j < 3; j++) {
                            copiedBlock[i][j] = this.currentBlock[3 - j][i - 1];
                        }
                    }
                }
            }
            // 置けるかチェックする
            for (let i=0; i<4; i++) {
                for (let j=0; j<4; j++) {
                    // 空白マスについてはスキップ
                    if (copiedBlock[i][j] === 0) {
                        continue;
                    }
                    const movedX = j + this.blockX + dx;
                    const movedY = i + this.blockY + dy;

                    // ブロックマスが盤面の外にある場合は不可
                    if (movedY < 0 || movedY >= this.height) {
                        return false;
                    }
                    if (movedX < 0 || movedX >= this.width) {
                        return false;
                    }

                    // ブロックマスが落ちる位置にすでにブロックがある場合は不可
                    if (copiedBoard[movedY][movedX] > 0) {
                        return false;
                    }
                }
            }
            return true;
        },

        /** ハードドロップ */
        hardDropFn: function () {
            let i = 0;
            while (this.checkFn(false, 0, i)) {
                i++;
            }
            if (i != 0) {
                this.drawBoardFn(false, 0, i - 1);
            }
            this.appendRowFn();
            this.dropNextBlockFn();
        },

        /** ホールド */
        holdFn: function() {
            if (!this.hold.can) {
                return;
            }
            this.hold.can = false;
            this.blockMemo.forEach(v => { this.board[v[0]][v[1]] = 0 });
            this.blockMemo = [];
            if (this.holdingBlockType == -1) {
                this.holdingBlockType = this.currentBlockType;
                this.dropNextBlockFn();
            } else {
                tmp = this.holdingBlockType;
                this.holdingBlockType = this.currentBlockType;
                this.currentBlockType = tmp;
                this.currentBlock = this.holdDisplay.map(v => v.slice());
                this.blockX = Math.ceil(this.width / 2) - 1;
                this.blockY = 1;
            }
            this.holdDisplay = this.blocks[this.holdingBlockType].map(v => v.slice());
            this.drawBoardFn(false, 0, 0);
        },


        /** 一時停止する */
        // pauseFn: function() {
        //     if (!this.gameOver && this.paused == false) {
        //         this.paused = true;
        //         clearInterval(this.timer);

        //     } else if (!this.gameOver && this.paused == true) {
        //         this.paused = false;
        //         this.timer = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnが呼び出される
        //     }
        // },
        
        /** リセット */
        resetFn: function () {
            if (!this.gameOver) {
                return;
            }
            clearInterval(this.timer);
            const resetData = {
                isReady: false,
                isReady_friend: false,
                score: -2000,
                gameStarted: false,
                gameOver: false,
                win: false
            };
            this.canInvite = false;
            this.board = [];
            this.isReady = false;
            this.isReady_friend = false;
            this.score = -2000;
            this.gameStarted = false;
            this.gameOver = false;
            this.win = false;
        },

        /** ブロックの形を編集する */
        // editFn: function() {
        // },

        /** チャットを送る */
        sendMessage() {
            const message = this.textInput.trim();
            this.textInput = '';
            if (message == '') return;
            const data = {
                to: this.friendsId,
                isToMe: true,
                message: message
            }
            socket.emit('post', data);
        },
    },

    mounted() {
        /** socketと接続された際に初期化する */
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
        /** オーナーがゲストから送信されたidを受け取る */
        socket.on('passId', (friendsId) => { // オーナーのみ
            this.friendsId = friendsId;
            const data = {
                isGuest: false,
                friendsId: friendsId
            };
            socket.emit('connectWithFriend', data);
        });
        /** 入室制限を通知する */
        socket.on('alertFull', () => {
            setTimeout(() => {
                alert('Illegal access');
            }, 100);
            this.yetReachedAccessLimit = false;
        });
        /** チャットメッセージを受け取る */
        socket.on('recievePost', (data) => {
            if (data.to === this.myId) {
                data.isToMe = false;
            }
            this.messages.push(data);

            if (data.isToMe && !isScrolled()) {
                return notify();
            }
            setTimeout(() => { scrollToEnd(); }, 10);
        });
        /** 相手の準備完了報告を受け取る */
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
                    to: this.friendsId,
                    isToMe: true,
                    message: 'Ready!'
                };
                socket.emit('post', data);
                return;
            }
            // 相手のみisReadyの場合
            // alert('Your friend is ready!');
        });
        /** 攻撃されたときの処理を行う */
        socket.on('addRowNum', (data) => {
            // 攻撃先(to)が自分でなけれら処理をパス
            if (data.to != this.myId) {
                return;
            }
            // 挿入する列を(rowNum)増やす
            this.appendRowNum += data.rowNum;
        });
        /** 勝利を通知する */
        socket.on('win', (winner) => {
            if (this.gameOver) {
                return;
            }
            alert('YOU WIN!');
            clearInterval(this.timer);
            this.gameOver = true;
            this.win = true;
            this.winNum += 1;
        });
    }
});


////　ここからはドキュメント自体に対する関数

/** キー入力を受け取る */
document.onkeydown = function(e) {
    const msgArea = document.getElementById('msg'); //　チャットの入力ボックス
    // チャット中はキーでの操作を禁止
    if (msgArea === document.activeElement) {
        return;
    }
    vm.getKeyCommandFn(e.key);
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
    notification.style.display = 'currentBlock';
}
const unnotify = () => {
    notification.style.display = 'none';
}
notification.addEventListener('click', function(){
    unnotify();
    scrollToEnd();
});
