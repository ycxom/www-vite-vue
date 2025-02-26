<template>
  <div class="logo-container" :style="containerStyle">
    <img :src="logoSrc" alt="Logo" class="logo" />
    <div class="glow-effect"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  logoSrc: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '300px'
  },
  height: {
    type: String,
    default: 'auto'
  },
  glowColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.7)'
  },
  glowSize: {
    type: String,
    default: '70px'
  }
});

const containerStyle = computed(() => {
  return {
    width: props.width,
    height: props.height
  };
});
</script>

<style scoped>
.logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.glow-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  background: v-bind('props.glowColor');
  filter: blur(v-bind('props.glowSize'));
  opacity: 0.8;
  z-index: 1;
  animation: pulse 4s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    filter: blur(v-bind('props.glowSize'));
  }

  50% {
    opacity: 0.8;
    filter: blur(calc(v-bind('props.glowSize') * 1.2));
  }

  100% {
    opacity: 0.5;
    filter: blur(v-bind('props.glowSize'));
  }
}
</style>