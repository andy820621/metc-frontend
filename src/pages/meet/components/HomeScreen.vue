<template>
  <main>
    <div class="wrapper">
      <h1>視訊直播間</h1>

      <q-form class="join-form" @submit.prevent="joinWithName">
        <div class="name-container">
          <q-input
            label="您的名字"
            id="name"
            v-model="name"
            type="text"
            required
          />
          <q-input
            label="Daily 網址"
            id="url"
            v-model="url"
            type="text"
            placeholder="https://your-daily-domain.daily.co/room-name"
            required
          />
        </div>
        <div class="submit-container">
          <q-btn type="submit">進入房間</q-btn>
        </div>
      </q-form>

      <p class="subtext">
        如果收到提示，請選擇 "允許" 以在此通話中使用您的相機和麥克風
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
const props = defineProps<{
  joinCall: (name: string, url: string) => void;
}>();

const name = ref(""); // 使用者名稱
const url = ref(""); // Daily URL

// 定義方法來處理表單提交
const joinWithName = () => {
  props.joinCall(name.value, url.value);
};
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  background-color: #fff;
}
.wrapper {
  max-width: 1200px;
  margin: auto;
  padding: 0 16px;
}
.wrapper p {
  margin: 8px 0;
}
.join-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  margin: auto;
}

.join-form label {
  font-size: 12px;
  color: #6b7785;
  text-align: left;
  margin: 8px 0 4px;
}
.join-form input {
  padding: 8px;
  border: 1px solid #c8d1dc;
  border-radius: 12px;
}
.join-form div {
  display: flex;
  justify-content: center;
}
.join-form .submit-container button {
  padding: 7px 16px 9px;
  font-size: 12px;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  margin-top: 16px;
  margin-bottom: 12px;
  background-color: #1bebb9;
  cursor: pointer;
}
.join-form .name-container {
  flex-direction: column;
}
.subtext {
  font-size: 12px;
  color: #6b7785;
}
</style>
