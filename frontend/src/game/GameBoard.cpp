#include "GameBoard.h"
#include <algorithm>

GameBoard::GameBoard() {}

bool GameBoard::checkCollision(Tetromino &tetromino, int dx, int dy) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            if (tetromino.shape[i][j]) {
                int newX = tetromino.x + j + dx;
                int newY = tetromino.y + i + dy;
                if (newX < 0 || newX >= WIDTH || newY >= HEIGHT || (newY >= 0 && board[newY][newX]))
                    return true;
            }
        }
    }
    return false;
}

void GameBoard::mergeTetromino(Tetromino &tetromino) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            if (tetromino.shape[i][j]) {
                int x = tetromino.x + j;
                int y = tetromino.y + i;
                if (y >= 0 && x >= 0 && x < WIDTH && y < HEIGHT) {
                    board[y][x] = 1;
                }
            }
        }
    }
}

void GameBoard::clearLines(int &score, int &level, int &speed) {
    int linesCleared = 0;
    for (int i = 0; i < HEIGHT; i++) {
        bool fullLine = true;
        for (int j = 0; j < WIDTH; j++) {
            if (!board[i][j]) {
                fullLine = false;
                break;
            }
        }
        if (fullLine) {
            linesCleared++;
            for (int k = i; k > 0; k--)
                for (int l = 0; l < WIDTH; l++)
                    board[k][l] = board[k - 1][l];

            for (int l = 0; l < WIDTH; l++)
                board[0][l] = 0;
        }
    }
    score += linesCleared * 100;
    if (score >= level * 1000) {
        level++;
        speed = std::max(50, 500 - (level - 1) * 50);
    }
}
