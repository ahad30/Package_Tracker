import { Server } from 'socket.io';

export function initSocket(io: Server) {
  io.on('connection', (socket) => {
    // console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id);
    });
  });
}