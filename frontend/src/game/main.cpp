#include "TetrisGame.h"
#include <emscripten/emscripten.h>

TetrisGame game;

extern "C" {
    EMSCRIPTEN_KEEPALIVE void moveDown() { game.moveDown(); }
    EMSCRIPTEN_KEEPALIVE void moveLeft() { game.moveLeft(); }
    EMSCRIPTEN_KEEPALIVE void moveRight() { game.moveRight(); }
    EMSCRIPTEN_KEEPALIVE void rotateTetromino() { game.rotate(); }
    EMSCRIPTEN_KEEPALIVE void spawnTetromino() { game.spawnTetromino(); }
    EMSCRIPTEN_KEEPALIVE void resetGame() { game.resetGame(); }
    EMSCRIPTEN_KEEPALIVE int getScore() { return game.getScore(); }
    EMSCRIPTEN_KEEPALIVE int getLevel() { return game.getLevel(); }
    EMSCRIPTEN_KEEPALIVE int getSpeed() { return game.getSpeed(); }
    EMSCRIPTEN_KEEPALIVE bool isGameOver() { return game.isGameOver(); }

    EMSCRIPTEN_KEEPALIVE int* getBoardPointer() { 
        return reinterpret_cast<int*>(game.getBoard()); 
    }

    EMSCRIPTEN_KEEPALIVE int getCurrentTetrominoX() { 
        return game.getCurrentTetromino().x; 
    }

    EMSCRIPTEN_KEEPALIVE int getCurrentTetrominoY() { 
        return game.getCurrentTetromino().y; 
    }

    EMSCRIPTEN_KEEPALIVE int getCurrentTetrominoType() {
        return game.getCurrentTetrominoType(); 
    }
    
    EMSCRIPTEN_KEEPALIVE const int* getCurrentTetrominoShape() { 
        return &game.getCurrentTetromino().shape[0][0]; 
    }

}
