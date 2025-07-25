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
    origin:[ 'http://localhost:5173' , 'https://package-tracker-gamma.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(authMiddleware);
app.use('/api/v1', packageRoutes);

initSocket(io);
startAlertCron(io);

export { app, httpServer, io };