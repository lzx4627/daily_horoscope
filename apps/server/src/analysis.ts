import type {
  DailyAnalysis,
  DailyReport,
  ElementScores,
  FiveElement,
  InvestmentLog,
  MoodLog,
  UserProfile
} from './types.js';

const baseScores = (): ElementScores => ({
  wood: 0,
  fire: 0,
  earth: 0,
  metal: 0,
  water: 0
});

const increment = (scores: ElementScores, element: FiveElement, value: number): void => {
  scores[element] += value;
};

const moodTagRules: Record<string, Partial<ElementScores>> = {
  开心: { wood: 2, fire: 1 },
  平静: { water: 2, wood: 1 },
  焦虑: { metal: 2, water: 2 },
  烦躁: { fire: 3, metal: 1 },
  低落: { water: 3, earth: 1 },
  疲惫: { earth: 2, water: 2 },
  自信: { wood: 2, fire: 2 },
  犹豫: { earth: 2, water: 1, metal: 1 }
};

const strategyRules: Array<{ match: RegExp; scores: Partial<ElementScores> }> = [
  { match: /追涨|短线|打板/i, scores: { fire: 2, metal: 1 } },
  { match: /价值|长线|基本面/i, scores: { earth: 2, wood: 1 } },
  { match: /定投|网格/i, scores: { earth: 2, water: 1 } },
  { match: /空仓|防守|避险/i, scores: { metal: 2, water: 1 } }
];

const activityMap: Record<FiveElement, string[]> = {
  wood: ['安排晨间散步或拉伸', '适合整理计划与复盘目标'],
  fire: ['减少高频信息摄入', '优先做简单而确定的事项'],
  earth: ['适合做预算整理与日程归档', '规律饮食并保持作息稳定'],
  metal: ['进行规则检查和风险清单梳理', '给自己留一点安静空间'],
  water: ['适合阅读、记录与深度思考', '晚间尽量提早休息']
};

const cautionMap: Record<FiveElement, string[]> = {
  wood: ['避免目标过多导致分散执行力', '不要因乐观而忽视止损纪律'],
  fire: ['避免情绪化交易与冲动加仓', '少做临盘追涨决策'],
  earth: ['避免拖延复盘与过度保守', '不要积压情绪到夜间'],
  metal: ['避免过度自我批评影响判断', '不要反复修改既定计划'],
  water: ['避免犹豫不决错过关键执行点', '不要熬夜放大负面情绪']
};

const recommendationMap: Record<FiveElement, { mood: string[]; investment: string[] }> = {
  wood: {
    mood: ['把压力拆分成 3 个可完成的小目标', '通过户外活动恢复行动力'],
    investment: ['优先观察成长型机会，但先设好止盈止损', '允许试仓，不做重仓冲动交易']
  },
  fire: {
    mood: ['先降低刺激源，再做情绪记录', '出现烦躁时暂停重要决策 30 分钟'],
    investment: ['明日控制仓位，避免高频追涨', '把交易次数压缩到 1 到 2 次以内']
  },
  earth: {
    mood: ['用固定作息和饮食稳定状态', '把困扰写下来，减少内耗'],
    investment: ['优先做仓位管理和计划执行', '关注稳健标的，不急于证明判断']
  },
  metal: {
    mood: ['给自己设置可接受的误差范围', '通过整理环境提升秩序感'],
    investment: ['先做风险复盘，再决定是否开仓', '把止损条件写清楚后再执行']
  },
  water: {
    mood: ['增加睡眠与独处恢复时间', '通过书写梳理焦虑来源'],
    investment: ['先观察市场节奏，不急于出手', '明日以复盘和等待确认信号为主']
  }
};

function applyPartialScores(scores: ElementScores, partial: Partial<ElementScores>): void {
  for (const [element, value] of Object.entries(partial) as Array<[FiveElement, number]>) {
    increment(scores, element, value);
  }
}

function getDominantElement(scores: ElementScores): FiveElement {
  return (Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'earth') as FiveElement;
}

function getWeakestElement(scores: ElementScores): FiveElement {
  return (Object.entries(scores).sort((left, right) => left[1] - right[1])[0]?.[0] ?? 'earth') as FiveElement;
}

