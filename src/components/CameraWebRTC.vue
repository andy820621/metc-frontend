<template>
  <div>
    <!-- 這是要顯示WebRTC影像的video元件 -->
    <div
      class="bg-grey q-pa-sm text-white text-bold text-subtitle1"
      v-if="$props.title"
    >
      {{ $props.title }}
    </div>
    <video
      ref="videoElement"
      autoplay
      playsinline
      muted
      controls
      class="block full-width"
    ></video>
    <!-- 這是原始碼中註釋的按鈕，可用於手動啟動播放 -->
    <button @click="startPlaying">Play</button>
  </div>
</template>

<script setup lang="ts">
import "webrtc-adapter";
import { ref, onMounted } from "vue";
import Cctv, { RTCIceCandidateInit, RTCSdpType } from "src/api/Cctv";
import { uid } from "quasar";

const $q = inject("$q") as typeof QVueGlobals;

// 定義元件的 props
const props = defineProps(["deviceId", "title"]);

const videoElement = ref(); // 參考用於存取 video 元件
const peerConnection = ref<RTCPeerConnection>(); // 反應性屬性用於儲存 peerConnection

// 在元件掛載後的生命週期方法中啟動播放
onMounted(() => {
  if (!window.RTCPeerConnection) {
    console.log("WebRTC is not supported.");
    // $q.notify({
    //   type: "negative",
    //   message: "目前環境不支援 WebRTC",
    //   position: "top",
    // });
  }

  setTimeout(() => {
    startPlaying();
  }, 500);
});

// 這是啟動 WebRTC 連接的函式
async function startPlaying() {
  // 關閉現有的 peer connection
  closePeer();

  const uniqueKey = uid();

  // 創建新的 RTCPeerConnection 物件
  const pc = new RTCPeerConnection();
  peerConnection.value = pc as RTCPeerConnection; // 保存到反應性的 peerConnection 參數中

  // 當 track 事件被觸發時（表示遠端 track 已經被添加到連接中）
  pc.ontrack = ({ track, streams: [stream] }) => {
    // 當 track 取消靜音時，將其添加到 video 元件以顯示
    track.onunmute = () => {
      if (videoElement.value) videoElement.value.srcObject = stream;
    };
  };

  // 當 ICE candidate 事件被觸發時
  // ICE（Interactive Connectivity Establishment）是一種協議，用於允許兩個 WebRTC 代理找到彼此之間的最佳路徑，以直接建立連接。
  pc.onicecandidate = async function (event) {
    // 如果事件中有 candidate，則傳送到遠端伺服器
    if (event.candidate) {
      console.log("event.candidate", event.candidate);
      console.log("nowww event.candidate.toJSON(): ", event.candidate.toJSON());
      console.log(
        "nowww event.candidate JSON.stringify(event.candidate): ",
        JSON.stringify(event.candidate)
      );

      try {
        await Cctv.apiAddIceCandidate(
          uniqueKey,
          // event.candidate.toJSON() as unknown as RTCIceCandidateInit
          JSON.stringify(event.candidate) as unknown as RTCIceCandidateInit
        );
        // $q.notify({
        //   type: "positive",
        //   message: "發送 ICE 候選人到 server 成功",
        //   position: "top",
        // });
      } catch (err) {
        console.log(err);
        // $q.notify({
        //   type: "negative",
        //   message: `交換 ICE 發生錯誤: ${err}`,
        //   position: "top",
        // });
      }
      // finally {
      //   pc.getStats(null)
      //     .then((stats) => {
      //       stats.forEach((report) => {
      //         console.log("nowww WebRTC status: ", report);
      //         // 这里您可以根据 report.type 进行过滤，比如只打印候选人(candidate)信息
      //         if (report.type === "candidate-pair") {
      //           $q.notify({
      //             type: "info",
      //             message: `WebRTC status: ${report.type}`,
      //             position: "top",
      //           });
      //         }
      //       });
      //     })
      //     .catch((error) => console.error(error));
      // }
    }
  };

  // 當 ICE gathering state 變化時，打印其狀態
  pc.onicegatheringstatechange = function () {
    console.log("ICE gathering state change: " + pc.iceGatheringState);
    // 可以在這裡增加對特定收集狀態的處理
    if (pc.iceGatheringState === "complete") {
      // 收集完成，可以進行下一步操作或檢查
      console.log("ICE gathering complete");
    }
  };

  // 當ICE connection state 變化時，打印其狀態
  pc.oniceconnectionstatechange = function () {
    console.log("ICE connection state change: " + pc.iceConnectionState);
    // 增加對特定狀態的處理
    if (
      pc.iceConnectionState === "failed" ||
      pc.iceConnectionState === "disconnected" ||
      pc.iceConnectionState === "closed"
    ) {
      // 處理連接問題，例如重新連接或通知用戶
      console.error(
        "ICE connection state indicates failure: ",
        pc.iceConnectionState
      );
      // $q.notify({
      //   type: "negative",
      //   message: `ICE connection problem: ${pc.iceConnectionState}`,
      //   position: "top",
      // });

      // pc.getStats(null)
      //   .then((stats) => {
      //     stats.forEach((report) => {
      //       console.log(report);
      //       // 这里您可以根据 report.type 进行过滤，比如只打印候选人(candidate)信息
      //       $q.notify({
      //         type: "info",
      //         message: `WebRTC status: ${report.type}`,
      //         position: "top",
      //       });
      //     });
      //   })
      //   .catch((error) => console.error(error));
    }
  };

  pc.onicecandidateerror = function (event: any) {
    console.error(
      "ICE candidate error:",
      event.errorText,
      "Code:",
      event.errorCode
    );
    // $q.notify({
    //   type: "negative",
    //   message: `ICE candidate error: ${event.errorText}, Code: ${event.errorCode}`,
    //   position: "top",
    // });
  };

  pc.onsignalingstatechange = () => {
    console.log("Signaling state change:", pc.signalingState);
    // $q.notify({
    //   type: "info",
    //   message: `Signaling state changed to: ${pc.signalingState}`,
    //   position: "top",
    // });
  };

  pc.onconnectionstatechange = () => {
    console.log("Connection state change:", pc.connectionState);
    if (pc.connectionState === "failed") {
      console.error("Connection has failed.");
      // $q.notify({
      //   type: "negative",
      //   message: `Connection state changed to: ${pc.connectionState}, the connection has failed.`,
      //   position: "top",
      // });
    }
    //  else {
    //   $q.notify({
    //     type: "info",
    //     message: `Connection state changed to: ${pc.connectionState}`,
    //     position: "top",
    //   });
    // }
  };

  // 從遠端伺服器獲取 offer
  try {
    const offerData = (await Cctv.apiGetOffer(
      uniqueKey,
      props.deviceId
    )) as typeof AxiosResponse;

    if (offerData.data && pc) {
      const offer = offerData.data;

      console.log("got offer: ", offer);

      offer.type = RTCSdpType[offer.type];
      // 設置遠端描述為獲取的 offer
      await pc.setRemoteDescription(offer);

      // 創建答覆並將其設置為本地描述，然後傳送到遠端伺服器
      pc.createAnswer()
        .then(function (answer) {
          return pc.setLocalDescription(answer);
        })
        .then(async function () {
          if (!pc.localDescription) return;
          console.log("pc.localDescription: ", pc.localDescription);
          const { type, sdp } = pc.localDescription;
          const payload = { type: RTCSdpType[type], sdp };

          try {
            await Cctv.apiSetAnswer(uniqueKey, payload);
          } catch (err) {
            // $q.notify({
            //   type: "negative",
            //   message: `將創建的 answer 傳送到遠端伺服器發生錯誤: ${err}`,
            //   position: "top",
            // });
          }
        })
        .catch(function (error) {
          console.error(
            "Error during answer creation or local description setting: ",
            error
          );
          // $q.notify({
          //   type: "negative",
          //   message: `Error during WebRTC operation: ${error.message}`,
          //   position: "top",
          // });
        });
    }
  } catch (err) {
    // $q.notify({
    //   type: "negative",
    //   message: `從遠端伺服器獲取 offer 發生錯誤: ${err}`,
    //   position: "top",
    // });
  }
}

