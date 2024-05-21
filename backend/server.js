const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
 }); 

app.use(express.json());

const dataFilePath = path.join(__dirname, 'example_data.json');
let userData = {};

try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    userData = JSON.parse(data);
} catch (error) {
    console.error('Error reading user data file:', error);
}

let userQueue = [];

app.post('/queue', (req, res) => {
    const { userId } = req.body;
    const user = userData[userId];

    if (!userId) {
        return res.status(400).send({ message: "User ID is required" });
    }

    if (!user) {
        return res.status(404).send({ message: "User ID does not exist" });
    }

    if (user.role === 0) {
        return res.status(403).send({ message: "User does not have the required role" });
    }

    if (userQueue.includes(userId)) {
        return res.status(409).send({ message: "User ID is already in the queue" });
    }

    userQueue.push(userId);
    io.emit('queue-updated', userQueue);
    res.status(201).send({ message: "User added to queue", queue: userQueue });
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