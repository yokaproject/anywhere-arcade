const socket = io();

// Vueオブジェクト
const vm = new Vue({
  el: '#app',

  data: {
    /* data */
    saveData: '', // 初期状態
    yetReachedAccessLimit: true,
    invitation: 'https://anywhere-arcade.herokuapp.com/tetrisVS/', // heroku
    //         invitation: 'localhost:3000/tetrisVS/', // local

    /** socket */
    roomId: '',
    myId: '',
    isConnected: false,
    isReady: false,
    isRequested: false,
    canReplay: true,

    /* chat data */
    textInput: '',
    messages: [],

    /* user config */
    width: 10, // 幅
    height: 20, // 高さ
    speed: 0.4, // 速さ
    solo: false,

    /* game info */
    score: 0,
    timer: null,
    gameStarted: false,
    gameOver: false,
    level: 1,
    isDrawing: false,
    paused: false,
    // edit: false,
    // player: -1,

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
    hold: { can: true, firstTime: true },

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
    readyFn: function () {
      // 相手が未アクセスの場合と、すでにSTARTした場合は処理をスキップ
      if (!this.isConnected) {
        console.log('Your friend has yet joined.');
        return;
      }
      if (this.isReady) {
        console.log('You already sent request.');
        return;
      }
      if (!this.canReplay) {
        console.log('Your friend has yet returned.');
        return;
      }
      this.isReady = true;
      socket.emit('sendRequest', this.roomId, this.myId);
    },

    /** ゲーム開始 */
    startFn: function () {
      this.canReplay = false;
      this.saveData = JSON.stringify(this.$data); // 初期状態を保存
      this.height += 2;
      this.score = this.height * (-100);
      this.gameStarted = true;
      this.dropNextBlockFn(); // ブロック生成
    },

    dropNextBlockFn: function () {
      // タイマーの解除
      clearInterval(this.timer);
      clearTimeout(commandTimer);
      clearTimeout(tapTimer);
      // 盤面の処理
      this.appendRowFn();
      this.deleteFullRowFn();
      this.judgeFn();

      if (this.gameOver) {
        return;
      }

      // 次のブロックを落とす
      this.changeLevel();
      this.releaseHold();
      this.createBlockFn();
      this.getNextBlockFn();
      this.drawNextBlockFn();
      this.drawBoardFn(false, 0, 0);

      this.isDrawing = false;
      this.timer = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnを呼び出す
    },

    /** おじゃま列を追加する */
    appendRowFn: function () {
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
      const attackData = {
        senderId: this.myId,
        rowNum: rowNum
      }
      socket.emit('sendAttack', this.roomId, attackData);
    },


    updateLevel: function () {
      /* initial level = 1, score increases at most 400 */
      const requiredScore = this.level * 800;
      if (this.score >= requiredScore) {
        this.level += 1;
        this.changeSpeed();
      }
    },

    changeSpeed: function () {
      if (this.speed > 0.1) {
        this.speed -= 0.05;
      }
    },

    releaseHold: function () {
      if (this.hold.firstTime && !this.hold.can) {
        this.hold.firstTime = false;
      } else {
        this.hold.can = true;
      }
    },

    /** ブロックを生成する */
    createBlockFn: function () {
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

    getNextBlockFn: function () {
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
        for (let i = 0; i < this.nextDisplayNum; i++) {
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
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              this.currentBlock[i][j] = currentBlock[3 - j][i];
            }
          }
        } else {
          for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
              this.currentBlock[i][j] = currentBlock[3 - j][i - 1];
            }
          }
        }
      }
      this.blockX += dx;
      this.blockY += dy;

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (this.currentBlock[i][j] === 0) {
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
        this.drawBoardFn(false, 0, 0);
        this.isDrawing = true;
        clearInterval(this.timer);
        setTimeout(this.dropNextBlockFn, 300);
      }
    },

    judgeFn: function () {
      if (this.win) {
        return
      }
      for (let judgeLine of this.board[1]) {
        if (judgeLine > 0) { // 最上段までブロックが積まれたら終了
          this.gameOver = true;
          socket.emit('sendSurrender', this.roomId, this.myId);
        }
      }
    },

    /** キー入力を受け取る */
    getKeyCommandFn: function (key) {
      if (this.isDrawing) {
        return;
      }
      switch (key) {
        case ' ':
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
    checkFn: function (rotate, dx, dy) {
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
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
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
      this.isDrawing = true;
      clearInterval(this.timer);
      setTimeout(this.dropNextBlockFn, 300);
    },

    /** ホールド */
    holdFn: function () {
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
      // データを復元
      const dataObject = JSON.parse(this.saveData);
      for (let dataItem in dataObject) {
        if (dataItem === 'messages' || dataItem === 'canReplay') {
          continue;
        }
        this[dataItem] = dataObject[dataItem];
      }
      this.isReady = false;
      this.isRequested = false;
      this.invitation += '';

      socket.emit('sendCanReplay', this.roomId, this.myId);
    },

    /** 途中終了 */
    quitFn: function () {
      if (confirm('Are you sure you want to quit the game?')) {
        this.gameOver = true;
        // タイマーの解除
        clearInterval(this.timer);
        clearTimeout(commandTimer);
        clearTimeout(tapTimer);
        socket.emit('sendSurrender', this.roomId, this.myId);

        setTimeout(() => {
          this.resetFn();
        }, 10);
      }
    },

    /** ブロックの形を編集する */
    // editFn: function() {
    // },

    /** チャットを送る */
    sendMessage() {
      const message = this.textInput.trim();
      this.textInput = '';
      if (message == '') return;

      const messageData = {
        senderId: this.myId,
        message: message,
        isToMe: false
      }
      socket.emit('sendMessage', this.roomId, messageData);
    },
  },

  mounted() {
    /** socketと接続された際に初期化する */
    socket.on('init', () => {
      console.log('initialize');
      this.myId = socket.id; // クライアント自身のsocket idを取得
      console.log(this.myId);
      const roomId = document.getElementById('roomId').textContent; // HTMLからroom idを取得
      let data = {};

      if (roomId === 'solo') { // ソロプレイの場合
        this.solo = true;
      } else if (roomId === 'start') { // オーナー（部屋を立てたユーザ）の場合
        socket.emit('makeRoom');
      } else { //　招待されたユーザの場合
        this.roomId = roomId;
        this.invitation += roomId;
        socket.emit('joinRoom', roomId);
      }
    });

    socket.on('setInvitationUrl', (roomId) => {
      this.roomId = roomId;
      this.invitation += roomId;

      socket.emit('joinRoom', roomId);
    });

    /** 入室制限を通知する */
    socket.on('alertIllegalness', (state) => {
      setTimeout(() => {
        if (state) {
          alert('The room is full.');
        } else {
          alert('The room doesn\'t exist.');
        }
      }, 100);
      this.yetReachedAccessLimit = false;
    });

    /** ユーザーが2人接続したことを確認する */
    socket.on('alertConnection', () => {
      this.isConnected = true;
    })

    /** ユーザーが退室したことを確認する */
    socket.on('alertDisconnection', () => {
      this.isConnected = false;
      this.canReplay = true;
      alert('Your friend left the room.');
    })

    /** 相手の準備完了報告を受け取る */
    socket.on('recieveRequest', (senderId) => {
      if (senderId != this.myId) {
        this.isRequested = true;
      }
      // 自分も相手もisReadyの場合
      if (this.isReady && this.isRequested) {
        this.startFn();
        return;
      }
      // 自分のみisReadyの場合
      if (this.isReady) {
        const messageData = {
          senderId: this.myId,
          message: 'Ready!',
          isToMe: false
        }
        socket.emit('sendMessage', this.roomId, messageData);
        return;
      }
    });

    /** チャットメッセージを受け取る */
    socket.on('recieveMessage', (messageData) => {
      if (messageData.senderId === this.myId) {
        messageData.isToMe = true;
      }
      this.messages.push(messageData);
      console.log('Recieved a new msg!');

      if (messageData.isToMe && !isScrolled()) {
        return notify();
      }
      setTimeout(() => { scrollToEnd(); }, 10);
    });

    /** 攻撃されたときの処理を行う */
    socket.on('recieveAttack', (attackData) => {
      // 攻撃者(to)が自分であれば処理をパス
      if (attackData.senderId === this.myId) {
        return;
      }
      // 挿入する列を(rowNum)増やす
      this.appendRowNum += attackData.rowNum;
    });

    /** 勝利を通知する */
    socket.on('recieveSurrender', () => {
      if (this.gameOver) {
        return;
      }
      alert('YOU WIN!');
      clearInterval(this.timer);
      this.gameOver = true;
      this.win = true;
      this.winNum += 1;
    });

    /** ゲームの再開を許可 */
    socket.on('recieveCanReplay', (senderId) => {
      if (senderId === this.myId) {
        return;
      }
      this.canReplay = true;
    });
  }
});

