<template>
  <view class="page">
    <view class="card">
      <view class="subtitle">个人五行档案</view>

      <view class="field">
        <text class="label">姓名</text>
        <input class="input" v-model="form.name" />
      </view>

      <view class="field">
        <text class="label">出生日期</text>
        <picker mode="date" :value="form.birthDate" @change="onBirthDateChange">
          <view class="picker-box">{{ form.birthDate }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">主导五行</text>
        <picker :range="elements" @change="onElementChange('dominantElement', $event)">
          <view class="picker-box">{{ form.dominantElement }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">偏弱五行</text>
        <picker :range="elements" @change="onElementChange('weakElement', $event)">
          <view class="picker-box">{{ form.weakElement }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">风险偏好</text>
        <picker :range="risks" @change="onRiskChange">
          <view class="picker-box">{{ form.riskPreference }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">投资偏好</text>
        <input class="input" v-model="form.investmentPreference" />
      </view>

      <button class="button-primary" @click="save">保存档案</button>
      <button class="button-secondary" style="margin-top: 16rpx" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';

import { api } from '../../utils/api';
import { clearToken } from '../../utils/auth';
import type { FiveElement, UserProfile } from '../../types';

const elements: FiveElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const risks: UserProfile['riskPreference'][] = ['low', 'medium', 'high'];

const form = reactive<UserProfile>({
  id: 'default-profile',
  name: '体验用户',
  birthDate: '1990-01-01',
  gender: 'other',
  dominantElement: 'wood',
  weakElement: 'water',
  riskPreference: 'medium',
  investmentPreference: '均衡配置'
});

function onBirthDateChange(event: { detail: { value: string } }) {
  form.birthDate = event.detail.value;
}

function onElementChange(field: 'dominantElement' | 'weakElement', event: { detail: { value: string } }) {
  form[field] = elements[Number(event.detail.value)];
}

function onRiskChange(event: { detail: { value: string } }) {
  form.riskPreference = risks[Number(event.detail.value)];
}

async function loadProfile() {
  Object.assign(form, await api.getProfile());
}

async function save() {
  await api.saveProfile(form);
  uni.showToast({ title: '档案已保存', icon: 'success' });
}

function logout() {
  clearToken();
  uni.reLaunch({ url: '/pages/login/index' });
}

onLoad(() => {
  void loadProfile();
});
</script>
