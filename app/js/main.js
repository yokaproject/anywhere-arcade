const size = 4;
const tileNum = size * size;

const vm = new Vue ({
  el: "#app",

  data: {
    board: [],
    count: 0,
    playing: false,
    solved: false
  },

  methods: {
    start: function() {
      this.board.length = 0;
      this.count = 0;
      this.playing = true;
      this.solved = false;

      originalTileArray = []
      for (let i = 1; i <= tileNum; i++) {
        originalTileArray.push(i % tileNum);
      }
      const shuffledTileArray = this.shuffle(originalTileArray);
      for (let i = 0; i < size; i++) {
        // this.board.push(originalTileArray.slice(i * size, (i + 1) * size));
        this.board.push(shuffledTileArray.slice(i * size, (i + 1) * size));
      }
    },
    shuffle: function([...tileArray]) {
      for (let i = tileArray.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tileArray[i], tileArray[j]] = [tileArray[j], tileArray[i]];
      }
      if (!this.isSolvable(tileArray)) {
        tileArray.reverse();
      }
      return tileArray;
    },
    isSolvable: function(tileArray) {
      let sum = 0;
      for (let i = 0; i < tileNum; i++) {
        if (tileArray[i] == 0) {
          sum += Math.floor(i / size) + 1;
          continue;
        }
        for (let j = i + 1; j < tileNum; j++) {
          if (tileArray[i] > tileArray[j] && tileArray[j] > 0) {
            sum++;
          }
        }
      }
      return sum % 2 == 0;
    },
    restart: function() {
      if (this.playing) {
        if(confirm("Are you sure you want to shuffle the board?")) {
          this.start();
        }
      } else {
        this.start();
      }
    },
    clicked: function(num) {
      if (!this.playing) {
        return;
      }
      const from = this.getIndex(num, this.board);
      const row = from[0], col = from[1];
      if (this.canMove(row, col)) {
        const to = this.getIndex(0);
        this.moveTile(num, from, to);
        this.count++;
        if (from[0] == size - 1 && from[1] == size - 1 ) {
          if (this.isSolved(this.board)) {
            this.playing = false;
            this.solved = true;
            window.setTimeout(this.alertCongrats, 100);
          }
        }
      }
    },
    getIndex: function(num) {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (this.board[row][col] == num) {
            return [row, col];
          }
        }
      }
    },
    canMove: function(row, col) {
      if (row > 0) {
        const above = this.board[row - 1][col];
        if (above == 0) {
          return true;
        }
      }
      if (row < size - 1) {
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
      if (col < size - 1) {
        const right = this.board[row][col + 1];
        if (right == 0) {
          return true;
        }
      }
      return false;
    },
    moveTile: function(num, from, to) {
      this.board[to[0]].splice([to[1]], 1, num);
      this.board[from[0]].splice([from[1]], 1, 0);
    },
    isSolved: function(board) {
      const tileArray = board.flat();
      for (let i = 1; i < tileNum; i++) {
        if (tileArray[i - 1] != i) {
          return false;
        }
      }
      return true;
    },
    alertCongrats: function() {
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
    }
  }
})