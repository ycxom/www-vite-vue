import { ref, onMounted } from 'vue';

export function useTransition(options) {
  const { isDarkTheme, copyToClipboard, showToast } = options;

  const pageTransition = ref(null);
  const currentTransitionTimeout = ref(null);

  // 检测低性能设备 (不再简单地把移动设备视为低性能)
  const isLowPerformanceDevice = () => {
    // 尝试获取设备内存
    let deviceMemory = 4; // 默认假设为4GB

    // 使用navigator.deviceMemory API (如果可用)
    if (navigator && navigator.deviceMemory !== undefined) {
      deviceMemory = navigator.deviceMemory;
    }
    // 尝试使用性能API估算内存
    else if (performance && performance.memory) {
      // Chrome浏览器特有的非标准API
      const memoryInfo = performance.memory;
      if (memoryInfo.jsHeapSizeLimit) {
        // 通过堆大小限制粗略估计设备内存 (单位是字节)
        const heapLimitInGB = memoryInfo.jsHeapSizeLimit / (1024 * 1024 * 1024);
        deviceMemory = heapLimitInGB < 4 ? 2 : 4;
      }
    }

    // 判断是否为低性能设备 (内存小于2GB)
    const isLowMemory = deviceMemory < 2;

    // 添加可选的额外检测
    // 例如检测是否为老旧移动设备 - 可选
    const isOldMobileDevice = /iPhone OS [1-9]_|Android [1-4]\./i.test(navigator.userAgent);

    // 检测是否明确要求减少动画
    const prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return isLowMemory || isOldMobileDevice || prefersReducedMotion;
  };

  // 获取服务对应的颜色
  const getColorForService = (serviceType) => {
    // 品牌颜色
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

    if (serviceType && brandColors[serviceType]) {
      return isDarkTheme.value ? brandColors[serviceType].dark : brandColors[serviceType].light;
    }
    return isDarkTheme.value ? defaultColors.dark : defaultColors.light;
  };

  // 彻底清除过渡元素的所有状态
  // 彻底清除过渡元素的所有状态
  const forceCleanTransition = () => {
    if (!pageTransition.value) return;

    const transition = pageTransition.value;

    // 移除所有类和内联样式
    transition.className = 'page-transition';
    transition.style.display = 'none';
    transition.style.opacity = '';
    transition.style.backgroundColor = '';
    transition.style.transform = 'translate(-50%, -50%)';
    transition.style.width = '';
    transition.style.height = '';
    transition.style.borderRadius = '';
    transition.style.transition = '';

    // 应用默认值
    transition.style.left = '50%';
    transition.style.top = '50%';
  };

  // 使用透明度淡出并清除
  const fadeOutAndClearTransition = () => {
    if (!pageTransition.value) return;

    // 清除计时器
    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value);
      currentTransitionTimeout.value = null;
    }

    const transition = pageTransition.value;

    // 设置透明度过渡
    transition.style.transition = 'opacity 1s ease';
    transition.style.webkitTransition = 'opacity 1s ease';

    // 开始淡出
    transition.style.opacity = '0';

    // 动画结束后移除元素
    setTimeout(() => {
      forceCleanTransition();
    }, 1000);
  };
  // 执行页面过渡动画和跳转
  const transitionToPage = (url, serviceType, event) => {
    // 低性能设备直接打开新页面
    if (isLowPerformanceDevice()) {
      window.open(url, '_blank');
      return;
    }

    if (!pageTransition.value) return;

    // 强制清除任何可能残留的过渡状态
    forceCleanTransition();

    // 如果已有一个正在进行的跳转，清除它
    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value);
      currentTransitionTimeout.value = null;
    }

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
        // 计算视口尺寸 - 使用多种方法确保准确
        const viewportWidth = Math.max(
          window.innerWidth,
          document.documentElement.clientWidth,
          screen.width
        ) * 1.2; // 额外20%确保覆盖

        const viewportHeight = Math.max(
          window.innerHeight,
          document.documentElement.clientHeight,
          screen.height
        ) * 1.2; // 额外20%确保覆盖

        // 计算需要的尺寸 - 取对角线长度的3倍，确保充分覆盖
        const requiredSize = Math.ceil(
          Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight) * 3
        );

        // 直接设置绝对尺寸
        transition.style.width = `${requiredSize}px`;
        transition.style.height = `${requiredSize}px`;
        transition.style.borderRadius = '0';

        // 添加扩展类
        transition.classList.add('expand');

        // 额外检查 - 强制确保尺寸覆盖整个视口
        setTimeout(() => {
          const rect = transition.getBoundingClientRect();
          if (rect.width < viewportWidth || rect.height < viewportHeight) {
            console.log('检测到覆盖不完全，增加尺寸');
            transition.style.width = `${requiredSize * 1.5}px`;
            transition.style.height = `${requiredSize * 1.5}px`;
          }

          // 视觉上的展开完成后，同时开始执行跳转和淡化效果
          setTimeout(() => {
            // 开始淡化效果
            fadeOutTransition();

            // 在新标签页打开链接
            window.open(url, '_blank');
          }, 600); // 展开持续时间
        }, 100);
      }, 400); // 神灯效果持续时间
    });
  };

  // 淡化过渡元素但不立即清除
  const fadeOutTransition = () => {
    if (!pageTransition.value) return;

    const transition = pageTransition.value;

    // 设置渐变淡出效果
    transition.style.transition = 'opacity 1s ease';
    transition.style.opacity = '0';

    // 淡出后再清除元素
    setTimeout(() => {
      forceCleanTransition();
    }, 1000); // 淡出动画持续时间
  };
  // 处理服务卡片点击
  const handleServiceClick = (event, service) => {
    // 如果是仅复制的服务，不执行跳转
    if (service.isCopyOnly) {
      copyToClipboard(service.copyValue);
      return;
    }

    // 如果是 Minecraft 服务器并且在 Android 设备上
    if (service.icon === 'minecraft' && isAndroidDevice()) {
      // 直接打开 Minecraft 应用，不使用过渡效果
      window.location.href = service.url; // 保留这里，因为Android应用需要当前窗口打开
      return;
    }

    // 如果是特殊服务，不使用过渡效果，直接在新标签页打开
    if (service.noTransition) {
      window.open(service.url, '_blank');
      return;
    }

    // 正常的过渡效果跳转
    transitionToPage(service.url, service.icon, event);
  };

  // 处理联系按钮点击
  const handleContactClick = (event, type, value) => {
    // QQ只复制不跳转
    if (type === 'qq') {
      transitionToPage(`${value}`, type, event);
      return;
    }

    // 邮件不使用过渡效果
    if (type === 'mail') {
      window.location.href = `mailto:${value}`; // 保留这里，因为mailto需要当前窗口打开
      return;
    }
  };
  // 检测是否为 Android 设备
  const isAndroidDevice = () => {
    return /Android/i.test(navigator.userAgent);
  };

  onMounted(() => {
    // 监听页面卸载事件
    const handleBeforeUnload = () => {
      // 页面正在卸载，不需要执行取消动画
      if (pageTransition.value &&
        getComputedStyle(pageTransition.value).opacity === '1' &&
        pageTransition.value.classList.contains('expand')) {
        fadeOutTransition();
      }
    };

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 如果页面不可见但过渡元素仍然显示，强制清除它
        if (pageTransition.value && pageTransition.value.style.display !== 'none') {
          forceCleanTransition();
        }
      }
    };

    // 添加事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 页面卸载和可见性事件监听
    const handleUnloadEvents = () => {
      if (currentTransitionTimeout.value) {
        clearTimeout(currentTransitionTimeout.value);
        currentTransitionTimeout.value = null;
      }
    };

    window.addEventListener('beforeunload', handleUnloadEvents);
    window.addEventListener('pagehide', handleUnloadEvents);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadEvents();
      }
    });

    // 组件卸载时清理
    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnloadEvents);
      window.removeEventListener('pagehide', handleUnloadEvents);
      document.removeEventListener('visibilitychange', handleUnloadEvents);

      // 确保清除所有残留状态
      forceCleanTransition();
    });
  });

  return {
    pageTransition,
    transitionToPage,
    handleServiceClick,
    handleContactClick
  };
}