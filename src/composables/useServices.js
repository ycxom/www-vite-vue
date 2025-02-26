import { ref, onMounted } from 'vue';

export function useServices() {
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

  // 服务配置
  const services = ref([
    {
      id: 'jellyfin',
      name: 'Jellyfin',
      description: 'Media Streaming',
      url: 'https://ai.ycxom.top:8096',
      icon: 'jellyfin'
    },
    {
      id: 'blog',
      name: 'Blog',
      description: 'My Thoughts',
      url: 'https://blog.ycxom.top',
      icon: 'blog'
    },
    {
      id: 'alist',
      name: 'Alist',
      description: 'File Sharing',
      url: 'https://pan.ycxom.top',
      icon: 'alist'
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      description: 'mc.ycxom.top',
      url: 'minecraft://connect/mc.ycxom.top',
      icon: 'minecraft',
      noTransition: true // 不使用过渡效果
    },
    {
      id: 'cncnet',
      name: 'CNCNet',
      description: 'CNCNet Server',
      url: 'https://cncnet.org/status',
      icon: 'cncnet'
    }
  ]);

  const serviceStatus = ref({});

  // 检查服务状态
  const checkServiceStatus = () => {
    services.value.forEach(service => {
      serviceStatus.value[service.id] = Math.random() > 0.2;
    });
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

  onMounted(() => {
    // 检查服务状态
    checkServiceStatus();
    const statusInterval = setInterval(checkServiceStatus, 60000);

    // 检测移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      const minecraftService = services.value.find(s => s.id === 'minecraft');
      if (minecraftService) {
        if (isAndroid) {
          // Android 设备保持原始链接，以便直接打开 Minecraft
          minecraftService.description = 'Tap to open MC';
        } else {
          minecraftService.url = '#';
          minecraftService.isCopyOnly = true;
          minecraftService.copyValue = 'mc.ycxom.top';
          minecraftService.description = 'Tap to copy';
        }
      }
    }

    // 组件卸载时清理
    onUnmounted(() => {
      clearInterval(statusInterval);
    });
  });

  return {
    services,
    serviceStatus,
    brandColors,
    copyToClipboard,
    showToast
  };
}