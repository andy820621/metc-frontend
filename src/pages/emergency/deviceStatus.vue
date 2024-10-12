<template>
  <q-page
    class="q-pa-md flex"
    :class="{ 'flex-col': $q.screen.xs || $q.screen.sm }"
  >
    <template v-if="$q.screen.xs || $q.screen.sm">
      <div class="text-h5 text-bold q-mb-md">設備狀況</div>

      <q-card
        flat
        bordered
        class="flex-nowrap flex-col"
        style="width: 100%; flex: 1 0 0"
        ref="mobileCard"
      >
        <q-tabs
          v-model="activeTab.value"
          class="text-grey"
          :class="{ twoTabsPerRow: $q.screen.xs || $q.screen.sm }"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
          outside-arrows
          mobile-arrows
          inline-label
        >
          <q-tab
            v-for="{ label, value } in blockTabs"
            :key="value"
            :label="label"
            :name="value"
          />
        </q-tabs>

        <!-- <q-separator /> -->

        <q-tab-panels v-model="activeTab.value" animated style="flex: 1">
          <q-tab-panel
            class="deviceStatusContainer"
            name="emergencyDeviceStatus"
          >
            <q-card bordered class="deviceBoxsContainer">
              <!-- <q-scroll-area class="fit" :visible="false"> -->
              <div
                class="deviceGridSystem"
                :class="{
                  retractRightSide:
                    !($q.screen.xs || $q.screen.sm) && retractRightSide,
                }"
              >
                <div
                  v-for="([deviceTypeName, deviceArray], idx) in Object.entries(
                    formatedByDeviceType
                  )"
                  :key="idx"
                >
                  <q-card bordered class="text-dark q-pb-sm">
                    <q-card-section
                      class="q-px-md q-py-sm"
                      style="background-color: #e2dfcd"
                    >
                      <div class="text-h6 text-bold text-center">
                        {{ deviceTypeName }}
                      </div>
                    </q-card-section>

                    <q-separator class="q-mb-sm" />

                    <q-scroll-area :visible="false" style="height: 390px">
                      <template
                        v-for="(device, idx) in deviceArray"
                        :key="device.deviceId"
                      >
                        <q-card-section
                          class="deviceBox q-mt-xs q-mx-sm"
                          :class="{
                            'q-mb-sm': idx !== deviceArray.length - 1,
                          }"
                        >
                          <!-- Device Box Tab -->
                          <div class="flexBox flexBoxTab">
                            <div class="grid">
                              <span class="deviceName">
                                {{ device.name }}
                              </span>
                              <span
                                class="devicePosition"
                                v-if="device.floorName"
                              >
                                (
                                {{ device.floorName }}
                                <template v-if="device.location">
                                  - {{ device.location }}
                                </template>
                                )
                              </span>
                            </div>
                            <q-btn
                              v-if="controlAuth"
                              color="primary"
                              dense
                              class="missionBtn"
                              label="發布任務"
                              style="max-height: 2rem"
                              @click="
                                handlePublishedDialogOpen({
                                  name: device.name,
                                  id: device.deviceId as number,
                                })
                              "
                            />
                          </div>

                          <!-- 水位計客製化顯示 -->
                          <template
                            v-if="
                              customDesignEquipTypes.Liquid_Level_Meter ===
                              device.deviceTypeValue
                            "
                          >
                            <div class="flexBox flexBoxContent">
                              <!-- 水位計相關資訊 -->
                              <div class="levelMeterData">
                                <div class="title">總量與法定水量</div>
                                <div>
                                  — 總量:
                                  {{
                                    getTotalVolume(
                                      device.addressData[0].deviceData?.pool
                                    )
                                  }}
                                  噸
                                </div>
                                <div>
                                  — 法定水量 :
                                  {{
                                    getLegalVolume(
                                      device.addressData[0].deviceData?.pool
                                    )
                                  }}
                                  噸
                                </div>
                                <div>
                                  — 目前水量 :
                                  {{
                                    getCurrentVolume(
                                      device.addressData[0].status as number,
                                      device.addressData[0].deviceData?.pool
                                    )
                                  }}
                                  噸 ({{ device.addressData[0].status }}%)
                                </div>
                              </div>
                              <!-- 水箱 -->
                              <div class="waterBox">
                                <div class="innerBox">
                                  <div
                                    class="water"
                                    :style="{
                                      height:
                                        (device.addressData[0].status || 0) +
                                        '%',
                                    }"
                                  ></div>
                                  <div class="percentage">
                                    {{
                                      (device.addressData[0].status || 0) + "%"
                                    }}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <q-separator />

                            <v-chart
                              class="chart"
                              style="height: 200px"
                              :option="device.chartOption"
                              autoresize
                            />
                          </template>

                          <!-- 電梯客製化顯示 -->
                          <template
                            v-else-if="
                              customDesignEquipTypes.Elevator ===
                              device.deviceTypeValue
                            "
                          >
                            <template
                              v-if="
                                device.addressData.length ||
                                Object.keys(device.control).length
                              "
                            >
                              <div class="defaultGridBox">
                                <div class="row items-center">
                                  <span class="q-mr-sm">目前樓層: </span>
                                  <q-chip square>
                                    {{ getElevatorFloor(device.addressData) }}
                                  </q-chip>
                                </div>
                              </div>
                            </template>
                          </template>

                          <!-- 預設顯示 -->
                          <template v-else>
                            <!-- 一般狀態 -->
                            <template
                              v-if="
                                device.addressData.length ||
                                Object.keys(device.control).length
                              "
                            >
                              <div class="defaultGridBox">
                                <template
                                  v-for="(item, id) in device.addressData"
                                  :key="id"
                                >
                                  <q-separator v-if="id" class="q-mb-sm" />

                                  <div>
                                    <div class="row items-center">
                                      <span class="q-mr-sm">狀態</span>
                                      <q-chip
                                        square
                                        :class="{ red: item.status === '關' }"
                                      >
                                        {{ item.status ?? "開" }}
                                      </q-chip>
                                      <!-- 按鈕 -->
                                      <template
                                        v-if="
                                          item.masterId &&
                                          device.control[item.masterId]
                                            ?.length &&
                                          controlAuth
                                        "
                                      >
                                        <div class="pointsBox">
                                          <template
                                            v-for="(btnData, i) in device
                                              .control[item.masterId]"
                                            :key="i"
                                          >
                                            <q-btn-group push>
                                              <q-btn
                                                dense
                                                padding=".24rem .8rem"
                                                push
                                                class="text-primary"
                                                :label="btn.name"
                                                v-for="btn in btnData.deviceStatuses"
                                                :key="btn.name"
                                                @click="
                                                  handleClickDeviceBtn(
                                                    btn,
                                                    btnData.deviceAddress,
                                                    device
                                                  )
                                                "
                                              />
                                            </q-btn-group>
                                          </template>
                                        </div>
                                      </template>
                                    </div>
                                    <!-- 幫浦客製 -->
                                    <div
                                      class="q-ml-auto row items-center q-mt-sm"
                                      style="gap: 0.8rem"
                                      v-if="
                                        device.deviceTypeValue ===
                                        customDesignEquipTypes.Pump
                                      "
                                    >
                                      <div class="flex flex-col items-center">
                                        <div class="text-grey">故障</div>
                                        <div>
                                          <q-icon
                                            :name="uniExclamationOctagon"
                                            size="lg"
                                            color="grey"
                                          />
                                        </div>
                                      </div>

                                      <div class="flex flex-col items-center">
                                        <div class="text-grey">缺水</div>
                                        <div>
                                          <q-icon
                                            :name="uniWaterDropSlash"
                                            size="lg"
                                            color="grey"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </template>
                              </div>
                            </template>

                            <!-- 電源狀態 -->
                            <template
                              v-if="
                                device.powerAddressData.length &&
                                Object.keys(device.powerControl).length
                              "
                            >
                              <q-separator class="q-mx-md" />

                              <div class="defaultGridBox">
                                <template
                                  v-for="(item, id) in device.powerAddressData"
                                  :key="id"
                                >
                                  <q-separator v-if="id" />

                                  <div>
                                    <div class="row items-center">
                                      <span class="q-mr-sm">電源</span>
                                      <q-chip
                                        square
                                        :class="{
                                          negative: item.status === '關',
                                        }"
                                      >
                                        {{ item.status ?? "開" }}
                                      </q-chip>
                                      <!-- 按鈕 -->
                                      <template
                                        v-if="
                                          item.masterId &&
                                          device.powerControl[item.masterId]
                                            ?.length &&
                                          controlAuth
                                        "
                                      >
                                        <div class="pointsBox">
                                          <template
                                            v-for="(btnData, i) in device
                                              .powerControl[item.masterId]"
                                            :key="i"
                                          >
                                            <q-btn-group push>
                                              <q-btn
                                                dense
                                                padding=".24rem .8rem"
                                                push
                                                class="text-primary"
                                                :label="btn.name"
                                                v-for="btn in btnData.deviceStatuses"
                                                :key="btn.name"
                                                @click="
                                                  handleClickDeviceBtn(
                                                    btn,
                                                    btnData.deviceAddress,
                                                    device
                                                  )
                                                "
                                              />
                                            </q-btn-group>
                                          </template>
                                        </div>
                                      </template>
                                    </div>
                                  </div>
                                </template>
                              </div>
                            </template>

                            <!-- 發電機油量客製化顯示 -->
                            <template
                              v-if="
                                device.deviceTypeValue ===
                                customDesignEquipTypes.Dynamotor
                              "
                            >
                              <q-separator class="q-mx-md" />

                              <v-chart
                                class="chart q-pb-sm"
                                style="height: 260px"
                                :option="oilOption"
                                autoresize
                              />
                            </template>
                          </template>
                        </q-card-section>
                      </template>
                    </q-scroll-area>
                  </q-card>
                </div>

                <!-- 客製化電力 -->
                <div class="fixRight">
                  <q-card
                    bordered
                    class="text-dark q-pb-sm"
                    style="height: 100%"
                  >
                    <q-card-section
                      class="q-px-md q-py-sm"
                      style="background-color: #e2dfcd"
                    >
                      <div class="text-h6 text-bold text-center">電力</div>
                    </q-card-section>

                    <q-separator class="q-mb-sm" />

                    <q-scroll-area :visible="false" style="height: 880px">
                      <q-card-section class="deviceBox q-mt-xs q-mx-sm">
                        <!-- Device Box Tab -->
                        <div class="flexBox flexBoxTab">
                          <div class="grid">
                            <span class="deviceName"> L12B PANEL 盤 </span>
                            <span class="devicePosition"> ( 12F ) </span>
                          </div>
                          <q-btn
                            v-if="controlAuth"
                            color="primary"
                            dense
                            class="missionBtn"
                            label="發布任務"
                            style="max-height: 2rem"
                            @click="
                              handlePublishedDialogOpen({
                                name: 'L12B Panel',
                                id: 99999,
                              })
                            "
                          />
                        </div>

                        <v-chart
                          class="chart"
                          style="height: 260px"
                          :option="electricalLoadOption"
                          autoresize
                        />

                        <q-separator />

                        <v-chart
                          class="chart"
                          style="height: 300px"
                          :option="voltageOption"
                          @datazoom="handleVoltageDataZoom"
                          autoresize
                        />

                        <q-separator />

                        <v-chart
                          class="chart"
                          style="height: 240px"
                          :option="electricCurrentOption"
                          autoresize
                        />
                      </q-card-section>
                    </q-scroll-area>
                  </q-card>
                </div>
              </div>
              <!-- </q-scroll-area> -->
            </q-card>
          </q-tab-panel>

          <q-tab-panel name="history">
            <q-card flat bordered class="flex-nowrap flex-col full-height">
              <q-tabs
                v-model="tab"
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
                outside-arrows
                mobile-arrows
                inline-label
              >
                <q-tab
                  v-for="[name, label] in Object.entries(tabObject)"
                  :key="name"
                  :label="label"
                  :name="name"
                  :icon="tab === name ? mdiCheckCircle : undefined"
                />
                <div class="cursor-pointer q-pr-xs-xs">
                  <q-btn
                    color="white"
                    text-color="primary"
                    icon="print"
                    @click.prevent="handlePrint"
                  >
                    <q-tooltip
                      class="text-body2"
                      transition-show="scale"
                      transition-hide="scale"
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      列印
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated style="flex: 1">
                <q-tab-panel
                  v-for="key in Object.keys(tabObject)"
                  :key="key"
                  :name="key"
                  class="q-px-xs q-py-none"
                  :style="`height: ${topPanelHeight}px`"
                >
                  <div class="q-py-xs q-px-sm">
                    <div
                      v-for="(item, index) in tabPanelDataObject[key].value"
                      :key="index"
                      class="flex items-flex-start flex-nowrap"
                      style="gap: 0.24rem"
                    >
                      <div>
                        <q-icon
                          :name="mdiNavigation"
                          style="transform: rotate(90deg)"
                        />
                      </div>
                      <div>
                        <span>{{ item.dateTime }}</span>
                        <span>&nbsp; - &nbsp;</span>
                        <span v-if="item.buildingName">
                          {{ item.buildingName }}&nbsp;
                        </span>
                        <span v-if="item.addressName || item.floorName">
                          {{ item.addressName || item.floorName }}&nbsp;
                        </span>
                        <span v-if="item.areaName">
                          {{ item.areaName }}&nbsp;&nbsp;
                        </span>
                        <span v-if="item.deviceName">
                          {{ item.deviceName }}&nbsp;&nbsp;
                        </span>
                        <span v-if="item.status">{{ item.status }}</span>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </q-tab-panel>

          <q-tab-panel name="postMission">
            <q-card
              bordered
              style="height: calc(100vh - 330px); overflow-y: auto"
            >
              <q-card-section class="q-pb-none">
                <div class="text-h6 text-bold">發布任務</div>
              </q-card-section>

              <q-card-section class="q-pt-none" v-if="controlAuth">
                <div class="flex justify-between">
                  <!-- 班別下拉 -->
                  <q-select
                    :model-value="className"
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    :options="classOptions"
                    @filter="classSelectFilterFunc"
                    @input-value="(val) => (className = val)"
                    option-value="id"
                    option-label="description"
                    :label="!!className ? '' : '班別 *'"
                    dense
                    :style="
                      $q.screen.xs || $q.screen.sm ? 'width:100%' : 'width:45%'
                    "
                    lazy-rules="ondemand"
                    :rules="[
                      (val) =>
                        !val
                          ? '此欄位不得為空'
                          : classOptions
                              ?.map((item) => item.description)
                              .includes(val)
                          ? true
                          : '請選擇正確的班別',
                    ]"
                    ref="classNameSelect"
                    @update:model-value="classNameSelectUpdateFunc"
                  >
                    <template v-if="className" v-slot:append>
                      <q-icon
                        name="cancel"
                        @click.stop.prevent="className = ''"
                        class="cursor-pointer"
                      />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          沒有該物件
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <!-- 設備下拉 -->
                  <q-select
                    :model-value="deviceName"
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    :options="deviceOptions"
                    @filter="deviceSelectFilterFunc"
                    @popup-show="deviceSelectPopupShowFunc"
                    @input-value="(val) => (deviceName = val)"
                    option-value="id"
                    option-label="name"
                    label="設備"
                    dense
                    :style="
                      $q.screen.xs || $q.screen.sm ? 'width:100%' : 'width:45%'
                    "
                    lazy-rules="ondemand"
                    :rules="[
                      (val) =>
                        !val
                          ? '此欄位不得為空'
                          : deviceOptions
                              ?.map((item) => item.name)
                              .includes(val)
                          ? true
                          : '請選擇正確的設備',
                    ]"
                    ref="deviceNameSelect"
                    @update:model-value="deviceNameSelectUpdateFunc"
                  >
                    <template v-if="deviceName" v-slot:append>
                      <q-icon
                        name="cancel"
                        @click.stop.prevent="deviceName = ''"
                        class="cursor-pointer"
                      />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          沒有該物件
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <!-- 任務罐頭訊息下拉 -->
                <q-select
                  :model-value="missionContent"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="missionLazyTextOptions"
                  @filter="missionLazyTextSelectFilterFunc"
                  @input-value="(val) => (missionContent = val)"
                  option-value="id"
                  option-label="label"
                  :label="!!missionContent ? '' : '任務內容 *'"
                  dense
                  lazy-rules="ondemand"
                  :rules="[(val) => !!val || '此欄位不得為空']"
                  ref="missionContentSelect"
                  @update:model-value="missionContentSelectUpdateFunc"
                >
                  <template v-if="missionContent" v-slot:append>
                    <q-icon
                      name="cancel"
                      @click.stop.prevent="missionContent = ''"
                      class="cursor-pointer"
                    />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        沒有該物件
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-btn
                  color="primary"
                  class="full-width q-mt-xs"
                  label="發布任務"
                  icon-right="navigation"
                  @click.prevent="handlePostMission"
                />
              </q-card-section>

              <q-card-section class="q-pt-none">
                <MissionList
                  :tableRowsData="Object.values(missionBlockData).reverse()"
                  :tableHeight="mobilePostMissonHeight + 'px'"
                  :unVisibleColumns="['sendUserName', 'receiveTime']"
                >
                  <template #desktopBtn="{ id, receiveUser }">
                    <div>
                      <span v-if="receiveUser" class="text-primary">
                        {{ receiveUser.fullname }}
                      </span>
                      <q-btn
                        v-if="controlAuth"
                        color="white"
                        text-color="black"
                        label="取消任務"
                        @click.prevent="cancelMission(id)"
                      />
                    </div>
                  </template>
                  <template #mobileBtn="{ id, receiveUser }">
                    <div>
                      <span v-if="receiveUser" class="text-primary">
                        {{ receiveUser.fullname }}
                      </span>
                      <q-btn
                        v-if="controlAuth"
                        color="white"
                        text-color="black"
                        label="取消任務"
                        @click.prevent="cancelMission(id)"
                      />
                    </div>
                  </template>
                </MissionList>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>

    <div
      v-else
      class="flex-grow-1 row deviceStatusContainer full-height no-wrap"
      style="gap: 1rem"
    >
      <!-- 左側 -->
      <q-card bordered class="deviceBoxsContainer">
        <q-scroll-area class="fit" :visible="false">
          <div
            class="deviceGridSystem"
            :class="{
              retractRightSide:
                !($q.screen.xs || $q.screen.sm) && retractRightSide,
            }"
          >
            <div
              v-for="([deviceTypeName, deviceArray], idx) in Object.entries(
                formatedByDeviceType
              )"
              :key="idx"
              :class="{
                levelMeter:
                  deviceArray[0].deviceTypeValue ===
                  customDesignEquipTypes.Liquid_Level_Meter,
              }"
            >
              <q-card bordered class="text-dark q-pb-sm">
                <q-card-section
                  class="q-px-md q-py-sm"
                  style="background-color: #e2dfcd"
                >
                  <div class="text-h6 text-bold text-center">
                    {{ deviceTypeName }}
                  </div>
                </q-card-section>

                <q-separator class="q-mb-sm" />

                <!-- <q-scroll-area :visible="false" style="height: 390px"> -->
                <!-- // TODO: 記得刪掉展場客製化`:style` -->
                <q-scroll-area
                  :visible="false"
                  style="height: 165px"
                  :style="
                    deviceArray[0].deviceTypeValue ===
                    customDesignEquipTypes.Liquid_Level_Meter
                      ? 'height: 412px'
                      : ''
                  "
                >
                  <template
                    v-for="(device, idx) in deviceArray"
                    :key="device.deviceId"
                  >
                    <q-card-section
                      class="deviceBox q-mt-xs q-mx-sm"
                      :class="{ 'q-mb-sm': idx !== deviceArray.length - 1 }"
                    >
                      <!-- Device Box Tab -->
                      <div class="flexBox flexBoxTab">
                        <div>
                          <span class="deviceName">
                            {{ device.name }}
                          </span>
                          <span class="devicePosition" v-if="device.floorName">
                            (
                            {{ device.floorName }}
                            <template v-if="device.location">
                              - {{ device.location }}
                            </template>
                            )
                          </span>
                        </div>
                        <q-btn
                          v-if="controlAuth"
                          color="primary"
                          dense
                          class="missionBtn"
                          label="發布任務"
                          style="max-height: 2rem"
                          @click="
                            handlePublishedDialogOpen({
                              name: device.name,
                              id: device.deviceId as number,
                            })
                          "
                        />
                      </div>

                      <!-- 水位計客製化顯示 -->
                      <template
                        v-if="
                          customDesignEquipTypes.Liquid_Level_Meter ===
                          device.deviceTypeValue
                        "
                      >
                        <div class="flexBox flexBoxContent">
                          <!-- 水位計相關資訊 -->
                          <div class="levelMeterData">
                            <div class="title">總量與法定水量</div>
                            <div>
                              — 總量:
                              {{
                                getTotalVolume(
                                  device.addressData[0].deviceData?.pool
                                )
                              }}
                              噸
                            </div>
                            <div>
                              — 法定水量 :
                              {{
                                getLegalVolume(
                                  device.addressData[0].deviceData?.pool
                                )
                              }}
                              噸
                            </div>
                            <div>
                              — 目前水量 :
                              {{
                                getCurrentVolume(
                                  device.addressData[0].status as number,
                                  device.addressData[0].deviceData?.pool
                                )
                              }}
                              噸 ({{ device.addressData[0].status }}%)
                            </div>
                          </div>
                          <!-- 水箱 -->
                          <div class="waterBox">
                            <div class="innerBox">
                              <div
                                class="water"
                                :style="{
                                  height:
                                    (device.addressData[0].status || 0) + '%',
                                }"
                              ></div>
                              <div class="percentage">
                                {{ (device.addressData[0].status || 0) + "%" }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <q-separator />

                        <v-chart
                          class="chart"
                          style="height: 200px"
                          :option="device.chartOption"
                          autoresize
                        />
                      </template>

                      <!-- 電梯客製化顯示 -->
                      <template
                        v-else-if="
                          customDesignEquipTypes.Elevator ===
                          device.deviceTypeValue
                        "
                      >
                        <template
                          v-if="
                            device.addressData.length ||
                            Object.keys(device.control).length
                          "
                        >
                          <div class="defaultGridBox">
                            <div class="row items-center">
                              <span class="q-mr-sm">目前樓層: </span>
                              <q-chip square>
                                {{ getElevatorFloor(device.addressData) }}
                              </q-chip>
                            </div>
                          </div>
                        </template>
                      </template>

                      <!-- 預設顯示 -->
                      <template v-else>
                        <!-- 一般狀態 -->
                        <template
                          v-if="
                            device.addressData.length ||
                            Object.keys(device.control).length
                          "
                        >
                          <div class="defaultGridBox">
                            <template
                              v-for="(item, id) in device.addressData"
                              :key="id"
                            >
                              <q-separator v-if="id" class="q-mb-sm" />

                              <div>
                                <div class="row items-center">
                                  <span class="q-mr-sm">狀態</span>
                                  <q-chip
                                    square
                                    :class="{ red: item.status === '關' }"
                                  >
                                    {{ item.status ?? "開" }}
                                  </q-chip>
                                  <!-- 按鈕 -->
                                  <template
                                    v-if="
                                      item.masterId &&
                                      device.control[item.masterId]?.length &&
                                      controlAuth
                                    "
                                  >
                                    <div class="pointsBox">
                                      <template
                                        v-for="(btnData, i) in device.control[
                                          item.masterId
                                        ]"
                                        :key="i"
                                      >
                                        <q-btn-group push>
                                          <q-btn
                                            dense
                                            padding=".24rem .8rem"
                                            push
                                            class="text-primary"
                                            :label="btn.name"
                                            v-for="btn in btnData.deviceStatuses"
                                            :key="btn.name"
                                            @click="
                                              handleClickDeviceBtn(
                                                btn,
                                                btnData.deviceAddress,
                                                device
                                              )
                                            "
                                          />
                                        </q-btn-group>
                                      </template>
                                    </div>
                                  </template>

                                  <!-- 幫浦客製 -->
                                  <div
                                    class="q-ml-auto row items-center"
                                    style="gap: 0.8rem"
                                    v-if="
                                      device.deviceTypeValue ===
                                      customDesignEquipTypes.Pump
                                    "
                                  >
                                    <div class="flex flex-col items-center">
                                      <div class="text-grey">故障</div>
                                      <div>
                                        <q-icon
                                          :name="uniExclamationOctagon"
                                          size="lg"
                                          color="grey"
                                        />
                                      </div>
                                    </div>

                                    <div class="flex flex-col items-center">
                                      <div class="text-grey">缺水</div>
                                      <div>
                                        <q-icon
                                          :name="uniWaterDropSlash"
                                          size="lg"
                                          color="grey"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </template>
                          </div>
                        </template>

                        <!-- 電源狀態 -->
                        <template
                          v-if="
                            device.powerAddressData.length &&
                            Object.keys(device.powerControl).length
                          "
                        >
                          <q-separator class="q-mx-md" />

                          <div class="defaultGridBox">
                            <template
                              v-for="(item, id) in device.powerAddressData"
                              :key="id"
                            >
                              <q-separator v-if="id" />

                              <div>
                                <div class="row items-center">
                                  <span class="q-mr-sm">電源</span>
                                  <q-chip
                                    square
                                    :class="{ negative: item.status === '關' }"
                                  >
                                    {{ item.status ?? "開" }}
                                  </q-chip>
                                  <!-- 按鈕 -->
                                  <template
                                    v-if="
                                      item.masterId &&
                                      device.powerControl[item.masterId]
                                        ?.length &&
                                      controlAuth
                                    "
                                  >
                                    <div class="pointsBox">
                                      <template
                                        v-for="(btnData, i) in device
                                          .powerControl[item.masterId]"
                                        :key="i"
                                      >
                                        <q-btn-group push>
                                          <q-btn
                                            dense
                                            padding=".24rem .8rem"
                                            push
                                            class="text-primary"
                                            :label="btn.name"
                                            v-for="btn in btnData.deviceStatuses"
                                            :key="btn.name"
                                            @click="
                                              handleClickDeviceBtn(
                                                btn,
                                                btnData.deviceAddress,
                                                device
                                              )
                                            "
                                          />
                                        </q-btn-group>
                                      </template>
                                    </div>
                                  </template>
                                </div>
                              </div>
                            </template>
                          </div>
                        </template>

                        <!-- 發電機油量客製化顯示 -->
                        <!-- <template
                          v-if="
                            device.deviceTypeValue ===
                            customDesignEquipTypes.Dynamotor
                          "
                        >
                          <q-separator class="q-mx-md" />

                          <v-chart
                            class="chart q-pb-sm"
                            style="height: 260px"
                            :option="oilOption"
                            autoresize
                          />
                        </template> -->
                      </template>
                    </q-card-section>
                  </template>
                </q-scroll-area>
              </q-card>
            </div>

            <!-- 客製化電力 -->
            <div class="fixRight">
              <q-card bordered class="text-dark q-pb-sm" style="height: 100%">
                <q-card-section
                  class="q-px-md q-py-sm"
                  style="background-color: #e2dfcd"
                >
                  <div class="text-h6 text-bold text-center">電力</div>
                </q-card-section>

                <q-separator class="q-mb-sm" />

                <q-scroll-area :visible="false" style="height: 880px">
                  <q-card-section class="deviceBox q-mt-xs q-mx-sm">
                    <!-- Device Box Tab -->
                    <div class="flexBox flexBoxTab">
                      <div>
                        <span class="deviceName"> L12B PANEL 盤 </span>
                        <span class="devicePosition"> ( 12F ) </span>
                      </div>
                      <q-btn
                        v-if="controlAuth"
                        color="primary"
                        dense
                        class="missionBtn"
                        label="發布任務"
                        style="max-height: 2rem"
                        @click="
                          handlePublishedDialogOpen({
                            name: 'L12B Panel',
                            id: 99999,
                          })
                        "
                      />
                    </div>

                    <v-chart
                      class="chart"
                      style="height: 260px"
                      :option="electricalLoadOption"
                      autoresize
                    />

                    <q-separator />

                    <v-chart
                      class="chart"
                      style="height: 300px"
                      :option="voltageOption"
                      @datazoom="handleVoltageDataZoom"
                      autoresize
                    />

                    <q-separator />

                    <v-chart
                      class="chart"
                      style="height: 240px"
                      :option="electricCurrentOption"
                      autoresize
                    />
                  </q-card-section>
                </q-scroll-area>
              </q-card>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
      <!-- 右側 -->
      <div
        class="right"
        ref="rightRef"
        v-show="
          $q.screen.xs || $q.screen.sm || (!retractRightSide && $q.screen.gt.md)
        "
      >
        <q-splitter v-model="splitterModel" horizontal :limits="[10, 70]">
          <template v-slot:before>
            <q-card flat bordered class="flex-nowrap flex-col">
              <q-tabs
                v-model="tab"
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
                outside-arrows
                mobile-arrows
                inline-label
              >
                <q-tab
                  v-for="[name, label] in Object.entries(tabObject)"
                  :key="name"
                  :label="label"
                  :name="name"
                  :icon="tab === name ? mdiCheckCircle : undefined"
                />
                <div class="cursor-pointer q-pr-xs-xs">
                  <q-btn
                    color="white"
                    text-color="primary"
                    icon="print"
                    @click.prevent="handlePrint"
                  >
                    <q-tooltip
                      class="text-body2"
                      transition-show="scale"
                      transition-hide="scale"
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      列印
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated style="flex: 1">
                <q-tab-panel
                  v-for="key in Object.keys(tabObject)"
                  :key="key"
                  :name="key"
                  class="q-px-xs q-py-none"
                  :style="`height: ${topPanelHeight}px`"
                >
                  <div class="q-py-xs q-px-sm">
                    <div
                      v-for="(item, index) in tabPanelDataObject[key].value"
                      :key="index"
                      class="flex items-flex-start flex-nowrap"
                      style="gap: 0.24rem"
                    >
                      <div>
                        <q-icon
                          :name="mdiNavigation"
                          style="transform: rotate(90deg)"
                        />
                      </div>
                      <div>
                        <span>{{ item.dateTime }}</span>
                        <span>&nbsp; - &nbsp;</span>
                        <span v-if="item.buildingName">
                          {{ item.buildingName }}&nbsp;
                        </span>
                        <span v-if="item.addressName || item.floorName">
                          {{ item.addressName || item.floorName }}&nbsp;
                        </span>
                        <span v-if="item.areaName">
                          {{ item.areaName }}&nbsp;&nbsp;
                        </span>
                        <span v-if="item.deviceName">
                          {{ item.deviceName }}&nbsp;&nbsp;
                        </span>
                        <span v-if="item.status">{{ item.status }}</span>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </template>

          <template v-slot:separator>
            <q-avatar
              color="primary"
              text-color="white"
              size="40px"
              :icon="mdiArrowSplitHorizontal"
              style="left: initial; right: -16px"
            />
          </template>

          <template v-slot:after>
            <q-card
              bordered
              style="height: calc(100vh - 420px); overflow-y: auto"
            >
              <q-card-section class="q-pb-none">
                <div class="text-h6 text-bold">發布任務</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="flex justify-between">
                  <!-- 班別下拉 -->
                  <q-select
                    :model-value="className"
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    :options="classOptions"
                    @filter="classSelectFilterFunc"
                    @input-value="(val) => (className = val)"
                    option-value="id"
                    option-label="description"
                    :label="!!className ? '' : '班別 *'"
                    dense
                    :style="
                      $q.screen.xs || $q.screen.sm ? 'width:100%' : 'width:45%'
                    "
                    lazy-rules="ondemand"
                    :rules="[
                      (val) =>
                        !val
                          ? '此欄位不得為空'
                          : classOptions
                              ?.map((item) => item.description)
                              .includes(val)
                          ? true
                          : '請選擇正確的班別',
                    ]"
                    ref="classNameSelect"
                    @update:model-value="classNameSelectUpdateFunc"
                  >
                    <template v-if="className" v-slot:append>
                      <q-icon
                        name="cancel"
                        @click.stop.prevent="className = ''"
                        class="cursor-pointer"
                      />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          沒有該物件
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <!-- 設備下拉 -->
                  <q-select
                    :model-value="deviceName"
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="300"
                    :options="deviceOptions"
                    @filter="deviceSelectFilterFunc"
                    @popup-show="deviceSelectPopupShowFunc"
                    @input-value="(val) => (deviceName = val)"
                    option-value="id"
                    option-label="name"
                    label="設備"
                    dense
                    :style="
                      $q.screen.xs || $q.screen.sm ? 'width:100%' : 'width:45%'
                    "
                    lazy-rules="ondemand"
                    :rules="[
                      (val) =>
                        !val
                          ? '此欄位不得為空'
                          : deviceOptions
                              ?.map((item) => item.name)
                              .includes(val)
                          ? true
                          : '請選擇正確的設備',
                    ]"
                    ref="deviceNameSelect"
                    @update:model-value="deviceNameSelectUpdateFunc"
                  >
                    <template v-if="deviceName" v-slot:append>
                      <q-icon
                        name="cancel"
                        @click.stop.prevent="deviceName = ''"
                        class="cursor-pointer"
                      />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          沒有該物件
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <!-- 任務罐頭訊息下拉 -->
                <q-select
                  :model-value="missionContent"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="missionLazyTextOptions"
                  @filter="missionLazyTextSelectFilterFunc"
                  @input-value="(val) => (missionContent = val)"
                  option-value="id"
                  option-label="label"
                  :label="!!missionContent ? '' : '任務內容 *'"
                  dense
                  lazy-rules="ondemand"
                  :rules="[(val) => !!val || '此欄位不得為空']"
                  ref="missionContentSelect"
                  @update:model-value="missionContentSelectUpdateFunc"
                >
                  <template v-if="missionContent" v-slot:append>
                    <q-icon
                      name="cancel"
                      @click.stop.prevent="missionContent = ''"
                      class="cursor-pointer"
                    />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        沒有該物件
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-btn
                  v-if="controlAuth"
                  color="primary"
                  class="full-width q-mt-xs"
                  label="發布任務"
                  icon-right="navigation"
                  @click.prevent="handlePostMission"
                />
              </q-card-section>

              <q-card-section class="q-pt-none">
                <MissionList
                  :tableRowsData="Object.values(missionBlockData).reverse()"
                  :tableHeight="bottomTableHeight + 'px'"
                  :unVisibleColumns="['sendUserName', 'receiveTime']"
                >
                  <template #desktopBtn="{ id, receiveUser }">
                    <div>
                      <span v-if="receiveUser" class="text-primary">
                        {{ receiveUser.fullname }}
                      </span>
                      <q-btn
                        v-if="controlAuth"
                        color="white"
                        text-color="black"
                        label="取消任務"
                        @click.prevent="cancelMission(id)"
                      />
                    </div>
                  </template>
                  <template #mobileBtn="{ id, receiveUser }">
                    <div>
                      <span v-if="receiveUser" class="text-primary">
                        {{ receiveUser.fullname }}
                      </span>
                      <q-btn
                        v-if="controlAuth"
                        color="white"
                        text-color="black"
                        label="取消任務"
                        @click.prevent="cancelMission(id)"
                      />
                    </div>
                  </template>
                </MissionList>
              </q-card-section>
            </q-card>
          </template>
        </q-splitter>
      </div>
      <!--  右側收縮按紐 -->
      <q-btn
        dense
        color="tertiary"
        text-color="black"
        :icon="retractRightSide ? 'arrow_back_ios_new' : 'arrow_forward_ios'"
        @click="retractRightSide = !retractRightSide"
      />
    </div>
  </q-page>

  <!-- 點擊設備的發布任務按鈕開啟的 Dialog -->
  <q-dialog
    v-model="publishedVisible"
    @hide="
      dialogMissionContent = '';
      dialogClassName = '';
    "
  >
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 500px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">
          發布任務內容 - {{ dialogDevice.name }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-select
          :model-value="dialogClassName"
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          :options="classOptions"
          @filter="classSelectFilterFunc"
          @input-value="(val) => (dialogClassName = val)"
          option-value="id"
          option-label="description"
          class="q-mb-sm"
          :label="!!dialogClassName ? '' : '班別 *'"
          :rules="[
            (val) =>
              !val
                ? '此欄位不得為空'
                : classOptions?.map((item) => item.description).includes(val)
                ? true
                : '請選擇正確的班別',
          ]"
          ref="dialogClassNameSelect"
          @update:model-value="dialogClassNameSelectUpdateFunc"
        >
          <template v-if="deviceName" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="deviceName = ''"
              class="cursor-pointer"
            />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 沒有該物件 </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select
          :model-value="dialogMissionContent"
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          :options="missionLazyTextOptions"
          @filter="classSelectFilterFunc"
          @input-value="(val) => (dialogMissionContent = val)"
          option-value="id"
          option-label="label"
          class="q-mb-sm"
          :label="!!dialogMissionContent ? '' : '任務內容 *'"
          lazy-rules="ondemand"
          :rules="[(val) => !!val || '此欄位不得為空']"
          ref="dialogMissionContentSelect"
          @update:model-value="dialogMissionContentSelectUpdateFunc"
        >
          <template v-if="dialogMissionContent" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="dialogMissionContent = ''"
              class="cursor-pointer"
            />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                沒有該任務內容
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="center" class="q-mb-md">
        <q-btn
          color="primary"
          padding=".4rem 1rem"
          label="發布任務"
          icon-right="navigation"
          @click.prevent="handleDialogPostMission"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
