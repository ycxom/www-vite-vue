import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 页面过渡效果可组合逻辑
 * 提供页面跳转的视觉过渡效果
 */
export function useTransition(options) {
  const { isDarkTheme, copyToClipboard, showToast, brandColors } = options

  const pageTransition = ref(null)
  const currentTransitionTimeout = ref(null)

  /**
   * 检测低性能设备
   * @returns {boolean} 是否为低性能设备
   */
  const isLowPerformanceDevice = () => {
    let deviceMemory = 4

    if (navigator && navigator.deviceMemory !== undefined) {
      deviceMemory = navigator.deviceMemory
    } else if (performance && performance.memory) {
      const memoryInfo = performance.memory
      if (memoryInfo.jsHeapSizeLimit) {
        const heapLimitInGB = memoryInfo.jsHeapSizeLimit / (1024 * 1024 * 1024)
        deviceMemory = heapLimitInGB < 4 ? 2 : 4
      }
    }

    const isLowMemory = deviceMemory < 2
    const isOldMobileDevice = /iPhone OS [1-9]_|Android [1-4]\./i.test(navigator.userAgent)
    const prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    return isLowMemory || isOldMobileDevice || prefersReducedMotion
  }

  /**
   * 获取服务对应的颜色
   * @param {string} serviceId - 服务ID
   * @returns {string} 颜色值
   */
  const getColorForService = (serviceId) => {
    const colors = brandColors || {
      'jellyfin': { light: '#00a4dc', dark: '#0088b9' },
      'blog': { light: '#ff7eb9', dark: '#e65a9e' },
      'alist': { light: '#42b983', dark: '#349e6d' },
      'minecraft': { light: '#97c040', dark: '#7d9e36' },
      'cncnet': { light: '#ff5722', dark: '#e34b1e' },
      'qq': { light: '#1aad19', dark: '#159314' },
      'mail': { light: '#4285f4', dark: '#3366cc' },
      'rich_media_api': { light: '#9c27b0', dark: '#7b1fa2' }
    }

    const defaultColors = {
      light: '#4285f4',
      dark: '#121212'
    }

    if (serviceId && colors[serviceId]) {
      return isDarkTheme.value ? colors[serviceId].dark : colors[serviceId].light
    }

    return isDarkTheme.value ? defaultColors.dark : defaultColors.light
  }

  /**
   * 获取服务的实际ID
   * @param {Object} service - 服务对象
   * @returns {string} 服务ID
   */
  const getServiceId = (service) => {
    if (service.iconType === 'image' || isImageIcon(service.icon)) {
      return service.id
    }
    return service.icon || service.id
  }

  /**
   * 检查是否是图片图标
   * @param {string} icon - 图标路径
   * @returns {boolean} 是否为图片图标
   */
  const isImageIcon = (icon) => {
    if (!icon) return false

    const imageExtensions = /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i
    return imageExtensions.test(icon) ||
      icon.startsWith('http') ||
      icon.startsWith('/') ||
      icon.startsWith('./') ||
      icon.startsWith('../')
  }

  /**
   * 彻底清除过渡元素的所有状态
   */
  const forceCleanTransition = () => {
    if (!pageTransition.value) return

    const transition = pageTransition.value
    transition.className = 'page-transition'
    transition.style.display = 'none'
    transition.style.opacity = ''
    transition.style.backgroundColor = ''
    transition.style.transform = 'translate(-50%, -50%)'
    transition.style.width = ''
    transition.style.height = ''
    transition.style.borderRadius = ''
    transition.style.transition = ''
    transition.style.left = '50%'
    transition.style.top = '50%'
  }

  /**
   * 使用透明度淡出并清除
   */
  const fadeOutAndClearTransition = () => {
    if (!pageTransition.value) return

    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value)
      currentTransitionTimeout.value = null
    }

    const transition = pageTransition.value
    transition.style.transition = 'opacity 1s ease'
    transition.style.webkitTransition = 'opacity 1s ease'
    transition.style.opacity = '0'

    setTimeout(() => {
      forceCleanTransition()
    }, 1000)
  }

  /**
   * 执行页面过渡动画和跳转
   * @param {string} url - 目标URL
   * @param {Object|string} service - 服务对象或服务ID
   * @param {Event} event - 点击事件
   */
  const transitionToPage = (url, service, event) => {
    // 低性能设备直接打开新页面
    if (isLowPerformanceDevice()) {
      window.open(url, '_blank')
      return
    }

    if (!pageTransition.value) return

    forceCleanTransition()

    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value)
      currentTransitionTimeout.value = null
    }

    // 获取点击位置
    const x = event?.clientX || window.innerWidth / 2
    const y = event?.clientY || window.innerHeight / 2

    // 设置过渡样式
    const transition = pageTransition.value
    const serviceId = typeof service === 'string' ? service : getServiceId(service)
    const color = getColorForService(serviceId)

    transition.style.backgroundColor = color
    transition.style.left = `${x}px`
    transition.style.top = `${y}px`
    transition.className = 'page-transition' + (isDarkTheme.value ? ' dark-theme' : '')
    transition.style.display = 'block'

    // 执行动画序列
    requestAnimationFrame(() => {
      transition.classList.add('lamp-show')

      setTimeout(() => {
        const viewportWidth = Math.max(
          window.innerWidth,
          document.documentElement.clientWidth,
          screen.width
        ) * 1.2

        const viewportHeight = Math.max(
          window.innerHeight,
          document.documentElement.clientHeight,
          screen.height
        ) * 1.2

        const requiredSize = Math.ceil(
          Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight) * 3
        )

        transition.style.width = `${requiredSize}px`
        transition.style.height = `${requiredSize}px`
        transition.style.borderRadius = '0'
        transition.classList.add('expand')

        setTimeout(() => {
          const rect = transition.getBoundingClientRect()
          if (rect.width < viewportWidth || rect.height < viewportHeight) {
            console.log('检测到覆盖不完全，增加尺寸')
            transition.style.width = `${requiredSize * 1.5}px`
            transition.style.height = `${requiredSize * 1.5}px`
          }

          setTimeout(() => {
            fadeOutTransition()
            window.open(url, '_blank')
          }, 600)
        }, 100)
      }, 400)
    })
  }

  /**
   * 淡化过渡元素
   */
  const fadeOutTransition = () => {
    if (!pageTransition.value) return

    const transition = pageTransition.value
    transition.style.transition = 'opacity 1s ease'
    transition.style.opacity = '0'

    setTimeout(() => {
      forceCleanTransition()
    }, 1000)
  }

  /**
   * 检测设备类型
   * @returns {Object} 设备信息
   */
  const detectDevice = () => {
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isMobile = isAndroid || isIOS || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    return { isAndroid, isIOS, isMobile }
  }

  /**
   * 处理服务卡片点击
   * @param {Event} event - 点击事件
   * @param {Object} service - 服务对象
   */
  const handleServiceClick = (event, service) => {
    // 检查是否是仅复制的服务
    if (service.isCopyOnly) {
      const copyValue = service.copyValue || service.url
      copyToClipboard(copyValue)
      return
    }

    // 检查特殊协议和Android设备
    const { isAndroid } = detectDevice()
    if (service.id === 'minecraft' && isAndroid) {
      if (service.url.startsWith('minecraft://')) {
        window.location.href = service.url
      } else {
        window.open(service.url, '_blank')
      }
      return
    }

    // 如果服务明确标记不使用过渡效果
    if (service.noTransition) {
      window.open(service.url, '_blank')
      return
    }

    // 检查特殊URL
    if (service.url.startsWith('mailto:') ||
      service.url.startsWith('tel:') ||
      service.url.startsWith('sms:')) {
      window.location.href = service.url
      return
    }

    // 正常的过渡效果跳转
    transitionToPage(service.url, service, event)
  }

  /**
   * 处理联系按钮点击
   * @param {Event} event - 点击事件
   * @param {string} type - 联系类型
   * @param {string} value - 联系值
   */
  const handleContactClick = (event, type, value) => {
    if (type === 'qq') {
      transitionToPage(`tencent://message/?uin=${value}`, type, event)
      return
    }

    if (type === 'mail') {
      window.location.href = `mailto:${value}`
      return
    }

    if (type === 'tel') {
      window.location.href = `tel:${value}`
      return
    }

    // 默认处理
    if (value.startsWith('http')) {
      transitionToPage(value, type, event)
    } else {
      copyToClipboard(value)
    }
  }

  // 事件处理函数
  const handleBeforeUnload = () => {
    if (pageTransition.value &&
      getComputedStyle(pageTransition.value).opacity === '1' &&
      pageTransition.value.classList.contains('expand')) {
      fadeOutTransition()
    }
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      if (pageTransition.value && pageTransition.value.style.display !== 'none') {
        forceCleanTransition()
      }
    }
  }

  const handleUnloadEvents = () => {
    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value)
      currentTransitionTimeout.value = null
    }
  }

  // 生命周期钩子
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('beforeunload', handleUnloadEvents)
    window.addEventListener('pagehide', handleUnloadEvents)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadEvents()
      }
    })
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('beforeunload', handleUnloadEvents)
    window.removeEventListener('pagehide', handleUnloadEvents)
    document.removeEventListener('visibilitychange', handleVisibilityChange)

    if (currentTransitionTimeout.value) {
      clearTimeout(currentTransitionTimeout.value)
    }

    forceCleanTransition()
  })

  return {
    pageTransition,
    transitionToPage,
    handleServiceClick,
    handleContactClick,
    getColorForService,
    getServiceId,
    isImageIcon,
    detectDevice
  }
}