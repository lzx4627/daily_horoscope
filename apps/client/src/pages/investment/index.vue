<template>
  <view class="page">
    <view class="card">
      <view class="subtitle">记录投资盈亏</view>

      <view class="field">
        <text class="label">日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="picker-box">{{ form.date }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">今日盈亏（元）</text>
        <input class="input" type="digit" v-model="form.pnl" />
      </view>

      <view class="field">
        <text class="label">收益率（%）</text>
        <input class="input" type="digit" v-model="form.pnlRate" />
      </view>

      <view class="field">
        <text class="label">仓位（%）</text>
        <input class="input" type="number" v-model="form.positionRatio" />
      </view>

      <view class="field">
        <text class="label">策略</text>
        <input class="input" v-model="form.strategy" placeholder="如：短线、价值、定投、观望" />
      </view>

      <view class="field">
        <text class="label">复盘备注</text>
        <textarea class="textarea" v-model="form.note" placeholder="记录今天的交易执行与反思" />
      </view>

      <button class="button-primary" @click="submit">保存投资记录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { api } from '../../utils/api';
import { today } from '../../utils/date';

const form = reactive({
  date: today(),
  pnl: '0',
  pnlRate: '0',
  positionRatio: '50',
  strategy: '均衡配置',
  note: ''
});

function onDateChange(event: { detail: { value: string } }) {
  form.date = event.detail.value;
}

async function submit() {
  await api.saveInvestment({
    date: form.date,
    pnl: Number(form.pnl),
    pnlRate: Number(form.pnlRate),
    positionRatio: Number(form.positionRatio),
    strategy: form.strategy,
    note: form.note
  });
  uni.showToast({ title: '投资记录已保存', icon: 'success' });
}
</script>

