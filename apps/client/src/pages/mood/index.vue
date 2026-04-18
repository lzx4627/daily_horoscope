<template>
  <view class="page">
    <view class="card">
      <view class="subtitle">记录今日心情</view>

      <view class="field">
        <text class="label">日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="picker-box">{{ form.date }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">心情分数（1-5）</text>
        <input class="input" type="number" v-model="form.score" />
      </view>

      <view class="field">
        <text class="label">情绪标签</text>
        <view class="tag-row">
          <view
            v-for="tag in tagOptions"
            :key="tag"
            class="tag"
            :class="{ 'tag-active': form.tags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <view class="field">
        <text class="label">备注</text>
        <textarea class="textarea" v-model="form.note" placeholder="记录今天影响心情的事件或想法" />
      </view>

      <button class="button-primary" @click="submit">保存心情记录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { api } from '../../utils/api';
import { today } from '../../utils/date';

const tagOptions = ['开心', '平静', '焦虑', '烦躁', '低落', '疲惫', '自信', '犹豫'];

const form = reactive({
  date: today(),
  score: '3',
  tags: [] as string[],
  note: ''
});

function onDateChange(event: { detail: { value: string } }) {
  form.date = event.detail.value;
}

function toggleTag(tag: string) {
  form.tags = form.tags.includes(tag) ? form.tags.filter((item) => item !== tag) : [...form.tags, tag];
}

async function submit() {
  await api.saveMood({
    date: form.date,
    score: Number(form.score),
    tags: form.tags,
    note: form.note
  });
  uni.showToast({ title: '心情已保存', icon: 'success' });
}
</script>

