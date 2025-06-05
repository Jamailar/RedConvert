// content-script.js

// 等待 selector 出现
function waitForSelector(selectors, timeout = 5000, interval = 200) {
  // selectors: string or array of strings
  const selectorArr = Array.isArray(selectors) ? selectors : [selectors];
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      for (const sel of selectorArr) {
        if (document.querySelector(sel)) {
          clearInterval(timer);
          resolve(sel);
          return;
        }
      }
      if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject();
      }
    }, interval);
  });
}

// 文件名过滤
function sanitizeFileName(raw) {
  return raw.replace(/[\\/:*?"<>|]/g, '_').slice(0, 50);
}

// 根据 URL 判断图片扩展
function getImageExtension(url) {
  if (url.includes('.webp') || url.includes('webp')) return 'webp';
  if (url.includes('.png')) return 'png';
  return 'jpg';
}

// 获取标题，兼容多种结构
function getNoteTitle() {
  return (
    document.querySelector('#detail-title')?.innerText.trim() ||
    document.querySelector('.title')?.innerText.trim() ||
    document.querySelector('.note-title')?.innerText.trim() ||
    '笔记'
  );
}

// 获取正文段落，兼容多种结构
function getNoteTextEls() {
  let els = Array.from(document.querySelectorAll('#detail-desc .note-text'));
  if (els.length === 0) {
    els = Array.from(document.querySelectorAll('.desc .note-text'));
  }
  if (els.length === 0) {
    els = Array.from(document.querySelectorAll('.note-content .note-text'));
  }
  return els;
}

// 只获取当前笔记的图片节点
function getCurrentNoteImgEls() {
  let els = Array.from(document.querySelectorAll('.img-container img'));
  if (els.length === 0) {
    els = Array.from(document.querySelectorAll('.note-content .img-container img'));
  }
  return els;
}

// 获取当前笔记的视频URL（支持多种结构）
function getCurrentNoteVideoUrl() {
  // 1. 直接查找 <video src="...">
  let videoEl = document.querySelector('video');
  if (videoEl && videoEl.src) return videoEl.src;
  // 2. 查找 <video><source src="..."></video>
  if (videoEl) {
    const source = videoEl.querySelector('source');
    if (source && source.src) return source.src;
  }
  // 3. 兼容常见视频容器
  videoEl = document.querySelector('.video-container video') || document.querySelector('.note-video video');
  if (videoEl && videoEl.src) return videoEl.src;
  if (videoEl) {
    const source = videoEl.querySelector('source');
    if (source && source.src) return source.src;
  }
  // 4. 其他自定义结构可继续补充
  return null;
}

// 消息监听
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'CHECK_IF_NOTE_PAGE') {
    const textSelectors = [
      '#detail-desc .note-text',
      '.desc .note-text',
      '.note-content .note-text'
    ];
    const found = textSelectors.some(sel => document.querySelector(sel));
    const title = found ? getNoteTitle() : '';
    sendResponse({ isNote: found, title });
  }

  if (msg.action === 'MANUAL_SCRAPE') {
    waitForSelector([
      '#detail-desc .note-text',
      '.desc .note-text',
      '.note-content .note-text'
    ], 5000, 200)
      .then(() => {
        setTimeout(scrapeAndPackZip, 300);
      })
      .catch(() => {
        alert('笔记数据加载超时，请稍后重试');
      });
  }

  // 新增：OCR提取内容
  if (msg.action === 'MANUAL_OCR_SCRAPE') {
    waitForSelector([
      '#detail-desc .note-text',
      '.desc .note-text',
      '.note-content .note-text'
    ], 5000, 200)
      .then(() => {
        setTimeout(scrapeAndOcrToTxt, 300);
      })
      .catch(() => {
        alert('笔记数据加载超时，请稍后重试');
      });
  }

  if (msg.action === 'GET_NOTE_TEXT') {
    const textEls = getNoteTextEls();
    const paragraphs = textEls.map(span => span.innerText.trim()).filter(Boolean);
    const fullText = paragraphs.join('\n\n');
    sendResponse({ text: fullText });
    return;
  }
});

