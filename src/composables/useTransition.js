import { ref, onMounted } from 'vue';

export function useTransition(options) {
  const { isDarkTheme, copyToClipboard, showToast } = options;

  const pageTransition = ref(null);
  const currentTransitionTimeout = ref(null);
  const navigationStartTime = ref(null);
  const shouldCancelOnMovement = ref(false);

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
  const forceCleanTransition = () => {
    if (!pageTransition.value) return;

    const transition = pageTransition.value;

    // 移除所有类和内联样式
    transition.className = 'page-transition';
    transition.style.display = 'none';
    transition.style.opacity = '';
    transition.style.backgroundColor = '';
    transition.style.transform = '';
    transition.style.width = '';
    transition.style.height = '';
    transition.style.borderRadius = '';

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
    transition.style.transition = 'opacity 1s ease, background-color 1s ease';

    // 开始淡出 - 先将颜色变为透明
    transition.style.opacity = '0';
    transition.style.backgroundColor = 'rgba(0, 0, 0, 0)';

    // 动画结束后移除元素
    setTimeout(() => {
      forceCleanTransition();
    }, 1000);
  };

  // 执行页面过渡动画和跳转
  const transitionToPage = (url, serviceType, event) => {
    // 低性能设备直接跳转
    if (isLowPerformanceDevice()) {
      window.location.href = url;
      return;
    }

    // 对于特定服务或链接，直接跳转不使用过渡效果
    if ((url.startsWith('mailto:') && !useTransitionForMail) ||
      (serviceType === 'minecraft' && !useTransitionForMinecraft)) {
      window.location.href = url;
      return;
    }

    if (!pageTransition.value) return;

    // 强制清除任何可能残留的过渡状态
    forceCleanTransition();
    shouldCancelOnMovement.value = false; // 重置标记

    // 如果已有一个正在进行的跳转，清除它
    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value);
      currentTransitionTimeout.value = null;
    }

    // 记录跳转开始时间
    navigationStartTime.value = Date.now();

    // 获取点击/触摸位置 (增强对触摸事件的支持)
    let x, y;

    if (event) {
      // 检测是触摸事件还是鼠标事件
      if (event.touches && event.touches[0]) {
        // 触摸事件
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      } else if (event.clientX !== undefined && event.clientY !== undefined) {
        // 鼠标事件
        x = event.clientX;
        y = event.clientY;
      } else {
        // 默认使用屏幕中心
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      }
    } else {
      // 如果没有事件对象，使用屏幕中心
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }

    // 设置过渡样式
    const transition = pageTransition.value;
    const color = getColorForService(serviceType);

    transition.style.backgroundColor = color;
    transition.style.left = `${x}px`;
    transition.style.top = `${y}px`;
    transition.className = 'page-transition' + (isDarkTheme.value ? ' dark-theme' : '');
    transition.style.display = 'block';

    // 增强移动设备的动画性能
    if (isMobileDevice()) {
      // 在移动设备上使用hardware acceleration
      transition.style.willChange = 'transform, opacity, width, height';
      transition.style.webkitBackfaceVisibility = 'hidden';
    }

    // 执行动画序列
    requestAnimationFrame(() => {
      transition.classList.add('lamp-show');

      setTimeout(() => {
        transition.classList.add('expand');

        // 设置跳转执行
        const jumpTimeout = setTimeout(() => {
          window.location.href = url;
          currentTransitionTimeout.value = null;
          shouldCancelOnMovement.value = false;
        }, 600);

        // 存储当前的跳转计时器ID
        currentTransitionTimeout.value = jumpTimeout;

        // 设置超时检测 - 2秒后激活用户移动检测
        setTimeout(() => {
          // 如果还在原页面且超过了2秒
          if (Date.now() - navigationStartTime.value >= 2000 &&
            currentTransitionTimeout.value === jumpTimeout) {

            // 标记为应该在用户移动时取消
            shouldCancelOnMovement.value = true;
          }
        }, 2000); // 2秒后检查

      }, 400);
    });
  };
  // 用户移动检测处理函数
  const handleUserMovement = (event) => {
    // 如果标记为应该取消且有正在进行的跳转，则取消
    if (shouldCancelOnMovement.value && currentTransitionTimeout.value) {
      // 显示提示消息
      showToast('检测到用户操作，跳转已取消');
      // 取消动画
      fadeOutAndClearTransition();
      // 重置标记
      shouldCancelOnMovement.value = false;
    }
  };

  // 处理服务卡片点击
  const handleServiceClick = (event, service) => {
    if (service.isCopyOnly) {
      copyToClipboard(service.copyValue);
      return;
    }
    // 如果是 Minecraft 服务器并且在 Android 设备上
    if (service.icon === 'minecraft' && isAndroidDevice()) {
      // 直接打开 Minecraft 应用
      window.location.href = service.url;
      return;
    }

    // 如果是特殊服务，不使用过渡效果，直接跳转
    if (service.noTransition) {
      window.location.href = service.url;
      return;
    }
    transitionToPage(service.url, service.icon, event);
  };

  // 处理联系按钮点击
  const handleContactClick = (event, type, value) => {
    if (type === 'qq') {
      // copyToClipboard(value); 发现快捷链接，就不复制qq了
      transitionToPage(`${value}`, type, event);
      return;
    }

    // 邮件链接处理
    if (type === 'mail') {
      // 检查是否配置为使用过渡效果
      if (useTransitionForMail.value) {
        transitionToPage(`mailto:${value}`, type, event);
      } else {
        // 直接打开邮件客户端
        window.location.href = `mailto:${value}`;
      }
    }
  };
  // 检测是否为 Android 设备
  // 检测是否为移动设备 (仅用于优化体验，不用于禁用过渡效果)
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // 检测是否为 Android 设备
  const isAndroidDevice = () => {
    return /Android/i.test(navigator.userAgent);
  };
  // 节流函数，限制事件处理频率
  const throttle = (fn, delay) => {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  };

  const throttledUserMovement = throttle(handleUserMovement, 100);

  onMounted(() => {
    // 监听页面卸载事件
    const handleBeforeUnload = () => {
      // 页面正在卸载，不需要执行取消动画
      currentTransitionTimeout.value = null;
    };

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentTransitionTimeout.value) {
        // 页面不可见时，不执行取消动画，可能是正在导航到新页面
        currentTransitionTimeout.value = null;
      }
    };

    // 添加事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', throttledUserMovement);
    document.addEventListener('touchmove', throttledUserMovement);
    document.addEventListener('click', handleUserMovement);
    document.addEventListener('keydown', handleUserMovement);
    document.addEventListener('scroll', throttledUserMovement);

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
      document.removeEventListener('mousemove', throttledUserMovement);
      document.removeEventListener('touchmove', throttledUserMovement);
      document.removeEventListener('click', handleUserMovement);
      document.removeEventListener('keydown', handleUserMovement);
      document.removeEventListener('scroll', throttledUserMovement);

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