// src/composables/useServices.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useServices() {
  // 品牌颜色配置
  const brandColors = {
    'jellyfin': { light: '#00a4dc', dark: '#0088b9' },
    'blog': { light: '#ff7eb9', dark: '#e65a9e' },
    'alist': { light: '#42b983', dark: '#349e6d' },
    'minecraft': { light: '#97c040', dark: '#7d9e36' },
    'cncnet': { light: '#ff5722', dark: '#e34b1e' },
    'qq': { light: '#1aad19', dark: '#159314' },
    'mail': { light: '#4285f4', dark: '#3366cc' },
    'rich_media_api': { light: '#9c27b0', dark: '#7b1fa2' }
  };

  // 服务配置
  const services = ref([
    {
      id: 'jellyfin',
      name: 'Jellyfin',
      description: 'Media Streaming',
      url: 'https://ai.ycxom.top:8096',
      icon: 'jellyfin',
      iconType: 'built-in' // 内置图标
    },
    {
      id: 'blog',
      name: 'Blog',
      description: 'My Thoughts',
      url: 'https://blog.ycxom.top',
      icon: 'blog',
      iconType: 'built-in'
    },
    {
      id: 'alist',
      name: 'Alist',
      description: 'File Sharing',
      url: 'https://pan.ycxom.top',
      icon: 'alist',
      iconType: 'built-in'
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      description: 'mc.ycxom.top',
      url: 'minecraft://connect/mc.ycxom.top',
      icon: 'minecraft',
      iconType: 'built-in',
      noTransition: true
    },
    {
      id: 'cncnet',
      name: 'CNCNet',
      description: 'CNCNet Server',
      url: 'https://cncnet.org/status',
      icon: '/src/assets/images/mo-icon.png', // 使用图片路径
      iconType: 'image', // 图片类型
      iconSize: 32, // 图标大小
      iconAlt: 'CNCNet Logo' // 图片描述
    },
    {
      id: 'rich_media_api',
      name: 'Rich Media API',
      description: 'Media Processing API',
      url: 'https://ai.ycxom.top:3002',
      icon: 'rich_media_api',
      iconType: 'built-in'
    }
  ]);

  const serviceStatus = ref({});

  // 获取图标配置
  const getIconConfig = (service) => {
    const config = {
      type: service.icon,
      size: service.iconSize || 24,
      alt: service.iconAlt || service.name,
      imageClass: service.iconClass || ''
    };

    // 如果是图片类型，确保路径正确
    if (service.iconType === 'image') {
      // 处理相对路径
      if (service.icon.startsWith('/src/')) {
        config.type = service.icon.replace('/src/', './src/');
      }
    }

    return config;
  };

  // 检查是否是图片图标
  const isImageIcon = (service) => {
    return service.iconType === 'image' ||
      /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(service.icon) ||
      service.icon.startsWith('http') ||
      service.icon.startsWith('/') ||
      service.icon.startsWith('./');
  };

  // 获取服务品牌颜色
  const getServiceColor = (serviceId, theme = 'light') => {
    return brandColors[serviceId]?.[theme] || brandColors['mail'][theme];
  };

  // 检查服务状态
  const checkServiceStatus = async () => {
    for (const service of services.value) {
      try {
        // 跳过特殊协议的链接
        if (service.url.startsWith('minecraft://') || service.url === '#') {
          serviceStatus.value[service.id] = true;
          continue;
        }

        // 简单的状态检查（实际项目中可能需要更复杂的检查）
        serviceStatus.value[service.id] = Math.random() > 0.2;
      } catch (error) {
        console.warn(`检查服务 ${service.name} 状态失败:`, error);
        serviceStatus.value[service.id] = false;
      }
    }
  };

  // 复制到剪贴板函数
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(`已复制: ${text}`);
      } else {
        // 回退方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          showToast(`已复制: ${text}`);
        } catch (err) {
          console.error('复制失败:', err);
          showToast('复制失败，请手动复制');
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('复制失败:', err);
      showToast('复制失败，请手动复制');
    }
  };

  // 显示提示条
  const showToast = (message) => {
    // 移除已存在的 toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;

    // 添加样式
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '14px',
      zIndex: '10000',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.classList.add('show');

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
    });
  };

  // 处理服务点击
  const handleServiceClick = (service) => {
    if (service.isCopyOnly) {
      copyToClipboard(service.copyValue || service.url);
      return false; // 阻止默认行为
    }
    return true; // 允许默认行为
  };

  // 检测设备类型
  const detectDevice = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    return { isMobile, isAndroid, isIOS };
  };

  onMounted(() => {
    // 检查服务状态
    checkServiceStatus();
    const statusInterval = setInterval(checkServiceStatus, 60000);

    // 检测移动设备并调整 Minecraft 服务
    const { isMobile, isAndroid } = detectDevice();

    if (isMobile) {
      const minecraftService = services.value.find(s => s.id === 'minecraft');
      if (minecraftService) {
        if (isAndroid) {
          // Android 设备保持原始链接
          minecraftService.description = 'Tap to open MC';
        } else {
          // iOS 设备改为复制模式
          minecraftService.url = '#';
          minecraftService.isCopyOnly = true;
          minecraftService.copyValue = 'mc.ycxom.top';
          minecraftService.description = 'Tap to copy';
        }
      }
    }

    // 组件卸载时清理
    const cleanup = () => {
      clearInterval(statusInterval);
    };

    // 返回清理函数（如果在组合式函数外部使用）
    return cleanup;
  });

  return {
    services,
    serviceStatus,
    brandColors,
    getIconConfig,
    isImageIcon,
    getServiceColor,
    copyToClipboard,
    showToast,
    handleServiceClick,
    detectDevice
  };
}