<template>
  <q-dialog v-model="visible">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 400px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">{{ dataLabel }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section
        class="q-mx-lg q-mt-lg q-pa-none"
        style="border: 1px solid rgb(164, 164, 164); border-radius: 5px"
        v-if="dialogConfig && dialogConfig.length"
      >
        <q-scroll-area style="height: 33vh">
          <q-list :dense="$q.screen.xs || $q.screen.sm">
            <div
              class="flex justify-center q-ma-md"
              v-if="dialogData.mugShotUrl"
            >
              <q-img
                :src="dialogData.mugShotUrl"
                style="height: 120px; width: 120px"
              ></q-img>
            </div>
            <template v-for="item in dialogConfig" :key="item.id">
              <q-item
                style="align-items: flex-start"
                v-if="item.isDialogConfig !== false"
              >
                <q-item-section>
                  <q-item-label>{{ item.label }}</q-item-label>
                </q-item-section>

                <q-item-section
                  side
                  style="
                    width: 65%;
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: pre-wrap;
                  "
                >
                  <span v-if="item.func">
                    {{ item.func(dialogData[item.name]) }}
                  </span>

                  <span v-else-if="item.name === 'fullTypeValues'">
                    {{ dialogData.fullTypeCh }}
                  </span>
                  <span v-else-if="item.name === 'maintainFrequency'">
                    {{ dialogData.maintainFrequencyCh }}
                  </span>

                  <span v-else-if="item.formType === 'selectString'">
                    {{
                      dialogData[item.name]?.name ||
                      dialogData[item.name]?.label
                    }}
                  </span>

                  <span v-else>{{ dialogData[item.name] }}</span>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </q-card-section>
      <q-card-section align="center" class="q-mb-md">
        <slot name="btn">
          <q-btn color="primary" @click="visible = false">確定</q-btn>
        </slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { tempDataType, tableConfigItem } from "src/utils/tableMixin";
import { useVModel } from "@vueuse/core";
import FileReadMixin from "src/utils/fileRead";

const $q = inject("$q") as typeof QVueGlobals;

const props = defineProps<{
  visible: boolean;
  dataLabel: string;
  dialogConfig?: tableConfigItem[];
  dialogData: tempDataType;
}>();
const emit = defineEmits(["update:visible"]);
const visible = useVModel(props, "visible", emit);

const { getFile } = FileReadMixin();

watch(
  () => props.dialogData,
  async (val) => {
    if (val && val.mugShotFileId) {
      const url = await getFile(null, val.mugShotFileId);
      val.mugShotUrl = url;
    }
  },
  { immediate: true }
);
</script>

<style scoped></style>