// icon
import {
  mdiArrowSplitHorizontal,
  mdiCheckCircle,
  mdiNavigation,
} from "@quasar/extras/mdi-v7";
import {
  uniExclamationOctagon,
  uniWaterDropSlash,
} from "quasar-extras-svg-icons/unicons";

// API
import emergencyMission, {
  GroupTaskViewModel,
  postMissionParams,
} from "src/api/emergencyMission";
import Role, { roleType } from "src/api/role";
import System, { systemType } from "src/api/system";
import Device, { DeviceStatusViewModel, DeviceStatus } from "src/api/device";
import DeviceControl from "src/api/deviceControl";
import DeviceHistory, {
  FormattedDeviceData,
  formatedDeviceBlockData,
} from "src/api/deviceHistory";

// types
import {
  fatek03Control,
  useDeviceAddressStore,
} from "src/stores/deviceAddress";
import type {
  DeviceAddressStatusViewModel,
  DeviceViewModel,
  PoolViewModel,
} from "src/api/device";
// pinia store
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { useBuildingStore } from "src/stores/building.js";
import { useSignalRStore } from "src/stores/signalR";

// utils
import { print, getTable, getTdContent } from "src/utils/usePrint";
import {
  getTotalVolume,
  getLegalVolume,
  getCurrentVolume,
  toPercentage,
} from "src/utils/leveMeterCopute";

