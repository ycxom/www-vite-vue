<template>
  <VideoBackground :videoSrc="videoSource">
    <!-- 顶部导航 -->
    <header class="site-header">
      <div class="logo-small">
        <img src="./assets/images/my-logo.png" alt="YCXOM" />
      </div>
      <div class="header-icons">
        <a href="https://github.com/ycxom" target="_blank" class="icon-link" title="GitHub">
          <div class="github-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22">
              </path>
            </svg>
          </div>
        </a>
      </div>
    </header>

    <!-- 点阵图案 -->
    <DotPattern :dotSize="2" dotColor="rgba(255, 255, 255, 0.3)" :spacing="20" :fadeDistance="100" :zIndex="2"
      :mouseRadius="120" :effectIntensity="0.9" />

    <!-- 主要内容区 -->
    <div class="scrollable-container">
      <div class="main-content">
        <div class="text-section">
          <h1 class="site-title">YCXOM</h1>
          <h2 class="site-subtitle">YCXOM’s homepage.</h2>
          <p class="site-description">联系方式 | Contact information | 連絡先</p>
          <div class="contact-buttons">
            <a href="https://qm.qq.com/q/TLckIaJGWk"
              @click.prevent="handleContactClick($event, 'qq', 'https://qm.qq.com/q/TLckIaJGWk')"
              class="contact-button qq">
              <span>QQ</span>
            </a>
            <a href="mailto:master@ycxom.top" @click.prevent="handleContactClick($event, 'mail', 'master@ycxom.top')"
              class="contact-button mail">
              <span>Mail</span>
            </a>
          </div>

          <!-- 添加服务按钮区域 -->
          <div class="services-section">
            <h3 class="services-title">My Services</h3>
            <div class="services-grid">
              <a v-for="service in services" :key="service.id" :href="service.url"
                @click.prevent="handleServiceClick($event, service)" target="_blank" class="service-card">
                <div class="status-indicator" :class="{ online: serviceStatus[service.id] }"></div>
                <div :class="['service-icon', service.icon]">
                  <ServiceIcon :type="service.icon" />
                </div>
                <div class="service-name">{{ service.name }}</div>
                <div class="service-description">{{ service.description }}</div>
              </a>
            </div>
          </div>
        </div>
        <div class="logo-section">
          <LogoGlow :logoSrc="logoSource" width="300px" glowColor="rgba(255, 192, 203, 0.5)" glowSize="60px"
            :springStrength="0.6" :damping="0.8" :maxStretch="5" :elasticity="0.7" :returnDuration="400" />
        </div>
      </div>

      <!-- 页脚 -->
      <Footer class="footer" owner="YCXOM" icpNumber="2021017838" />
    </div>

    <!-- 页面过渡效果组件 -->
    <div class="page-transition" ref="pageTransition" :class="{ 'dark-theme': isDarkTheme }"></div>
  </VideoBackground>
</template>

<script setup>
import { ref } from 'vue';
// 导入组件
import VideoBackground from './components/VideoBackground.vue';
import DotPattern from './components/DotPattern.vue';
import LogoGlow from './components/LogoGlow.vue';
import Footer from './components/Footer.vue';
import ServiceIcon from './components/ServiceIcon.vue';

// 导入可组合逻辑
import { useTheme } from './composables/useTheme';
import { useTransition } from './composables/useTransition';
import { useServices } from './composables/useServices';

// 导入资源
import backgroundVideo from './assets/video/ANIPLEX.EXE『ATRI -My Dear Moments-』スペシャルアニメーションPV.mp4';
import logoImage from './assets/images/my-logo.png';

// 导入样式
import './assets/styles/main.css';

// 设置响应式状态
const videoSource = ref(backgroundVideo);
const logoSource = ref(logoImage);

// 使用主题逻辑
const { isDarkTheme } = useTheme();

// 使用服务状态逻辑
const {
  services,
  serviceStatus,
  copyToClipboard,
  showToast
} = useServices();

// 使用页面过渡逻辑
const {
  pageTransition,
  transitionToPage,
  handleServiceClick,
  handleContactClick
} = useTransition({
  isDarkTheme,
  copyToClipboard,
  showToast
});
</script>