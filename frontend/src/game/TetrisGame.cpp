#include "TetrisGame.h"
#include <cstdlib>

TetrisGame::TetrisGame() : score(0), level(1), speed(500) {
    spawnTetromino();
}

void TetrisGame::spawnTetromino() {
    int randomIndex = rand() % 7;
    currentTetromino.initialize(randomIndex);
}

void TetrisGame::moveDown() {
    if (!board.checkCollision(currentTetromino, 0, 1)) {
        currentTetromino.y++;
    } else {
        board.mergeTetromino(currentTetromino);
        board.clearLines(score, level, speed);
        spawnTetromino();
    }
}

void TetrisGame::moveLeft() { if (!board.checkCollision(currentTetromino, -1, 0)) currentTetromino.x--; }
void TetrisGame::moveRight() { if (!board.checkCollision(currentTetromino, 1, 0)) currentTetromino.x++; }
void TetrisGame::rotate() { currentTetromino.rotate(); }
bool TetrisGame::isGameOver() { return board.checkCollision(currentTetromino, 0, 0); }

void TetrisGame::resetGame() {
    score = 0;
    level = 1;
    speed = 500;
    spawnTetromino();
}

const Tetromino& TetrisGame::getCurrentTetromino() const {
    return currentTetromino; 
}

int* TetrisGame::getBoard() {
    return &board.board[0][0];  
}

