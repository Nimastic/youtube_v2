const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 20;
const tetrominoColors = [
    null, // No color for empty cells
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'purple',
    'red'
];

const tetrominoes = [
    [],
    [[1,1,1,1]],
    [[2,0,0],[2,2,2]],
    [[0,0,3],[3,3,3]],
    [[4,4],[4,4]],
    [[0,5,5],[5,5,0]],
    [[0,6,0],[6,6,6]],
    [[7,7,0],[0,7,7]]
];

let board = [];
const rows = 20;
const cols = 10;

for(let row = 0; row < rows; row++) {
    board[row] = [];
    for(let col = 0; col < cols; col++) {
        board[row][col] = 0;
    }
}

let piece = null;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = false;

function resetPiece() {
    const index = Math.floor(Math.random() * (tetrominoes.length - 1)) + 1;
    piece = {
        x: Math.floor(cols / 2) - 1,
        y: 0,
        shape: tetrominoes[index],
        color: index
    };
}

function collide(board, piece) {
    const m = piece.shape;
    for(let y = 0; y < m.length; y++) {
        for(let x = 0; x < m[y].length; x++) {
            if(m[y][x]) {
                const newX = piece.x + x;
                const newY = piece.y + y;
                if(newY >= rows || 
                   newX < 0 || 
                   newX >= cols || 
                   board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge(board, piece) {
    const m = piece.shape;
    for(let y = 0; y < m.length; y++) {
        for(let x = 0; x < m[y].length; x++) {
            if(m[y][x]) {
                board[piece.y + y][piece.x + x] = piece.color;
            }
        }
    }
}

function rotate(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

function playerRotate() {
    const oldShape = piece.shape;
    piece.shape = rotate(piece.shape);
    if(collide(board, piece)) {
        piece.shape = oldShape;
    }
}

function drop() {
    piece.y++;
    if(collide(board, piece)) {
        piece.y--;
        merge(board, piece);
        resetPiece();
        lineClear();
    }
    dropCounter = 0;
}

function lineClear() {
    outer: for(let y = rows -1; y >= 0; y--) {
        for(let x = 0; x < cols; x++) {
            if(!board[y][x]) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++;
    }
}

function drawMatrix(matrix, offset) {
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            if(matrix[y][x]) {
                context.fillStyle = tetrominoColors[matrix[y][x]];
                context.fillRect((x + offset.x) * grid, (y + offset.y) * grid, grid, grid);
                context.strokeRect((x + offset.x) * grid, (y + offset.y) * grid, grid, grid);
            }
        }
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0,0,canvas.width, canvas.height);
    drawMatrix(board, {x:0, y:0});
    drawMatrix(piece.shape, {x: piece.x, y: piece.y});
}

function update(time = 0) {
    if(isPaused) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval) {
        drop();
    }
    draw();
    requestAnimationFrame(update);
}

function startGame() {
    resetPiece();
    lastTime = 0;
    dropCounter = 0;
    isPaused = false;
    update();
}

function pauseGame() {
    isPaused = !isPaused;
    if(!isPaused) {
        update();
    }
}

document.addEventListener('keydown', event => {
    if(isPaused) return;
    if(event.keyCode === 37) { // Left Arrow Key
        piece.x--;
        if(collide(board, piece)) {
            piece.x++;
        }
    } else if(event.keyCode === 39) { // Right Arrow Key
        piece.x++;
        if(collide(board, piece)) {
            piece.x--;
        }
    } else if(event.keyCode === 40) { // Down Arrow Key
        drop();
    } else if(event.keyCode === 38) { // Up Arrow Key
        playerRotate();
    } else if(event.keyCode === 32) { // Spacebar
        while(!collide(board, piece)) {
            piece.y++;
        }
        piece.y--;
        merge(board, piece);
        resetPiece();
        lineClear();
    } else if(event.keyCode === 80) { // 'P' Key
        pauseGame();
    }
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('pauseButton').addEventListener('click', pauseGame);

// Help modal functionality
const helpIcon = document.getElementById('helpIcon');
const helpModal = document.getElementById('helpModal');
const closeBtn = document.querySelector('.close');

helpIcon.onclick = function() {
    helpModal.style.display = 'block';
}

closeBtn.onclick = function() {
    helpModal.style.display = 'none';
}

window.onclick = function(event) {
    if(event.target == helpModal) {
        helpModal.style.display = 'none';
    }
}