// background.js

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'DOWNLOAD_ZIP_URL') {
    const { title, zipBlobUrl } = msg;
    chrome.downloads.download({
      url: zipBlobUrl,
      filename: `${title}.zip`,
      saveAs: false,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('下载 ZIP 失败：', chrome.runtime.lastError);
      } else {
        console.log(`ZIP 下载已发起，下载 ID = ${downloadId}`);
      }
    });
    // 下载发起后，Background 就可以结束本次循环
  }

  if (msg.action === 'DOWNLOAD_IMAGE_DIRECT') {
    const { url, filename } = msg;
    console.log('[XHS-DEBUG] Background 开始下载图片:', url, filename);
    chrome.downloads.download({
      url,
      filename,
      saveAs: false,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[XHS-DEBUG] 图片下载失败：', chrome.runtime.lastError);
      } else {
        console.log(`[XHS-DEBUG] 图片下载已发起，下载 ID = ${downloadId}`);
      }
    });
  }

  if (msg.action === 'DOWNLOAD_TXT_DIRECT') {
    const { url, filename } = msg;
    console.log('[XHS-DEBUG] Background 开始下载正文txt:', url, filename);
    chrome.downloads.download({
      url,
      filename,
      saveAs: false,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[XHS-DEBUG] 正文txt下载失败：', chrome.runtime.lastError);
      } else {
        console.log(`[XHS-DEBUG] 正文txt下载已发起，下载 ID = ${downloadId}`);
      }
    });
  }

  if (msg.action === 'DOWNLOAD_VIDEO_DIRECT') {
    const { url, filename } = msg;
    console.log('[XHS-DEBUG] Background 开始下载视频:', url, filename);
    chrome.downloads.download({
      url,
      filename,
      saveAs: false,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[XHS-DEBUG] 视频下载失败：', chrome.runtime.lastError);
      } else {
        console.log(`[XHS-DEBUG] 视频下载已发起，下载 ID = ${downloadId}`);
      }
    });
  }

  if (msg.action === 'FOUND_VIDEO_SOURCE') {
    const { url } = msg;
    console.log('[XHS-DEBUG] Background 捕获到视频源地址:', url);
    // 可扩展为自动复制到剪贴板或通知用户
  }
});
