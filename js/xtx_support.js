/* 姓名：xutongxin | 学号：24001010909 | 时间：2026-11-12 | 大模型：gpt-6.1-sol */
'use strict';
const xtx_form = document.getElementById('xtx_chat_form');
const xtx_prompt = document.getElementById('xtx_prompt');
const xtx_log = document.getElementById('xtx_conversation');
const xtx_status = document.getElementById('xtx_chat_status');
const xtx_send = document.getElementById('xtx_send');
const xtx_clear = document.getElementById('xtx_clear');
const xtx_suggestions = [...document.querySelectorAll('.xtx_suggestions button')];

let xtx_busy = false;
function xtx_addMessage(xtx_role, xtx_text) {
  const xtx_article = document.createElement('article');
  xtx_article.className = 'xtx_message';
  xtx_article.dataset.role = xtx_role;
  const xtx_name = document.createElement('strong');
  xtx_name.textContent = xtx_role === 'user' ? '你' : '知识库客服';
  const xtx_content = document.createElement('p');
  xtx_content.textContent = xtx_text;
  xtx_article.append(xtx_name, xtx_content);
  xtx_log.append(xtx_article);
  xtx_log.scrollTop = xtx_log.scrollHeight;
  return xtx_article;
}
xtx_form.addEventListener('submit', async (xtx_event) => {
  xtx_event.preventDefault();
  const xtx_text = xtx_prompt.value.trim();
  if (xtx_busy || !xtx_text) return;
  xtx_busy = true;
  [xtx_send, xtx_clear, ...xtx_suggestions].forEach(xtx_button => { xtx_button.disabled = true; });
  xtx_log.setAttribute('aria-busy', 'true');
  xtx_status.dataset.error = 'false';
  xtx_status.textContent = '正在思考，请稍候…';
  const xtx_userNode = xtx_addMessage('user', xtx_text);
  xtx_prompt.value = '';
  document.getElementById('xtx_sources').replaceChildren();
  console.log('发送的提示词：', xtx_text);
  
  try {
    const xtx_response = await fetch(xtx_backendUrl('/api/knowledge/ask'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xtx_question: xtx_text }), signal: AbortSignal.timeout(65000) });
    const xtx_result = await xtx_response.json();
    console.log('发送给 LLM 的完整请求（无 Key）：', xtx_result.data?.xtx_request);
    console.log('从 LLM 获得的数据及来源：', xtx_result);
    if (xtx_result.data?.xtx_sources) xtx_renderSources(xtx_result.data.xtx_sources);
    if (xtx_response.status === 404) throw new Error('聊天接口未加载，请重启后端服务');
    if (!xtx_response.ok || xtx_result.code !== 0) throw new Error(xtx_result.msg || '请求失败');
    xtx_addMessage('assistant', xtx_result.data.xtx_reply);
    
    xtx_status.textContent = xtx_result.data.xtx_finish_reason === 'length' ? '回复达到长度上限，可发送“请继续”' : '回复完成';
  } catch (xtx_error) {
    console.error('聊天错误：', xtx_error);
    xtx_userNode.remove();
    if (!xtx_prompt.value) xtx_prompt.value = xtx_text;
    xtx_status.dataset.error = 'true';
    xtx_status.textContent = xtx_error.name === 'TimeoutError' ? '请求超时，请重新发送' : xtx_error.message;
  } finally {
    xtx_busy = false;
    [xtx_send, xtx_clear, ...xtx_suggestions].forEach(xtx_button => { xtx_button.disabled = false; });
    xtx_log.setAttribute('aria-busy', 'false');
    xtx_prompt.focus();
  }
});
xtx_prompt.addEventListener('keydown', xtx_event => {
  if (xtx_event.key === 'Enter' && !xtx_event.shiftKey && !xtx_event.isComposing) { xtx_event.preventDefault(); xtx_form.requestSubmit(); }
});
xtx_clear.addEventListener('click', () => {  xtx_log.replaceChildren(); xtx_addMessage('assistant', '新的对话已开始，有什么想一起探索的？'); xtx_status.textContent = '准备好检索知识库'; xtx_status.dataset.error = 'false'; xtx_prompt.value = ''; document.getElementById('xtx_sources').replaceChildren(); xtx_prompt.focus(); });
xtx_suggestions.forEach(xtx_button => xtx_button.addEventListener('click', () => { xtx_prompt.value = xtx_button.textContent; xtx_prompt.focus(); }));

function xtx_renderSources(xtx_sources) {
 const xtx_container = document.getElementById('xtx_sources');
 xtx_container.replaceChildren();
 if (!xtx_sources.length) { xtx_container.textContent = '未找到相关片段，本次没有调用 LLM。'; return; }
 xtx_sources.forEach((xtx_source, xtx_i) => {
  const xtx_detail = document.createElement('details');
  const xtx_summary = document.createElement('summary');
  xtx_summary.textContent = '[' + (xtx_i + 1) + '] ' + xtx_source.xtx_filename + ' · 片段 ' + xtx_source.xtx_index;
  const xtx_text = document.createElement('p'); xtx_text.textContent = xtx_source.xtx_content;
  const xtx_link = document.createElement('a'); xtx_link.href = xtx_backendUrl('/api/knowledge/files/' + xtx_source.xtx_file_id); xtx_link.textContent = '下载原文件 ↓';
  xtx_detail.append(xtx_summary, xtx_text, xtx_link); xtx_container.append(xtx_detail);
 });
}
