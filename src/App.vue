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
          <h2 class="site-subtitle">A small website for YCXOM.</h2>
          <p class="site-description">Want to contact me?</p>
          <div class="contact-buttons">
            <a href="#" @click.prevent="handleContactClick($event, 'qq', '你的QQ号')" class="contact-button qq">
              <span>QQ</span>
            </a>
            <a href="mailto:your@email.com" @click.prevent="handleContactClick($event, 'mail', 'your@email.com')"
              class="contact-button mail">
              <span>Mail</span>
            </a>
          </div>
          
          <!-- 添加服务按钮区域 -->
          <div class="services-section">
            <h3 class="services-title">My Services</h3>
            <div class="services-grid">
              <a 
                v-for="service in services" 
                :key="service.id" 
                :href="service.url"
                @click.prevent="handleServiceClick($event, service)" 
                target="_blank" 
                class="service-card"
              >
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
          <LogoGlow :logoSrc="logoSource" width="300px" glowColor="rgba(255, 192, 203, 0.5)" glowSize="60px" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VideoBackground from './components/VideoBackground.vue';
import DotPattern from './components/DotPattern.vue';
import LogoGlow from './components/LogoGlow.vue';
import Footer from './components/Footer.vue';
import ServiceIcon from './components/ServiceIcon.vue';

// 导入资源
import backgroundVideo from './assets/video/ANIPLEX.EXE『ATRI -My Dear Moments-』スペシャルアニメーションPV.mp4';
import logoImage from './assets/images/my-logo.png';

// 响应式状态
const videoSource = ref(backgroundVideo);
const logoSource = ref(logoImage);
const serviceStatus = ref({});
const pageTransition = ref(null);
const isDarkTheme = ref(false);

// 品牌颜色配置
const brandColors = {
  'jellyfin': { light: '#00a4dc', dark: '#0088b9' },
  'blog': { light: '#ff7eb9', dark: '#e65a9e' },
  'alist': { light: '#42b983', dark: '#349e6d' },
  'minecraft': { light: '#97c040', dark: '#7d9e36' },
  'cncnet': { light: '#ff5722', dark: '#e34b1e' },
  'qq': { light: '#1aad19', dark: '#159314' },
  'mail': { light: '#4285f4', dark: '#3366cc' }
};

// 默认主题颜色
const defaultColors = {
  light: '#4285f4', // Google蓝
  dark: '#121212'   // Material暗色背景
};

// 服务配置
const services = ref([
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: 'Media Streaming',
    url: 'https://jellyfin.yourdomain.com',
    icon: 'jellyfin'
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'My Thoughts',
    url: 'https://blog.yourdomain.com',
    icon: 'blog'
  },
  {
    id: 'alist',
    name: 'Alist',
    description: 'File Sharing',
    url: 'https://alist.yourdomain.com',
    icon: 'alist'
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    description: 'mc.yourdomain.com',
    url: 'minecraft://connect/mc.yourdomain.com:25565',
    icon: 'minecraft'
  },
  {
    id: 'cncnet',
    name: 'CNCNet',
    description: 'Gaming Server',
    url: 'https://cncnet.yourdomain.com',
    icon: 'cncnet'
  }
]);

// 检测并获取系统主题状态
const detectTheme = () => {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  isDarkTheme.value = darkModeMediaQuery.matches;
  
  // 监听系统主题变化
  const handleThemeChange = (e) => {
    isDarkTheme.value = e.matches;
  };
  
  darkModeMediaQuery.addEventListener('change', handleThemeChange);
  return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
};

// 获取服务对应的颜色
const getColorForService = (serviceType) => {
  if (serviceType && brandColors[serviceType]) {
    return isDarkTheme.value ? brandColors[serviceType].dark : brandColors[serviceType].light;
  }
  return isDarkTheme.value ? defaultColors.dark : defaultColors.light;
};

// 检测低性能设备
const isLowPerformanceDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
};

// 复制到剪贴板函数
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => showToast(`已复制: ${text}`))
    .catch(err => {
      console.error('复制失败:', err);
      showToast('复制失败，请手动复制');
    });
};

// 显示提示条
const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  });
};

