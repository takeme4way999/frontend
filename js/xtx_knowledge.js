/* 姓名：xutongxin | 学号：24001010909 | 时间：2026-11-12 | 大模型：gpt-6.1-sol */
'use strict';
const xtx_form = document.getElementById('xtx_upload_form');
const xtx_input = document.getElementById('xtx_file');
const xtx_upload = document.getElementById('xtx_upload');
const xtx_status = document.getElementById('xtx_upload_status');
const xtx_filesStatus = document.getElementById('xtx_files_status');
async function xtx_loadFiles() {
  const xtx_list = document.getElementById('xtx_files');
  xtx_filesStatus.textContent = '正在读取…';
  xtx_filesStatus.dataset.error = 'false';
  try {
    const xtx_response = await fetch(xtx_backendUrl('/api/knowledge/files'), { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    const xtx_data = await xtx_response.json();
    console.log('知识库文件列表：', xtx_data);
    if (!xtx_response.ok || xtx_data.code !== 0) throw new Error(xtx_response.status === 404 ? '接口未加载，请重启后端服务' : xtx_data.msg);
    xtx_list.replaceChildren();
    document.getElementById('xtx_file_count').textContent = xtx_data.data.xtx_files.length;
    for (const xtx_file of xtx_data.data.xtx_files) {
      const xtx_card = document.createElement('article'); xtx_card.className = 'xtx_file_card';
      const xtx_title = document.createElement('h3'); xtx_title.textContent = xtx_file.xtx_filename;
      const xtx_meta = document.createElement('p'); xtx_meta.textContent = `${xtx_file.xtx_chunks} 个知识片段 · ${(xtx_file.xtx_size / 1024).toFixed(1)} KB · 已就绪`;
      const xtx_link = document.createElement('a'); xtx_link.href = xtx_backendUrl('/api/knowledge/files/' + xtx_file.xtx_file_id); xtx_link.textContent = '下载原文件 ↓';
      xtx_card.append(xtx_title, xtx_meta, xtx_link); xtx_list.append(xtx_card);
    }
    xtx_filesStatus.textContent = xtx_data.data.xtx_files.length ? '资料已持久化到 MySQL，可供客服检索。' : '知识库为空，请上传第一份文件。';
  } catch (xtx_error) { console.error('读取文件失败：', xtx_error); xtx_filesStatus.dataset.error = 'true'; xtx_filesStatus.textContent = xtx_error.message; }
}
xtx_form.addEventListener('submit', async xtx_event => {
  xtx_event.preventDefault();
  const xtx_file = xtx_input.files[0];
  if (!xtx_file || xtx_upload.disabled) return;
  if (xtx_file.size > 5 * 1024 * 1024 || !/\.(txt|pdf)$/i.test(xtx_file.name)) { xtx_status.dataset.error = 'true'; xtx_status.textContent = '请选择 5 MB 以内的 TXT 或 PDF 文件'; return; }
  xtx_upload.disabled = true; xtx_status.dataset.error = 'false'; xtx_status.textContent = '正在上传、解析并构建知识片段…';
  try {
    const xtx_body = new FormData(); xtx_body.append('xtx_file', xtx_file);
    const xtx_response = await fetch(xtx_backendUrl('/api/knowledge/upload'), { method: 'POST', body: xtx_body, signal: AbortSignal.timeout(90000) });
    const xtx_data = await xtx_response.json(); console.log('知识库上传响应：', xtx_data);
    if (!xtx_response.ok || xtx_data.code !== 0) throw new Error(xtx_data.msg);
    xtx_status.textContent = `上传成功：${xtx_data.data.xtx_filename}，生成 ${xtx_data.data.xtx_chunks} 个知识片段。`;
    xtx_form.reset(); await xtx_loadFiles();
  } catch (xtx_error) { console.error('知识库上传失败：', xtx_error); xtx_status.dataset.error = 'true'; xtx_status.textContent = xtx_error.name === 'TimeoutError' ? '请求超时，请刷新列表确认是否已入库' : xtx_error.message; }
  finally { xtx_upload.disabled = false; }
});
document.getElementById('xtx_refresh_files').addEventListener('click', xtx_loadFiles);
xtx_loadFiles();