// constant
import { customDesignEquipTypes } from "src/constant/customDesignEquipTypes";

// E-Charts
import { use, graphic } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, GaugeChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { date } from "quasar";
import {
  EChartsOption,
  LineSeriesOption,
  XAXisOption,
} from "echarts/types/dist/shared";
import { useCloned } from "@vueuse/core";

const userStore = useUserStore();
const { isMercury, isSystem, isManager, isCenter } = storeToRefs(userStore);

const deviceAddressStore = useDeviceAddressStore();
const { fatek03, amsamotion02, mitsubishi } = storeToRefs(deviceAddressStore);

const signalRStore = useSignalRStore();
const { emgMission, processRunning } = storeToRefs(signalRStore);

// 有控制權限的角色
const controlAuth = computed(
  () => isMercury.value || isSystem.value || isManager.value || isCenter.value
);

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

// 左側設備九宮格
interface AddressData {
  area?: string;
  addressStr: string;
  driver?: string;
  status?: string | number;
  masterName: string | undefined;
  masterId: number | undefined;
  deviceData?: {
    pool: PoolViewModel;
  };
}
interface MyDeviceAddress {
  system: DeviceAddressStatusViewModel["deviceAddress"]["system"];
  address: DeviceAddressStatusViewModel["deviceAddress"]["address"];
  number: DeviceAddressStatusViewModel["deviceAddress"]["number"];
}
interface Control {
  deviceStatuses: DeviceAddressStatusViewModel["deviceStatuses"];
  deviceAddress: MyDeviceAddress;
}
interface MyDeviceStatusViewModel {
  gateway: DeviceViewModel["gateway"];
  iconId: DeviceViewModel["iconId"];
  deviceId: DeviceViewModel["id"];
  name: DeviceViewModel["name"];
  location: DeviceViewModel["location"];
  floorName: string | undefined;
  useType: DeviceViewModel["deviceType"]["useType"];
  deviceTypeName: DeviceViewModel["deviceType"]["name"];
  deviceTypeValue: string;
  addressData: AddressData[];
  control: { [key: number]: Control[] };
  powerAddressData: AddressData[];
  powerControl: { [key: number]: Control[] };
  chartOption?: any;
}
interface FormatedDeviceData {
  [addressString: string]: AddressData;
}
interface FormatedDeviceDataObject {
  [driver: string]: FormatedDeviceData;
}

