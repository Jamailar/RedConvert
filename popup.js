// popup.js

window.onload = () => {
  const detectEl = document.getElementById('note-detect-status');
  const infoEl = document.getElementById('note-info');
  const titleSpan = document.getElementById('title-text');
  const noticeEl = document.getElementById('note-notice');
  const btnDownload = document.getElementById('btn-download');

  // 1. 默认状态：检测中...
  detectEl.style.display = 'block';
  infoEl.style.display = 'none';
  noticeEl.style.display = 'none';

  // 2. 发送消息到 Content Script 询问是否笔记页
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'CHECK_IF_NOTE_PAGE' }, (resp) => {
      if (resp && resp.isNote) {
        // 是笔记页
        detectEl.style.display = 'none';
        // 标题处理：若过长截断
        const rawTitle = resp.title || '笔记';
        const displayTitle = rawTitle.length > 30 
          ? rawTitle.slice(0, 27) + '...' 
          : rawTitle;
        titleSpan.innerText = displayTitle;
        infoEl.style.display = 'block';
      } else {
        // 不是笔记页
        detectEl.style.display = 'none';
        noticeEl.style.display = 'block';
      }
    });
  });

  // 3. 点击 下载 按钮 事件
  btnDownload.addEventListener('click', () => {
    btnDownload.innerText = '正在打包...';
    btnDownload.disabled = true;

    // 通知 Content Script 进行抓取并打包
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'MANUAL_SCRAPE' });
      // 关闭 Popup（MVP 选择直接关闭）
      window.close();
    });
  });
};
