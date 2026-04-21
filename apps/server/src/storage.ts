import { Pool } from 'pg';

import type {
  DailyReport,
  DatabaseUser,
  InvestmentLog,
  MoodLog,
  UserProfile
} from './types.js';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/daily_horoscope';

export const pool = new Pool({
  connectionString
});

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      gender TEXT NOT NULL,
      dominant_element TEXT NOT NULL,
      weak_element TEXT NOT NULL,
      risk_preference TEXT NOT NULL,
      investment_preference TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mood_logs (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      tags JSONB NOT NULL,
      note TEXT NOT NULL,
      UNIQUE(user_id, date)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS investment_logs (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      pnl DOUBLE PRECISION NOT NULL,
      pnl_rate DOUBLE PRECISION NOT NULL,
      position_ratio DOUBLE PRECISION NOT NULL,
      strategy TEXT NOT NULL,
      note TEXT NOT NULL,
      UNIQUE(user_id, date)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_reports (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      mood_summary TEXT NOT NULL,
      investment_summary TEXT NOT NULL,
      five_element_summary TEXT NOT NULL,
      improvement_suggestions JSONB NOT NULL,
      next_day_strategy JSONB NOT NULL,
      activities JSONB NOT NULL,
      cautions JSONB NOT NULL,
      PRIMARY KEY(user_id, date)
    );
  `);
}

export async function createUser(user: DatabaseUser, profile: UserProfile): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [user.id, user.email, user.passwordHash]
    );
    await client.query(
      `INSERT INTO user_profiles (
        user_id, name, birth_date, gender, dominant_element, weak_element, risk_preference, investment_preference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        profile.id,
        profile.name,
        profile.birthDate,
        profile.gender,
        profile.dominantElement,
        profile.weakElement,
        profile.riskPreference,
        profile.investmentPreference
      ]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserByEmail(email: string): Promise<DatabaseUser | null> {
  const result = await pool.query(
    'SELECT id, email, password_hash AS "passwordHash" FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return result.rows[0] ?? null;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const result = await pool.query(
    `SELECT
      user_id AS id,
      name,
      birth_date AS "birthDate",
      gender,
      dominant_element AS "dominantElement",
      weak_element AS "weakElement",
      risk_preference AS "riskPreference",
      investment_preference AS "investmentPreference"
    FROM user_profiles WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  await pool.query(
    `INSERT INTO user_profiles (
      user_id, name, birth_date, gender, dominant_element, weak_element, risk_preference, investment_preference
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      birth_date = EXCLUDED.birth_date,
      gender = EXCLUDED.gender,
      dominant_element = EXCLUDED.dominant_element,
      weak_element = EXCLUDED.weak_element,
      risk_preference = EXCLUDED.risk_preference,
      investment_preference = EXCLUDED.investment_preference`,
    [
      profile.id,
      profile.name,
      profile.birthDate,
      profile.gender,
      profile.dominantElement,
      profile.weakElement,
      profile.riskPreference,
      profile.investmentPreference
    ]
  );

  return profile;
}

export async function listMoods(userId: string, date?: string): Promise<MoodLog[]> {
  const result = await pool.query(
    `SELECT id, date, score, tags, note
     FROM mood_logs
     WHERE user_id = $1 AND ($2::TEXT = '' OR date = $2)
     ORDER BY date DESC`,
    [userId, date ?? '']
  );
  return result.rows;
}

export async function saveMood(userId: string, mood: MoodLog): Promise<MoodLog> {
  await pool.query(
    `INSERT INTO mood_logs (id, user_id, date, score, tags, note)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, date) DO UPDATE SET
       score = EXCLUDED.score,
       tags = EXCLUDED.tags,
       note = EXCLUDED.note`,
    [mood.id, userId, mood.date, mood.score, JSON.stringify(mood.tags), mood.note]
  );
  return mood;
}

export async function listInvestments(userId: string, date?: string): Promise<InvestmentLog[]> {
  const result = await pool.query(
    `SELECT id, date, pnl, pnl_rate AS "pnlRate", position_ratio AS "positionRatio", strategy, note
     FROM investment_logs
     WHERE user_id = $1 AND ($2::TEXT = '' OR date = $2)
     ORDER BY date DESC`,
    [userId, date ?? '']
  );
  return result.rows;
}

export async function saveInvestment(userId: string, investment: InvestmentLog): Promise<InvestmentLog> {
  await pool.query(
    `INSERT INTO investment_logs (id, user_id, date, pnl, pnl_rate, position_ratio, strategy, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, date) DO UPDATE SET
       pnl = EXCLUDED.pnl,
       pnl_rate = EXCLUDED.pnl_rate,
       position_ratio = EXCLUDED.position_ratio,
       strategy = EXCLUDED.strategy,
       note = EXCLUDED.note`,
    [
      investment.id,
      userId,
      investment.date,
      investment.pnl,
      investment.pnlRate,
      investment.positionRatio,
      investment.strategy,
      investment.note
    ]
  );
  return investment;
}

export async function findMoodByDate(userId: string, date: string): Promise<MoodLog | undefined> {
  const items = await listMoods(userId, date);
  return items[0];
}

export async function findInvestmentByDate(userId: string, date: string): Promise<InvestmentLog | undefined> {
  const items = await listInvestments(userId, date);
  return items[0];
}

export async function getReport(userId: string, date: string): Promise<DailyReport | null> {
  const result = await pool.query(
    `SELECT
      date,
      mood_summary AS "moodSummary",
      investment_summary AS "investmentSummary",
      five_element_summary AS "fiveElementSummary",
      improvement_suggestions AS "improvementSuggestions",
      next_day_strategy AS "nextDayStrategy",
      activities,
      cautions
     FROM daily_reports
     WHERE user_id = $1 AND date = $2
     LIMIT 1`,
    [userId, date]
  );
  return result.rows[0] ?? null;
}

export async function saveReport(userId: string, report: DailyReport): Promise<DailyReport> {
  await pool.query(
    `INSERT INTO daily_reports (
      user_id, date, mood_summary, investment_summary, five_element_summary,
      improvement_suggestions, next_day_strategy, activities, cautions
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_id, date) DO UPDATE SET
      mood_summary = EXCLUDED.mood_summary,
      investment_summary = EXCLUDED.investment_summary,
      five_element_summary = EXCLUDED.five_element_summary,
      improvement_suggestions = EXCLUDED.improvement_suggestions,
      next_day_strategy = EXCLUDED.next_day_strategy,
      activities = EXCLUDED.activities,
      cautions = EXCLUDED.cautions`,
    [
      userId,
      report.date,
      report.moodSummary,
      report.investmentSummary,
      report.fiveElementSummary,
      JSON.stringify(report.improvementSuggestions),
      JSON.stringify(report.nextDayStrategy),
      JSON.stringify(report.activities),
      JSON.stringify(report.cautions)
    ]
  );
  return report;
}
