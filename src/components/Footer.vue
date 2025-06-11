<!-- src/components/Footer.vue -->
<template>
  <footer class="site-footer" :class="themeClass">
    <div class="footer-content">
      <div class="footer-text">
        <p>版权所有 © {{ currentYear }} {{ owner }}</p>
        <p v-if="icpNumber && showIcp">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="icp-link">
            ICP备{{ icpNumber }}号
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  owner: {
    type: String,
    default: 'YCXOM'
  },
  icpNumber: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'dark',
    validator: (value) => ['light', 'dark'].includes(value)
  },
  showIcp: {
    type: Boolean,
    default: false
  }
});

const currentYear = computed(() => new Date().getFullYear());
const themeClass = computed(() => `footer-${props.theme}`);
</script>