const formatedByDeviceType = ref<{
  [deviceType: string]: MyDeviceStatusViewModel[];
}>({});
const formatedDeviceDataObject: FormatedDeviceDataObject = {};

async function handleClickDeviceBtn(
  btn: DeviceStatus,
  deviceAddress: MyDeviceAddress,
  device: MyDeviceStatusViewModel
) {
  // if (device.value === btn.name) return;
  // device.value = btn.name;
  // 發送控制 fatek 設備的 api
  // if (fatek03.value) {
  const { deviceId, gateway } = device;
  // 獲得 control Index
  const { system, address, number } = deviceAddress;
  const addressStr = `${system}-${address}-${number}`;
  const controlIndex =
    fatek03Control[addressStr as keyof typeof fatek03Control];

  const controlArray = deviceAddressStore.getFatek03ControlArray();
  controlArray[controlIndex] = btn.value;

  const result = await DeviceControl.apiDeviceControl(
    gateway as number,
    deviceId as number,
    controlArray
  );

  if (result.data.length && result.data[0].isSuccess) {
    $q.notify({
      type: "positive",
      message: "發送成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "發送失敗",
      position: "top",
    });
  }
  // } else {
  //   $q.notify({
  //     type: "warning",
  //     message: "尚未取得設備資料，請稍等片刻再重新嘗試",
  //     position: "top",
  //   });
  // }
}
watch(
  fatek03,
  (newValue) => {
    console.log("fatek03 status", newValue);
    if (
      newValue &&
      formatedDeviceDataObject &&
      Object.keys(formatedDeviceDataObject).length
    ) {
      Object.entries(newValue.points).forEach(([key, status]) => {
        if (formatedDeviceDataObject[newValue.driver][key]) {
          const value = !isNaN(+status)
            ? toPercentage(
                +status,
                formatedDeviceDataObject[newValue.driver][key].deviceData!.pool
              )
            : status;
          formatedDeviceDataObject[newValue.driver][key].status = value;
        }
      });
    }
  },
  { deep: true }
);
watch(
  amsamotion02,
  (newValue) => {
    if (
      newValue &&
      formatedDeviceDataObject &&
      Object.keys(formatedDeviceDataObject).length
    ) {
      Object.entries(newValue.points).forEach(([key, status]) => {
        if (formatedDeviceDataObject[newValue.driver][key]) {
          formatedDeviceDataObject[newValue.driver][key].status = status;
        }
      });
    }
  },
  { deep: true }
);

