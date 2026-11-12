/* 姓名：xutongxin | 学号：24001010909 | 时间：2026-11-09 | 大模型：GPT-6 */
'use strict';
const xtx_list = document.getElementById('xtx_news_list');
const xtx_status = document.getElementById('xtx_news_status');
const xtx_json = document.getElementById('xtx_json');
const xtx_refresh = document.getElementById('xtx_refresh');
const xtx_total = document.getElementById('xtx_total');
document.getElementById('xtx_api_link').href = xtx_backendUrl('/api/news');
document.getElementById('xtx_api_link').textContent = xtx_backendUrl('/api/news') + ' ↗';
function xtx_element(xtx_tag, xtx_class, xtx_text) {
  const xtx_node = document.createElement(xtx_tag);
  xtx_node.className = xtx_class;
  xtx_node.textContent = xtx_text;
  return xtx_node;
}
async function xtx_loadNews() {
  xtx_refresh.disabled = true;
  xtx_list.setAttribute('aria-busy', 'true');
  xtx_list.replaceChildren();
  xtx_total.textContent = '—';
  xtx_status.dataset.state = 'loading';
  xtx_status.textContent = '正在读取新闻…';
  xtx_json.textContent = '正在请求…';
  try {
    const xtx_response = await fetch(xtx_backendUrl('/api/news'), { cache: 'no-store', signal: AbortSignal.timeout(12000) });
    const xtx_data = await xtx_response.json();
    console.log('新闻接口返回：', xtx_data);
    xtx_json.textContent = JSON.stringify(xtx_data, null, 2);
    if (xtx_response.status === 404) throw new Error('新闻接口尚未加载，请重启后端后重试。');
    if (!xtx_response.ok || xtx_data.code !== 0) throw new Error(xtx_data.msg || '新闻加载失败');
    for (const xtx_item of xtx_data.data.xtx_items) {
      const xtx_article = xtx_element('article', 'xtx_news_item', '');
      const xtx_meta = xtx_element('div', 'xtx_news_meta', '');
      xtx_meta.append(xtx_element('span', 'xtx_news_category', xtx_item.xtx_category), xtx_element('span', 'xtx_news_date', xtx_item.xtx_published_at));
      xtx_article.append(xtx_meta, xtx_element('h3', 'xtx_news_title', xtx_item.xtx_title), xtx_element('p', 'xtx_news_summary', xtx_item.xtx_summary), xtx_element('span', 'xtx_news_source', xtx_item.xtx_source));
      xtx_list.append(xtx_article);
    }
    xtx_total.textContent = String(xtx_data.data.xtx_total).padStart(2, '0');
    xtx_status.dataset.state = 'success';
    xtx_status.textContent = xtx_data.data.xtx_total ? '已从 MySQL 读取最新数据 · 按发布时间倒序' : '暂无新闻';
  } catch (xtx_error) {
    console.error('新闻加载错误：', xtx_error);
    xtx_status.dataset.state = 'error';
    xtx_status.textContent = xtx_error.name === 'TimeoutError' ? '请求超时，请稍后刷新重试。' : xtx_error.message;
    if (xtx_json.textContent === '正在请求…') xtx_json.textContent = '未收到有效 JSON 响应，请检查后端服务。';
  } finally {
    xtx_refresh.disabled = false;
    xtx_list.setAttribute('aria-busy', 'false');
  }
}
xtx_refresh.addEventListener('click', xtx_loadNews);
xtx_loadNews();
