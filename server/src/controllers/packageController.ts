import { Request, Response } from 'express';
import { PackageEventInput } from '../models/package';
import { createPackageEvent, getActivePackages, getPackageHistory } from '../services/packageService';


export const handlePackageUpdate = async (req: Request, res: Response) => {
  try {
    const event: PackageEventInput = req.body;
    const result = await createPackageEvent(event);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error processing package update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPackages = async (_req: Request, res: Response) => {
  try {
    const packages = await getActivePackages();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPackageDetails = async (req: Request, res: Response) => {
  try {
    const id  = req.params.id;
    const history = await getPackageHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};