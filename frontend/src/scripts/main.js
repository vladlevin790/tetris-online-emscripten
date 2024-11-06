const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

const BLOCK_COLORS = [
    'cyan',    // I
    'yellow',  // O
    'green',   // S
    'red',     // Z
    'purple',  // T
    'orange',  // L
    'blue'     // J
];

let drawingCanvas, drawingContext, opponentCanvas, opponentContext;
let boardPointer;
let scoreDisplayElement, levelDisplayElement;
let fallingInterval;
let ws;
let playerId = null;
let opponentGameState = { board: [], tetromino: [] };

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const gameCanvas = document.getElementById('gameCanvas');
    const startButton = document.getElementById('startButton');

    startButton.addEventListener('click', () => {
        welcomeMessage.style.display = 'none';
        gameCanvas.style.display = 'block';
        initiateGame();
        startButton.style.borderRadius = "0px 0px 5px 5px";
    });

    ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = handleMessage;

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
});

Module.onRuntimeInitialized = function() {
    drawingCanvas = document.getElementById('gameCanvas');
    drawingContext = drawingCanvas.getContext('2d');
    opponentCanvas = document.getElementById('opponentCanvas');
    opponentContext = opponentCanvas.getContext('2d');
    scoreDisplayElement = document.getElementById('score');
    levelDisplayElement = document.getElementById('level');

    scoreDisplayElement.style.display = 'none';
    levelDisplayElement.style.display = 'none';

    boardPointer = Module.ccall('getBoardPointer', 'number');
    initializeKeyControls();
};

function initiateGame() {
    scoreDisplayElement.style.display = 'block';
    levelDisplayElement.style.display = 'block';

    resetGameState();
    startFallingInterval();
    requestAnimationFrame(gameRenderLoop);
}

function resetGameState() {
    Module.ccall('resetGame', null, [], []);
    generateTetromino();
    refreshScoreAndLevel();
}

function fetchCurrentTetrominoColor() {
    const tetrominoType = Module.ccall('getCurrentTetrominoType', 'number');
    return BLOCK_COLORS[tetrominoType];
}

function startFallingInterval() {
    clearInterval(fallingInterval);
    fallingInterval = setInterval(() => {
        if (!Module.ccall('isGameOver', 'boolean')) {
            descendTetromino();
            refreshScoreAndLevel();
            sendPlayerMove('down');
        } else {
            processGameOver();
        }
    }, Module.ccall('getSpeed', 'number'));
}

function gameRenderLoop() {
    renderGameBoard();
    renderOpponentBoard();
    requestAnimationFrame(gameRenderLoop);
}

function processGameOver() {
    clearInterval(fallingInterval);
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    alert("Game Over! Final Score: " + Module.ccall('getScore', 'number'));
}

function renderGameBoard() {
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            if (Module.HEAP32[(boardPointer >> 2) + row * GRID_WIDTH + col]) {
                drawSingleBlock(drawingContext, col, row, 'gray');
            }
        }
    }

    const currentTetrominoX = Module.ccall('getCurrentTetrominoX', 'number');
    const currentTetrominoY = Module.ccall('getCurrentTetrominoY', 'number');
    const tetrominoShapePtr = Module.ccall('getCurrentTetrominoShape', 'number');
    const currentColor = fetchCurrentTetrominoColor();

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (Module.HEAP32[(tetrominoShapePtr >> 2) + i * 4 + j]) {
                drawSingleBlock(drawingContext, currentTetrominoX + j, currentTetrominoY + i, currentColor);
            }
        }
    }
}

function renderOpponentBoard() {
    if (opponentContext) {
        opponentContext.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);

        if (opponentGameState.board.length > 0) {
            opponentGameState.board.forEach((value, index) => {
                if (value) {
                    const col = index % GRID_WIDTH;
                    const row = Math.floor(index / GRID_WIDTH);
                    drawSingleBlock(opponentContext, col, row, 'gray');
                }
            });

            opponentGameState.tetromino.forEach(block => {
                drawSingleBlock(opponentContext, block.x, block.y, BLOCK_COLORS[block.color]);
            });
        }
    }
}

function drawSingleBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * 20, y * 20, 20, 20);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * 20, y * 20, 20, 20);
}

function refreshScoreAndLevel() {
    const scoreValue = Module.ccall('getScore', 'number');
    const levelValue = Module.ccall('getLevel', 'number');
    scoreDisplayElement.textContent = `Score: ${scoreValue}`;
    levelDisplayElement.textContent = `Level: ${levelValue}`;
}

function descendTetromino() {
    Module.ccall('moveDown', null, [], []);
}

function spinTetromino() {
    Module.ccall('rotateTetromino', null, [], []);
}

function shiftTetrominoLeft() {
    Module.ccall('moveLeft', null, [], []);
}

function shiftTetrominoRight() {
    Module.ccall('moveRight', null, [], []);
}

function generateTetromino() {
    Module.ccall('spawnTetromino', null, [], []);
}

function sendPlayerMove(move) {
    if (playerId !== null) {
        ws.send(JSON.stringify({
            type: 'playerMove',
            playerId: playerId,
            move: move,
            board: Array.from(Module.HEAP32.subarray(boardPointer >> 2, (boardPointer >> 2) + (GRID_WIDTH * GRID_HEIGHT))),
            tetromino: getTetrominoData()
        }));
    }
}

function getTetrominoData() {
    const tetromino = [];
    const currentTetrominoX = Module.ccall('getCurrentTetrominoX', 'number');
    const currentTetrominoY = Module.ccall('getCurrentTetrominoY', 'number');
    const tetrominoShapePtr = Module.ccall('getCurrentTetrominoShape', 'number');

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (Module.HEAP32[(tetrominoShapePtr >> 2) + i * 4 + j]) {
                tetromino.push({
                    x: currentTetrominoX + j,
                    y: currentTetrominoY + i,
                    color: Module.ccall('getCurrentTetrominoType', 'number')
                });
            }
        }
    }
    return tetromino;
}

function handleMessage(event) {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
        case 'welcome':
            playerId = data.playerId;
            console.log(`Welcome Player ${playerId}`);
            break;

        case 'gameState':
            initializeGameState(data.state);
            break;

        case 'gameStateUpdate':
            updateGameState(data);
            break;

        case 'playerMove':
            handleGameMove(data);
            break;

        default:
            console.error('Unknown message type:', data.type);
    }
}

function handleGameMove(data) {
    if (data.playerId !== playerId) {
        opponentGameState.board = data.board;
        opponentGameState.tetromino = data.tetromino;
        renderOpponentBoard();
    }
}

function initializeGameState(state) {
    opponentGameState = state; 
    renderOpponentBoard(); 
}

function updateGameState(data) {
    if (data.playerId !== playerId) {
        opponentGameState.board = data.board;
        opponentGameState.tetromino = data.tetromino;
        renderOpponentBoard();
    }
}

function initializeKeyControls() {
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 's':
            case 'ы':
                descendTetromino();
                sendPlayerMove('down');
                break;
            case 'a':
            case 'ф':
                shiftTetrominoLeft();
                sendPlayerMove('left');
                break;
            case 'd':
            case 'в':
                shiftTetrominoRight();
                sendPlayerMove('right');
                break;
            case 'w':
            case 'ц':
                spinTetromino();
                sendPlayerMove('rotate');
                break;
        }
    });
}

function handleMessage(event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'welcome':
            playerId = data.playerId;
            console.log(`Welcome Player ${playerId}`);
            break;

        case 'gameState':
            initializeGameState(data.state);
            break;

        case 'gameStateUpdate':
            updateGameState(data);
            break;

        case 'playerMove':
            handleGameMove(data);
            break;

        default:
            console.error('Unknown message type:', data.type);
    }
}

