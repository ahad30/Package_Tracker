import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { PackageStatus } from '../models/package';
import cron from 'node-cron';

const prisma = new PrismaClient();
const STUCK_THRESHOLD_MINUTES = 30;
const RE_ALERT_THRESHOLD_MINUTES = 30;

export async function checkStuckPackages(io: Server, packageId?: string) {
  const whereClause = packageId
    ? { package_id: packageId, current_status: { notIn: [PackageStatus.DELIVERED, PackageStatus.CANCELLED] } }
    : { current_status: { notIn: [PackageStatus.DELIVERED, PackageStatus.CANCELLED] } };

  const packages = await prisma.package.findMany({ where: whereClause });

  const now = new Date();

  for (const pkg of packages) {
    const lastUpdated = new Date(pkg.last_updated);
    const timeSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

    if (timeSinceUpdate > STUCK_THRESHOLD_MINUTES) {
      const lastAlert = await prisma.alert.findFirst({
        where: { package_id: pkg.package_id, resolved: false },
        orderBy: { created_at: 'desc' },
      });

      if (!lastAlert) {
        const alert = await prisma.alert.create({
          data: {
            package_id: pkg.package_id,
            message: `Package ${pkg.package_id} stuck for ${Math.floor(timeSinceUpdate)} minutes`,
            created_at: now,
            updated_at: now,
          },
        });
        io.emit('alert', alert);
      } else {
         const timeSinceLastAlert = (now.getTime() - new Date(lastAlert.created_at).getTime()) / (1000 * 60);
        if (timeSinceLastAlert >= RE_ALERT_THRESHOLD_MINUTES) {
          const updatedAlert = await prisma.alert.update({
            where: { id: lastAlert.id },
            data: {
              message: `Package ${pkg.package_id} still stuck for ${Math.floor(timeSinceUpdate)} minutes`,
              created_at: now,
              updated_at: now,
            },
          });
          io.emit('alert', updatedAlert);
        }
      }
    }
  }
}

export function startAlertCron(io: Server) {
  cron.schedule('*/1 * * * *', () => checkStuckPackages(io));
}