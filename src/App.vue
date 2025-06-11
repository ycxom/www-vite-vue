<template>
  <VideoBackground :videoSrc="videoSource">
    <!-- 顶部导航 -->
    <header class="site-header" :class="getThemeClasses()">
      <div class="logo-small-wrapper">
        <AvoidanceIcon :avoidanceRadius="120" :maxDistance="40" :speedFactor="0.2" :returnFactor="0.1"
          :enabled="!isLowPerformanceDevice">
          <div class="logo-small">
            <img src="./assets/images/my-logo.png" alt="YCXOM" />
          </div>
        </AvoidanceIcon>
      </div>

      <div class="header-icons">
        <!-- GitHub 链接 -->
        <a href="https://github.com/ycxom" target="_blank" class="icon-link" title="GitHub"
          @click.prevent="handleServiceClick($event, githubService)">
          <IconComponent type="github" :size="24" />
        </a>
      </div>
    </header>

    <!-- 点阵图案 -->
    <DotPattern :dotSize="2" dotColor="rgba(255, 255, 255, 0.3)" :spacing="20" :fadeDistance="100" :zIndex="2"
      :mouseRadius="120" :effectIntensity="0.9" />

    <!-- 主要内容区 -->
    <div class="scrollable-container" :class="getThemeClasses()" :style="getThemeStyles()">
      <div class="main-content">
        <div class="text-section">
          <h1 class="site-title">YCXOM</h1>
          <h2 class="site-subtitle">YCXOM's homepage.</h2>
          <p class="site-description">联系方式 | Contact information | 連絡先</p>

          <!-- 联系按钮 -->
          <div class="contact-buttons">
            <button @click="handleContactClick($event, 'qq', 'https://qm.qq.com/q/TLckIaJGWk')"
              class="contact-button qq" :style="{ '--button-color': getServiceColor('qq') }">
              <IconComponent type="qq" :size="20" />
              <span>QQ</span>
            </button>

            <button @click="handleContactClick($event, 'mail', 'master@ycxom.top')" class="contact-button mail"
              :style="{ '--button-color': getServiceColor('mail') }">
              <IconComponent type="mail" :size="20" />
              <span>Mail</span>
            </button>
          </div>

          <!-- 服务按钮区域 -->
          <div class="services-section">
            <h3 class="services-title">My Services</h3>
            <div class="services-grid">
              <div v-for="service in services" :key="service.id" class="service-card"
                @click="handleServiceClick($event, service)" :style="{
                  '--service-color': getServiceColor(service.id),
                  '--service-hover-color': getServiceHoverColor(service.id)
                }" :class="{
                  'online': serviceStatus[service.id],
                  'offline': !serviceStatus[service.id],
                  'copy-only': service.isCopyOnly
                }">
                <!-- 状态指示器 -->
                <div class="status-indicator" :class="{
                  'online': serviceStatus[service.id],
                  'offline': !serviceStatus[service.id]
                }" :title="serviceStatus[service.id] ? '在线' : '离线'"></div>

                <!-- 服务图标 -->
                <div class="service-icon-wrapper">
                  <IconComponent v-bind="getIconConfig(service)" class="service-icon"
                    :class="{ 'image-icon': isImageIcon(service) }" />
                </div>

                <!-- 服务信息 -->
                <div class="service-info">
                  <div class="service-name">{{ service.name }}</div>
                  <div class="service-description">{{ service.description }}</div>
                </div>

                <!-- 复制指示器 -->
                <div v-if="service.isCopyOnly" class="copy-indicator" title="点击复制">
                  <IconComponent type="copy" :size="16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Logo 区域 -->
        <div class="logo-section">
          <LogoGlow :logoSrc="logoSource" width="300px" glowColor="rgba(255, 192, 203, 0.5)" glowSize="60px"
            :springStrength="0.6" :damping="0.8" :maxStretch="5" :elasticity="0.7" :returnDuration="400" />
        </div>
      </div>

      <!-- 页脚 -->
      <Footer class="footer" owner="YCXOM" icpNumber="2021017838" :theme="isDarkTheme ? 'dark' : 'light'" />
    </div>

    <!-- 页面过渡效果组件 -->
    <div class="page-transition" ref="pageTransition" :class="{ 'dark-theme': isDarkTheme }"></div>
  </VideoBackground>
</template>

<script setup>
import { ref, computed } from 'vue'

// 导入组件
import VideoBackground from './components/VideoBackground.vue'
import DotPattern from './components/DotPattern.vue'
import LogoGlow from './components/LogoGlow.vue'
import Footer from './components/Footer.vue'
import IconComponent from './components/IconComponent.vue'
import AvoidanceIcon from './components/AvoidanceIcon.vue'

// 导入可组合逻辑
import { useTheme } from './composables/useTheme'
import { useTransition } from './composables/useTransition'
import { useServices } from './composables/useServices'

// 导入资源
import backgroundVideo from './assets/video/ANIPLEX.EXE『ATRI -My Dear Moments-』スペシャルアニメーションPV.mp4'
import logoImage from './assets/images/my-logo.png'

// 导入样式
import './assets/styles/main.css'

// 设置响应式状态
const videoSource = ref(backgroundVideo)
const logoSource = ref(logoImage)

// 使用主题逻辑
const {
  isDarkTheme,
  getCurrentThemeInfo,
  getThemeClasses,
  getThemeStyles
} = useTheme({
  storageKey: 'ycxom-theme',
  defaultTheme: 'system',
  enableStorage: true,
  enableTransitions: true
})

// 使用服务状态逻辑
const {
  services,
  serviceStatus,
  brandColors,
  getIconConfig,
  isImageIcon,
  getServiceColor,
  copyToClipboard,
  showToast
} = useServices()

// 使用页面过渡逻辑
const {
  pageTransition,
  handleServiceClick,
  handleContactClick,
  isLowPerformanceDevice
} = useTransition({
  isDarkTheme,
  copyToClipboard,
  showToast,
  brandColors
})

// GitHub 服务配置
const githubService = computed(() => ({
  id: 'github',
  name: 'GitHub',
  url: 'https://github.com/ycxom',
  icon: 'github',
  iconType: 'built-in'
}))

/**
 * 获取服务悬停颜色
 * @param {string} serviceId - 服务ID
 * @returns {string} 悬停颜色
 */
const getServiceHoverColor = (serviceId) => {
  const color = getServiceColor(serviceId)
  return color + '20'
}
</script>