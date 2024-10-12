<template>
  <div class="wrapper">
    <div class="permissions-card">
      <h2 class="text-h4">攝影機或是麥克風被禁用中</h2>
      <q-btn @click="reset">再試一次</q-btn>

      <q-btn
        type="a"
        @click.prevent="
          openURL(
            'https://help.daily.co/en/articles/2528184-unblock-camera-mic-access-on-a-computer'
          )
        "
      >
        獲取幫助
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { openURL } from "quasar";
defineProps<{
  reset: () => void;
}>();
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.permissions-card {
  background-color: #2b3f56;
  border-radius: 16px;
  margin: 10px 20px;
  flex: 1 1 350px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
  aspect-ratio: 16/9;
}
h2 {
  color: #f63135;
  margin: 0;
}
button {
  color: #fff;
  background-color: #121a24;
  border: none;
  font-size: 12px;
  border: 1px solid #2b3f56;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  margin: 16px;
}
a {
  color: #fff;
  text-decoration: underline;
  font-size: 12px;
}
</style>
