import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { DatabaseShape } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const databasePath = path.join(dataDirectory, 'db.json');

const defaultDatabase: DatabaseShape = {
  profile: {
    id: 'default-profile',
    name: '体验用户',
    birthDate: '1990-01-01',
    gender: 'other',
    dominantElement: 'wood',
    weakElement: 'water',
    riskPreference: 'medium',
    investmentPreference: '均衡配置'
  },
  moods: [],
  investments: [],
  reports: []
};

export async function ensureDatabase(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(databasePath, 'utf8');
  } catch {
    await writeFile(databasePath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
  }
}

export async function readDatabase(): Promise<DatabaseShape> {
  await ensureDatabase();
  const content = await readFile(databasePath, 'utf8');
  return JSON.parse(content) as DatabaseShape;
}

export async function writeDatabase(database: DatabaseShape): Promise<void> {
  await ensureDatabase();
  await writeFile(databasePath, JSON.stringify(database, null, 2), 'utf8');
}

