// 提示音效
export function beep() {
  const mp3 = new Audio("../../mp3/beep.mp3");
  mp3.play();
}
export function initBeep() {
  const mp3 = new Audio("../../mp3/beep.mp3");
  mp3.loop = false;
  mp3.autoplay = false;
  mp3.muted = true;
  mp3.play();
}