watch(
  mitsubishi,
  (newValue) => {
    if (
      newValue &&
      formatedDeviceDataObject &&
      Object.keys(formatedDeviceDataObject).length
    ) {
      Object.entries(newValue.points).forEach(([key, status]) => {
        if (formatedDeviceDataObject[newValue.driver][key]) {
          const value = !isNaN(+status)
            ? toPercentage(
                +status,
                formatedDeviceDataObject[newValue.driver][key].deviceData!.pool
              )
            : status;
          formatedDeviceDataObject[newValue.driver][key].status = value;
        }
      });
    }
  },
  { deep: true }
);

// Spitter 設定
const splitterModel = ref(40);
const rightRef = ref();
const splitterHeight = ref(700);
// 固定高度參數
const SPITTER_LINE_HEIGHT = 13;
const TOP_TABS_HEIGHT = 48;
const BOTTOM_TITLE_HEIGHT = 48;
const INPUT_BOX_HEIGHT = 176;
const TABLE_PADDING = 16;
onMounted(async () => {
  if ($q.screen.gt.md) {
    splitterHeight.value =
      rightRef.value.getBoundingClientRect().height - SPITTER_LINE_HEIGHT;
  }
});
const topPanelHeight = computed(() => {
  return (splitterHeight.value * splitterModel.value) / 100 - TOP_TABS_HEIGHT;
});
const bottomTableHeight = computed(() => {
  return (
    (splitterHeight.value * (100 - splitterModel.value)) / 100 -
      BOTTOM_TITLE_HEIGHT -
      INPUT_BOX_HEIGHT -
      TABLE_PADDING || 300
  );
});

// 發布任務
// Select 共用方法
interface optionItem {
  id: number;
  label: string;
  value: string;
  type: number;
  order: number;
  description: string;
  [key: string]: number | string;
}
function filterFunc<T = object>(
  val: string,
  update: (func: () => void) => void,
  refOptions: Ref<T[]>,
  options: T[],
  optionLabelKey = "name"
) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    refOptions.value = options.filter((option) =>
      (option[optionLabelKey as keyof typeof option] as string)
        ?.toLocaleLowerCase()
        ?.includes(needle)
    );
  });
}

// 班別 select 下拉
interface ClassOption {
  description: string;
  id: string;
  isEmergency: boolean | null;
  name: string;
  type: number;
}
const classData: ClassOption[] = [];
const classOptions = ref<ClassOption[]>([]);
const className = ref("");
const classNameSelect = ref();
onMounted(async () => {
  const result = (await Role.apiGetRoles([
    { type: roleType.class, isEmergency: null },
  ])) as typeof AxiosResponse;
  if (result.data) {
    classData.length = 0;
    classData.push(...result.data);
    classOptions.value = classData;
  }
});
function classSelectFilterFunc(
  val: string,
  update: (func: () => void) => void
) {
  filterFunc<ClassOption>(val, update, classOptions, classData);
}
function classNameSelectUpdateFunc() {
  classNameSelect.value.resetValidation();
}

// 設備 select 下拉
const deviceName = ref("");
const deviceListsData: optionItem[] = [];
const deviceOptions = ref<optionItem[]>([]);
const deviceNameSelect = ref();

watch(
  Bid,
  async () => {
    if (Bid.value) {
      // 取得要顯示在設備處理狀況左側的設備資料
      try {
        const deviceData = await Device.apiGetIsShortcutDevices();
        console.log("nowwwwwww deviceData", deviceData);
        if (!deviceData.data) return;

        deviceData.data.forEach((device: DeviceStatusViewModel) => {
          const newObject = formatDeviceData(device);

          addDeviceToTypeCollection(newObject); // 根據設備產出顯示用的物件
          populateDeviceDataObject(newObject); // 跟據點位產出對照用的物件
          getDeviceStatusById(device.id as number); // 取得設備最新狀態
        });

        //! 客製化排序 (展覽用)
        const desiredOrder = [
          "消防專用蓄水池",
          "緊急發電機",
          "巨大的消防幫浦",
          "自然排煙窗",
        ];
        const ordered: typeof formatedByDeviceType.value = {};
        desiredOrder.forEach((key) => {
          if (key in formatedByDeviceType.value) {
            ordered[key] = formatedByDeviceType.value[key];
          }
        });

        // 然后添加那些不在 desiredOrder 中的元素
        Object.keys(formatedByDeviceType.value).forEach((key) => {
          if (!desiredOrder.includes(key)) {
            ordered[key] = formatedByDeviceType.value[key];
          }
        });

        if (Object.keys(ordered).length) formatedByDeviceType.value = ordered;

        console.log("formatedByDeviceType", formatedByDeviceType.value);
        console.log("formatedDeviceDataObject", formatedDeviceDataObject);
      } catch (error) {
        console.error("取得側的設備資料發生錯誤: ", error);
      }
    }
  },
  { immediate: true }
);

function formatDeviceData(device: DeviceStatusViewModel) {
  const formattedConrols = device.control.reduce((acc, item) => {
    const key = item.deviceAddress.master!.id!;
    const formattedItem = {
      deviceStatuses: item.deviceStatuses,
      deviceAddress: {
        system: item.deviceAddress.system!,
        address: item.deviceAddress.address!,
        number: item.deviceAddress.number,
      },
    };

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(formattedItem);
    return acc;
  }, {} as { [key: number]: Control[] });

  const formattedPowerControl = device.control.reduce((acc, item) => {
    const key = item.deviceAddress.master!.id!;
    const formattedItem = {
      deviceStatuses: item.deviceStatuses,
      deviceAddress: {
        system: item.deviceAddress.system,
        address: item.deviceAddress.address,
        number: item.deviceAddress.number,
      },
    };

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(formattedItem);
    return acc;
  }, {} as { [key: number]: Control[] });

  const newData = reactive<MyDeviceStatusViewModel>({
    gateway: device.gateway,
    iconId: device.iconId,
    deviceId: device.id,
    name: device.name,
    location: device.location,
    useType: device.deviceType.useType,
    deviceTypeName: device.deviceType.name,
    deviceTypeValue: device.deviceType.fullTypeValues.join(","),
    floorName: device.floor?.name,

    addressData: device.state.map((state) => {
      return {
        area: state.area,
        addressStr:
          state.system != null || state.address != null || state.number != null
            ? `${state.system != null ? state.system : ""}${
                state.address != null ? "-" + state.address : ""
              }${state.number != null ? "-" + state.number : ""}`
            : "",

        driver: state.master?.deviceType.driver || undefined,
        masterName: state.master?.name,
        masterId: state.master?.id,
        deviceData: {
          pool: state.device.pool!,
        },
      };
    }),
    control: formattedConrols,

    powerAddressData: device.powerState.map((state) => {
      return {
        area: state.area,
        addressStr:
          state.system || state.address || state.number
            ? `${state.system || ""}${
                state.address ? "-" + state.address : ""
              }${state.number ? "-" + state.number : ""}`
            : "",
        driver: state.master?.deviceType.driver || undefined,
        masterName: state.master?.name,
        masterId: state.master?.id,
      };
    }),
    powerControl: formattedPowerControl,
  });

  const deviceTypeStr = device.deviceType.fullTypeValues.join(",");
  // 產出水位計 Chart option
  if (deviceTypeStr === customDesignEquipTypes.Liquid_Level_Meter) {
    console.log("nowwwwww newData", newData);
    const { area, high, legal, invalid } =
      newData.addressData[0].deviceData!.pool;
    if (!area || !high || !legal || !invalid) return newData;
    const leagalPercent = ((legal + invalid) / area) * high;
    const poolOption = getDefalutPoolOption(leagalPercent);
    newData.chartOption = poolOption;
  }
  return newData;
}
// 產出左邊設備九宮格相關邏輯
function addDeviceToTypeCollection(device: MyDeviceStatusViewModel) {
  const deviceType = device.deviceTypeName;
  if (!formatedByDeviceType.value[deviceType]) {
    formatedByDeviceType.value[deviceType] = [];
  }
  formatedByDeviceType.value[deviceType].push(device);
}
function populateDeviceDataObject(device: MyDeviceStatusViewModel) {
  const populateData = (data: AddressData[]) => {
    data.forEach((item) => {
      const { addressStr, driver } = item;
      if (!driver) return;
      if (!formatedDeviceDataObject[driver]) {
        formatedDeviceDataObject[driver] = {};
      }
      formatedDeviceDataObject[driver][addressStr] = item;
    });
  };

  populateData(device.addressData);
  populateData(device.powerAddressData);
}

