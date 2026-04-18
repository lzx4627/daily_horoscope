<template>
  <view class="page">
    <view class="card">
      <view class="title">五行日报助手</view>
      <view class="muted">每日记录心情与投资盈亏，系统会基于五行规律生成分析和明日建议。</view>
    </view>

    <view class="card">
      <view class="subtitle">今日概览</view>
      <view class="grid">
        <view class="stat">
          <view>主导五行</view>
          <view class="stat-value">{{ overview?.analysis.dominantElement || '-' }}</view>
        </view>
        <view class="stat">
          <view>心情评分</view>
          <view class="stat-value">{{ overview?.mood?.score || '-' }}</view>
        </view>
        <view class="stat">
          <view>今日盈亏</view>
          <view class="stat-value">{{ overview?.investment?.pnl ?? '-' }}</view>
        </view>
        <view class="stat">
          <view>建议重点</view>
          <view class="stat-value">{{ overview?.analysis.weakestElement || '-' }}</view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="subtitle">快捷入口</view>
      <view class="grid">
        <button class="button-primary" @click="navigate('/pages/mood/index')">记录心情</button>
        <button class="button-primary" @click="navigate('/pages/investment/index')">记录投资</button>
        <button class="button-secondary" @click="navigate('/pages/report/index')">查看日报</button>
        <button class="button-secondary" @click="navigate('/pages/history/index')">历史记录</button>
      </view>
    </view>

    <view class="card" v-if="overview">
      <view class="subtitle">今日提示</view>
      <view class="muted">{{ overview.analysis.moodInsight }}</view>
      <view class="muted" style="margin-top: 12rpx">{{ overview.analysis.investmentInsight }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

import type { OverviewResponse } from '../../types';
import { api } from '../../utils/api';
import { today } from '../../utils/date';

const overview = ref<OverviewResponse | null>(null);

async function loadOverview() {
  overview.value = await api.getOverview(today());
}

function navigate(url: string) {
  uni.navigateTo({ url });
}

onShow(() => {
  void loadOverview();
});
</script>

