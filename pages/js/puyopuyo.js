// Vueオブジェクト
const vm = new Vue({
    el: '#app',
    data: {
        W: 6, // 幅
        H: 12, // 高さ
        speed: 0.5, // 速さ
        yx: [], // board
        puyo: [], //今動かしているブロック
        puyoX: 0, // X座標
        puyoY: 0, // Y座標
        puyoType1: 3, // 種類
        puyoType2: 3,
        puyoRotate: true, // 回転2通り用の右回転、左回転判断
        put: false, // 置かれている
        puyoMemo: [], // 今動かしているブロックの変化前の位置
        yxNext: [], // 次のブロック表示用
        nextList: [],
        player: -1,
        score: 0,
        edit: false,
        paused: false,
        timerID: null,
        gameStart: false,
        gameOver: false,
        saveData: "",
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
            console.log("a");
            this.createFn(); // ブロック生成
            console.log("start");
            this.timerID = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnが呼び出される
        },

        // キー入力を受け取る
        keydownFn: function (rotate, dx, dy) {
            if (!this.gameOver) {
                if (this.checkFn(rotate, dx, dy)) {
                    this.drawFn(rotate, dx, dy);
                    console.log("good");
                } else {
                    do {
                        while (this.putFn());
                    } while (this.deleteFn());
                }
            }
        },

        // 一時停止する
        pauseFn: function () {
            if (!this.gameOver && this.paused == false) {
                this.paused = true;
                clearInterval(this.timerID);

            } else if (!this.gameOver && this.paused == true) {
                this.paused = false;
                this.timerID = setInterval(this.fallFn, this.speed * 1000); // speed秒毎にfallFnが呼び出される
            }
        },

        // 操作が可能かを確かめる
        checkFn: function (rotate, dx, dy) {
            let yx = this.yx.map(v => v.slice()); // 盤面のコピーを作成
            let puyo = this.puyo.map(v => v.slice()); // ブロックのコピーを作成
            this.puyoMemo.forEach(v => { yx[v[0]][v[1]] = 0 }); // 元々操作中のブロックが存在した盤面のブロックを消す
            if (rotate) {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        puyo[i][j] = this.puyo[2 - j][i];
                    }
                }
            }
            let flag = true;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (puyo[i][j] != 0) {
                        let x = j + this.puyoX + dx;
                        let y = i + this.puyoY + dy;
                        if (!(y >= 0 && y < this.H && x >= 0 && x < this.W && yx[y][x] == 0)) {
                            flag = false;
                            break;
                        }
                    }
                }
            }
            // for (let i = this.H - 2; i >= 0; i--) {
            //     for (let j = this.W - 1; j >= 0; j--) {
            //         if (this.yx[i][j] != 0 && this.yx[i + 1][j] == 0) {
            //             flag = false;
            //             break;
            //         }
            //     }
            // }
            return flag;
        },

        // 描画する
        drawFn: function (rotate, dx, dy) {
            this.puyoMemo.forEach(v => { this.yx[v[0]][v[1]] = 0 }); // 操作中のブロックの位置の盤面の値を0にする？
            this.puyoMemo = [];
            let puyo = this.puyo.map(v => v.slice());
            if (rotate) { // 回転
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        this.puyo[i][j] = puyo[2 - j][i];
                    }
                }
            }
            this.puyoX += dx;
            this.puyoY += dy;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (this.puyo[i][j] != 0) {
                        if (this.yx[i + this.puyoY][j + this.puyoX] != 0) { // 最上段までぷよが積まれたら終了
                            this.gameOver = true;
                        }
                        this.yx[i + this.puyoY][j + this.puyoX] = this.puyo[i][j];
                        this.puyoMemo.push([i + this.puyoY, j + this.puyoX]); // 操作中のぷよが盤面上で存在する位置の配列
                    }
                }
            }
            if (this.gameOver) {
                clearInterval(this.timerID);
            }
            this.yx.push();
        },

        // ブロックの生成
        createFn: function () {
            // if (this.puyo.length != 0) {
            //     this.deleteFn();
            // }
            this.puyoMemo = []; // 現在操作中のブロックを消す
            if (this.nextList.length == 0) {
                // 次のぷよをランダムに生成
                for (let i=0; i<4; i++) {
                    this.nextList.push(1);
                }
            }
            this.puyoType1 = this.nextList.shift();
            this.puyoType2 = this.nextList.shift();
            this.nextList.push(2);
            this.nextList.push(2);

            // this.nextDrawFn(); // 次のブロックを描画

            console.log(this.nextList);
            this.puyoX = Math.ceil(this.W / 2) - 1;
            this.puyoY = 1;
            this.puyoRotate = true;
            this.puyo = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]
            this.puyo[1][1] = this.puyoType1;
            this.puyo[0][1] = this.puyoType2;
            this.drawFn(false, 0, 0);
        },

        putFn: function () {
            let flag = false;
            for (let i=this.H-2; i>=0; i--) {
                for (let j=this.W-1; j>=0; j--) {
                    if (this.yx[i][j] != 0 && this.yx[i+1][j] == 0) {
                        this.yx[i+1][j] = this.yx[i][j];
                        this.yx[i][j] = 0;
                        flag = true;
                    }
                }
            }
            return flag;
        },

        // 揃った列を消す
        deleteFn: function () {
            let yx = this.yx.map(v => v.slice());
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
                do {
                    while (this.putFn());
                } while (this.deleteFn());
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
        // nextDrawFn: function () {
        //     this.yxNext = [[]]
        //     for (let i = 0; i < 5; i++) {
        //         let tmp = this.puyos[this.nextList[i]].map(v => v.slice());
        //         this.yxNext.push(tmp);
        //     }
        // },
    },
});

document.onkeydown = function (e) { // キー入力
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