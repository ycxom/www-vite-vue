<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-text">
        <p>版权所有 © {{ currentYear }} {{ owner }}</p>
        <!-- <p v-if="icpNumber">ICP备{{ icpNumber }}号</p> -->
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
    default: '000000000'
  }
});

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.site-footer {
  width: 100%;
  background-color: rgba(13, 15, 22, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  text-align: center;
  padding: 1.5rem 0;
  z-index: 10;
  backdrop-filter: blur(5px);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-text p {
  margin: 0.3rem 0;
}

@media (max-width: 768px) {
  .site-footer {
    font-size: 0.8rem;
    padding: 1rem 0;
  }
}
</style>