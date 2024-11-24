let gridSize = 8;  
let mineCount = 10;  
let grid = [];
let mineLocations = [];
let revealedCount = 0;
let flagsPlaced = 0;

const levelConfig = {
  easy: { size: 8, mines: 10 },
  medium: { size: 16, mines: 40 },
  hard: { size: 24, mines: 99 }
};

document.getElementById('restart').addEventListener('click', initGame);
document.getElementById('level').addEventListener('change', changeLevel);

function changeLevel() {
  const level = document.getElementById('level').value;
  gridSize = levelConfig[level].size;
  mineCount = levelConfig[level].mines;
  initGame();
}

function initGame() {
  const container = document.getElementById('game-container');
  container.style.gridTemplateColumns = `repeat(${gridSize}, 30px)`;
  container.style.gridTemplateRows = `repeat(${gridSize}, 30px)`;

  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  mineLocations = [];
  revealedCount = 0;
  flagsPlaced = 0;

  placeMines();
  calculateNumbers();

  container.innerHTML = '';  // Clear the container for a new game
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener('click', () => revealCell(row, col));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleFlag(row, col);
      });

      container.appendChild(cell);
    }
  }

  document.getElementById('status').textContent = 'Game in Progress';
}

function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    if (grid[row][col] !== 'M') {
      grid[row][col] = 'M';
      mineLocations.push({ row, col });
      minesPlaced++;
    }
  }
}

function calculateNumbers() {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === 'M') continue;

      let count = 0;
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          if (grid[newRow][newCol] === 'M') {
            count++;
          }
        }
      }
      grid[row][col] = count;
    }
  }
}

function revealCell(row, col) {
  const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
  if (cell.classList.contains('revealed') || cell.classList.contains('flag')) return;

  cell.classList.add('revealed');
  const value = grid[row][col];

  if (value === 'M') {
    cell.classList.add('mine');
    gameOver(false);
  } else {
    revealedCount++;
    if (value > 0) {
      cell.textContent = value;
    } else {
      cell.textContent = '';
      revealAdjacentCells(row, col);
    }

    if (revealedCount === gridSize * gridSize - mineCount) {
      gameOver(true);
    }
  }
}

function revealAdjacentCells(row, col) {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [dx, dy] of directions) {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      revealCell(newRow, newCol);
    }
  }
}

function toggleFlag(row, col) {
  const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
  if (cell.classList.contains('revealed')) return;

  if (cell.classList.contains('flag')) {
    cell.classList.remove('flag');
    cell.textContent = '';
    flagsPlaced--;
  } else {
    if (flagsPlaced < mineCount) {
      cell.classList.add('flag');
      cell.textContent = '🚩';
      flagsPlaced++;
    }
  }
}

function revealAllMines() {
  mineLocations.forEach(({ row, col }) => {
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    cell.classList.add('mine', 'revealed');
  });
}

function gameOver(won) {
  const status = document.getElementById('status');
  if (won) {
    status.textContent = 'You Win!';
  } else {
    status.textContent = 'Game Over!';
    revealAllMines();
  }

  document.querySelectorAll('.cell').forEach(cell => {
    cell.replaceWith(cell.cloneNode(true));
  });
}

initGame();
