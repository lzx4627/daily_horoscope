<template>
  <view class="page">
    <view class="card">
      <view class="subtitle">生成日报总结</view>
      <view class="field">
        <text class="label">日期</text>
        <picker mode="date" :value="date" @change="onDateChange">
          <view class="picker-box">{{ date }}</view>
        </picker>
      </view>
      <button class="button-primary" @click="generate">生成今日日报</button>
    </view>

    <view class="card" v-if="report">
      <view class="subtitle">心情总结</view>
      <view class="muted">{{ report.moodSummary }}</view>
    </view>

    <view class="card" v-if="report">
      <view class="subtitle">投资总结</view>
      <view class="muted">{{ report.investmentSummary }}</view>
    </view>

    <view class="card" v-if="report">
      <view class="subtitle">五行分析</view>
      <view class="muted">{{ report.fiveElementSummary }}</view>
    </view>

    <view class="card" v-if="report">
      <view class="subtitle">改进建议</view>
      <view class="list-item" v-for="item in report.improvementSuggestions" :key="item">{{ item }}</view>
    </view>

    <view class="card" v-if="report">
      <view class="subtitle">明日策略</view>
      <view class="list-item" v-for="item in report.nextDayStrategy" :key="item">{{ item }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { DailyReport } from '../../types';
import { api } from '../../utils/api';
import { today } from '../../utils/date';

const date = ref(today());
const report = ref<DailyReport | null>(null);

function onDateChange(event: { detail: { value: string } }) {
  date.value = event.detail.value;
}

async function generate() {
  report.value = await api.generateDailyReport(date.value);
  uni.showToast({ title: '日报已生成', icon: 'success' });
}
</script>

