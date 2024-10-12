<template>
  <q-card class="q-mx-lg" style="border-radius: 0.5rem">
    <q-toolbar class="flex items-center q-gutter-xs q-py-sm q-pl-md">
      <q-btn
        icon="priority_high"
        round
        dense
        color="primary"
        readonly
        size=".58rem"
        class="q-ml-sm"
      />

      <q-toolbar-title
        class="text-bold"
        style="font-size: 17px; letter-spacing: 0.85px"
      >
        無瀏覽此頁面的權限
      </q-toolbar-title>
    </q-toolbar>

    <q-separator />

    <q-card-section
      class="text-bold"
      style="font-size: 1rem; letter-spacing: 0.75px"
    >
      <slot />
    </q-card-section>
  </q-card>
</template>
