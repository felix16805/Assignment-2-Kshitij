let board = [];
let solution = [];
let timer = null;
let seconds = 0;

// Start a new game
function newGame() {
  clearInterval(timer);
  seconds = 0;
  updateTimer();
  generateSudoku();
  renderBoard();
  timer = setInterval(() => {
    seconds++;
    updateTimer();
  }, 1000);
}

// Generate full solution using backtracking
function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isValid(r, c, num) {
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === num || board[i][c] === num) return false;
    }
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[boxRow + i][boxCol + j] === num) return false;
    return true;
  }

  function solve(r = 0, c = 0) {
    if (r === 9) return true;
    const nextR = c === 8 ? r + 1 : r;
    const nextC = (c + 1) % 9;
    const nums = [...Array(9).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
    for (let num of nums) {
      if (isValid(r, c, num)) {
        board[r][c] = num;
        if (solve(nextR, nextC)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }

  solve();
  return board;
}

// Remove cells for puzzle based on difficulty
function removeCells(fullBoard, difficulty = "medium") {
  let cellsToRemove = difficulty === "easy" ? 35 : difficulty === "hard" ? 55 : 45;
  let puzzle = fullBoard.map(row => row.slice());
  while (cellsToRemove > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      cellsToRemove--;
    }
  }
  return puzzle;
}

// Generate Sudoku Puzzle
function generateSudoku() {
  solution = generateFullBoard();
  const difficulty = document.getElementById("difficulty").value;
  board = removeCells(solution, difficulty);
}

// Render Board
function renderBoard() {
  const boardContainer = document.getElementById("board");
  boardContainer.innerHTML = "";
  board.forEach((row, r) => {
    row.forEach((num, c) => {
      const cell = document.createElement("input");
      cell.type = "text";
      cell.maxLength = 1;
      cell.dataset.r = r;
      cell.dataset.c = c;

      if (num !== 0) {
        cell.value = num;
        cell.disabled = true;
        cell.classList.add("prefilled");
      } else {
        cell.addEventListener("input", () => validateInput(cell));
      }
      boardContainer.appendChild(cell);
    });
  });
}

// Input Validation
function validateInput(cell) {
  const r = +cell.dataset.r;
  const c = +cell.dataset.c;
  const val = +cell.value;
  cell.classList.remove("invalid");

  if (isNaN(val) || val < 1 || val > 9) {
    cell.classList.add("invalid");
    return;
  }

  // Check for duplicates
  const inputs = document.querySelectorAll("input:not(.prefilled)");
  inputs.forEach(input => input.classList.remove("invalid"));

  for (let input of inputs) {
    const rr = +input.dataset.r;
    const cc = +input.dataset.c;
    const v = +input.value;
    if (
      (r === rr || c === cc || (Math.floor(r / 3) === Math.floor(rr / 3) && Math.floor(c / 3) === Math.floor(cc / 3))) &&
      v === val &&
      input !== cell
    ) {
      cell.classList.add("invalid");
      input.classList.add("invalid");
    }
  }
}

// Check Puzzle
function checkSolution() {
  const inputs = document.querySelectorAll("input:not(.prefilled)");
  let correct = true;

  inputs.forEach(input => {
    const r = +input.dataset.r;
    const c = +input.dataset.c;
    const val = +input.value;
    if (val !== solution[r][c]) {
      correct = false;
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  });

  const message = document.getElementById("message");
  if (correct) {
    message.textContent = "🎉 Puzzle Solved!";
    updateLeaderboard();
    clearInterval(timer);
  } else {
    message.textContent = "❌ Some entries are incorrect!";
  }
}

// Timer
function updateTimer() {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${min}:${sec}`;
}

// Reset Controls
function resetBoard() {
  document.getElementById("reset-modal").classList.remove("hidden");
}

function confirmReset() {
  document.querySelectorAll("input:not(.prefilled)").forEach(input => {
    input.value = "";
    input.classList.remove("invalid");
  });
  document.getElementById("reset-modal").classList.add("hidden");
  document.getElementById("message").textContent = "";
}

function closeModal() {
  document.getElementById("reset-modal").classList.add("hidden");
}

// Leaderboard
function updateLeaderboard() {
  const time = seconds;
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push(time);
  leaderboard.sort((a, b) => a - b);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  list.innerHTML = leaderboard.map(time => {
    const min = String(Math.floor(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    return `<li>${min}:${sec}</li>`;
  }).join("");
}

// Hint Feature
function getHint() {
  const inputs = document.querySelectorAll("input:not(.prefilled)");
  const emptyCells = Array.from(inputs).filter(i => !i.value);
  if (emptyCells.length === 0) return;

  const randCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const r = +randCell.dataset.r;
  const c = +randCell.dataset.c;
  randCell.value = solution[r][c];
  validateInput(randCell);
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Init
window.onload = () => {
  renderLeaderboard();
  newGame();
};
