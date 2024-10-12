<template>
  <div class="textareaContainer">
    <div class="label no-pointer-events ellipsis">{{ label }}</div>
    <div
      ref="editableDiv"
      contenteditable="true"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeydown"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      class="contenteditableDIV"
    ></div>
    <q-input
      v-model="trueValue"
      :label="label"
      type="textarea"
      autogrow
      readonly
      :rules="[(val) => !!val || '請輸入訊息']"
      style="display: none"
    />
    <div class="flex q-gutter-md">
      <div
        v-for="(button, index) in buttons"
        :key="index"
        class="button-container"
      >
        <q-btn
          outline
          class="q-mt-md"
          :label="button.label"
          color="primary"
          @click="() => insertFirePosition(button)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";

const editableDiv = ref();
const { saveState, undo, redo } = useHistoryManager(editableDiv);

// v-model
const props = defineProps<{
  modelValue: string | undefined;
  isFocused?: boolean;
  id: string;
  blurFunc?: () => void;
  label?: string;
  buttons: { label: string; trueValue: string }[];
}>();
const emit = defineEmits(["update:modelValue", "update:isFocused"]);
const trueValue = useVModel(props, "modelValue", emit); // 該值將與父組件同步
const isFocused = useVModel(props, "isFocused", emit); // 該值將與父組件同步

let selectedNodeId: string;

watchEffect(() => {
  if (editableDiv.value) {
    if (props.modelValue) {
      if (selectedNodeId === props.id) return; // 為了確保在切換節點後才進行更新
      if (props.id) selectedNodeId = props.id;
      let currentTrueValue = props.modelValue;
      for (const button of props.buttons) {
        const regex = new RegExp(escapeRegExp(button.trueValue), "g");
        currentTrueValue = currentTrueValue.replace(
          regex,
          `<span class="content" contentEditable='false'>${button.label}</span>`
        );
        editableDiv.value.innerHTML = currentTrueValue;
      }
    } else if (!props.modelValue) {
      editableDiv.value.innerHTML = "";
    }
  }
});

// 讓正則表達式中接受特殊字符
function escapeRegExp(string: string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& 表示整個匹配項目
}

// 避免記錄注音
let isComposing = false; // 是否正在使用注音输入
function handleCompositionStart() {
  isComposing = true;
}
function handleCompositionEnd() {
  isComposing = false;
  saveState();
}

function handleFocus(e: Event) {
  isFocused.value = true;
}
function handleBlur(e: Event) {
  isFocused.value = false;
  props.blurFunc?.();
}

function handleInput() {
  let currentTrueValue = editableDiv.value.textContent;

  for (const button of props.buttons) {
    const regex = new RegExp(escapeRegExp(button.label), "g");
    currentTrueValue = currentTrueValue.replace(regex, button.trueValue);
  }
  trueValue.value = currentTrueValue;
  if (!isComposing) saveState();
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();

  const clipboardData = event.clipboardData;
  if (!clipboardData) return;

  const pastedHtml = clipboardData.getData("text/html");
  const frag = cleanPastedHTML(pastedHtml);
  console.log("pastedHtml", pastedHtml);
  console.log("frag", frag);

  // 插入文檔片段到 editableDiv
  const sel = window.getSelection();
  if (sel?.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(frag);

    // 設置光標到最後一個節點的後面
    setTimeout(() => {
      const lastNode = frag.lastChild;
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.setEndAfter(lastNode);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 1);
  }

  // 更新 trueValue
  let currentTrueValue = editableDiv.value.textContent;

  for (const button of props.buttons) {
    const regex = new RegExp(escapeRegExp(button.label), "g");
    currentTrueValue = currentTrueValue.replace(regex, button.trueValue);
  }
  trueValue.value = currentTrueValue;
  saveState();
}

function cleanPastedHTML(htmlContent: string): DocumentFragment {
  const doc = new DOMParser().parseFromString(htmlContent, "text/html");
  const frag = document.createDocumentFragment();

  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      frag.appendChild(document.createTextNode(node.textContent || ""));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (el.getAttribute("contenteditable") === "false") {
        const span = document.createElement("span");
        span.contentEditable = "false";
        span.textContent = el.textContent || "";
        frag.appendChild(span);
      } else {
        // 這裡我們只添加純文字內容，以防止嵌入不安全的 HTML
        frag.appendChild(document.createTextNode(el.textContent || ""));
      }
    }
  });

  return frag;
}

