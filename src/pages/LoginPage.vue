<template>
  <q-layout>
    <div class="fullscreen">
      <q-img
        v-if="!$q.screen.gt.md"
        src="~assets/image/login_bg_mobile.jpg"
        class="absolute"
      />
      <q-img v-else src="~assets/image/login_bg_2.jpg" class="absolute" />
      <div class="row q-col-gutter-md window-height z-top">
        <div class="col-12">
          <div
            class="flex items-center flex-xs-center full-height absolute"
            :style="
              $q.screen.xs || $q.screen.sm ? 'width:100%;top:20%' : 'right: 5%'
            "
          >
            <q-card
              flat
              class="cardBorder text-dark q-pa-xs-lg q-pa-sm-xl"
              :style="
                $q.screen.xs || $q.screen.sm ? 'width: 90%' : 'min-width: 450px'
              "
            >
              <q-form @submit="handleSubmit">
                <div class="flex flex-center q-mb-md">
                  <q-img
                    src="~assets/image/login_logo.png"
                    style="width: 150px"
                  />
                </div>
                <q-input
                  dense
                  v-model="account"
                  label="帳號"
                  name="account"
                  type="text"
                  id="account"
                  :rules="[(val) => (val && val.length > 0) || '請輸入帳號']"
                />
                <q-input
                  dense
                  v-model="loginData.password"
                  :type="isPwd ? 'password' : 'text'"
                  label="密碼"
                  name="password"
                  id="current-password"
                  :rules="[(val) => (val && val.length > 0) || '請輸入密碼']"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <div class="flex justify-between items-center">
                  <q-checkbox v-model="isRememberMe" label="記住我" />
                  <q-btn style="text-decoration: underline" flat
                    >忘記密碼</q-btn
                  >
                </div>
                <q-card-actions>
                  <q-btn
                    unelevated
                    type="submit"
                    color="primary"
                    class="full-width q-mb-md"
                    >登入</q-btn
                  >
                  <div class="full-width text-center">
                    還沒有帳號嗎 ? 從
                    <RouterLink to="/register" class="text-primary text-bold"
                      >這裡</RouterLink
                    >
                    開始註冊
                  </div>
                </q-card-actions>
                <div></div>
              </q-form>
            </q-card>
          </div>
        </div>
        <q-footer elevated class="q-pa-sm" style="background: #575958">
          <div class="flex justify-xs-center justify-md-end">
            <span
              class="block text-bold"
              :class="$q.screen.xs || $q.screen.sm ? '' : 'text-h6'"
              >版權所有：水星工程科技有限公司</span
            >
          </div>
        </q-footer>
      </div>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
// pinia
import { storeToRefs } from 'pinia';
import { LoginPartialParams, LoginRequest } from 'src/api/basic';
import { useUserStore } from 'src/stores/user';
// utils
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// 生出設備指紋
const visitorId = ref('');
const fpPromise = FingerprintJS.load();
fpPromise
  .then((fp) => fp.get())
  .then((result) => {
    visitorId.value = result.visitorId;
    console.log('visitorId', visitorId.value);
  })
  .catch((error) => console.error(error));

const userStore = useUserStore();
const { fcmToken } = storeToRefs(userStore);

const router = useRouter();
const route = useRoute();
const $q = inject('$q') as typeof QVueGlobals;

const isPwd = ref(true);

const account = ref('');
const loginData = reactive<LoginRequest>({
  account: '',
  email: '',
  phoneNumber: '',
  password: '',
  visitorId: '',
  loginProvider: 'Web',
  token: '',
});
watch(
  fcmToken,
  (val) => {
    if (val && val.length > 0) {
      loginData.token = val;
    }
  },
  { immediate: true }
);
watch(
  visitorId,
  (val) => {
    if (val && val.length > 0) {
      loginData.visitorId = val;
    }
  },
  { immediate: true }
);
// TODO: 之後要拔掉
// account.value = "test1";
// loginData.password = "p@$$w0rd";

function determineAccountString(
  accounrString: string
): 'email' | 'phoneNumber' | 'account' {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneNumberPattern = /^\d{10}$/;
  if (emailPattern.test(accounrString)) {
    loginData.account = '';
    loginData.phoneNumber = '';
    return 'email';
  } else if (phoneNumberPattern.test(accounrString)) {
    loginData.account = '';
    loginData.email = '';
    return 'phoneNumber';
  } else {
    loginData.email = '';
    loginData.phoneNumber = '';
    return 'account';
  }
}

type Info = LoginPartialParams & { password: string };
async function handleSubmit() {
  console.log('handleSubmit');
}

const isRememberMe = ref(false);

onMounted(() => {
  const info = localStorage.getItem('info');
  if (info) {
    const parsedInfo = JSON.parse(info);
    Object.keys(parsedInfo).forEach((key) => {
      if (key === 'password') {
        loginData.password = parsedInfo[key];
      } else {
        account.value = parsedInfo[key];
      }
    });
    isRememberMe.value = true;
  }
});

// 展場硬寫
onMounted(() => {
  if (router.currentRoute.value.query?.nfc === '1') {
    account.value = '滅火班';
    loginData.password = 'p@$$w0rd';
  } else if (router.currentRoute.value.query?.nfc === '2') {
    account.value = '避難引導班';
    loginData.password = 'p@$$w0rd';
  } else if (router.currentRoute.value.query?.nfc === '3') {
    account.value = '救護班';
    loginData.password = 'p@$$w0rd';
  } else if (router.currentRoute.value.query?.nfc === '4') {
    account.value = '安全防護班';
    loginData.password = 'p@$$w0rd';
  } else if (router.currentRoute.value.query?.nfc === '5') {
    account.value = '通報班';
    loginData.password = 'p@$$w0rd';
  } else if (router.currentRoute.value.query?.nfc === '6') {
    account.value = '住戶';
    loginData.password = 'p@$$w0rd';
  } else if (router.currentRoute.value.query?.nfc === '7') {
    // account.value = "";
    // loginData.password = "p@$$w0rd";
  }
});
</script>
<style lang="scss" scoped>
.absolute-top-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.cardBorder {
  border: 8px solid transparent;
  border-image: linear-gradient(to right, #e1ca87 0%, #8096ce 100%);
  border-image-slice: 1;
}
</style>
