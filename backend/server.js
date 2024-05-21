const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const PORT = 8080;

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
 }); 

app.use(express.json());

let userQueue = [];

app.post('/queue', (req, res) => {
    const { userId } = req.body;
    if (userId) {
        userQueue.push(userId);
        io.emit('queue-updated', userQueue);
        res.status(201).send({ message: "User added to queue", queue: userQueue });
    } else {
        res.status(400).send({ message: "User ID is required" });
    }
});

app.delete('/queue/:userId', (req, res) => {
    const { userId } = req.params;
    userQueue = userQueue.filter(id => id !== userId);
    io.emit('queue-updated', userQueue);
    res.send({ message: "User removed from queue", queue: userQueue });
});

app.delete('/queue', (req, res) => {
    userQueue = [];
    io.emit('queue-updated', userQueue);
    res.send({ message: "Queue cleared" });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('queue-updated', userQueue);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});