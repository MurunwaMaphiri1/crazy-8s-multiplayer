import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Player } from '../Client/utils/interface';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const room: Player[] = [];

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    io.on('join-room', (player: Player) => {
        if (room.length < 2) {
            room.push(player);
            io.emit('room-updated', room);
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        const index = room.findIndex(p => p.socketId === socket.id);
        if (index !== -1) room.splice(index, 1);
        io.emit('room-updated', room);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
