import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { PackageStatus } from '../models/package';
import cron from 'node-cron';

const prisma = new PrismaClient();
const STUCK_THRESHOLD_MINUTES = 30;

export async function checkStuckPackages(io: Server) {
  const packages = await prisma.package.findMany({
    where: {
      current_status: {
        notIn: [PackageStatus.DELIVERED, PackageStatus.CANCELLED],
      },
    },
  });

  const now = new Date();
  for (const pkg of packages) {
    const timeSinceUpdate = (now.getTime() - pkg.last_updated.getTime()) / (1000 * 60);
    if (timeSinceUpdate > STUCK_THRESHOLD_MINUTES) {
      const lastAlert = await prisma.alert.findFirst({
        where: { package_id: pkg.package_id, resolved: false },
        orderBy: { created_at: 'desc' },
      });

      const shouldAlert = !lastAlert || 
        (now.getTime() - lastAlert.created_at.getTime()) / (1000 * 60) > STUCK_THRESHOLD_MINUTES;

      if (shouldAlert) {
        const alert = await prisma.alert.create({
          data: {
            package_id: pkg.package_id,
            message: `Package ${pkg.package_id} stuck for ${Math.floor(timeSinceUpdate)} minutes`,
            created_at: now,
          },
        });
        io.emit('alert', alert);
      }
    }
  }
}

export function startAlertCron(io: Server) {
  cron.schedule('*/5 * * * *', () => checkStuckPackages(io));
}