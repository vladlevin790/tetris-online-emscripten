#ifndef TETROMINO_H
#define TETROMINO_H

class Tetromino {
public:
    int x, y;
    int shape[4][4];
    int type;

    Tetromino();
    void initialize(int index);
    void rotate();
    int getType() const {
        return type;
    }
};

#endif
