<template>
  <view class="page">
    <view class="card">
      <view class="title">欢迎使用五行日报助手</view>
      <view class="muted">登录后可同步你的心情、投资记录和五行分析。</view>
    </view>

    <view class="card">
      <view class="subtitle">{{ mode === 'login' ? '登录' : '注册' }}</view>

      <view class="field" v-if="mode === 'register'">
        <text class="label">昵称</text>
        <input class="input" v-model="form.name" placeholder="请输入昵称" />
      </view>

      <view class="field">
        <text class="label">邮箱</text>
        <input class="input" v-model="form.email" placeholder="请输入邮箱" />
      </view>

      <view class="field">
        <text class="label">密码</text>
        <input class="input" password v-model="form.password" placeholder="请输入密码" />
      </view>

      <button class="button-primary" @click="submit">{{ mode === 'login' ? '登录' : '注册并进入' }}</button>
      <button class="button-secondary" @click="toggleMode" style="margin-top: 16rpx">
        {{ mode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

import { api } from '../../utils/api';
import { setToken } from '../../utils/auth';

const mode = ref<'login' | 'register'>('login');
const form = reactive({
  name: '',
  email: '',
  password: ''
});

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
}

async function submit() {
  if (!form.email || !form.password) {
    uni.showToast({ title: '请填写邮箱和密码', icon: 'none' });
    return;
  }

  const response =
    mode.value === 'login'
      ? await api.login({ email: form.email, password: form.password })
      : await api.register({ email: form.email, password: form.password, name: form.name });

  setToken(response.token);
  uni.reLaunch({ url: '/pages/index/index' });
}
</script>
