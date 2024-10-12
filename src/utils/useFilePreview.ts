import fileRead, {
  extractFilenameAndExtension,
  showInIframe,
  excelFileTypes,
  wordFileTypes,
} from "src/utils/fileRead";
import { Notify } from "quasar";

export default function useFilePreview() {
  const previewCoverModel = ref(false);
  const imageUrl = ref("");
  const iframeUrl = ref("");
  const downloadUrl = ref("");

  const { getFile, file, useObjectUrl } = fileRead();

  watch(previewCoverModel, (val) => {
    if (!val) {
      imageUrl.value = "";
      iframeUrl.value = "";
      downloadUrl.value = "";
    }
  });

  async function setFilePreview(filePath: string, fileId: number) {
    const { filename, extension } = extractFilenameAndExtension(filePath);
    const fileUrl = await getFile(null, fileId, extension, filename);

    if (fileUrl) {
      previewCoverModel.value = true;
      if (showInIframe.includes(extension)) iframeUrl.value = fileUrl;
      else imageUrl.value = fileUrl;

      if (
        excelFileTypes.includes(extension) ||
        wordFileTypes.includes(extension)
      ) {
        const url = useObjectUrl(file).value;
        if (url) downloadUrl.value = url;
      }
    } else {
      Notify.create({
        type: "negative",
        message: "獲取檔案失敗",
        position: "top",
      });
    }
  }

  return {
    previewCoverModel,
    imageUrl,
    iframeUrl,
    downloadUrl,
    setFilePreview,
  };
}
