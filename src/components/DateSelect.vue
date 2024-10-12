<template>
  <q-input
    ref="dateSelect"
    clearable
    :style="{ minWidth, width, marginBottom: dateModel ? '0px' : '19px' }"
    v-model="dateModel"
    mask="date"
    :rules="rules ? rules : dateModel ? ['date'] : []"
  >
    <template v-if="iconLeft" v-slot:prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="dateModel" today-btn :options="dateIsSelectable">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
    <template v-else v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="dateModel" today-btn :options="dateIsSelectable">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import type { ValidationRule } from "quasar";

const props = withDefaults(
  defineProps<{
    dateModel: string | null;
    iconLeft?: boolean;
    minWidth?: string;
    width?: string;
    rules?: ValidationRule[] | undefined;
    disableFuture?: Date;
    disablePast?: Date;
  }>(),
  {
    dateModel: "",
    iconLeft: false,
    minWidth: "150px",
    width: "auto",
  }
);
const emit = defineEmits(["update:dateModel"]);

const dateModel = useVModel(props, "dateModel", emit);

const dateSelect = ref();

function validate() {
  dateSelect.value.validate();
}

defineExpose({
  validate,
});

function dateIsSelectable(currentDate: string) {
  const dateToCheck = new Date(currentDate);
  dateToCheck.setHours(0, 0, 0, 0);

  if (props.disableFuture) {
    const futureDate = new Date(props.disableFuture);
    futureDate.setHours(0, 0, 0, 0);
    if (dateToCheck.getTime() > futureDate.getTime()) {
      return false;
    }
  }

  if (props.disablePast) {
    const pastDate = new Date(props.disablePast);
    pastDate.setHours(0, 0, 0, 0);
    if (dateToCheck.getTime() < pastDate.getTime()) {
      return false;
    }
  }

  return true;
}
</script>

<style scoped></style>
