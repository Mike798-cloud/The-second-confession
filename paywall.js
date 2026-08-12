/**
 * 《第二份口供》1 元自愿支持系统
 * 沿用《松涛粮站》的纯前端 localStorage + sessionStorage + Cookie 结构，
 * 仅调整为第 17 号案件主题，并增加“进入案件后自动弹出一次”的安全调度。
 */
(() => {
  'use strict';

  const Paywall = {
    STORAGE_KEY: '_second_confession_support',
    SESSION_KEY: '_second_confession_support_session',
    COOKIE_KEY: '_second_confession_support_flag',
    AUTO_KEY: '_second_confession_support_auto_shown_v1',
    _autoTimer: 0,
    _observer: null,
    _autoSessionShown: false,
    _lastFocus: null,

    hasPaid() {
      try {
        const ls = localStorage.getItem(this.STORAGE_KEY);
        const ss = sessionStorage.getItem(this.SESSION_KEY);
        const cookie = this._getCookie(this.COOKIE_KEY);
        return !!(ls || ss || cookie);
      } catch (e) {
        return !!this._getCookie(this.COOKIE_KEY);
      }
    },

    markPaid() {
      const token = this._generateToken();
      try { localStorage.setItem(this.STORAGE_KEY, token); } catch (e) {}
      try { sessionStorage.setItem(this.SESSION_KEY, token); } catch (e) {}
      this._setCookie(this.COOKIE_KEY, token, 365);
    },

    _generateToken() {
      const ts = Date.now();
      const rand = Math.random().toString(36).substring(2, 10);
      try { return btoa(`${ts}_${rand}_abc_studio`); }
      catch (e) { return `${ts}_${rand}_abc_studio`; }
    },

    _setCookie(name, value, days) {
      try {
        const d = new Date();
        d.setTime(d.getTime() + days * 86400000);
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
      } catch (e) {}
    },

    _getCookie(name) {
      try {
        const cname = name + '=';
        const parts = document.cookie.split(';');
        for (const raw of parts) {
          const c = raw.trim();
          if (c.indexOf(cname) === 0) return decodeURIComponent(c.substring(cname.length));
        }
      } catch (e) {}
      return '';
    },

    _wasAutoShown() {
      if (this._autoSessionShown) return true;
      try { return localStorage.getItem(this.AUTO_KEY) === '1'; }
      catch (e) { return false; }
    },

    _markAutoShown() {
      this._autoSessionShown = true;
      try { localStorage.setItem(this.AUTO_KEY, '1'); } catch (e) {}
    },

    show(config = {}, options = {}) {
      const manual = !!options.manual;
      if (this.hasPaid()) {
        if (manual) this._showThanks('已经记录过你的支持，谢谢你。');
        return false;
      }

      this._lastFocus = document.activeElement;
      const overlay = document.getElementById('paywall-overlay');
      if (!overlay) this._createOverlay(config);
      else {
        overlay.style.display = 'flex';
        overlay.classList.remove('paywall-closing');
        overlay.classList.remove('paywall-show');
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('paywall-show')));
      }
      setTimeout(() => document.querySelector('#paywall-overlay .paywall-close')?.focus(), 30);
      return true;
    },

    hide() {
      const overlay = document.getElementById('paywall-overlay');
      if (!overlay) return;
      overlay.classList.add('paywall-closing');
      overlay.classList.remove('paywall-show');
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('paywall-closing');
        if (this._lastFocus && typeof this._lastFocus.focus === 'function') this._lastFocus.focus();
      }, 320);
    },

    _onSupport() {
      this.markPaid();
      this.hide();
      this._showThanks('感谢你的支持。第17号案件，会继续有人认真核对下去。');
    },

    _showThanks(message) {
      document.querySelectorAll('.paywall-toast').forEach(n => n.remove());
      const toast = document.createElement('div');
      toast.className = 'paywall-toast';
      toast.textContent = message || '感谢你的支持。';
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 30);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
      }, 2800);
    },

    _createOverlay(config) {
      const cfg = Object.assign({
        qrCode: 'paycode.png',
        price: '1元',
        title: '支持《第二份口供》',
        studio: 'abc studio'
      }, config || {});

      const html = `
        <div class="paywall-overlay" id="paywall-overlay" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
          <div class="paywall-card" role="document">
            <button class="paywall-close" type="button" data-paywall-close aria-label="关闭支持窗口">&times;</button>
            <div class="paywall-card-inner">
              <header class="paywall-header">
                <div class="paywall-case">CASE NO.17 / VOLUNTARY SUPPORT</div>
                <div class="paywall-title-row"><span class="paywall-heart">♡</span><div class="paywall-title" id="paywall-title">${cfg.title}</div></div>
                <div class="paywall-subtitle">自愿支持，不影响任何剧情、提示、存档或结局</div>
              </header>
              <div class="paywall-body">
                <div class="paywall-qr-wrapper">
                  <img src="${cfg.qrCode}" alt="1元支持收款码" class="paywall-qr-img">
                  <div class="paywall-qr-glow"></div>
                </div>
                <div class="paywall-qr-tip">扫码自愿支持 <strong>${cfg.price}</strong></div>
                <div class="paywall-message">
                  <p class="paywall-msg-warm">你好，我是 ${cfg.studio} 的独立开发者。</p>
                  <p class="paywall-msg-body">《第二份口供》里每一份讯问、现场照片和时间记录，都希望让你真正像在核对一份卷宗。<br>如果这次调查让你愿意多停留几分钟，可以自愿支持 <strong>${cfg.price}</strong>，给下一份案件留一盏灯。</p>
                  <p class="paywall-msg-cute">1块钱不会解锁额外线索，也不会让系统替你判断口供；它只是对创作本身的一次支持。</p>
                  <p class="paywall-msg-warm2">不支持也完全可以正常游玩到所有结局。感谢你愿意打开这份卷宗。</p>
                </div>
              </div>
              <footer class="paywall-footer">
                <div class="paywall-hint"><span>提示：</span><span>支持记录只保存在你的浏览器中；清除浏览器数据后可能需要重新记录。</span></div>
                <div class="paywall-btns">
                  <button class="paywall-btn paywall-btn-support" type="button" data-paywall-supported>已完成支持 ♡</button>
                  <button class="paywall-btn paywall-btn-later" type="button" data-paywall-close>下次一定</button>
                </div>
              </footer>
              <div class="paywall-studio">${cfg.studio}</div>
            </div>
          </div>
        </div>`;

      document.body.insertAdjacentHTML('beforeend', html);
      const overlay = document.getElementById('paywall-overlay');
      overlay.querySelectorAll('[data-paywall-close]').forEach(btn => btn.addEventListener('click', () => this.hide()));
      overlay.querySelector('[data-paywall-supported]')?.addEventListener('click', () => this._onSupport());
      overlay.addEventListener('click', e => { if (e.target === overlay) this.hide(); });
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('paywall-show')));
    },

    _gameVisible() {
      const boot = document.getElementById('boot');
      const app = document.getElementById('app');
      return !!app && !app.classList.contains('hidden') && (!boot || boot.classList.contains('hidden'));
    },

    _blockingLayerVisible() {
      const ids = ['modal', 'folder', 'hintPanel', 'theatre'];
      return ids.some(id => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('hidden');
      });
    },

    autoOnce() {
      if (this.hasPaid() || this._wasAutoShown() || !this._gameVisible()) return;
      clearTimeout(this._autoTimer);
      const tryShow = () => {
        if (this.hasPaid() || this._wasAutoShown() || !this._gameVisible()) return;
        if (document.hidden || this._blockingLayerVisible()) {
          this._autoTimer = setTimeout(tryShow, 800);
          return;
        }
        const shown = this.show({
          qrCode: 'paycode.png',
          price: '1元',
          title: '支持《第二份口供》',
          studio: 'abc studio'
        });
        if (shown) this._markAutoShown();
      };
      this._autoTimer = setTimeout(tryShow, 3000);
    },

    init() {
      const supportBtn = document.getElementById('supportBtn');
      supportBtn?.addEventListener('click', () => {
        this._markAutoShown();
        this.show({
        qrCode: 'paycode.png',
        price: '1元',
        title: '支持《第二份口供》',
        studio: 'abc studio'
      }, { manual: true });
      });

      const boot = document.getElementById('boot');
      const app = document.getElementById('app');
      const watch = () => this.autoOnce();
      if (boot) {
        this._observer = new MutationObserver(watch);
        this._observer.observe(boot, { attributes: true, attributeFilter: ['class'] });
      }
      if (app) {
        const appObserver = new MutationObserver(watch);
        appObserver.observe(app, { attributes: true, attributeFilter: ['class'] });
      }
      document.addEventListener('visibilitychange', () => { if (!document.hidden) watch(); });
      document.addEventListener('keydown', e => {
        const overlay = document.getElementById('paywall-overlay');
        if (!overlay || overlay.style.display === 'none' || !overlay.classList.contains('paywall-show')) return;
        if (e.key === 'Escape') { e.preventDefault(); this.hide(); }
      }, true);
      watch();
    }
  };

  window.Paywall = Paywall;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Paywall.init(), { once: true });
  else Paywall.init();
})();
