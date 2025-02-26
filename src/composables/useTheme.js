import { ref, onMounted } from 'vue';

export function useTheme() {
  const isDarkTheme = ref(false);
  
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
  
  onMounted(() => {
    const cleanup = detectTheme();
    
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
    
    // 组件卸载时清理
    onUnmounted(() => {
      cleanup();
      observer.disconnect();
    });
  });
  
  return {
    isDarkTheme
  };
}