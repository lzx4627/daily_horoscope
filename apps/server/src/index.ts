import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';

import { analyzeDay, buildDailyReport } from './analysis.js';
import { comparePassword, hashPassword, requireAuth, signToken, type AuthenticatedRequest } from './auth.js';
import {
  createUser,
  findInvestmentByDate,
  findMoodByDate,
  findUserByEmail,
  getProfile,
  getReport,
  initializeDatabase,
  listInvestments,
  listMoods,
  saveInvestment,
  saveMood,
  saveProfile,
  saveReport
} from './storage.js';
import type { AuthResponse, InvestmentLog, MoodLog, UserProfile } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 3100);

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/auth/register', async (request, response) => {
  const { email, password, name } = request.body as { email: string; password: string; name?: string };

  if (!email || !password) {
    response.status(400).json({ message: '邮箱和密码不能为空' });
    return;
  }

  const existedUser = await findUserByEmail(email);
  if (existedUser) {
    response.status(409).json({ message: '该邮箱已注册' });
    return;
  }

  const userId = randomUUID();
  const profile: UserProfile = {
    id: userId,
    name: name || '新用户',
    birthDate: '1990-01-01',
    gender: 'other',
    dominantElement: 'wood',
    weakElement: 'water',
    riskPreference: 'medium',
    investmentPreference: '均衡配置'
  };

  await createUser(
    {
      id: userId,
      email,
      passwordHash: await hashPassword(password)
    },
    profile
  );

  const authResponse: AuthResponse = {
    token: signToken({ userId, email }),
    user: { id: userId, email },
    profile
  };

  response.status(201).json(authResponse);
});

app.post('/api/auth/login', async (request, response) => {
  const { email, password } = request.body as { email: string; password: string };
  const user = await findUserByEmail(email);

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    response.status(401).json({ message: '邮箱或密码错误' });
    return;
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    response.status(404).json({ message: '未找到用户档案' });
    return;
  }

  const authResponse: AuthResponse = {
    token: signToken({ userId: user.id, email: user.email }),
    user: { id: user.id, email: user.email },
    profile
  };

  response.json(authResponse);
});

app.get('/api/profile', requireAuth, async (request: AuthenticatedRequest, response) => {
  response.json(await getProfile(request.auth!.userId));
});

app.put('/api/profile', requireAuth, async (request: AuthenticatedRequest, response) => {
  const currentProfile = await getProfile(request.auth!.userId);
  const profile: UserProfile = {
    ...currentProfile,
    ...request.body,
    id: request.auth!.userId
  } as UserProfile;
  response.json(await saveProfile(profile));
});

app.get('/api/moods', requireAuth, async (request: AuthenticatedRequest, response) => {
  const date = String(request.query.date ?? '');
  response.json(await listMoods(request.auth!.userId, date));
});

app.post('/api/moods', requireAuth, async (request: AuthenticatedRequest, response) => {
  const payload = request.body as Omit<MoodLog, 'id'>;
  const mood: MoodLog = {
    id: randomUUID(),
    date: payload.date,
    score: payload.score,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    note: payload.note ?? ''
  };

  response.status(201).json(await saveMood(request.auth!.userId, mood));
});

app.get('/api/investments', requireAuth, async (request: AuthenticatedRequest, response) => {
  const date = String(request.query.date ?? '');
  response.json(await listInvestments(request.auth!.userId, date));
});

app.post('/api/investments', requireAuth, async (request: AuthenticatedRequest, response) => {
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

  response.status(201).json(await saveInvestment(request.auth!.userId, investment));
});

app.get('/api/analysis/daily', requireAuth, async (request: AuthenticatedRequest, response) => {
  const date = String(request.query.date ?? new Date().toISOString().slice(0, 10));
  const profile = await getProfile(request.auth!.userId);
  const mood = await findMoodByDate(request.auth!.userId, date);
  const investment = await findInvestmentByDate(request.auth!.userId, date);
  response.json(analyzeDay(profile!, mood, investment));
});

app.get('/api/reports/:date', requireAuth, async (request: AuthenticatedRequest, response) => {
  const date = Array.isArray(request.params.date) ? request.params.date[0] : request.params.date;
  const report = await getReport(request.auth!.userId, date);

  if (!report) {
    response.status(404).json({ message: '未找到该日期日报' });
    return;
  }

  response.json(report);
});

app.post('/api/reports/daily', requireAuth, async (request: AuthenticatedRequest, response) => {
  const date = String(request.body.date ?? new Date().toISOString().slice(0, 10));
  const profile = await getProfile(request.auth!.userId);
  const mood = await findMoodByDate(request.auth!.userId, date);
  const investment = await findInvestmentByDate(request.auth!.userId, date);
  const report = buildDailyReport(profile!, mood, investment);

  response.status(201).json(await saveReport(request.auth!.userId, report));
});

app.get('/api/overview', requireAuth, async (request: AuthenticatedRequest, response) => {
  const date = String(request.query.date ?? new Date().toISOString().slice(0, 10));
  const profile = await getProfile(request.auth!.userId);
  const mood = await findMoodByDate(request.auth!.userId, date);
  const investment = await findInvestmentByDate(request.auth!.userId, date);
  const report = (await getReport(request.auth!.userId, date)) ?? buildDailyReport(profile!, mood, investment);
  const analysis = analyzeDay(profile!, mood, investment);

  response.json({
    profile,
    mood,
    investment,
    analysis,
    report
  });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`daily-horoscope server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('database initialization failed', error);
    process.exit(1);
  });
