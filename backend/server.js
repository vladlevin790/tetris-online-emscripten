const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

let rooms = new Map();

app.use(cors({
    origin: "*",
    methods: ['GET','POST']
}));


app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/rooms', (req, res) => {
    const roomList = Array.from(rooms.keys()).map(roomId => {
        const room = rooms.get(roomId);
        return {
            roomId,
            players: room.players.length
        };
    }).filter(room => room.players < 2); 
    res.json(roomList);
});

app.post('/create-room', (req, res) => {
    const newRoomId = `room_${rooms.size + 1}`;
    rooms.set(newRoomId, { players: [], gameState: { board: Array(GRID_WIDTH * GRID_HEIGHT).fill(0), tetromino: [] }, gameStarted: false, playerScores: {} });
    res.json({ roomId: newRoomId });
});

wss.on('connection', (ws, req) => {
    const roomId = new URLSearchParams(req.url.split('?')[1]).get('roomId');

    if (!rooms.has(roomId)) {
        ws.close();
        return;
    }

    const room = rooms.get(roomId);
    const playerId = room.players.length + 1;
    room.players.push({ id: playerId, ws });

    ws.send(JSON.stringify({ type: 'welcome', playerId, roomId }));
    ws.send(JSON.stringify({ type: 'gameState', state: room.gameState }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received message of type: ${data.type} from player ${data.playerId}`);
        switch (data.type) {
            case 'gameStart':
                handleGameStart(ws, roomId);
                break;

            case 'gameStateUpdate':
                broadcastGameState(data, ws, roomId);
                break;

            case 'playerMove':
                handlePlayerMove(data, ws, roomId);
                break;

            case 'gameOver':
                console.log('Handling game over');
                handleGameOver(data, roomId);
                break;

            default:
                console.error('Unknown message type:', data.type);
                break;
        }
    });

    ws.on('close', () => {
        console.log('Player disconnected');
        room.players = room.players.filter(player => player.ws !== ws);
        if (room.players.length === 0) {
            rooms.delete(roomId);
        }
    });
});

function handleGameStart(ws, roomId) {
    const room = rooms.get(roomId);
    if (!room.gameStarted) {
        room.gameStarted = true;

        room.players.forEach(player => {
            if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify({ type: 'gameStart' }));
            }
        });
    }
}

function broadcastGameState(data, senderWs, roomId) {
    const room = rooms.get(roomId);
    room.gameState = { ...room.gameState, ...data };

    room.players.forEach(player => {
        if (player.ws !== senderWs && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    });
}

function handlePlayerMove(data, senderWs, roomId) {
    const room = rooms.get(roomId);
    const senderPlayer = room.players.find(player => player.ws === senderWs);
    data.playerId = senderPlayer.id;
    data.type = 'playerMove';

    broadcastGameState(data, senderWs, roomId);
}

function handleGameOver(data, roomId) {
    const room = rooms.get(roomId);
    room.playerScores[data.playerId] = { score: data.score, level: data.level };

    const allPlayersScores = Object.values(room.playerScores);
    console.log(allPlayersScores);
    if (allPlayersScores.length === 2) { 
        const player1 = room.players[0];
        const player2 = room.players[1];
        
        const player1Score = room.playerScores[player1.id].score;
        const player2Score = room.playerScores[player2.id].score;

        const winner = player1Score > player2Score ? player1.id : player2.id;

        room.players.forEach(player => {
            if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify({
                    type: 'gameOver',
                    winner: winner,
                    scores: room.playerScores
                }));
            }
        });

        room.gameStarted = false;
        room.gameState = { board: Array(GRID_WIDTH * GRID_HEIGHT).fill(0), tetromino: [] };
        room.playerScores = {};
    }
}

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

//TODO: fix end of game, 