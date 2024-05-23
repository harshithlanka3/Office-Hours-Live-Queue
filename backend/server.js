const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateAlias } = require('./anonymousGenerator.js');
const { createClient } = require('redis');

const PORT = 8080;

const client = createClient({
    password: 'YGcYdPeNnXESPEwMtfVd0FQ8VWV4F50p',
    socket: {
        host: 'redis-10719.c244.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 10719
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

async function addUsersToRedis() {
    const dataFilePath = path.join(__dirname, 'example_data.json');
    let userData = {};
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        userData = JSON.parse(data);
    } catch (error) {
        console.error('Error reading user data file:', error);
    }
    try {
        for (const userId in userData) {
            const user = userData[userId];
            await client.hSet(`user:${userId}`, {
                'name': user.name,
                'role': user.role
            });
        }
        console.log('All users added to Redis successfully!');
    } catch (error) {
        console.error('Failed to add user data to Redis:', error);
    }
}

addUsersToRedis();

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
 }); 

app.use(express.json());

io.on('connection', async (socket) => {
    console.log('A user connected');

    const updatedQueue = await client.lRange('userQueue', 0, -1);
    socket.emit('queue-updated', updatedQueue);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.post('/queue', async (req, res) => {
    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).send({ message: "User ID is required" });
    }

    const userExists = await client.exists(`user:${userId}`);

    if (!userExists) {
        return res.status(404).send({ message: "User ID does not exist" });
    }

    const role = await client.hGet(`user:${userId}`, 'role');
    if (role === '0') {
        return res.status(403).send({ message: "User does not have the required role" });
    }

    const isUserInQueue = await client.sIsMember('userSet', userId);
    if (isUserInQueue) {
        return res.status(409).send({ message: "User ID is already in the queue" });
    }

    let alias;
    let isNameUnique;
    do {
        alias = generateAlias();
        isNameUnique = !(await client.sIsMember('aliasSet', alias));
    } while (!isNameUnique);

    const queueObject = JSON.stringify({ alias, userId });

    const multi = client.multi();

    multi.rPush('userQueue', queueObject);
    multi.sAdd('userSet', userId);
    multi.sAdd('aliasSet', alias);

    try {
        await multi.exec()
        const updatedQueue = await client.lRange('userQueue', 0, -1);
        io.emit('queue-updated', updatedQueue);
        res.status(201).send({ message: "User added to queue" });
    } catch (error) {
        console.error("Failed to add user to queue:", error);
        res.status(500).send({ message: "Failed to add user to queue" });
    }
});

app.delete('/queue/:userId', async (req, res) => {
    const userId = req.params.userId;
    const currentQueue = await client.lRange('userQueue', 0, -1);
    let userAlias = null;
    let foundUser = false;

    for (const item of currentQueue) {
        const user = JSON.parse(item);
        if (user.userId === userId) {
            userAlias = user.alias;
            foundUser = true;
            break;
        }
    }

    if (!foundUser) {
        res.status(404).send({ message: "User not found/Has already been removed" });
        return;
    }

    const multi = client.multi();

    multi.lRem('userQueue', 1, JSON.stringify({ alias: userAlias, userId }));
    multi.sRem('userSet', userId);
    multi.sRem('aliasSet', userAlias);

    await multi.exec();

    const updatedQueue = await client.lRange('userQueue', 0, -1);
    io.emit('queue-updated', updatedQueue);
    res.send({ message: "User removed from queue" });
});

app.delete('/queue', async (req, res) => {
    try {
        const multi = client.multi();
        multi.del('userQueue');
        multi.del('userSet');
        multi.del('aliasSet');
        await multi.exec();
        io.emit('queue-updated', []);
        res.send({ message: "Queue cleared" });
    } catch (error) {
        console.error("Failed to clear the queue:", error);
        res.status(500).send({ message: "Failed to clear the queue" });
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});