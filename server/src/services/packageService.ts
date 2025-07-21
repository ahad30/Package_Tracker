import { PrismaClient } from '@prisma/client';
import { PackageEventInput, Package, PackageStatus } from '../models/package';
import { createHash } from 'crypto';
import { io } from '../app';

const prisma = new PrismaClient();

export async function createPackageEvent(event: PackageEventInput) {
  const eventHash = createHash('sha256')
    .update(`${event.package_id}:${event.status}:${event.timestamp}`)
    .digest('hex');

  const existingEvent = await prisma.packageEvent.findUnique({ where: { eventHash } });
  if (existingEvent) {
    return { message: 'Event already processed', event: existingEvent };
  }

  const eventTimestamp = new Date(event.timestamp);
  const receivedAt = new Date();

  const latestEvent = await prisma.package.findUnique({
    where: { package_id: event.package_id },
    select: { last_updated: true },
  });

  const isStale = latestEvent && latestEvent.last_updated > eventTimestamp;
  await prisma.packageEvent.create({
    data: {
      package_id: event.package_id,
      status: event.status,
      lat: event.lat,
      lon: event.lon,
      event_timestamp: eventTimestamp,
      received_at: receivedAt,
      note: event.note,
      eta: event.eta ? new Date(event.eta) : undefined,
      eventHash,
    },
  });

  if (!isStale) {
    await prisma.package.upsert({
      where: { package_id: event.package_id },
      update: {
        current_status: event.status,
        last_updated: eventTimestamp,
        lat: event.lat,
        lon: event.lon,
        note: event.note,
        eta: event.eta ? new Date(event.eta) : undefined,
      },
      create: {
        package_id: event.package_id,
        current_status: event.status,
        last_updated: eventTimestamp,
        lat: event.lat,
        lon: event.lon,
        note: event.note,
        eta: event.eta ? new Date(event.eta) : undefined,
      },
    });

    io.emit('packageUpdate', {
      package_id: event.package_id,
      current_status: event.status,
      last_updated: eventTimestamp,
      lat: event.lat,
      lon: event.lon,
      note: event.note,
      eta: event.eta,
    });
  }

  return { message: 'Event processed', event };
}

export async function getActivePackages(): Promise<Package[]> {
  return prisma.package.findMany({
    where: {
      current_status: {
        notIn: [PackageStatus.DELIVERED, PackageStatus.CANCELLED],
      },
      last_updated: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });
}

export async function getPackageHistory(packageId: string) {
  return prisma.packageEvent.findMany({
    where: { package_id: packageId },
    orderBy: { event_timestamp: 'asc' },
  });
}