// Vueオブジェクト
const vm = new Vue({
    el: '#app',
    data: {
        W: 10, // 幅
        H: 20, // 高さ
        speed: 0.5, // 速さ
        yx: [], // board
        block: [], //今動かしているブロック
        blockX: 0, // X座標
        blockY: 0, // Y座標
        blockType: 0, // 種類
        holdType: -1, // ホールドの種類
        blockRotate: true, // 回転2通り用の右回転、左回転判断
        blockMemo: [], // 今動かしているブロックの変化前の位置
        yxNext: [], // 次のブロック表示用
        yxHold: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ], // ホールドしているブロック表示用
        nextList: [], // 7個で一巡
        nextNextList: [], //
        player: -1,
        score: 0,
        edit: false,
        paused: false,
        timerID: null,
        gameStart: false,
        gameOver: false,
        saveData: "",
        blocks: [
            [[0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],   // I

            [[0, 0, 0, 0],
            [0, 2, 2, 0],
            [0, 2, 2, 0],
            [0, 0, 0, 0]],   // O

            [[0, 0, 0, 0],
            [0, 3, 3, 0],
            [3, 3, 0, 0],
            [0, 0, 0, 0]],   // S

            [[0, 0, 0, 0],
            [4, 4, 0, 0],
            [0, 4, 4, 0],
            [0, 0, 0, 0]],   // Z

            [[0, 0, 0, 0],
            [5, 0, 0, 0],
            [5, 5, 5, 0],
            [0, 0, 0, 0]],   // J

            [[0, 0, 0, 0],
            [0, 0, 6, 0],
            [6, 6, 6, 0],
            [0, 0, 0, 0]],   // L

            [[0, 0, 0, 0],
            [0, 7, 0, 0],
            [7, 7, 7, 0],
            [0, 0, 0, 0]]   // T
        ],
        color: ["white", "deepskyblue", "gold", "red", "lawngreen", "royalblue", "darkorange", "blueviolet", "gray", "black"]
    },
    methods: {
        // ゲームスタート
        startFn: function () {
            this.saveData = JSON.stringify(this.$data); // セーブデータ?
            while (this.yx.length < this.H) {
                this.yx.push("0".repeat(this.W).split("").map(Number)); // 盤面作成
            }
            while (this.yxNext.length < 4) {
                this.yxNext.push("0".repeat(4).split("").map(Number)); // ネクストの盤面作成
            }
            this.gameStart = true;
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
            let yx = this.yx.map(v => v.slice()); // 盤面のコピーを作成
            let block = this.block.map(v => v.slice()); // ブロックのコピーを作成
            this.blockMemo.forEach(v => { yx[v[0]][v[1]] = 0 }); // 元々操作中のブロックが存在した盤面のブロックを消す
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
                        if (!(y >= 0 && y < this.H && x >= 0 && x < this.W && yx[y][x] == 0)) {
                            flag = false;
                        }
                    }
                }
            }
            return flag;
        },

        // 描画する
        drawFn: function (rotate, dx, dy) {
            this.blockMemo.forEach(v => { this.yx[v[0]][v[1]] = 0 }); // 操作中のブロックの位置の盤面の値を0にする？
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
                        if (this.yx[i + this.blockY][j + this.blockX] != 0) { // 最上段までブロックが積まれたら終了
                            this.gameOver = true;
                        }
                        this.yx[i + this.blockY][j + this.blockX] = this.blockType + 1;
                        this.blockMemo.push([i + this.blockY, j + this.blockX]); // 操作中のブロックが盤面上で存在する位置の配列
                    }
                }
            }
            if (this.gameOver) {
                clearInterval(this.timerID);
            }
            this.yx.push();
        },

        // ブロックの生成
        createFn: function() {
            if (this.block.length != 0) {
                this.deleteFn();
            }
            this.blockMemo = []; // 現在操作中のブロックを消す
            if (this.nextList.length == 0) {
                for (let i = 0; i < this.blocks.length; i++) { // 7種一巡のブロック配列を作成
                    while (true) {
                        let tmp = Math.floor(Math.random() * this.blocks.length);;
                        if (!this.nextList.includes(tmp)) {
                            this.nextList.push(tmp);
                            break;
                        }
                    }
                }
            }
            if (this.nextNextList.length == 0) {
                for (let i = 0; i < this.blocks.length; i++) { // 7種一巡のブロック配列を作成
                    while (true) {
                        let tmp = Math.floor(Math.random() * this.blocks.length);;
                        if (!this.nextNextList.includes(tmp)) {
                            this.nextNextList.push(tmp);
                            break;
                        }
                    }
                }
            }
            this.blockType = this.nextList.shift();
            this.nextList.push(this.nextNextList.shift());

            this.nextDrawFn(); // 次のブロックを描画
            this.blockX = Math.ceil(this.W / 2) - 1;
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
            this.yx = this.yx.filter(v => /0/.test(v.join(""))); // 盤面内の揃った列を消す
            this.score += (this.H - this.yx.length) * 100; // スコアを記録
            while (this.yx.length < this.H) { // 盤面の高さを揃える
                this.yx.unshift("0".repeat(this.W).split("").map(Number));
            }
        },

        // ブロックを1マス分落とす
        fallFn: function () {
            if (this.checkFn(false, 0, 1)) {
                this.drawFn(false, 0, 1);
            } else {
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
            clearInterval(this.timerID);
            const obj = JSON.parse(this.saveData);
            for (var k in obj) {
                this[k] = obj[k];
            }
        },

        // 次のブロックの描画
        nextDrawFn: function () {
            this.yxNext = [[]]
            for (let i=0; i<5; i++) {
                let tmp = this.blocks[this.nextList[i]].map(v => v.slice());
                this.yxNext.push(tmp);
            }
        },
        holdFn: function() {
            this.blockMemo.forEach(v => { this.yx[v[0]][v[1]] = 0 });
            this.blockMemo = [];
            if (this.holdType == -1) {
                this.holdType = this.blockType;
                this.createFn();
            } else {
                tmp = this.holdType;
                this.holdType = this.blockType;
                this.blockType = tmp;
                this.block = this.yxHold.map(v => v.slice());
                this.blockX = Math.ceil(this.W / 2) - 1;
                this.blockY = 1;
            }
            this.yxHold = this.blocks[this.holdType].map(v => v.slice());
        },
    },
});

document.onkeydown = function(e) { // キー入力
    if (e.key == 'ArrowUp' && !vm.paused) vm.hardDropFn();  //up
    else if (e.key == 'ArrowLeft' && !vm.paused) vm.keydownFn(false, -1, 0);  //left
    else if (e.key == 'ArrowDown' && !vm.paused) vm.keydownFn(false, 0, 1);  //down
    else if (e.key == 'ArrowRight' && !vm.paused) vm.keydownFn(false, 1, 0);  //right
    else if (e.key == 'f' && !vm.paused) vm.keydownFn(true, 0, 0);  //shift
    else if (e.key == 's' && !vm.paused) vm.holdFn();
    else if (e.key == ' ' && !vm.gameStart) vm.startFn();
    else if (e.key == 'p') vm.pauseFn();
    else if (e.key == 'r' && vm.gameStart) vm.resetFn();  //r
};