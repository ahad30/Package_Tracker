import { PrismaClient } from '@prisma/client';
import { PackageEventInput, PackageStatus } from '../models/package';
import { Package as PrismaPackage } from '@prisma/client';
import { createHash } from 'crypto';
import { io } from '../app';
import { checkStuckPackages } from './alertService';

const prisma = new PrismaClient();

export async function createPackageEvent(event: PackageEventInput) {
  const eventHash = createHash('sha256')
    .update(`${event.package_id}:${event.status}:${event.timestamp}`)
    .digest('hex');

  const existingEvent = await prisma.packageEvent.findUnique({ where: { eventHash } });
  console.log(existingEvent);
  if (existingEvent) {
    return { message: 'Event already processed', event: existingEvent };
  }

  const eventTimestamp = event.timestamp ? new Date(event.timestamp) : new Date();
  const receivedAt = new Date();

  const latestEvent = await prisma.package.findUnique({
    where: { package_id: event.package_id },
    select: { 
      last_updated: true,
      lat: true,
      lon: true,
      note: true,
      eta: true
    },
  });

  const isStale = latestEvent && latestEvent.last_updated > eventTimestamp;

  // Use previous values if current event doesn't provide them
  const finalLat = event.lat !== undefined ? event.lat : (latestEvent?.lat || 20.0);
  const finalLon = event.lon !== undefined ? event.lon : (latestEvent?.lon || 20.0);
  const finalNote = event.note !== undefined ? event.note : latestEvent?.note;
  const finalEta = event.eta !== undefined 
    ? (event.eta ? new Date(event.eta) : null)
    : latestEvent?.eta;

  await prisma.packageEvent.create({
    data: {
      package_id: event.package_id,
      status: event.status,
      lat: finalLat,
      lon: finalLon,
      event_timestamp: eventTimestamp,
      received_at: receivedAt,
      note: finalNote,
      eta: finalEta,
      eventHash,
    },
  });

  if (!isStale) {
    await prisma.package.upsert({
      where: { package_id: event.package_id },
      update: {
        current_status: event.status,
        last_updated: eventTimestamp,
        lat: finalLat,
        lon: finalLon,
        note: finalNote,
        eta: finalEta,
      },
      create: {
        package_id: event.package_id,
        current_status: event.status,
        last_updated: eventTimestamp,
        lat: event.lat || 23.8103,
        lon: event.lon || 90.4125,
        note: event.note,
        eta: event.eta ? new Date(event.eta) : undefined,
      },
    });

    io.emit('packageUpdate', {
      package_id: event.package_id,
      current_status: event.status,
      last_updated: eventTimestamp,
      lat: finalLat,
      lon: finalLon,
      note: finalNote,
      eta: finalEta,
    });

    await checkStuckPackages(io, event.package_id);
  }

  return { message: 'Event processed', event };
}

export async function getActivePackages(): Promise<PrismaPackage[]> {
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

export async function getPackageHistory(id: string) {
  return prisma.packageEvent.findMany({
    where: { package_id: id },
    orderBy: { event_timestamp: 'asc' },
  });
}