// 主函数：打包正文和图片为ZIP
async function scrapeAndPackZip() {
  try {
    const rawTitle = getNoteTitle();
    const title = sanitizeFileName(rawTitle);
    console.log('[XHS-DEBUG] 抓取到标题:', rawTitle);

    const textEls = getNoteTextEls();
    console.log('[XHS-DEBUG] 正文节点数量:', textEls.length);
    const paragraphs = textEls.map(span => span.innerText.trim()).filter(Boolean);
    const fullText = paragraphs.join('\n\n');
    console.log('[XHS-DEBUG] 正文内容预览:', fullText.slice(0, 100));

    // 只抓取当前笔记的图片
    const imgEls = getCurrentNoteImgEls();
    let imgUrls = imgEls
      .map(img => img.getAttribute('src'))
      .filter(src => src && src.includes('https://sns-webpic-qc.xhscdn.com/'));
    // 去重
    imgUrls = Array.from(new Set(imgUrls));
    console.log('[XHS-DEBUG] 去重后图片数量:', imgUrls.length);
    imgUrls.forEach((url, idx) => {
      console.log(`[XHS-DEBUG] 当前笔记图片${idx + 1}:`, url);
    });

    if (imgUrls.length === 0 && !fullText) {
      alert('未找到任何图片或正文，无法打包。');
      return;
    }

    // 初始化 JSZip
    const zip = new JSZip();
    // 添加正文txt
    const txtContent = `${rawTitle}\n\n${fullText}`;
    zip.file(`${title}.txt`, txtContent);
    // 添加图片
    const imgFolder = zip.folder('images');
    const fetchTasks = imgUrls.map(async (url, idx) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const ext = getImageExtension(url);
        imgFolder.file(`img_${idx + 1}.${ext}`, blob);
      } catch (err) {
        console.error(`[XHS-DEBUG] 图片${idx + 1} 抓取失败:`, err);
      }
    });
    await Promise.all(fetchTasks);
    // 生成 ZIP Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipBlobUrl = URL.createObjectURL(zipBlob);
    // 发送给 background 下载
    chrome.runtime.sendMessage({ action: 'DOWNLOAD_ZIP_URL', title, zipBlobUrl });
    console.log('[XHS-DEBUG] ZIP 打包完成，已发送下载请求:', title + '.zip');
    alert(`已开始下载压缩包：${title}.zip，请在浏览器下载列表查看。`);
    setTimeout(() => {
      URL.revokeObjectURL(zipBlobUrl);
    }, 30000);
  } catch (err) {
    console.error('[XHS-DEBUG] scrapeAndPackZip 异常：', err);
    alert('打包失败，请稍后重试');
  }
}

// 新增：OCR识别所有图片并合并正文，生成txt下载
async function scrapeAndOcrToTxt() {
  try {
    // 调试：打印window对象和相关字段
    console.log('[XHS-OCR][DEBUG] typeof window.Tesseract:', typeof window.Tesseract);
    if (window.Tesseract) {
      console.log('[XHS-OCR][DEBUG] window.Tesseract keys:', Object.keys(window.Tesseract));
    }
    if (!(window.Tesseract && window.Tesseract.createWorker)) {
      alert('Tesseract.js 加载失败或API不兼容');
      console.error('[XHS-OCR][DEBUG] window.Tesseract.createWorker 不可用! window.Tesseract keys:', window.Tesseract ? Object.keys(window.Tesseract) : 'undefined');
      return;
    }
    // 获取标题和正文
    const rawTitle = getNoteTitle();
    const title = sanitizeFileName(rawTitle);
    const textEls = getNoteTextEls();
    const paragraphs = textEls.map(span => span.innerText.trim()).filter(Boolean);
    const fullText = paragraphs.join('\n\n');
    // 获取图片
    const imgEls = getCurrentNoteImgEls();
    let imgUrls = imgEls
      .map(img => img.getAttribute('src'))
      .filter(src => src && src.includes('https://sns-webpic-qc.xhscdn.com/'));
    imgUrls = Array.from(new Set(imgUrls));
    if (imgUrls.length === 0 && !fullText) {
      alert('未找到任何图片或正文，无法提取。');
      return;
    }
    let ocrResults = [];
    if (window.Tesseract && window.Tesseract.createWorker) {
      // v6官方推荐用法：createWorker('eng+chi_sim')，无需再调用load/loadLanguage/initialize
      try {
        const { createWorker } = window.Tesseract;
        // 一次性加载中英文模型
        const worker = await createWorker('eng+chi_sim');
        if (typeof worker.setLogger === 'function') {
          await worker.setLogger((msg) => {
            console.log('[OCR 进度]', msg);
          });
        }
        for (let i = 0; i < imgUrls.length; i++) {
          const url = imgUrls[i];
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const imgBitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = imgBitmap.width;
            canvas.height = imgBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgBitmap, 0, 0);
            const dataUrl = canvas.toDataURL();
            const { data: { text: ocrText } } = await worker.recognize(dataUrl);
            ocrResults.push(`【图片${i + 1}】\n${ocrText.trim()}`);
          } catch (err) {
            ocrResults.push(`【图片${i + 1}】\n[识别失败]`);
            console.error(`[XHS-OCR] 图片${i + 1} 识别失败:`, err);
          }
        }
        await worker.terminate();
      } catch (err) {
        console.error('[XHS-OCR][DEBUG] createWorker/recognize/terminate异常:', err);
        alert('Tesseract.js OCR 识别失败，请检查所有tesseract相关文件版本一致');
        return;
      }
    } else {
      alert('Tesseract.js 加载失败或API不兼容 (无Tesseract对象)');
      console.error('[XHS-OCR][DEBUG] window.Tesseract 不存在!');
      return;
    }
    // 合并内容
    let txtContent = `${rawTitle}\n\n${fullText}`;
    if (ocrResults.length > 0) {
      txtContent += '\n\n--- OCR识别图片内容 ---\n' + ocrResults.join('\n\n');
    }
    // 下载txt
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.runtime.sendMessage({ action: 'DOWNLOAD_TXT_DIRECT', url, filename: `${title}_ocr.txt` });
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    alert('已开始下载OCR识别内容txt，请在浏览器下载列表查看。');
  } catch (err) {
    console.error('[XHS-OCR] 异常：', err);
    alert('OCR识别失败，请稍后重试');
  }
}
