#include "Tetromino.h"

const int tetrominos[7][4][4] = {
    {{0, 1, 0, 0}, {0, 1, 0, 0}, {0, 1, 0, 0}, {0, 1, 0, 0}},  // I
    {{1, 1}, {1, 1}},                                          // O
    {{0, 1, 1}, {1, 1, 0}},                                    // S
    {{1, 1, 0}, {0, 1, 1}},                                    // Z
    {{1, 1, 1}, {0, 1, 0}},                                    // T
    {{1, 1, 1}, {1, 0, 0}},                                    // L
    {{1, 1, 1}, {0, 0, 1}}                                     // J
};

Tetromino::Tetromino() : x(0), y(0), type(0) {}

void Tetromino::initialize(int index) {
    type = index;
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4; j++)
            shape[i][j] = tetrominos[index][i][j];
    x = 3;
    y = 0;
}

void Tetromino::rotate() {
    int newShape[4][4] = {0};
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4; j++)
            newShape[j][3 - i] = shape[i][j];
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4; j++)
            shape[i][j] = newShape[i][j];
}