function createAddressString(
  system: string | undefined,
  address: number | undefined,
  number: number
) {
  if (!system) return "";

  const parts: (string | number)[] = [system];
  if (address) parts.push(address);
  if (number) parts.push(number);

  return parts.join("-");
}

async function getDeviceStatusById(id: number) {
  const result = await Device.apiGetDeviceStatus(id);
  if (result.data) {
    result.data.forEach((status) => {
      const { value, deviceAddress } = status;
      const { system, address, number, master } = deviceAddress;
      if (!master) return;
      const { driver } = master.deviceType as { driver: string };
      const addressStr = createAddressString(system, address, number);
      let trueValue: number | string;
      if (
        customDesignEquipTypes.Liquid_Level_Meter ===
        status.deviceAddress.device.deviceType.fullTypeValues.join(",")
      ) {
        trueValue =
          value && typeof +value === "number"
            ? toPercentage(+value, status.deviceAddress.device.pool)
            : 0;
      } else {
        trueValue = value === "False" ? "關" : "開";
      }
      formatedDeviceDataObject[driver][addressStr].status = trueValue;

      // 附值給 fatek、amsamotion、mitsubishi
      if (driver === "fatek" && formatedDeviceDataObject.fatek[addressStr]) {
        if (fatek03.value) fatek03.value.points[addressStr] = trueValue;
      } else if (
        driver === "amsamotion" &&
        formatedDeviceDataObject.amsamotion[addressStr] &&
        amsamotion02.value
      ) {
        amsamotion02.value.points[addressStr] = trueValue;
      } else if (
        driver === "mitsubishi" &&
        formatedDeviceDataObject.mitsubishi[addressStr] &&
        mitsubishi.value
      ) {
        mitsubishi.value.points[addressStr] = trueValue;
      }
    });
  }
}

function deviceSelectFilterFunc(
  val: string,
  update: (func: () => void) => void
) {
  filterFunc<optionItem>(val, update, deviceOptions, deviceListsData);
}
function deviceNameSelectUpdateFunc() {
  deviceNameSelect.value.resetValidation();
}
// 獲取設備下拉資料
async function deviceSelectPopupShowFunc() {
  if (deviceListsData.length) return;
  const result = (await Device.apiGetDevice()) as typeof AxiosResponse;
  if (result && result.data) {
    deviceListsData.length = 0;
    deviceListsData.push(...result.data);
    deviceOptions.value = deviceListsData;
  }
}

// 任務內容 select 下拉
const missionContent = ref(""); // 發布任務的內容
const lazyTexts: optionItem[] = [];
const missionLazyTextOptions = ref();
const missionContentSelect = ref();

onMounted(async () => {
  const result = (await System.apiGetSystemItem(
    systemType.EmergencyNotice
  )) as typeof AxiosResponse;
  if (result.data) {
    lazyTexts.length = 0;
    lazyTexts.push(...result.data);
    missionLazyTextOptions.value = lazyTexts;
  }
});

function missionContentSelectUpdateFunc() {
  missionContentSelect.value.resetValidation();
}

function missionLazyTextSelectFilterFunc(
  val: string,
  update: (func: () => void) => void
) {
  filterFunc(val, update, missionLazyTextOptions, lazyTexts, "label");
}

// 發布任務方法
async function handlePostMission() {
  // 檢查是否有欄位為空
  if (className.value.trim() === "" || missionContent.value.trim() === "") {
    classNameSelect.value.validate();
    missionContentSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "班別欄位與任務內容不得為空",
      position: "top",
    });
    return;
  }
  // 檢查班別欄位值是否式有效值
  const roleName = classData.find(
    (data) => data.description === className.value
  )?.name;
  if (!roleName) {
    classNameSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "班別欄位的值非有效值，請重新選取",
      position: "top",
    });
    return;
  }
  // 檢查設備欄位值是否式有效值
  let deviceId;
  if (deviceName.value.trim() !== "") {
    deviceId = deviceListsData.find(
      (data) => data.name === deviceName.value
    )?.id;
    if (!deviceId) {
      deviceNameSelect.value.validate();
      $q.notify({
        type: "warning",
        message: "設備欄位的值非有效值，請重新選取",
        position: "top",
      });
      return;
    }
  }
  console.log("roleName", roleName);
  console.log("deviceId", deviceId);
  console.log("missionContent.value", missionContent.value);
  const params: postMissionParams = {
    roleName,
    deviceId: undefined,
    content: missionContent.value,
  };
  if (deviceId) params.deviceId = deviceId;
  // 打 api 發布
  const result = (await emergencyMission.apiPostMission(
    params
  )) as typeof AxiosResponse;
  if (result.data) {
    console.log("result.data", result.data);
    $q.notify({
      type: "positive",
      message: "發布任務成功",
      position: "top",
    });
    // 清空 input
    className.value = "";
    deviceName.value = "";
    missionContent.value = "";
  } else {
    $q.notify({
      type: "negative",
      message: "發布任務失敗",
      position: "top",
    });
  }
}

// 發布任務 Table
// 獲取任務歷史清單
onMounted(getMissionLists);
async function getMissionLists() {
  const params = {
    filter: "",
    page: 1,
    rowsPerPage: 25,
    roleName: "",
  };
  const result = (await emergencyMission.apiGetMissionLists(
    params
  )) as typeof AxiosResponse;
  console.log("apiGetMissionLists", result.data);
  if (result.data.rows && result.data.rows.length) {
    missionBlockData.value = result.data.rows;
    missionBlockData.value = result.data.rows.reduce(
      (obj: { [key: string]: GroupTaskViewModel }, row: GroupTaskViewModel) => {
        obj[row.id] = row;
        return obj;
      },
      {}
    );
  }
}

// table 資料
const missionBlockData = ref<{ [key: string | number]: GroupTaskViewModel }>(
  {}
);
watch(
  emgMission,
  (newValue) => {
    if (newValue) {
      console.log("newValue", newValue);
      for (const key in newValue) {
        missionBlockData.value[key] = newValue[key];
      }
      console.log("watch missionBlockData", missionBlockData.value);
    }
  },
  { deep: true }
);
async function cancelMission(id: number) {
  console.log("cancelMission", id);
  const result = (await emergencyMission.apiCancelMission(
    id
  )) as typeof AxiosResponse;
  if (result.data) {
    console.log("cancelMission", result.data);
    $q.notify({
      type: "positive",
      message: "取消任務成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "取消任務失敗",
      position: "top",
    });
  }
}

// Dialog Select 下拉
const dialogClassName = ref("");
const dialogMissionContent = ref("");
const publishedVisible = ref(false);
const dialogDevice = ref({ name: "", id: 0 });
const dialogClassNameSelect = ref();
const dialogMissionContentSelect = ref();
function dialogClassNameSelectUpdateFunc() {
  dialogClassNameSelect.value.resetValidation();
}
function dialogMissionContentSelectUpdateFunc() {
  dialogMissionContentSelect.value.resetValidation();
}
function handlePublishedDialogOpen(device: { name: string; id: number }) {
  publishedVisible.value = true;
  dialogDevice.value = device;
  dialogMissionContent.value = device.name + "出現異常，請前往確認";
}
async function handleDialogPostMission() {
  // 檢查是否有欄位為空
  if (
    dialogClassName.value.trim() === "" ||
    dialogMissionContent.value.trim() === ""
  ) {
    dialogClassNameSelect.value.validate();
    dialogMissionContentSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "班別欄位與任務內容不得為空",
      position: "top",
    });
    return;
  }
  // 檢查班別欄位值是否式有效值
  const roleName = classData.find(
    (data) => data.description === dialogClassName.value
  )?.name;
  if (!roleName) {
    dialogClassNameSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "班別欄位的值非有效值，請重新選取",
      position: "top",
    });
    return;
  }
  // 檢查設備欄位值是否式有效值
  if (!dialogDevice.value.id) {
    deviceNameSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "設備欄位的值非有效值，請重新選取",
      position: "top",
    });
    return;
  }
  console.log("roleName", roleName);
  console.log("dialogMissionContent.value", dialogMissionContent.value);
  const params: postMissionParams = {
    roleName,
    deviceId: dialogDevice.value.id,
    content: dialogMissionContent.value,
  };
  // 打 api 發布
  const result = (await emergencyMission.apiPostMission(
    params
  )) as typeof AxiosResponse;
  if (result.data) {
    console.log("result.data", result.data);
    $q.notify({
      type: "positive",
      message: "發布任務成功",
      position: "top",
    });
    // 清空 input
    dialogClassName.value = "";
    dialogDevice.value = { name: "", id: 0 };
    dialogMissionContent.value = "";
    publishedVisible.value = false;
  } else {
    $q.notify({
      type: "negative",
      message: "發布任務失敗",
      position: "top",
    });
  }
}

// 設備歷史紀錄
// tab 設定
onMounted(async () => {
  const result = (await DeviceHistory.apiGetData({
    filters: "",
    page: 1,
    rowsPerPage: 20,
  })) as typeof AxiosResponse;
  if (result.data && result.data.rows) {
    console.log("now DeviceHistory", result.data.rows);
    deviceContentList.value = formatedDeviceBlockData(result.data.rows);
  }
});

const tab = ref("all");
const tabObject = {
  all: "總覽",
  fireDevice: "消防設備及防火避難設施",
  normalDevice: "一般設備",
};
// tabPanel 設定

const deviceContentList = ref<FormattedDeviceData[]>([]);
const fireDevice = computed(() =>
  deviceContentList.value.filter((item) => item.useType === "Fire")
);
const normalDevice = computed(() =>
  deviceContentList.value.filter((item) => item.useType === "Normal")
);
const tabPanelDataObject: {
  [key: string]: Ref<FormattedDeviceData[]>;
} = {
  all: deviceContentList,
  fireDevice,
  normalDevice,
};
// 列印
const tableTitleObject = {
  dateTime: "時間",
  buildingName: "大樓名稱",
  addressName: "地址名稱",
  areaName: "場所",
  deviceType: "設備種類",
  deviceName: "設備項目",
  status: "目前情況",
};

