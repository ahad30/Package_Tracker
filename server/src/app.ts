import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import packageRoutes from './routes/packageRoutes';
import { initSocket } from './socket/socket';
import { authMiddleware } from './middlewares/auth';
import { startAlertCron } from './services/alertService';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(authMiddleware);
app.use('/api/v1', packageRoutes);

initSocket(io);
startAlertCron(io);

export { app, httpServer, io };