CXX = em++
CXXFLAGS = -O2
SRC_DIR = ./src/game
OUTPUT_DIR = ./src/scripts

all: tetris

tetris: $(SRC_DIR)/main.cpp $(SRC_DIR)/TetrisGame.cpp $(SRC_DIR)/GameBoard.cpp $(SRC_DIR)/Tetromino.cpp
	$(CXX) $(CXXFLAGS) $(SRC_DIR)/main.cpp $(SRC_DIR)/TetrisGame.cpp $(SRC_DIR)/GameBoard.cpp $(SRC_DIR)/Tetromino.cpp \
	-o $(OUTPUT_DIR)/tetris.js -s WASM=1 -s "EXPORTED_FUNCTIONS=['_moveDown', '_moveLeft', '_moveRight', '_rotateTetromino', '_spawnTetromino', '_resetGame', '_getScore', '_getLevel', '_getSpeed', '_isGameOver', '_getBoardPointer', '_getCurrentTetrominoX', '_getCurrentTetrominoY', '_getCurrentTetrominoShape', '_getCurrentTetrominoType']" \
	-s "EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']"

clean:
	rm -f $(OUTPUT_DIR)/tetris.js $(OUTPUT_DIR)/tetris.wasm