////　ここからはドキュメント自体に対する関数

/** キー入力を受け取る */
document.onkeydown = function (e) {
  const msgArea = document.getElementById('msg'); //　チャットの入力ボックス
  // チャット中はキーでの操作を禁止
  if (msgArea === document.activeElement) {
    return;
  }
  vm.getKeyCommandFn(e.key);
};

/** スワイプ入力を受け取る */
const swipeBoard = document.getElementById('js-swipeBoard');
if (swipeBoard) {
  console.log('detected')
} else {
  console.log('yet detected')
}
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let count = 0;
let commandTimer;
let tapTimer;
let canTap = false;
let yetMoved = true;
// ハードドロップはタッチした直後のみ許可
let canHardDrop = true;
// 連続スワイプの反応時間
const fastSpeed = 150;
const middleSpeed = 200;
const slowSpeed = 250;
// let speed = fastSpeed;
const setCommandTimer = (speed) => {
  return setTimeout(() => {
    yetMoved = false;
    sendCommand();
  }, speed);
}

// touchstart
const setStart = (event) => {
  event.preventDefault();
  canTap = true;
  startX = event.touches[0].pageX;
  startY = event.touches[0].pageY;
  endX = startX;
  endY = startY;

  tapTimer = setTimeout(() => {
    canTap = false;
  }, fastSpeed - 1); // setCommandTimerが呼び出される直前まではタップ可能
  commandTimer = setCommandTimer(fastSpeed);
}