// 执行页面过渡动画和跳转
const transitionToPage = (url, serviceType, event) => {
  // 低性能设备直接跳转
  if (isLowPerformanceDevice()) {
    window.location.href = url;
    return;
  }
  
  if (!pageTransition.value) return;
  
  // 获取点击位置
  const x = event?.clientX || window.innerWidth / 2;
  const y = event?.clientY || window.innerHeight / 2;
  
  // 设置过渡样式
  const transition = pageTransition.value;
  const color = getColorForService(serviceType);
  
  transition.style.backgroundColor = color;
  transition.style.left = `${x}px`;
  transition.style.top = `${y}px`;
  transition.className = 'page-transition' + (isDarkTheme.value ? ' dark-theme' : '');
  transition.style.display = 'block';
  
  // 执行动画序列
  requestAnimationFrame(() => {
    transition.classList.add('lamp-show');
    
    setTimeout(() => {
      transition.classList.add('expand');
      
      setTimeout(() => {
        window.location.href = url;
      }, 600);
    }, 400);
  });
};

// 处理服务卡片点击
const handleServiceClick = (event, service) => {
  if (service.isCopyOnly) {
    copyToClipboard(service.copyValue);
    return;
  }
  
  transitionToPage(service.url, service.icon, event);
};

// 处理联系按钮点击
const handleContactClick = (event, type, value) => {
  if (type === 'qq') {
    copyToClipboard(value);
    return;
  }
  
  if (type === 'mail') {
    transitionToPage(`mailto:${value}`, type, event);
  }
};

// 服务状态检查
const checkServiceStatus = () => {
  services.value.forEach(service => {
    serviceStatus.value[service.id] = Math.random() > 0.2;
  });
};

// 生命周期钩子
onMounted(() => {
  // 检测当前主题
  const cleanupThemeDetection = detectTheme();
  
  // 检查服务状态
  checkServiceStatus();
  const statusInterval = setInterval(checkServiceStatus, 60000);
  
  // 检测移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    const minecraftService = services.value.find(s => s.id === 'minecraft');
    if (minecraftService) {
      minecraftService.url = '#';
      minecraftService.isCopyOnly = true;
      minecraftService.copyValue = 'mc.yourdomain.com:25565';
      minecraftService.description = 'Tap to copy';
    }
  }
  
  // 监听自定义主题变化
  const observer = new MutationObserver(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const customTheme = bodyStyle.getPropertyValue('--theme-mode')?.trim();
    
    if (customTheme) {
      isDarkTheme.value = customTheme === 'dark';
    }
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  // 清理函数
  onUnmounted(() => {
    cleanupThemeDetection();
    clearInterval(statusInterval);
    observer.disconnect();
  });
});
</script>

<style>
/* 重置和基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

body {
  overflow: hidden;
}

/* 页面过渡效果 */
.page-transition {
  position: fixed;
  width: 0;
  height: 0;
  border-radius: 50%;
  z-index: 9999;
  display: none;
  pointer-events: none;
  transform: translate(-50%, -50%);
  will-change: transform, width, height, border-radius;
  background-color: #ffffff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.page-transition.dark-theme {
  background-color: #121212;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.page-transition.lamp-show {
  width: 60px;
  height: 80px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: rotate-and-glow-light 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards;
}

.page-transition.dark-theme.lamp-show {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.1);
  animation: rotate-and-glow-dark 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards;
}

.page-transition.expand {
  width: 300vw;
  height: 300vh;
  border-radius: 0;
  transition: all 0.6s cubic-bezier(0.86, 0, 0.07, 1);
}

.page-transition.dark-theme.expand {
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(50, 50, 50, 0.8);
}

@keyframes rotate-and-glow-light {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0);
    opacity: 0;
    filter: brightness(100%) contrast(100%);
  }
  50% {
    filter: brightness(120%) contrast(110%);
  }
  100% {
    transform: translate(-50%, -50%) rotate(720deg) scale(1);
    opacity: 1;
    filter: brightness(110%) contrast(105%);
  }
}

@keyframes rotate-and-glow-dark {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0);
    opacity: 0;
    filter: brightness(40%) contrast(120%);
  }
  50% {
    filter: brightness(50%) contrast(130%);
  }
  100% {
    transform: translate(-50%, -50%) rotate(720deg) scale(1);
    opacity: 1;
    filter: brightness(45%) contrast(125%);
  }
}

/* 页面布局 */
.scrollable-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 3;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  border: 2px solid transparent;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.main-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 2rem 2rem;
  flex: 1;
}

