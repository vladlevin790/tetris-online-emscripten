#ifndef TETRISGAME_H
#define TETRISGAME_H

#include "GameBoard.h"

class TetrisGame {
private:
    GameBoard board;
    Tetromino currentTetromino;
    int score;
    int level;
    int speed;

public:
    TetrisGame();
    
    void spawnTetromino();
    void moveDown();
    void moveLeft();
    void moveRight();
    void rotate();
    void resetGame();
    bool isGameOver();

    const Tetromino& getCurrentTetromino() const;  
    int* getBoard();                                 
    int getScore() const { return score; }          
    int getLevel() const { return level; }         
    int getSpeed() const { return speed; }          
    int getCurrentTetrominoType() const {
        return currentTetromino.getType(); 
    }
};

#endif