// touchmove
const setXY = (event) => {
  endX = event.touches[0].pageX;
  endY = event.touches[0].pageY;
}

// touchend
const sendCommand = () => {
  if (!yetMoved) {
    commandTimer = setCommandTimer(fastSpeed);
  }

  const diffX = startX - endX;
  const diffY = startY - endY;
  if (diffX === 0 && diffY === 0) { // タップ
    if (canTap) {
      vm.getKeyCommandFn('f');
    }

  } else if (Math.abs(diffX) >= Math.abs(diffY)) { // X方向へのスワイプ
    if (diffX > 0) { // left
      vm.getKeyCommandFn('ArrowLeft');
    } else { // right
      vm.getKeyCommandFn('ArrowRight');
    }

  } else { // Y方向へのスワイプ
    if (diffY < 0) { // down
      vm.getKeyCommandFn('ArrowDown');

    } else if (canHardDrop) { // up
      vm.getKeyCommandFn('ArrowUp');
    }
  }
  canHardDrop = false;
}

const endSwipe = () => {
  clearTimeout(commandTimer);
  clearTimeout(tapTimer);
  if (yetMoved) { // commandTimer発火前に呼び出されていたら
    sendCommand();
  }
  yetMoved = true;
  canTap = false;
  canHardDrop = true;
}
if (swipeBoard) {
  swipeBoard.addEventListener('touchstart', setStart);
  swipeBoard.addEventListener('touchmove', setXY);
  swipeBoard.addEventListener('touchend', endSwipe);
}

/** ホールドコマンドを受け取る */
const hold = document.getElementById('js-holdBoard');
if (hold) {
  hold.addEventListener('touchend', () => {
    vm.getKeyCommandFn('s');
  });
}

/** チャットのスクロール */
const chatBoard = document.getElementById('chatBoard');
const isScrolled = () => {
  const scroll = chatBoard.scrollTop + chatBoard.offsetHeight;
  const height = chatBoard.scrollHeight;
  return scroll === height;
}
const scrollToEnd = () => {
  chatBoard.scrollTop = chatBoard.scrollHeight;
}
chatBoard.addEventListener('scroll', function () {
  unnotify();
});

/** チャットの通知 */
const notification = document.getElementById('chatNotification');
const notify = () => {
  notification.style.display = 'currentBlock';
}
const unnotify = () => {
  notification.style.display = 'none';
}
notification.addEventListener('click', function () {
  unnotify();
  scrollToEnd();
});