// 關閉現有的 peer connection
function closePeer() {
  const pc = peerConnection.value;
  if (pc != null) {
    console.log("Closing peer");
    pc.close();
  }
}
</script>

<!-- 交換多媒體相關資訊
使用 Session Description Protocol（SDP）協定的 offer 與 answer 來交換多媒體相關的資訊（例如解析度與音視頻解碼器(codec) 等），傳輸的通道同樣是使用上面建立的信令傳輸管道。

首先呼叫 createOffer() 並傳入兩個回呼函數，它會建立一個 RTCSessionDescription 物件（包含了多媒體相關的設定資訊），當這個物件建立時會直接傳入第一個回呼函數中（localDescCreated()），而其第二個回呼函數只是單純的輸出錯誤訊息而已。

當 RTCSessionDescription 物件建立好的時候，我們在 localDescCreated() 函數中透過 setLocalDescription() 將該物件設定為 local description，再將其傳送給對方。

對方接收到這個 description 資料之後，透過 new RTCSessionDescription(message.sdp) 重建 RTCSessionDescription 物件，並呼叫 setRemoteDescription() 設定 remote description。

當對方接收到 offer 的資料，必須回傳一個 answer 作為回應，而其建立與傳送的過程與 offer 大同小異，只不過是從遠端傳回本地端而已。

當本地端接收到 answer 的回應時，同樣呼叫 setRemoteDescription() 設定 remote description，到這裡整個連線的前置作業就完成了。

網路與多媒體的資訊交換可以同時進行，只是這兩種資訊都要在真正建立視訊連線之前完成。

上述 offer 與 answer 的交換機制稱為 JavaScript Session Establishment Protocol（JSEP），當雙方都透過這樣的方式取得對方的資訊之後，就可以開始傳送多媒體的串流，進行視訊連線了。 -->