export function analyzeDay(profile: UserProfile, mood?: MoodLog, investment?: InvestmentLog): DailyAnalysis {
  const scores = baseScores();

  increment(scores, profile.dominantElement, 2);
  increment(scores, profile.weakElement, -1);

  if (mood) {
    for (const tag of mood.tags) {
      const rule = moodTagRules[tag];
      if (rule) {
        applyPartialScores(scores, rule);
      }
    }

    if (mood.score >= 4) {
      increment(scores, 'wood', 1);
      increment(scores, 'fire', 1);
    }

    if (mood.score <= 2) {
      increment(scores, 'water', 2);
      increment(scores, 'metal', 1);
    }
  }

  if (investment) {
    if (investment.pnl > 0) {
      increment(scores, 'wood', 2);
      increment(scores, 'fire', 1);
    } else if (investment.pnl < 0) {
      increment(scores, 'metal', 2);
      increment(scores, 'water', 2);
    }

    if (investment.positionRatio >= 70) {
      increment(scores, 'fire', 2);
    } else if (investment.positionRatio <= 30) {
      increment(scores, 'metal', 1);
      increment(scores, 'earth', 1);
    }

    for (const rule of strategyRules) {
      if (rule.match.test(investment.strategy)) {
        applyPartialScores(scores, rule.scores);
      }
    }
  }

  const dominantElement = getDominantElement(scores);
  const weakestElement = getWeakestElement(scores);
  const recommendations = recommendationMap[dominantElement];

  return {
    date: mood?.date ?? investment?.date ?? new Date().toISOString().slice(0, 10),
    dominantElement,
    weakestElement,
    scores,
    moodInsight: mood
      ? `今日情绪以${dominantElement}行为主导，${mood.tags.join('、') || '状态平稳'}与五行特征形成明显联动。`
      : '今日暂未记录心情，建议先完成情绪打卡以增强分析准确度。',
    investmentInsight: investment
      ? `投资表现与${dominantElement}行能量相关，当前更需要关注${weakestElement}行对应的平衡与节奏。`
      : '今日暂未记录投资数据，建议补充盈亏与仓位信息以生成更完整策略。',
    recommendations: {
      mood: recommendations.mood,
      investment: recommendations.investment,
      activities: activityMap[weakestElement],
      cautions: cautionMap[dominantElement]
    }
  };
}

export function buildDailyReport(profile: UserProfile, mood?: MoodLog, investment?: InvestmentLog): DailyReport {
  const analysis = analyzeDay(profile, mood, investment);

  const moodSummary = mood
    ? `心情评分 ${mood.score}/5，关键词为 ${mood.tags.join('、') || '未填写'}。${analysis.moodInsight}`
    : '今日没有心情记录，建议保持每日固定时间打卡，方便观察趋势。';

  const investmentSummary = investment
    ? `今日盈亏 ${investment.pnl} 元，收益率 ${investment.pnlRate}% ，仓位 ${investment.positionRatio}% 。${analysis.investmentInsight}`
    : '今日没有投资记录，建议记录盈亏、仓位和策略，以便系统生成更具体建议。';

  const fiveElementSummary = `今日五行以${analysis.dominantElement}偏强、${analysis.weakestElement}偏弱。偏强元素会放大行为惯性，偏弱元素提醒你关注节奏、恢复与风险边界。`;

  const improvementSuggestions = [
    ...analysis.recommendations.mood,
    ...analysis.recommendations.investment
  ];

  const nextDayStrategy = [
    `优先补足${analysis.weakestElement}行相关行动，例如作息、节奏或计划整理。`,
    `根据${profile.riskPreference === 'high' ? '高风险偏好' : profile.riskPreference === 'low' ? '低风险偏好' : '中等风险偏好'}，明日先按计划执行，不做临时加码。`
  ];

  return {
    date: analysis.date,
    moodSummary,
    investmentSummary,
    fiveElementSummary,
    improvementSuggestions,
    nextDayStrategy,
    activities: analysis.recommendations.activities,
    cautions: analysis.recommendations.cautions
  };
}

