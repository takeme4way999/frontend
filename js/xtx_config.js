/* 姓名：xutongxin | 学号：24001010909 | 时间：2026-11-12 | 大模型：gpt-6.1-sol */
'use strict';
// Cloudflare 临时隧道更换后，只需修改这一处地址。
const xtx_backendBase = 'https://certificate-employ-geographical-three.trycloudflare.com';
function xtx_backendUrl(xtx_path) {
  return new URL(xtx_path, xtx_backendBase).href;
}
