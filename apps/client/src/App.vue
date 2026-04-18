<template>
  <slot />
</template>

<style>
page {
  background: #f5f7fb;
  color: #1f2937;
  font-size: 28rpx;
}

view,
text,
button,
input,
textarea,
picker {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  padding: 32rpx;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.muted {
  color: #6b7280;
  line-height: 1.7;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.button-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border-radius: 18rpx;
}

.button-secondary {
  background: #eef2ff;
  color: #4338ca;
  border-radius: 18rpx;
}

.field {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.input,
.textarea,
.picker-box {
  width: 100%;
  background: #f8fafc;
  border: 2rpx solid #e5e7eb;
  border-radius: 18rpx;
  padding: 20rpx 24rpx;
}

.textarea {
  min-height: 180rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #eef2ff;
  color: #4338ca;
}

.tag-active {
  background: #4338ca;
  color: #ffffff;
}

.stat {
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 18rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  margin-top: 10rpx;
}

.list-item {
  padding: 18rpx 0;
  border-bottom: 2rpx solid #f1f5f9;
}
</style>

