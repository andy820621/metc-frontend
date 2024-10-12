<template>
  <div class="card">
    <h2 class="text-h4 q-mx-xs q-mt-none" style="color: #1bebb9">
      等待其他人加入中...
    </h2>
    <h3 class="text-h5 q-mx-xs q-mt-none text-white">
      透過分享此連結邀請其他人：
    </h3>
    <p class="text-h5 q-mx-md q-mt-none text-white">{{ url }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ url: string }>();
</script>

<style>
.card {
  background-color: #2b3f56;
  border-radius: 16px;
  margin: 10px 20px;
  max-width: 50%;
  flex: 1 1 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
  aspect-ratio: 16/9;
}
@media screen and (max-width: 700px) {
  .card {
    max-width: 100%;
    margin: 10px 20px;
  }
}
</style>
