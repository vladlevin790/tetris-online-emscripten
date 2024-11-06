#ifndef GAMEBOARD_H
#define GAMEBOARD_H

#define WIDTH 10
#define HEIGHT 20

#include "Tetromino.h"

class GameBoard {
public:
    int board[HEIGHT][WIDTH] = {0};

    GameBoard();
    bool checkCollision(Tetromino &tetromino, int dx, int dy);
    void mergeTetromino(Tetromino &tetromino);
    void clearLines(int &score, int &level, int &speed);
};

#endif
