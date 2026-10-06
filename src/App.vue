<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600&display=swap');

:root {
  --rm-bg: #FFFFFF;
  --rm-text: #141214;
  --rm-text-body: #4A4246;
  --rm-text-secondary: #5E5458;
  --rm-text-muted: #6E6368;
  --rm-border: #E6D1CE;
  --rm-placeholder: #9A8E92;
  --rm-accent: #B3202E;
  --rm-accent-dark: #8E1622;
  --rm-accent-darker: #6E0F19;
  --rm-btn-secondary: #F8D5D2;
  --rm-success: #2E9D6A;
  --rm-success-bg: #E8F5E9;
  --font-heading: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background: var(--rm-bg);
  color: var(--rm-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--rm-accent-dark);
}
a:hover {
  color: var(--rm-accent-darker);
}

#app {
  min-height: 100vh;
}
</style>