.text-section {
  flex: 1;
  text-align: left;
  padding-right: 2rem;
  position: relative;
  z-index: 5;
  max-width: 600px;
}

.site-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.site-subtitle {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.site-description {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

/* 顶部导航 */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  z-index: 20;
  backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.site-header:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.logo-small {
  height: 30px;
}

.logo-small img {
  height: 100%;
  transition: transform 0.3s;
}

.logo-small:hover img {
  transform: scale(1.1);
}

.header-icons {
  display: flex;
  gap: 1rem;
}

.icon-link {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s;
  padding: 5px;
  border-radius: 50%;
}

.icon-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* 联系按钮 */
.contact-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  position: relative;
  z-index: 10;
}

.contact-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.5rem;
  border-radius: 2rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.contact-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s;
  z-index: -1;
}

.contact-button:hover::before {
  left: 100%;
}

.contact-button.qq {
  background-color: #1aad19;
  color: white;
}

.contact-button.mail {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.contact-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.contact-button:active {
  transform: scale(0.98);
}

.contact-button.qq:hover {
  background-color: #129611;
}

.contact-button.mail:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.contact-button span {
  position: relative;
  z-index: 2;
}

.contact-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.contact-button:active::after {
  animation: ripple 0.4s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20) translate(-50%, -50%);
    opacity: 0;
  }
}

/* 服务区域 */
.services-section {
  margin-top: 2.5rem;
  width: 100%;
}

.services-title {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
  width: 100%;
}

.service-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.7s;
  z-index: -1;
}

.service-card:hover::before {
  left: 100%;
}

.service-card:hover {
  transform: translateY(-5px);
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

.service-card:active {
  transform: scale(0.95);
}

.service-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  transition: transform 0.3s ease, color 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.15);
}

.service-card:active .service-icon {
  transform: scale(0.9);
}

.service-icon svg {
  width: 100%;
  height: 100%;
}

.service-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.25rem;
}

.service-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 服务颜色 */
.service-icon.jellyfin { color: #00a4dc; }
.service-icon.blog { color: #ff7eb9; }
.service-icon.alist { color: #42b983; }
.service-icon.minecraft { color: #97c040; }
.service-icon.cncnet { color: #ff5722; }

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f44336;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 0 0 rgba(244, 67, 54, 0.5);
  animation: pulse-red 2s infinite;
}

.status-indicator.online {
  background-color: #4caf50;
  animation: pulse-green 2s infinite;
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.5); }
  70% { box-shadow: 0 0 0 5px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
}

@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.5); }
  70% { box-shadow: 0 0 0 5px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

/* Logo区域 */
.logo-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 5;
}

/* 页脚 */
.footer {
  width: 100%;
  padding: 1.5rem 0;
  margin-top: auto;
  z-index: 15;
}

/* Toast消息 */
.toast-message {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%) translateY(100px);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 0.9rem;
  z-index: 1000;
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.toast-message.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .main-content {
    flex-direction: column-reverse;
    justify-content: flex-start;
    padding-top: 80px;
    padding-bottom: 80px;
  }
  
  .logo-section {
    margin-bottom: 2rem;
  }
  
  .text-section {
    width: 100%;
    max-width: none;
    padding-right: 0;
    text-align: center;
  }
  
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .services-title {
    text-align: center;
  }
  
  .site-title {
    font-size: 3rem;
  }
  
  .site-subtitle {
    font-size: 1.8rem;
  }
  
  .contact-buttons {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .site-header {
    padding: 1rem;
  }
  
  .main-content {
    padding: 80px 1rem 100px;
  }
  
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .site-title {
    font-size: 2.5rem;
  }
  
  .site-subtitle {
    font-size: 1.5rem;
  }
  
  .site-description {
    font-size: 1.2rem;
  }
  
  .contact-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
  }
  
  .logo-section {
    width: 80%;
  }
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  .service-card {
    background-color: rgba(30, 30, 40, 0.6);
  }
  
  .service-card:hover {
    background-color: rgba(40, 40, 55, 0.8);
  }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .service-card, .contact-button, .icon-link, .logo-small img {
    transition: none;
  }
  
  .service-card:hover, .contact-button:hover {
    transform: none;
  }
  
  .service-card::before, .contact-button::before {
    display: none;
  }
  
  .status-indicator {
    animation: none;
  }
}
</style>