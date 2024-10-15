import { defineStore } from 'pinia';

import FileReadMixin from 'src/utils/fileRead';

export const useUserStore = defineStore('user', () => {
  const userMugShotUrl = ref();
  const userData = ref({
    account: '',
    fullname: '',
    password: '',
    emailConfirmed: false,
    roleBuildings: [],
    roleAddressPlates: [],
    addressPlateConfirmeds: {},
    roles: [],
    switchs: 0,
    isCommunityUser: false,
  });
  const roleName = ref<string[]>([]);
  const marshallingName = ref<string>('');
  const marshallingId = ref<string>('');
  const fcmToken = ref<string>('');
  const roleChName = ref<string[]>([]);

  // 編組角色判斷
  const isManagerGroup = computed(
    () =>
      userData.value.isCommunityUser ||
      isCenter.value ||
      isManager.value ||
      isMercury.value ||
      isSystem.value
  );

  const isNormalUser = computed(() => roleName.value.includes('Member'));
  const isFire = computed(() => marshallingName.value === 'Fire'); // 滅火班
  const isInfo = computed(() => marshallingName.value === 'Inform'); // 通報班
  const isGuide = computed(() => marshallingName.value === 'EvacuationGuide'); // 避難引導班
  const isProtection = computed(
    () => marshallingName.value === 'SafetyProtection'
  ); // 安全防護班
  const isAmbulance = computed(() => marshallingName.value === 'Ambulance'); // 救護班
  const isManager = computed(() => roleName.value.includes('Manager')); // 防火管理人
  const isCenter = computed(() => roleName.value.includes('Center')); // 防災中心
  const isMercury = computed(() => roleName.value.includes('Mercury')); // 水星
  const isSystem = computed(() => roleName.value.includes('System')); // 系統管理員

  // 按鈕選項

  function setMarshallingName(name: string) {
    marshallingName.value = name;
  }

  return {
    userMugShotUrl,
    roleName,
    marshallingName,
    roleChName,
    marshallingId,
    userData,
    setMarshallingName,
    fcmToken,
    isNormalUser,
    isFire,
    isInfo,
    isGuide,
    isProtection,
    isAmbulance,
    isManager,
    isCenter,
    isManagerGroup,
    isMercury,
    isSystem,
  };
});
