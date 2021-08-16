const size = 4;
const tileNum = size * size;

const shuffle = function([...array]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const start = function() {
  const originalTile = []
  for (let i = 0; i < tileNum; i++) {
    originalTile[i] = i;
  }
  const shuffledTile = shuffle(originalTile);
  let board = [];
  for (let i = 0; i < size; i++) {
    board[i] = shuffledTile.slice(i * size, (i + 1) * size);
  }
  return board
}

const startBoard = start();

const vm = new Vue ({
  el: "#app",

  data: {
    board: startBoard,
    count: 0
  },

  methods: {
    start: function() {
      const answerTile = []
      for (let i = 0; i < tileNum; i++) {
        answerTile[i] = i;
      }
      const shuffledTile = shuffle(answerTile);
      let board = [];
      for (let i = 0; i < size; i++) {
        board[i] = shuffledTile.slice(i * size, (i + 1) * size);
      }
      return this.board = board
    },
    restart: function() {
      if(confirm("Are you sure you want to restart?")) {
        this.start();
        this.count = 0;
      }
    },
    clicked: function(num) {
      const from = this.getIndex(num, this.board);
      const row = from[0], col = from[1];
      if (this.canMove(row, col)) {
        const to = this.getIndex(0);
        this.moveTile(num, from, to);
        this.count++;
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
      console.log('swap');
      this.board[to[0]].splice([to[1]], 1, num);
      this.board[from[0]].splice([from[1]], 1, 0);
    }
  }
})
