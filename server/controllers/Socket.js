import { Server } from 'socket.io';

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
        });

        socket.on("send-message", ({ roomId, userId, text, sender, senderId, image }) => {
            io.to(roomId).emit("recieve-message", { roomId, userId, text, sender, senderId, image });
        });

        socket.on("update-room", () => {
            io.emit("update-room");
        });
    })
}

export default initializeSocket;