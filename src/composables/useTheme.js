// src/composables/useTheme.js
import { ref, onMounted, onUnmounted, watch } from 'vue';

export function useTheme(options = {}) {
  const {
    storageKey = 'theme-preference',
    defaultTheme = 'system', // 'light', 'dark', 'system'
    enableStorage = true,
    enableTransitions = true
  } = options;

  const isDarkTheme = ref(false);
  const currentTheme = ref(defaultTheme);
  const systemPrefersDark = ref(false);

  // 从本地存储获取主题偏好
  const getStoredTheme = () => {
    if (!enableStorage) return defaultTheme;
    try {
      return localStorage.getItem(storageKey) || defaultTheme;
    } catch (error) {
      console.warn('无法访问 localStorage:', error);
      return defaultTheme;
    }
  };

  // 保存主题偏好到本地存储
  const setStoredTheme = (theme) => {
    if (!enableStorage) return;
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn('无法保存到 localStorage:', error);
    }
  };

  // 检测系统主题偏好
  const detectSystemTheme = () => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark.value = darkModeMediaQuery.matches;

    const handleSystemThemeChange = (e) => {
      systemPrefersDark.value = e.matches;
      updateTheme();
    };

    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
  };

  // 更新实际主题状态
  const updateTheme = () => {
    let shouldBeDark = false;
    switch (currentTheme.value) {
      case 'dark':
        shouldBeDark = true;
        break;
      case 'light':
        shouldBeDark = false;
        break;
      case 'system':
      default:
        shouldBeDark = systemPrefersDark.value;
        break;
    }
    isDarkTheme.value = shouldBeDark;
  };

  // 应用主题到 DOM
  const applyTheme = (dark) => {
    const root = document.documentElement;
    const body = document.body;

    // 添加过渡效果类（如果启用）
    if (enableTransitions) {
      root.style.setProperty('--theme-transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease');
    }

    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
      root.style.setProperty('--theme-mode', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
      root.style.setProperty('--theme-mode', 'light');
    }

    // 设置 CSS 自定义属性
    root.style.setProperty('--is-dark-theme', dark ? '1' : '0');

    // 更新 meta theme-color（用于移动端浏览器）
    updateMetaThemeColor(dark);
  };

  // 更新移动端浏览器主题色
  const updateMetaThemeColor = (dark) => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = dark ? '#121212' : '#ffffff';
  };

  // 设置特定主题
  const setTheme = (theme) => {
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(theme)) {
      console.warn(`未知的主题类型: ${theme}`);
      return;
    }
    currentTheme.value = theme;
    setStoredTheme(theme);
    updateTheme();
  };

  // 切换主题
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 获取当前主题信息
  const getCurrentThemeInfo = () => {
    return {
      current: currentTheme.value,
      isDark: isDarkTheme.value,
      isLight: !isDarkTheme.value,
      isSystem: currentTheme.value === 'system',
      systemPrefersDark: systemPrefersDark.value
    };
  };

  // 检测自定义主题变化（通过 CSS 变量或类名）
  const detectCustomTheme = () => {
    const observer = new MutationObserver(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const customTheme = bodyStyle.getPropertyValue('--theme-mode')?.trim();
      if (customTheme && (customTheme === 'dark' || customTheme === 'light')) {
        const shouldBeDark = customTheme === 'dark';
        if (isDarkTheme.value !== shouldBeDark) {
          isDarkTheme.value = shouldBeDark;
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  };

  // 获取主题相关的 CSS 类
  const getThemeClasses = () => {
    return {
      'theme-light': !isDarkTheme.value,
      'theme-dark': isDarkTheme.value,
      [`theme-${currentTheme.value}`]: true
    };
  };

  // 获取主题相关的样式变量
  const getThemeStyles = () => {
    return {
      '--current-theme': currentTheme.value,
      '--is-dark': isDarkTheme.value ? '1' : '0',
      '--is-light': isDarkTheme.value ? '0' : '1'
    };
  };

  // 监听主题变化并应用到 DOM
  watch(isDarkTheme, (newValue) => {
    applyTheme(newValue);
  }, { immediate: true });

  // 监听当前主题变化
  watch(currentTheme, () => {
    updateTheme();
  });

  onMounted(() => {
    // 初始化主题
    currentTheme.value = getStoredTheme();

    // 设置系统主题检测
    const cleanupSystemTheme = detectSystemTheme();

    // 设置自定义主题检测
    const cleanupCustomTheme = detectCustomTheme();

    // 初始更新主题
    updateTheme();

    // 组件卸载时清理
    onUnmounted(() => {
      cleanupSystemTheme();
      cleanupCustomTheme();
    });
  });

  return {
    // 响应式状态
    isDarkTheme,
    currentTheme,
    systemPrefersDark,

    // 主题控制方法
    toggleTheme,
    setTheme,

    // 信息获取方法
    getCurrentThemeInfo,
    getThemeClasses,
    getThemeStyles,

    // 工具方法
    updateTheme,
    applyTheme
  };
}