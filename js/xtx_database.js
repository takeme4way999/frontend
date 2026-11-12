/* 姓名：xutongxin | 学号：24001010909 | 时间：2026-11-09 | 大模型：GPT-6 */
'use strict';
const xtx_form = document.getElementById('xtx_database_form');
const xtx_default = document.getElementById('xtx_use_default');
const xtx_user = document.getElementById('xtx_user');
const xtx_password = document.getElementById('xtx_password');
const xtx_connect = document.getElementById('xtx_connect');
const xtx_result = document.getElementById('xtx_result');
xtx_default.addEventListener('change', () => {
  xtx_user.disabled = xtx_password.disabled = xtx_default.checked;
  xtx_user.required = !xtx_default.checked;
  if (!xtx_default.checked) xtx_user.focus();
});
xtx_form.addEventListener('submit', async (xtx_event) => {
  xtx_event.preventDefault();
  xtx_connect.disabled = true;
  xtx_form.setAttribute('aria-busy', 'true');
  xtx_result.dataset.state = 'loading';
  xtx_result.textContent = '正在连接 MySQL，请稍候…';
  try {
    const xtx_body = xtx_default.checked ? {} : { xtx_user: xtx_user.value.trim(), xtx_password: xtx_password.value };
    const xtx_response = await fetch(xtx_backendUrl('/api/database/test'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xtx_body), signal: AbortSignal.timeout(12000)
    });
    const xtx_data = await xtx_response.json();
    console.log('数据库连接测试返回：', xtx_data);
    if (!xtx_response.ok || xtx_data.code !== 0) throw new Error(xtx_data.msg || '数据库连接失败');
    xtx_result.dataset.state = 'success';
    xtx_result.textContent = xtx_data.msg;
  } catch (xtx_error) {
    console.error('数据库连接测试错误：', xtx_error);
    xtx_result.dataset.state = 'error';
    xtx_result.textContent = xtx_error.name === 'TimeoutError' ? '请求超时，请稍后重试。' : xtx_error instanceof TypeError ? '无法连接后端服务，请确认服务已启动。' : xtx_error.message;
  } finally {
    xtx_connect.disabled = false;
    xtx_form.setAttribute('aria-busy', 'false');
  }
});