function handlePrint() {
  const printData = tabPanelDataObject[tab.value];
  const tdContent = getTdContent(printData.value, tableTitleObject);
  const tableContent = getTable(tableTitleObject, tdContent);
  print(tableContent, "設備狀況歷史紀錄");
}

// 右側收縮
const retractRightSide = ref(false);

// 手機頁面設計
const activeTab = ref({
  label: "設備狀況",
  value: "emergencyDeviceStatus",
});
const blockTabs = [
  {
    label: "設備狀況",
    value: "emergencyDeviceStatus",
  },
  {
    label: "歷史紀錄",
    value: "history",
  },
  {
    label: "發布任務",
    value: "postMission",
  },
];
// 手機發布任務 table 高度獲取
const mobileCard = ref();
const mobilePostMissonHeight = ref(0);
const CUSTOM_TABS_HEIGHT = 137.8;
const MOBILE_INPUT_AREA = 236;
const TAB_PANNEL_PADDING = 32;
const MOBILE_TABLE_PADDING = 16;
const UNKNOWN_PADDING = 16;

onMounted(() => {
  if (mobileCard.value?.$el) {
    const { height } = mobileCard.value.$el.getBoundingClientRect();
    mobilePostMissonHeight.value =
      height -
      CUSTOM_TABS_HEIGHT -
      BOTTOM_TITLE_HEIGHT -
      MOBILE_INPUT_AREA -
      TAB_PANNEL_PADDING -
      MOBILE_TABLE_PADDING -
      UNKNOWN_PADDING;
  }
});

// E-Charts
use([
  TitleComponent,
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  GaugeChart,
]);

// provide(THEME_KEY, "dark");

// 產出預設的水位計 chart option
function getDefalutPoolOption(leagalPercent: number) {
  // 產出假資料
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒數

  const poolValueArray = reactive<(string | Date)[][]>([]);
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - i * oneDay);
    poolValueArray.push([
      time,
      (Math.random() * 20 + 80 - Math.random() * 8).toFixed(2),
    ]);
  }
  const legalData = reactive({
    name: "法定水量",
    type: "line",
    showSymbol: false,
    data: poolValueArray.map((item) => [item[0], leagalPercent || 70]),
    itemStyle: {
      color: "red",
    },
    lineStyle: {
      color: "red",
      width: 4,
    },
  });

  return reactive({
    title: {
      text: "近十日水量變化",
      textStyle: {
        fontSize: 18,
      },
      left: "3%",
    },
    tooltip: {
      trigger: "axis", // axis, item, none, formatter (自定義顯示內容), axisPointer (坐標軸指示器設定)
    },
    legend: {
      data: ["目前水量", "法定水量"],
      right: "5%",
      top: "15%",
    },
    grid: {
      top: 70,
      left: "3%",
      right: "5%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      axisLabel: {
        formatter: (value: Date) => {
          return date.formatDate(value, "M/D"); // 格式化為月/日
        },
      },
      // 這將確保 X 軸覆蓋整個數據範圍
      min: new Date(now.getTime() - 9 * oneDay),
      max: now,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} %",
        align: "right",
      },
      boundaryGap: [0, "100%"],
      min: 0,
      max: 100,
    },
    series: [
      {
        name: "目前水量",
        type: "line",
        showSymbol: true,
        smooth: true,
        data: poolValueArray,
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(135, 206, 235, 1)",
            },
            {
              offset: 1,
              color: "rgba(135, 206, 235, 0.24)",
            },
          ]),
        },
      },
      legalData,
    ],
  });
}

// 計算電梯樓層
function getElevatorFloor(addressDatas: AddressData[]) {
  const isOn = addressDatas.find((item) => item.status === "開");
  if (isOn) {
    switch (isOn.addressStr) {
      case "Y-10":
        return "25樓";
      case "Y-11":
        return "17樓";
      case "Y-12":
        return "10樓";
      case "Y-13":
        return "1樓";
    }
  }

  return "25樓";
}

// 假資料基礎參數
const backSeconds = 2000; // 回推的秒數
const oneSecond = 1000;
const threeSeconds = 3 * oneSecond; // 每3秒更新一次
interface ChartData {
  name: string;
  value: (string | number)[];
}

// 電壓
const voltageData = reactive<ChartData[]>([]);
let voltageStartDate = new Date(Date.now() - backSeconds * oneSecond);
let voltageLastUpdateTime = Date.now(); //  紀錄上次 requestAnimationFrame 更新時間

function randomVoltageData() {
  voltageStartDate = new Date(voltageStartDate.getTime() + oneSecond); // 增加一秒
  const lastValue =
    voltageData.length > 0 ? voltageData[voltageData.length - 1].value[1] : 215;
  const newValue = Math.max(
    200,
    Math.min(230, +lastValue + (Math.random() * 2 - 1) * 40)
  ); // 確保值在 200 到 230 之間

  return {
    name: voltageStartDate.toString(),
    value: [+voltageStartDate, +newValue.toFixed(2)],
  };
}

// 生成初始2000秒的資料
for (let i = 0; i < backSeconds; i++) {
  voltageData.push(randomVoltageData());
}

function updateVoltageData() {
  const now = Date.now();
  if (now - voltageLastUpdateTime >= threeSeconds) {
    for (let i = 0; i < 3; i++) {
      voltageData.shift();
      voltageData.push(randomVoltageData());
    }
    voltageLastUpdateTime = now;
  }
  requestAnimationFrame(updateVoltageData);
}
requestAnimationFrame(updateVoltageData);
// 更新 dataZoom
interface dataZoomAction {
  type: string;
  from: string;
  dataZoomId: string;
  animation: {
    easing: string;
    duration: number;
    delay: number;
  };
  start: number;
  end: number;
}
function handleVoltageDataZoom(action: dataZoomAction) {
  const { start, end } = action;
  voltageDataZoom.forEach((item) => {
    item.start = start;
    item.end = end;
  });
}
const voltageDataZoom = reactive([
  {
    start: 80,
    end: 100,
  },
]);
// 電壓 Chart Option
const voltageOption = reactive<EChartsOption>({
  tooltip: { trigger: "axis" },
  title: {
    text: "電壓 (V)",
    textStyle: { fontSize: 18 },
    left: "3%",
  },
  toolbox: {
    right: "5%",
    top: "10%",
    feature: {
      dataZoom: {
        yAxisIndex: "none",
        title: {
          zoom: "區域縮放",
          back: "區域還原",
        },
      },
      restore: {
        title: "還原",
      },
      saveAsImage: {
        title: "保存圖片",
      },
    },
  },
  grid: { top: 70, left: "12%", right: "5%" },
  xAxis: { type: "time" },
  yAxis: { type: "value", boundaryGap: [0, "100%"] },
  dataZoom: voltageDataZoom,
  series: [
    {
      name: "電壓值",
      type: "line",
      smooth: true,
      symbol: "none",
      areaStyle: {},
      data: voltageData,
    },
  ],
});

// 負載
const todayData = reactive<ChartData[]>([]);
const yesterdayData = reactive<ChartData[]>([]);

const electricalLoadColors = ["#5470C6", "#EE6666"];
const electricalLoadOption = reactive<EChartsOption>({
  title: {
    text: "負載 (kW)",
    textStyle: { fontSize: 18 },
    left: "3%",
  },
  color: electricalLoadColors,
  tooltip: {
    trigger: "axis",
    axisPointer: { animation: false },
  },
  legend: { right: "5%", top: "10%" },
  grid: { top: 90, left: "10%", right: "5%", bottom: 50 },
  xAxis: [
    {
      type: "time",
      axisLine: {
        onZero: false,
        lineStyle: {
          color: electricalLoadColors[0],
        },
      },
      splitLine: {
        show: false,
      },
      minInterval: 60000, // 最小間隔設為一分鐘
      min: Date.now() - 6 * 60 * 1000,
      max: Date.now(),
    },
    {
      type: "time",
      axisLine: {
        onZero: false,
        lineStyle: {
          color: electricalLoadColors[1],
        },
      },
      splitLine: {
        show: false,
      },
      minInterval: 60000, // 最小間隔設為一分鐘
      min: Date.now() - 6 * 60 * 1000,
      max: Date.now(),
    },
  ],
  yAxis: [
    {
      type: "value",
      splitLine: {
        show: false,
      },
      boundaryGap: [0, "100%"],
    },
  ],
  series: [
    {
      name: "今天",
      type: "line",
      xAxisIndex: 1,
      smooth: true,
      showSymbol: false,
      data: todayData,
    },
    {
      name: "昨天",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: yesterdayData,
    },
  ],
});

// 電流
const electricCurrentData = reactive<{ name: string; value: number[] }[]>([]);
// 電流的 chart option
const electricCurrentOption = reactive<EChartsOption>({
  title: {
    text: "電流 (A)",
    textStyle: {
      fontSize: 18,
    },
    left: "3%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      animation: false,
    },
  },
  grid: {
    top: 40,
    left: $q.screen.xs || $q.screen.sm ? "15%" : "12%",
    right: "5%",
  },
  xAxis: {
    type: "time",
    splitLine: {
      show: false,
    },
    min: Date.now() - 6 * 60 * 1000,
    max: Date.now(),
  },
  yAxis: {
    type: "value",
    boundaryGap: [0, "100%"],
    splitLine: {
      show: false,
    },
    min: 0,
    max: 30,
  },
  series: [
    {
      name: "電流",
      type: "line",
      showSymbol: false,
      data: electricCurrentData,
    },
  ] as LineSeriesOption[],
});

// 負載與電流的假資料
const startDate: { [key: string]: Date } = {
  today: new Date(Date.now() - backSeconds * oneSecond),
  yesterday: new Date(Date.now() - backSeconds * oneSecond - 86400000),
};
let lastUpdateTime = Date.now();
// 產出負載的假資料
function generateRandomData(data: ChartData[], startDateKey: string) {
  startDate[startDateKey] = new Date(
    startDate[startDateKey].getTime() + oneSecond
  ); // 增加一秒
  const lastValue = data.length > 0 ? data[data.length - 1].value[1] : 1500;
  const newValue = Math.max(
    1000,
    Math.min(2000, +lastValue + (Math.random() * 2 - 1) * 100)
  ); // 確保值在 1000 到 2000 之間

  return {
    name: date.formatDate(startDate[startDateKey], "HH:mm:ss"),
    value: [+startDate[startDateKey], +newValue.toFixed(2)],
  };
}

