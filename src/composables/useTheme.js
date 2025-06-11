import { ref, onMounted, onUnmounted, watch } from 'vue'

/**
 * 主题管理可组合逻辑
 * 提供完整的主题切换、存储和系统主题检测功能
 */
export function useTheme(options = {}) {
  const {
    storageKey = 'theme-preference',
    defaultTheme = 'system',
    enableStorage = true,
    enableTransitions = true
  } = options

  // 响应式状态
  const isDarkTheme = ref(false)
  const currentTheme = ref(defaultTheme)
  const systemPrefersDark = ref(false)

  /**
   * 从本地存储获取主题偏好
   * @returns {string} 主题值
   */
  const getStoredTheme = () => {
    if (!enableStorage) return defaultTheme

    try {
      return localStorage.getItem(storageKey) || defaultTheme
    } catch (error) {
      console.warn('无法访问 localStorage:', error)
      return defaultTheme
    }
  }

  /**
   * 保存主题偏好到本地存储
   * @param {string} theme - 主题值
   */
  const setStoredTheme = (theme) => {
    if (!enableStorage) return

    try {
      localStorage.setItem(storageKey, theme)
    } catch (error) {
      console.warn('无法保存到 localStorage:', error)
    }
  }

  /**
   * 检测系统主题偏好
   * @returns {Function} 清理函数
   */
  const detectSystemTheme = () => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = darkModeMediaQuery.matches

    const handleSystemThemeChange = (e) => {
      systemPrefersDark.value = e.matches
      updateTheme()
    }

    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange)
  }

  /**
   * 更新实际主题状态
   */
  const updateTheme = () => {
    let shouldBeDark = false

    switch (currentTheme.value) {
      case 'dark':
        shouldBeDark = true
        break
      case 'light':
        shouldBeDark = false
        break
      case 'system':
      default:
        shouldBeDark = systemPrefersDark.value
        break
    }

    isDarkTheme.value = shouldBeDark
  }

  /**
   * 应用主题到DOM
   * @param {boolean} dark - 是否为深色主题
   */
  const applyTheme = (dark) => {
    const root = document.documentElement
    const body = document.body

    // 添加过渡效果
    if (enableTransitions) {
      root.style.setProperty('--theme-transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease')
    }

    // 应用主题类
    if (dark) {
      root.classList.add('dark')
      root.classList.remove('light')
      body.classList.add('dark-theme')
      body.classList.remove('light-theme')
      root.style.setProperty('--theme-mode', 'dark')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
      body.classList.add('light-theme')
      body.classList.remove('dark-theme')
      root.style.setProperty('--theme-mode', 'light')
    }

    // 设置CSS自定义属性
    root.style.setProperty('--is-dark-theme', dark ? '1' : '0')

    // 更新移动端浏览器主题色
    updateMetaThemeColor(dark)
  }

  /**
   * 更新移动端浏览器主题色
   * @param {boolean} dark - 是否为深色主题
   */
  const updateMetaThemeColor = (dark) => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.name = 'theme-color'
      document.head.appendChild(metaThemeColor)
    }

    metaThemeColor.content = dark ? '#121212' : '#ffffff'
  }

  /**
   * 检测自定义主题变化
   * @returns {Function} 清理函数
   */
  const detectCustomTheme = () => {
    const observer = new MutationObserver(() => {
      const bodyStyle = window.getComputedStyle(document.body)
      const customTheme = bodyStyle.getPropertyValue('--theme-mode')?.trim()

      if (customTheme && (customTheme === 'dark' || customTheme === 'light')) {
        const shouldBeDark = customTheme === 'dark'
        if (isDarkTheme.value !== shouldBeDark) {
          isDarkTheme.value = shouldBeDark
        }
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => observer.disconnect()
  }

  /**
   * 获取主题相关的CSS类
   * @returns {Object} CSS类对象
   */
  const getThemeClasses = () => {
    return {
      'theme-light': !isDarkTheme.value,
      'theme-dark': isDarkTheme.value,
      [`theme-${currentTheme.value}`]: true
    }
  }

  /**
   * 获取主题相关的样式变量
   * @returns {Object} CSS变量对象
   */
  const getThemeStyles = () => {
    return {
      '--current-theme': currentTheme.value,
      '--is-dark': isDarkTheme.value ? '1' : '0',
      '--is-light': isDarkTheme.value ? '0' : '1'
    }
  }

  // 监听主题变化并应用到DOM
  watch(isDarkTheme, (newValue) => {
    applyTheme(newValue)
  }, { immediate: true })

  // 监听当前主题变化
  watch(currentTheme, () => {
    updateTheme()
  })

  // 组件挂载时的初始化
  onMounted(() => {
    currentTheme.value = getStoredTheme()

    const cleanupSystemTheme = detectSystemTheme()
    const cleanupCustomTheme = detectCustomTheme()

    updateTheme()

    onUnmounted(() => {
      cleanupSystemTheme()
      cleanupCustomTheme()
    })
  })

  return {
    // 响应式状态
    isDarkTheme,
    currentTheme,
    systemPrefersDark,

    // 信息获取方法
    getCurrentThemeInfo,
    getThemeClasses,
    getThemeStyles,

    // 工具方法
    updateTheme,
    applyTheme
  }
}