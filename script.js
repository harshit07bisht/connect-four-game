const ROWS = 6;
const COLS = 7;

let board = [];
let currentPlayer = "red";
let gameOver = false;
let winningCells = [];

const boardElement = document.getElementById("board");
const winLineElement = document.getElementById("winLine");
const statusElement = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

function createBoard() {
    winLineElement.innerHTML = "";
    board = [];
    winningCells = [];
    boardElement.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {
        board[row] = [];

        for (let col = 0; col < COLS; col++) {
            board[row][col] = "";

            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", () => dropDisc(col));

            boardElement.appendChild(cell);
        }
    }
}

function dropDisc(col) {
    if (gameOver) return;

    let targetRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === "") {
            targetRow = row;
            break;
        }
    }

    if (targetRow === -1) {
        statusElement.textContent = "That column is full. Choose another one.";
        return;
    }

    board[targetRow][col] = currentPlayer;
    updateBoard();

    if (checkWinner(targetRow, col)) {
        statusElement.textContent = `${capitalize(currentPlayer)} Wins!`;
        boardElement.classList.add("game-over");
        createWinLine(winningCells);
        createConfetti();
        gameOver = true;
        return;
    }

    if (isBoardFull()) {
        statusElement.textContent = "It's a Draw!";
        gameOver = true;
        return;
    }

    currentPlayer = currentPlayer === "red" ? "yellow" : "red";
    statusElement.textContent = `${capitalize(currentPlayer)}'s Turn`;
}

function updateBoard() {
    const cells = document.querySelectorAll(".cell");

    cells.forEach(cell => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const value = board[row][col];

        cell.classList.remove("red", "yellow", "win");

        if (value) {
            cell.classList.add(value);

            if (winningCells.some(([r, c]) => r === row && c === col)) {
                cell.classList.add("win");
            }
        }
    });
}

function checkWinner(row, col) {
    winningCells = [];
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ];

    for (const [rowDir, colDir] of directions) {
        const line = getLine(row, col, rowDir, colDir);
        if (line.length >= 4) {
            winningCells = line;
            return true;
        }
    }

    return false;
}

function getLine(row, col, rowDir, colDir) {
    const line = [[row, col]];
    collectDirection(row, col, -rowDir, -colDir, line, true);
    collectDirection(row, col, rowDir, colDir, line, false);
    return line;
}

function collectDirection(row, col, rowDir, colDir, line, prepend) {
    let r = row + rowDir;
    let c = col + colDir;

    while (
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS &&
        board[r][c] === currentPlayer
    ) {
        const cell = [r, c];
        if (prepend) {
            line.unshift(cell);
        } else {
            line.push(cell);
        }
        r += rowDir;
        c += colDir;
    }
}

function isBoardFull() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === "") {
                return false;
            }
        }
    }
    return true;
}

function createConfetti() {
    const confettiContainer = document.getElementById("confetti");
    confettiContainer.innerHTML = "";
    const colors = ["#f8e71c", "#ff6f61", "#7ed321", "#50e3c2", "#4a90e2"];

    for (let i = 0; i < 24; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 90 + 5}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDuration = `${1.2 + Math.random() * 0.6}s`;
        piece.style.animationDelay = `${Math.random() * 0.3}s`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(piece);
    }

    setTimeout(() => {
        confettiContainer.innerHTML = "";
    }, 1800);
}

function createWinLine(cells) {
    winLineElement.innerHTML = "";
    if (cells.length < 2) return;

    const firstCell = document.querySelector(`.cell[data-row="${cells[0][0]}"][data-col="${cells[0][1]}"]`);
    const lastCell = document.querySelector(`.cell[data-row="${cells[cells.length - 1][0]}"][data-col="${cells[cells.length - 1][1]}"]`);

    if (!firstCell || !lastCell) return;

    const boardRect = boardElement.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    const x1 = firstRect.left - boardRect.left + firstRect.width / 2;
    const y1 = firstRect.top - boardRect.top + firstRect.height / 2;
    const x2 = lastRect.left - boardRect.left + lastRect.width / 2;
    const y2 = lastRect.top - boardRect.top + lastRect.height / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy) + 14;
    const angle = Math.atan2(dy, dx);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const line = document.createElement("div");
    line.className = "win-line";
    line.style.width = `${length}px`;
    line.style.left = `${midX}px`;
    line.style.top = `${midY}px`;
    line.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;

    winLineElement.appendChild(line);
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

restartBtn.addEventListener("click", () => {
    currentPlayer = "red";
    gameOver = false;
    winningCells = [];
    statusElement.textContent = "Red's Turn";
    boardElement.classList.remove("game-over");
    document.getElementById("confetti").innerHTML = "";
    winLineElement.innerHTML = "";
    createBoard();
});

createBoard();