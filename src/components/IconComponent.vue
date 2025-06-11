<!-- src/components/IconComponent.vue -->
<template>
  <img v-if="isImageFile" :src="type" :alt="alt || 'icon'" :class="['icon-image', imageClass]" :style="imageStyle"
    @error="handleImageError" />

  <svg v-else-if="type === 'jellyfin'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M12 .007C5.375.007 0 5.375 0 12s5.375 11.993 12 11.993S24 18.625 24 12 18.625.007 12 .007zm0 2c5.522 0 10 4.477 10 10 0 5.522-4.478 10-10 10-5.523 0-10-4.478-10-10 0-5.523 4.477-10 10-10zM8 5v13l9-6.5z" />
  </svg>

  <svg v-else-if="type === 'blog'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 5h16v3H4V5zm0 5h16v9H4v-9z" />
    <path d="M6 14h10v2H6z" />
    <path d="M6 11h4v2H6z" />
  </svg>

  <svg v-else-if="type === 'alist'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    <path d="M8 13.5l2.5 3 3.5-4.5 4.5 6H5z" />
  </svg>

  <svg v-else-if="type === 'minecraft'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M4 2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm5 16h6v-2h-6v2zm5-14h-4v2h4V4z" />
    <path d="M2 11h20v2H2z" />
  </svg>

  <svg v-else-if="type === 'cncnet'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>

  <svg v-else-if="type === 'rich_media_api'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>

  <svg v-else-if="type === 'github'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>

  <svg v-else-if="type === 'qq'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-2-2h4l-2 2zm6-2h-2l-2 2-2-2H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V5h8v2z" />
  </svg>

  <svg v-else-if="type === 'mail'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>

  <svg v-else-if="type === 'copy'" viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>

  <svg v-else viewBox="0 0 24 24" fill="currentColor" :style="svgStyle">
    <path
      d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  alt: {
    type: String,
    default: ''
  },
  size: {
    type: [String, Number],
    default: 24
  },
  imageClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['error']);

const isImageFile = computed(() => {
  if (!props.type) return false;

  const imageExtensions = /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i;

  return imageExtensions.test(props.type) ||
    props.type.startsWith('http') ||
    props.type.startsWith('/') ||
    props.type.startsWith('./') ||
    props.type.startsWith('../');
});

const imageStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  objectFit: 'contain'
}));

const svgStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size
}));

const handleImageError = (event) => {
  console.warn('图标加载失败:', props.type);
  emit('error', event);
};
</script>