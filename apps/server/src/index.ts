import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';

import { analyzeDay, buildDailyReport } from './analysis.js';
import { readDatabase, writeDatabase } from './storage.js';
import type { InvestmentLog, MoodLog, UserProfile } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 3100);

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/profile', async (_request, response) => {
  const database = await readDatabase();
  response.json(database.profile);
});

app.put('/api/profile', async (request, response) => {
  const database = await readDatabase();
  const profile: UserProfile = {
    ...database.profile,
    ...request.body
  };
  database.profile = profile;
  await writeDatabase(database);
  response.json(profile);
});

app.get('/api/moods', async (request, response) => {
  const database = await readDatabase();
  const date = String(request.query.date ?? '');
  const moods = date ? database.moods.filter((item) => item.date === date) : database.moods;
  response.json(moods.sort((left, right) => right.date.localeCompare(left.date)));
});

app.post('/api/moods', async (request, response) => {
  const database = await readDatabase();
  const payload = request.body as Omit<MoodLog, 'id'>;
  const mood: MoodLog = {
    id: randomUUID(),
    date: payload.date,
    score: payload.score,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    note: payload.note ?? ''
  };

  database.moods = database.moods.filter((item) => item.date !== mood.date);
  database.moods.unshift(mood);
  await writeDatabase(database);
  response.status(201).json(mood);
});

app.get('/api/investments', async (request, response) => {
  const database = await readDatabase();
  const date = String(request.query.date ?? '');
  const investments = date ? database.investments.filter((item) => item.date === date) : database.investments;
  response.json(investments.sort((left, right) => right.date.localeCompare(left.date)));
});

app.post('/api/investments', async (request, response) => {
  const database = await readDatabase();
  const payload = request.body as Omit<InvestmentLog, 'id'>;
  const investment: InvestmentLog = {
    id: randomUUID(),
    date: payload.date,
    pnl: payload.pnl,
    pnlRate: payload.pnlRate,
    positionRatio: payload.positionRatio,
    strategy: payload.strategy ?? '',
    note: payload.note ?? ''
  };

  database.investments = database.investments.filter((item) => item.date !== investment.date);
  database.investments.unshift(investment);
  await writeDatabase(database);
  response.status(201).json(investment);
});

app.get('/api/analysis/daily', async (request, response) => {
  const database = await readDatabase();
  const date = String(request.query.date ?? new Date().toISOString().slice(0, 10));
  const mood = database.moods.find((item) => item.date === date);
  const investment = database.investments.find((item) => item.date === date);
  response.json(analyzeDay(database.profile, mood, investment));
});

app.get('/api/reports/:date', async (request, response) => {
  const database = await readDatabase();
  const report = database.reports.find((item) => item.date === request.params.date);

  if (!report) {
    response.status(404).json({ message: '未找到该日期日报' });
    return;
  }

  response.json(report);
});

app.post('/api/reports/daily', async (request, response) => {
  const database = await readDatabase();
  const date = String(request.body.date ?? new Date().toISOString().slice(0, 10));
  const mood = database.moods.find((item) => item.date === date);
  const investment = database.investments.find((item) => item.date === date);
  const report = buildDailyReport(database.profile, mood, investment);

  database.reports = database.reports.filter((item) => item.date !== date);
  database.reports.unshift(report);
  await writeDatabase(database);
  response.status(201).json(report);
});

app.get('/api/overview', async (request, response) => {
  const database = await readDatabase();
  const date = String(request.query.date ?? new Date().toISOString().slice(0, 10));
  const mood = database.moods.find((item) => item.date === date);
  const investment = database.investments.find((item) => item.date === date);
  const report = database.reports.find((item) => item.date === date) ?? buildDailyReport(database.profile, mood, investment);
  const analysis = analyzeDay(database.profile, mood, investment);

  response.json({
    profile: database.profile,
    mood,
    investment,
    analysis,
    report
  });
});

app.listen(port, () => {
  console.log(`daily-horoscope server running at http://localhost:${port}`);
});
