<template>
    <svg v-if="type === 'jellyfin'" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M12 .007C5.375.007 0 5.375 0 12s5.375 11.993 12 11.993S24 18.625 24 12 18.625.007 12 .007zm0 2c5.522 0 10 4.477 10 10 0 5.522-4.478 10-10 10-5.523 0-10-4.478-10-10 0-5.523 4.477-10 10-10zM8 5v13l9-6.5z" />
    </svg>
  
    <svg v-else-if="type === 'blog'" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 5h16v3H4V5zm0 5h16v9H4v-9z" />
      <path d="M6 14h10v2H6z" />
      <path d="M6 11h4v2H6z" />
    </svg>
  
    <svg v-else-if="type === 'alist'" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
      <path d="M8 13.5l2.5 3 3.5-4.5 4.5 6H5z" />
    </svg>
  
    <svg v-else-if="type === 'minecraft'" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M4 2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm5 16h6v-2h-6v2zm5-14h-4v2h4V4z" />
      <path d="M2 11h20v2H2z" />
    </svg>
  
    <svg v-else-if="type === 'cncnet'" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M17 10.5V7c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  
    <!-- 默认图标 -->
    <svg v-else viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z" />
    </svg>
  </template>
  
  <script setup>
  defineProps({
    type: {
      type: String,
      default: 'default'
    }
  });
  </script>