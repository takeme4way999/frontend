/* 姓名：xutongxin | 学号：24001010909 | 时间：2026-11-09 | 大模型：GPT-6 */
'use strict';
const xtx_canvas = document.getElementById('xtx_canvas');
const xtx_context = xtx_canvas.getContext('2d');
const xtx_button = document.getElementById('xtx_motion');
const xtx_preference = window.matchMedia('(prefers-reduced-motion: reduce)');
let xtx_paused = xtx_preference.matches;
let xtx_frame = null;
let xtx_width = 0;
let xtx_height = 0;
let xtx_previous = 0;
const xtx_particles = Array.from({ length: 32 }, () => ({
  xtx_x: Math.random(), xtx_y: Math.random(), xtx_radius: 1 + Math.random() * 2,
  xtx_speed: .000008 + Math.random() * .000012
}));
function xtx_resize() {
  xtx_width = window.innerWidth;
  xtx_height = window.innerHeight;
  const xtx_ratio = Math.min(window.devicePixelRatio || 1, 2);
  xtx_canvas.width = xtx_width * xtx_ratio;
  xtx_canvas.height = xtx_height * xtx_ratio;
  if (xtx_context) xtx_context.setTransform(xtx_ratio, 0, 0, xtx_ratio, 0, 0);
  xtx_draw(0);
}
function xtx_draw(xtx_delta) {
  if (!xtx_context) return;
  xtx_context.clearRect(0, 0, xtx_width, xtx_height);
  xtx_context.fillStyle = 'rgba(112, 137, 80, 0.22)';
  for (const xtx_particle of xtx_particles) {
    xtx_particle.xtx_y = (xtx_particle.xtx_y - xtx_delta * xtx_particle.xtx_speed + 1) % 1;
    xtx_context.beginPath();
    xtx_context.arc(xtx_particle.xtx_x * xtx_width, xtx_particle.xtx_y * xtx_height, xtx_particle.xtx_radius, 0, Math.PI * 2);
    xtx_context.fill();
  }
}
function xtx_animate(xtx_time) {
  xtx_draw(xtx_previous ? Math.min(xtx_time - xtx_previous, 50) : 0);
  xtx_previous = xtx_time;
  xtx_frame = requestAnimationFrame(xtx_animate);
}
function xtx_syncMotion() {
  if (xtx_frame !== null) cancelAnimationFrame(xtx_frame);
  xtx_frame = null;
  xtx_previous = 0;
  xtx_button.textContent = xtx_paused ? '播放背景动画' : '暂停背景动画';
  xtx_button.setAttribute('aria-pressed', String(xtx_paused));
  if (!xtx_paused && !document.hidden && xtx_context) xtx_frame = requestAnimationFrame(xtx_animate);
}
xtx_button.addEventListener('click', () => { xtx_paused = !xtx_paused; xtx_syncMotion(); });
xtx_preference.addEventListener('change', (xtx_event) => { xtx_paused = xtx_event.matches; xtx_syncMotion(); });
window.addEventListener('resize', xtx_resize);
document.addEventListener('visibilitychange', xtx_syncMotion);
xtx_resize();
xtx_syncMotion();
async function xtx_checkService() {
  const xtx_status = document.getElementById('xtx_status');
  try {
    const xtx_response = await fetch(xtx_backendUrl('/api/health'), { signal: AbortSignal.timeout(5000) });
    const xtx_result = await xtx_response.json();
    console.log('服务器返回：', xtx_result);
    if (!xtx_response.ok || xtx_result.code !== 0) throw new Error(xtx_result.msg || '连接失败');
    xtx_status.textContent = '● 服务已连接';
  } catch (xtx_error) {
    console.error('服务连接错误：', xtx_error);
    xtx_status.textContent = '○ 服务暂不可用';
  }
}
xtx_checkService();
