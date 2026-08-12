/**
 * 《第二份口供》资源兼容层
 * 当前 data.js 仍引用少量 v7 影像名，但仓库公开素材仍是 v6/旧版文件名。
 * 这里只在图片真实加载失败时映射到现有对应素材，不修改剧情、阶段或证据判定。
 */
(() => {
  'use strict';

  const ASSET_MAP = Object.freeze({
    'portrait_han_v7.jpg': 'portrait_han_v6.jpg',
    'portrait_sun_v7.jpg': 'portrait_sun_v6.jpg',
    'portrait_zhao_v7.jpg': 'portrait_zhao_v6.jpg',
    'portrait_qiu_v7.jpg': 'portrait_qiu_v6.jpg',
    'portrait_feng_v7.jpg': 'scene_corridor.jpg',
    'portrait_zhong_v7.jpg': 'ev_parcel.jpg',
    'film_review_room_v7.jpg': 'film_review_meeting.jpg'
  });
  const FALLBACK = 'film_records_wide.jpg';

  function filename(src) {
    try {
      const url = new URL(src, location.href);
      return url.pathname.split('/').pop() || '';
    } catch (e) {
      return String(src || '').split('/').pop() || '';
    }
  }

  document.addEventListener('error', event => {
    const el = event.target;
    if (!(el instanceof HTMLImageElement) || el.dataset.case17Fallback === '1') return;

    const failed = filename(el.currentSrc || el.src);
    const replacement = ASSET_MAP[failed] || FALLBACK;
    el.dataset.case17Fallback = '1';
    el.src = `assets/images/${replacement}`;
    if (!el.alt) el.alt = '卷宗影像替代资料';
  }, true);
})();
