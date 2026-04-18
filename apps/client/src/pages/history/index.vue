<template>
  <view class="page">
    <view class="card">
      <view class="subtitle">心情记录</view>
      <view v-if="moods.length === 0" class="muted">暂无记录</view>
      <view class="list-item" v-for="item in moods" :key="item.id">
        <view>{{ item.date }} · 评分 {{ item.score }}/5</view>
        <view class="muted">{{ item.tags.join('、') || '无标签' }}</view>
      </view>
    </view>

    <view class="card">
      <view class="subtitle">投资记录</view>
      <view v-if="investments.length === 0" class="muted">暂无记录</view>
      <view class="list-item" v-for="item in investments" :key="item.id">
        <view>{{ item.date }} · 盈亏 {{ item.pnl }} 元</view>
        <view class="muted">收益率 {{ item.pnlRate }}%，仓位 {{ item.positionRatio }}%，{{ item.strategy }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

import type { InvestmentLog, MoodLog } from '../../types';
import { api } from '../../utils/api';

const moods = ref<MoodLog[]>([]);
const investments = ref<InvestmentLog[]>([]);

async function loadHistory() {
  moods.value = await api.getMoods();
  investments.value = await api.getInvestments();
}

onShow(() => {
  void loadHistory();
});
</script>