// 生成負載與電流初始的假資料
for (let i = 0; i < backSeconds; i++) {
  const todayValue = generateRandomData(todayData, "today");
  todayData.push(todayValue);
  yesterdayData.push(generateRandomData(yesterdayData, "today"));
  // 負載的假資料需與電流的假資料有正相關 => 轉換負載今天的資料成電流的資料
  const { cloned } = useCloned(todayValue);
  cloned.value.value[1] = +((cloned.value.value[1] * 20) / 2000).toFixed(2);
  electricCurrentData.push(cloned.value);
}
// 更新負載與電流的時間區間
function updateTimespan() {
  const timeSpan = {
    min: Date.now() - 6 * 60 * 1000,
    max: Date.now(),
  };
  (electricalLoadOption.xAxis as XAXisOption[]).forEach((item) => {
    item.min = timeSpan.min;
    item.max = timeSpan.max;
  });

  (electricCurrentOption.xAxis as XAXisOption) = timeSpan;
}
// 更新電流的 Series
function updateElectricCurrentSeries() {
  if (electricCurrentOption.series) {
    (electricCurrentOption.series as LineSeriesOption[])[0].data =
      electricCurrentData;
  }
}
// 更新負載與電流的資料
function updateElectricData() {
  const now = Date.now();
  if (now - lastUpdateTime >= threeSeconds) {
    for (let i = 0; i < 3; i++) {
      // 更新負載資料
      todayData.shift();
      yesterdayData.shift();
      const todayValue = generateRandomData(todayData, "today");
      todayData.push(todayValue);
      yesterdayData.push(generateRandomData(yesterdayData, "today"));
      // 更新電腦資料
      electricCurrentData.shift();
      const { cloned } = useCloned(todayValue);
      cloned.value.value[1] = +((cloned.value.value[1] * 20) / 230).toFixed(2);
      electricCurrentData.push(cloned.value);
    }
    updateElectricCurrentSeries();
    updateTimespan();
    lastUpdateTime = now;
  }
  requestAnimationFrame(updateElectricData);
}
requestAnimationFrame(updateElectricData);

// 油量
// 緊急應變時遞減油亮至 800
watch(processRunning, async (newValue, oldValue) => {
  if (newValue && !oldValue) setTimeout(decreaseOilValue, 4000);
});
let decreaseAnimationFrameId: number;
let lastDecreaseTime = Date.now();
function decreaseOilValue() {
  const now = Date.now();
  const deltaTime = now - lastDecreaseTime;

  // 將 deltaTime 轉換為分鐘，如果超過一分鐘，則減少 20 油量
  if (deltaTime >= 60000) {
    if (oilValue[0].value > 800) {
      oilValue[0].value -= 10;
      oilTitle.subtext = `—總油量: ${oilValue[0].value}L`;
      lastDecreaseTime = now; // 更新 lastDecreaseTime 至當前時間
    } else {
      // 当油量等于 800 时取消 requestAnimationFrame 的监听
      cancelAnimationFrame(decreaseAnimationFrameId);
      return;
    }
  }

  // 只有當油量大於 800 時才繼續調用 requestAnimationFrame
  if (oilValue[0].value > 800) {
    decreaseAnimationFrameId = requestAnimationFrame(decreaseOilValue);
  }
}

const oilValue = reactive([
  {
    value: 900,
  },
]);
const oilTitle = reactive({
  text: "油量 (L)",
  textStyle: {
    fontSize: 18,
  },
  left: "3%",
  subtext: "— 總油量: " + oilValue[0].value + "L",
  subtextStyle: {
    fontSize: 16,
    color: "#000",
  },
});
const oilOption = reactive<EChartsOption>({
  title: oilTitle,
  series: [
    {
      type: "gauge",
      min: 0,
      max: 1000,
      radius: $q.screen.lt.xs || $q.screen.lt.sm ? "78%" : "95%",
      center:
        $q.screen.lt.xs || $q.screen.lt.sm ? ["50%", "65%"] : ["50%", "70%"],
      axisLine: {
        lineStyle: {
          width: 10,
          color: [
            [0.3, "#fd666d"],
            [0.7, "#37a2da"],
            [1, "#5dda37"],
          ],
        },
      },
      pointer: {
        itemStyle: {
          color: "auto",
        },
      },
      axisTick: {
        distance: -8, // 更新刻度距離
        length: 8, // 可以根據需要進一步調整
        lineStyle: {
          color: "#fff",
          width: 2,
        },
      },
      splitLine: {
        distance: -20,
        length: 20,
        lineStyle: {
          color: "#fff",
          width: 4,
        },
      },
      axisLabel: {
        color: "inherit",
        distance: $q.screen.lt.xs || $q.screen.lt.sm ? 18 : 20,
        fontSize: $q.screen.lt.xs || $q.screen.lt.sm ? 14 : 16,
      },
      detail: {
        valueAnimation: true,
        formatter: "{value} L",
        color: "inherit",
        fontSize: $q.screen.lt.xs || $q.screen.lt.sm ? 18 : 20,
      },
      data: oilValue,
    },
  ],
});
</script>

<style lang="scss" scoped>
.q-btn-group button ~ button {
  border-left: 1px solid #ccc;
}
.deviceStatusContainer {
  & > * {
    -webkit-font-smoothing: antialiased;
  }
  & > .deviceBoxsContainer,
  & > .right {
    flex: 1 0 auto;
  }
  & > .deviceBoxsContainer {
    height: calc(100vh - 82px);
    padding: 0.8rem;
    flex-basis: calc(100% * 7 / 12);
    @media screen and (max-width: 768px) {
      max-height: calc(100vh - 32px - 2rem - 137.8px - 2rem - 72px - 1.2rem);
      overflow-y: auto;
      // height: 100%;
      flex-basis: auto;
    }
    .deviceGridSystem {
      display: grid;
      gap: 1rem;
      @media screen and (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        // grid-template-rows: calc(390px + 67px); // 正方形
        grid-template-rows: calc(165px + 67px); // TODO: 展場用 => 結束後可刪
        .fixRight {
          grid-column: 2 / 3;
          // grid-row: 1 / 3;
          grid-row: 1 / 5; // TODO: 展場用 => 結束後可刪
        }
        &.retractRightSide {
          grid-template-columns: repeat(3, 1fr);
          .fixRight {
            grid-column: 3 / 4;
          }
        }

        // TODO: 展場用 => 結束後可刪
        .levelMeter {
          grid-row: 1 / 3;
        }
      }
    }
  }
  & > .right {
    flex-basis: calc(100% * 5 / 12 - 64px);
    @media screen and (max-width: 768px) {
      flex-basis: auto;
      width: calc(100% - 4rem);
    }
  }
}

.waterBox {
  --squareSize: 100px;
  height: var(--squareSize);
  width: var(--squareSize);
  border: solid 2px skyblue;
  position: relative;
  .innerBox {
    border: solid 0px white;
    inset: 0;
    position: absolute;
    overflow: hidden;
    .percentage {
      position: absolute;
      font-size: 1.5rem;
      inset: 0;
      display: grid;
      place-items: center;
    }

    .water {
      background-color: lightblue;
      height: 50%;
      width: 400%;
      position: absolute;
      left: 0%;
      bottom: 0%;
      clip-path: polygon(
        0 0,
        10% 10%,
        20% 0,
        30% 10%,
        40% 0,
        50% 10%,
        60% 0,
        70% 10%,
        80% 0,
        90% 10%,
        100% 0,
        100% 100%,
        0 100%
      );
      animation: wave 5s linear infinite;
    }
  }
}

@keyframes wave {
  0% {
    left: -100%;
  }
  100% {
    left: 0%;
  }
}
.battery {
  position: relative;
  width: 120px;
  height: 50px;
  .outer {
    width: 100px;
    height: 50px;
    border: 6px solid #4e4e4e;
    border-radius: 3px;
    overflow: hidden;
  }
  .inner {
    height: 40px;
    background-color: #f7dd4c;
  }
  .cap {
    width: 10px;
    height: 20px;
    border: 5px solid #4e4e4e;
    border-left: none;
    position: absolute;
    margin-left: 100px;
    margin-top: 15px;
  }
}

.deviceBox {
  padding: 0 0 0.25rem 0;
  display: grid;
  border: 1px solid #eee;
  border-radius: 0.2rem;
  box-shadow: 0 0 0.2rem #ddd;

  .flexBox {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &.flexBoxTab {
      background-color: #f0f0f0;
      min-height: 3rem;
      box-shadow: 0px 1px 3px #00000029;
    }
    &.flexBoxContent {
      padding: 16px;
      @media screen and (max-width: 768px) {
        flex-direction: column;
        gap: 0.8rem;
      }
    }
    .grow {
      flex: 1;
    }
    .deviceName {
      padding-left: 18.5px;
      font-size: 20px;
      font-weight: bold;
      @media screen and (max-width: 768px) {
        font-size: 18px;
        padding-left: 14px;
      }
    }
    .devicePosition {
      @media screen and (max-width: 768px) {
        padding-left: 14px;
      }
      font-size: 15px;
      letter-spacing: 1px;
    }
    .missionBtn {
      margin-right: 12px;
      font-size: 18px;
      font-weight: 600;
      padding: 0 20px;
      height: 33px;
      border-radius: 6px;
      @media screen and (max-width: 768px) {
        padding: 0 8px;
        font-size: 1rem;
        height: 30px;
      }
    }
    // 水位計設計
    .levelMeterData {
      font-size: 17px;
      .title {
        font-size: 19px;
      }
    }
  }
  // Default Grid Box
  .defaultGridBox {
    display: grid;
    font-size: 20px;
    & > div {
      padding: 18px 24px;
      .q-chip {
        font-size: 19px;
        padding: 0 7px;
        margin: 0 20px 0 0;
        background-color: $positive;
        color: #fff;
        border-radius: 0.5rem;
        line-height: 34px;
        &.red {
          background-color: #bf4242;
        }
      }
      .pointsBox {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
    }
  }
}

// Charts
.chart {
  width: 100%;
  height: 240px; // 預設
  margin-top: 0.8rem;
}
</style>