function insertFirePosition(button: { label: string; trueValue: string }) {
  const sel = window.getSelection();

  if (!sel) return;

  // 檢查是否在 editableDiv 内部
  if (!editableDiv.value.contains(sel.anchorNode)) {
    // 將光標設到 editableDiv 的最尾端
    const range = document.createRange();
    range.selectNodeContents(editableDiv.value);
    range.collapse(false); // 設置光標到尾端
    sel.removeAllRanges();
    sel.addRange(range);
  }

  insertAtCaret(button.label);
  let currentTrueValue = editableDiv.value.textContent;

  for (const button of props.buttons) {
    const regex = new RegExp(escapeRegExp(button.label), "g");
    currentTrueValue = currentTrueValue.replace(regex, button.trueValue);
  }
  trueValue.value = currentTrueValue;

  saveState();
}

function insertAtCaret(text: string) {
  const sel = window.getSelection();
  if (!sel) return;

  const range = sel.getRangeAt(0);
  range.deleteContents();

  const span = document.createElement("span");
  span.contentEditable = "false";
  span.textContent = text;

  range.insertNode(span);

  // Adjust caret position after the span
  range.setStartAfter(span);
  range.setEndAfter(span);
  sel.removeAllRanges();
  sel.addRange(range);
}

// undo / redo
interface EditableState {
  html: string;
  selection: {
    start: number;
    end: number;
  };
}
function useHistoryManager(editableDiv: Ref<HTMLDivElement>) {
  const undoStack = ref<EditableState[]>([]);
  const redoStack = ref<EditableState[]>([]);

  // 儲存當前的狀態到 undoStack
  const saveState = () => {
    const currentHTML = editableDiv.value.innerHTML;
    const currentSelection = saveSelection(editableDiv.value);
    if (
      !undoStack.value.length ||
      undoStack.value[undoStack.value.length - 1].html !== currentHTML
    ) {
      undoStack.value.push({
        html: currentHTML,
        selection: currentSelection as EditableState["selection"],
      });
      redoStack.value.length = 0; // 清空 redoStack
    }
  };

  // 儲存當前選擇的範圍
  const saveSelection = (containerEl: Node | HTMLElement) => {
    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return {
      start,
      end: start + range.toString().length,
    };
  };

  // 復原先前儲存的選擇範圍
  const restoreSelection = (
    containerEl: Node | HTMLElement,
    savedSel: EditableState["selection"]
  ) => {
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    const nodeStack = [containerEl];
    let node,
      foundStart = false,
      stop = false;
    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + (node as Text).length;
        if (
          !foundStart &&
          savedSel.start >= charIndex &&
          savedSel.start <= nextCharIndex
        ) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (
          foundStart &&
          savedSel.end >= charIndex &&
          savedSel.end <= nextCharIndex
        ) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  // 復原先前的狀態
  const undo = () => {
    if (undoStack.value.length > 1) {
      const state = undoStack.value.pop();
      if (state) redoStack.value.push(state);
      editableDiv.value.innerHTML =
        undoStack.value[undoStack.value.length - 1].html;
      restoreSelection(
        editableDiv.value,
        undoStack.value[undoStack.value.length - 1].selection
      );
    }
  };

  // 重做被撤銷的狀態
  const redo = () => {
    if (redoStack.value.length) {
      const state = redoStack.value.pop();
      if (state) undoStack.value.push(state);
      editableDiv.value.innerHTML =
        undoStack.value[undoStack.value.length - 1].html;
      restoreSelection(
        editableDiv.value,
        undoStack.value[undoStack.value.length - 1].selection
      );
    }
  };

  return {
    saveState,
    undo,
    redo,
  };
}

// 鍵盤事件監聽
function handleKeydown(e: KeyboardEvent) {
  const isUndo = (e.ctrlKey || e.metaKey) && e.key === "z";
  const isRedo =
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.shiftKey && e.key === "z")); // 在 Mac 上，Cmd + Shift + Z 通常用於重做

  if (isUndo || isRedo) e.preventDefault();

  if (isUndo) undo();
  else if (isRedo) redo();
}
</script>

<style>
.contenteditableDIV span {
  border-width: 1px;
  border-style: dashed;
  border-color: #ffac55;
  padding: 0 2px;
  margin: 0 5px;
}
</style>

<style lang="scss" scoped>
.textareaContainer {
  width: 100%;
  height: auto;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .label {
    align-self: flex-start;
    padding: 0;
    margin: 0;
  }
  .contenteditableDIV {
    width: 100%;
    height: auto;
    min-height: 50px;
    outline: 0px solid transparent;
    border-bottom: 1px dashed rgb(180, 180, 180);
    line-height: 19px;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.00937em;
    padding: 2px;
    span {
      border-width: 1px;
      border-style: dashed;
      border-color: #ffac55;
      padding: 0 2px;
      margin: 0 5px;
    }
  }
}
</style>
