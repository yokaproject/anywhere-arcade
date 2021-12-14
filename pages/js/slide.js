const vm = new Vue({
  el: "#app",

  data: {
    size: 4,
    tileNum: 0,
    board: [],
    count: 0,
    showBoard: false,
    playing: false,
    solved: false,
  },

  methods: {
    restart: function () {
      if (this.playing) {
        if (confirm("Are you sure you want to shuffle the board?")) {
          this.start();
        }
      } else {
        this.start();
      }
    },
    start: function () {
      this.tileNum = this.size * this.size;
      console.log(this.tileNum);
      this.board.length = 0;
      this.count = 0;
      this.showBoard = true;
      this.playing = true;
      this.solved = false;

      originalTileArray = []
      for (let i = 1; i <= this.tileNum; i++) {
        originalTileArray.push(i % this.tileNum);
      }
      const shuffledTileArray = this.shuffle(originalTileArray);
      // const shuffledTileArray = [3,9,1,15, 14,11,4,6, 13,0,10,12, 2,7,8,5];
      for (let i = 0; i < this.size; i++) {
        // this.board.push(originalTileArray.slice(i * this.size, (i + 1) * this.size));
        this.board.push(shuffledTileArray.slice(i * this.size, (i + 1) * this.size));
      }
    },
    shuffle: function (tileArray) {
      for (let i = tileArray.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tileArray[i], tileArray[j]] = [tileArray[j], tileArray[i]];
      }
      if (!this.isSolvable(tileArray) || this.isSolved(tileArray)) {
        return this.shuffle(tileArray);
      }
      return tileArray;
    },
    isSolvable: function (tileArray) {
      let inversion = 0;
      for (let i = 0; i < this.tileNum; i++) {
        if (tileArray[i] == 0) {
          inversion += (this.size - 1) * (Math.floor(i / this.size) + 1);
          continue;
        }
        for (let j = i + 1; j < this.tileNum; j++) {
          if (tileArray[i] > tileArray[j] && tileArray[j] > 0) {
            inversion++;
          }
        }
      }
      console.log(inversion);
      return inversion % 2 == 0;
    },
    clickedFn: function (num) {
      if (!this.playing) {
        return;
      }
      const from = this.getIndex(num);
      if (this.canMove(from)) {
        const to = this.getIndex(0);
        this.moveTile(num, from, to);
        this.count++;
        this.checkBoard(from);
      }
    },
    getIndex: function (num) {
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          if (this.board[row][col] == num) {
            return [row, col];
          }
        }
      }
    },
    canMove: function (index) {
      const row = index[0], col = index[1];
      if (row > 0) {
        const above = this.board[row - 1][col];
        if (above == 0) {
          return true;
        }
      }
      if (row < this.size - 1) {
        const below = this.board[row + 1][col];
        if (below == 0) {
          return true;
        }
      }
      if (col > 0) {
        const left = this.board[row][col - 1];
        if (left == 0) {
          return true;
        }
      }
      if (col < this.size - 1) {
        const right = this.board[row][col + 1];
        if (right == 0) {
          return true;
        }
      }
      return false;
    },
    moveTile: function (num, from, to) {
      this.board[to[0]].splice([to[1]], 1, num);
      this.board[from[0]].splice([from[1]], 1, 0);
    },
    checkBoard: function (indexOfFree) {
      if (indexOfFree[0] == this.size - 1 && indexOfFree[1] == this.size - 1) {
        if (this.isSolved(this.board.flat())) {
          this.playing = false;
          this.solved = true;
          window.setTimeout(this.alertCongrats, 100);
        }
      }
    },
    isSolved: function (tileArray) {
      for (let i = 1; i < this.tileNum; i++) {
        if (tileArray[i - 1] != i) {
          return false;
        }
      }
      return true;
    },
    alertCongrats: function () {
      let message = "Congrats! You solved the puzzle in ";
      if (this.count == 1) {
        message = message + "1 move!!";
      } else {
        message = message + this.count + " moves!!";
      }
      alert(message);
      if (confirm("Would you like to try another puzzle?")) {
        this.start();
      }
    },
    quit: function () {
      if (!this.solved) {
        if (!confirm("Are you sure you want to quit the game?")) {
          return;
        }
      }
      this.showBoard = false;
      this.playing = false;
      this.solved = false;
    }
  }
})