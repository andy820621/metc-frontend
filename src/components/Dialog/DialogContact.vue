<template>
  <q-dialog>
    <q-card :style="$q.platform.is.mobile ? 'width:100%' : 'min-width: 700px'">
      <q-card-section class="row flex-center q-pb-none q-mt-md">
        <div class="text-h5 text-bold">{{ props.titleName }}</div>
      </q-card-section>
      <q-card-section class="flex flex-center">
        <q-card-section
          class="flex justify-between no-wrap col-xs-12 col-md-3 q-pa-xs-none q-pa-sm-md"
        >
          <q-item class="column flex-center q-mr-md">
            <q-avatar :size="props.avatarSize">
              <q-img
                class="fit"
                v-if="account.mugShotUrl !== ''"
                :src="account.mugShotUrl"
                fit="cover"
                placeholder-src="~assets/image/mugShotPlaceHolder.png"
              />
            </q-avatar>

            <div class="text-subtitle1 text-bold q-mt-md q-mb-xs">
              {{ account.fullname }}
            </div>
          </q-item>
          <q-separator vertical inset v-if="$q.screen.gt.md" />
        </q-card-section>
        <q-card-section
          class="col-xs-12 col-md-9 q-mb-md flex-grow-1 q-pa-xs-none q-pa-sm-md"
        >
          <q-list class="column justify-center">
            <q-item clickable>
              <q-item-section class="list">
                <div class="left">
                  <q-icon name="phone" class="cursor-pointer" size="1.3rem" />
                  <span>聯絡電話：</span>
                </div>
                <div class="right">
                  <a
                    v-if="account.phoneNumber || account.contactNumber"
                    :href="`tel:${
                      account.phoneNumber || account.contactNumber
                    }`"
                    >{{ account.phoneNumber || account.contactNumber }}</a
                  >
                  <span v-else>無</span>
                </div>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section class="list">
                <div
                  class="left"
                  :style="!$q.screen.gt.md ? 'width: 6rem' : ''"
                >
                  <q-icon name="email" class="cursor-pointer" size="1.3rem" />
                  <span>Email：</span>
                </div>
                <div class="right">
                  <a :href="`mailto: ${account.email}`" v-if="account.email">
                    {{ account.email }}
                  </a>
                  <span v-else>無</span>
                </div>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section class="list">
                <div class="left">
                  <q-icon name="email" class="cursor-pointer" size="1.3rem" />
                  <span>緊急聯絡人：</span>
                </div>
                <div class="right">
                  {{
                    account.emergencyContact ? account.emergencyContact : '無'
                  }}
                </div>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section class="list">
                <div class="left">
                  <q-icon name="phone" class="cursor-pointer" size="1.3rem" />
                  <span>緊急聯絡人電話：</span>
                </div>
                <div class="right">
                  <a
                    v-if="account.emergencyNumber"
                    :href="`tel:${account.emergencyNumber}`"
                    >{{ account.emergencyNumber }}</a
                  >
                  <span v-else>無</span>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const $q = useQuasar();
const props = defineProps({
  titleName: {
    type: String,
    default: '聯絡方式',
  },
  titleSize: {
    type: String,
    default: '1.5rem',
  },
  avatarSize: {
    type: String,
    default: '120px',
  },
  account: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<style scoped lang="scss">
.list {
  flex-direction: row;
  align-items: center;
  justify-content: start;
  gap: 0;
  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 10rem;
  }
  .right {
    a {
      color: #111;
    }
  }
}
</style>
