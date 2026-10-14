/* ══════════════════════════════════════════════════════════════
   翁法罗斯 · 黄金裔 —— 交互脚本
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ═══════ 1. 载入 ═══════ */
  (function loader() {
    var el = $('#loader'), pct = $('#loaderPct'), n = 0;
    var t = setInterval(function () {
      n = Math.min(100, n + Math.random() * 17 + 5);
      if (pct) pct.textContent = Math.floor(n);
      if (n >= 100) {
        clearInterval(t);
        setTimeout(function () {
          el.classList.add('done');
          document.body.classList.add('ready');
          setTimeout(function () { el.style.display = 'none'; }, 950);
        }, 380);
      }
    }, 150);
    // 兜底：无论如何 3.2 秒后必开
    setTimeout(function () {
      clearInterval(t);
      el.classList.add('done');
      document.body.classList.add('ready');
      setTimeout(function () { el.style.display = 'none'; }, 950);
    }, 3200);
  })();

  /* ═══════ 2. 星尘 · 火种粒子 ═══════ */
  (function embers() {
    var cv = $('#embers');
    if (!cv || REDUCED) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], mouse = { x: -999, y: -999 };
    var COLORS = ['#d4af37', '#ffe9a8', '#fff6d0', '#e8cd77', '#b8912c'];

    function resize() {
      W = cv.width  = Math.floor(innerWidth  * dpr);
      H = cv.height = Math.floor(innerHeight * dpr);
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      var target = Math.round(Math.min(160, Math.max(48, innerWidth / 11)));
      parts = [];
      for (var i = 0; i < target; i++) parts.push(make(true));
    }
    function make(spread) {
      return {
        x: Math.random() * W,
        y: spread ? Math.random() * H : H + 12 * dpr,
        r: (Math.random() * 1.5 + .5) * dpr,
        vy: -(Math.random() * .26 + .07) * dpr,
        vx: (Math.random() - .5) * .17 * dpr,
        a: Math.random() * .5 + .18,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * .022 + .006,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0, max: Math.random() * 500 + 340
      };
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy; p.tw += p.tws; p.life++;
        // 鼠标斥力
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 20000 * dpr) {
          var d = Math.sqrt(d2) || 1, f = (1 - d / (141 * dpr)) * 1.5;
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }
        var alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        if (p.life > p.max * .72) alpha *= (1 - (p.life - p.max * .72) / (p.max * .28));
        if (p.y < -12 * dpr || p.life > p.max || p.x < -20 || p.x > W + 20) { parts[i] = make(false); continue; }
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
        if (p.r > 1.3 * dpr) { // 火种光晕
          ctx.globalAlpha = Math.max(0, alpha * .16);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4.5, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    resize();
    addEventListener('resize', resize, { passive: true });
    addEventListener('pointermove', function (e) {
      mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
    }, { passive: true });
    addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    requestAnimationFrame(frame);
  })();

  /* ═══════ 3. 自定义光标 ═══════ */
  (function cursor() {
    if (!FINE || REDUCED) return;
    var ring = $('.cursor-ring'), dot = $('.cursor-dot');
    var rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry, mx = rx, my = ry;
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('cursor-ready');
    }, { passive: true });
    (function loop() {
      rx += (tx - rx) * .16; ry += (ty - ry) * .16;
      mx += (tx - mx) * .55; my += (ty - my) * .55;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      dot.style.transform  = 'translate(' + mx + 'px,' + my + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor="link"],a,button,.card,.gcard,.chip,.fire-node');
      document.body.classList.toggle('cursor-hover', !!t);
    });
  })();

  /* ═══════ 4. 导航 / 进度条 ═══════ */
  (function nav() {
    var nav = $('#nav'), bar = $('#progressBar');
    var links = $$('.nav-links a');
    var secs = links.map(function (a) { return $(a.getAttribute('href')); });

    function onScroll() {
      var y = scrollY;
      nav.classList.toggle('solid', y > 60);
      var max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      var cur = -1;
      secs.forEach(function (s, i) {
        if (s && s.getBoundingClientRect().top <= innerHeight * .42) cur = i;
      });
      links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    onScroll();
  })();

  /* ═══════ 5. Reveal ═══════ */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

  function watchReveal(root) {
    $$('.reveal', root).forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i, 8) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ═══════ 6. 数字滚动 ═══════ */
  function animateNum(el, to, opts) {
    opts = opts || {};
    var dur = opts.duration || 2200, t0 = null;
    function fmt(v) {
      if (opts.compact && v >= 10000) return Math.round(v / 10000) + '万';
      return Math.round(v).toLocaleString('en-US');
    }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(to);
    }
    requestAnimationFrame(step);
  }
  var numIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      animateNum(el, +el.dataset.count, { compact: el.dataset.compact === '1', duration: el.classList.contains('counter') ? 3000 : 1800 });
      numIO.unobserve(el);
    });
  }, { threshold: .5 });

  /* ═══════ 7. 火种环 ═══════ */
  (function fireOrbit() {
    var host = $('#fireOrbit');
    if (!host || typeof CHARACTERS === 'undefined') return;
    ['r1', 'r2', 'r3'].forEach(function (c) {
      var d = document.createElement('div'); d.className = 'ring ' + c; host.appendChild(d);
    });
    var core = document.createElement('div'); core.className = 'core'; host.appendChild(core);

    var n = CHARACTERS.length;
    CHARACTERS.forEach(function (ch, i) {
      var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      var R = 44; // %
      var node = document.createElement('button');
      node.className = 'fire-node';
      node.type = 'button';
      node.textContent = ch.fire;
      node.style.left = (50 + Math.cos(ang) * R) + '%';
      node.style.top  = (50 + Math.sin(ang) * R) + '%';
      node.style.color = ch.c2;
      node.style.borderColor = ch.c1 + '80';
      node.title = ch.name + ' · ' + ch.fire;
      node.addEventListener('click', function () { openDetail(i); });
      node.addEventListener('pointerenter', function () {
        node.style.background = ch.c1;
        node.style.boxShadow = '0 0 0 1px ' + ch.c2 + ',0 0 34px ' + ch.c1;
      });
      node.addEventListener('pointerleave', function () {
        node.style.background = '';
        node.style.boxShadow = '';
      });
      host.appendChild(node);
    });
  })();

  /* ═══════ 8. 逐火长卷 ═══════ */
  (function track() {
    var el = $('#scrollTrack'), rail = $('#railFill');
    if (!el || typeof CHARACTERS === 'undefined') return;

    CHARACTERS.forEach(function (ch, i) {
      var card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', ch.name + ' 档案');
      card.style.setProperty('--accent', ch.c1);
      card.innerHTML =
        '<img class="card-art" src="' + ch.artSm + '" alt="' + esc(ch.name) + '" loading="lazy" decoding="async">' +
        '<div class="card-fade"></div>' +
        '<span class="card-idx">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="card-fire">' + esc(ch.fire) + '</span>' +
        '<div class="card-body">' +
          '<h3 class="card-name">' + esc(ch.name) + '</h3>' +
          '<p class="card-role">' + esc(ch.title) + '</p>' +
          '<p class="card-quote">' + esc(ch.quote) + '</p>' +
          '<span class="card-cta">展开档案 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        '</div>';
      var open = function () { openDetail(i); };
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      el.appendChild(card);
    });

    // 滚轮 → 横向
    el.addEventListener('wheel', function (e) {
      var max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      var d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      var before = el.scrollLeft;
      el.scrollLeft = before + d;
      if (el.scrollLeft !== before) e.preventDefault();
    }, { passive: false });

    // 拖动
    var down = false, sx = 0, sl = 0, moved = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = el.scrollLeft;
      el.classList.add('dragging');
    });
    addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = sl - dx;
      if (moved > 6) el.classList.add('dragging');
    });
    addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { el.classList.remove('dragging'); }, 40);
    });
    el.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

    function onScrollRail() {
      var max = el.scrollWidth - el.clientWidth;
      var p = max > 0 ? el.scrollLeft / max : 0;
      if (rail) rail.style.width = (8 + p * 92) + '%';
    }
    el.addEventListener('scroll', onScrollRail, { passive: true });
    addEventListener('resize', onScrollRail, { passive: true });
    onScrollRail();

    // 键盘左右
    addEventListener('keydown', function (e) {
      if ($('#detail').classList.contains('open')) return;
      var r = el.getBoundingClientRect();
      if (r.top > innerHeight || r.bottom < 0) return;
      if (e.key === 'ArrowRight') { el.scrollBy({ left: 320, behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft')  { el.scrollBy({ left: -320, behavior: 'smooth' }); }
    });
  })();

  /* ═══════ 9. 档案网格 + 筛选 ═══════ */
  (function archive() {
    var grid = $('#grid'), filters = $('#filters');
    if (!grid || typeof CHARACTERS === 'undefined') return;

    // 「火种」分组：按首字归类过于细碎，这里按火种名做筛选项（全部 + 每个火种）
    var groups = [
      { key: 'all', label: '全部席位' },
      { key: 'gold', label: '金血之人' },
      { key: 'heal', label: '医者与信使' },
      { key: 'war', label: '战士与王者' }
    ];
    var MAP = {
      heal: ['缇宝', '风堇', '遐蝶', '昔涟'],
      war:  ['万敌', '白厄', '刻律德菈', '海瑟音', '赛飞儿', '丹恒·腾荒'],
      gold: ['阿格莱雅', '那刻夏', '长夜月']
    };

    groups.forEach(function (g, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' active' : '');
      b.type = 'button';
      b.textContent = g.label;
      b.dataset.key = g.key;
      filters.appendChild(b);
    });

    CHARACTERS.forEach(function (ch, i) {
      var c = document.createElement('article');
      c.className = 'gcard';
      c.tabIndex = 0;
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', ch.name + ' 档案');
      c.dataset.name = ch.name;
      c.style.setProperty('--accent', ch.c1);
      c.innerHTML =
        '<img src="' + ch.artSm + '" alt="' + esc(ch.name) + '" loading="lazy" decoding="async">' +
        '<div class="gcard-fade"></div>' +
        '<span class="gcard-fire">' + esc(ch.fire) + '</span>' +
        '<div class="gcard-info"><h3>' + esc(ch.name) + '</h3><p>' + esc(ch.title) + '</p></div>';
      var open = function () { openDetail(i); };
      c.addEventListener('click', open);
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      grid.appendChild(c);
    });

    filters.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      $$('.chip', filters).forEach(function (x) { x.classList.toggle('active', x === b); });
      var k = b.dataset.key;
      $$('.gcard', grid).forEach(function (c) {
        var show = k === 'all' || (MAP[k] || []).indexOf(c.dataset.name) >= 0;
        c.classList.toggle('hide', !show);
      });
    });
  })();

  /* ═══════ 10. 档案详情 ═══════ */
  var current = 0;

  function storyHTML(sections, ch) {
    if (!sections || !sections.length) return '<p>档案暂缺。</p>';
    return sections.map(function (s) {
      var lines = String(s.body).split('\n');
      var out = '', sysBuf = [];
      function flushSys() {
        if (sysBuf.length) { out += '<p class="sys">' + esc(sysBuf.join('\n')) + '</p>'; sysBuf = []; }
      }
      lines.forEach(function (raw) {
        var t = raw.trim();
        if (!t) return;
        var isSys = /^(>>>|###|第\s*\d+\s*次|【第|请求：|响应：|进度：|错误\s*\d+|编号：|课题：|材料：|记录：|警告)/.test(t);
        if (isSys) { sysBuf.push(t); return; }
        flushSys();
        if (/^(——|—\s|‧)/.test(t)) { out += '<p class="attrib">' + esc(t) + '</p>'; return; }
        if (/^[「『"]/.test(t)) { out += '<p class="msg">' + esc(t) + '</p>'; return; }
        out += '<p>' + esc(t) + '</p>';
      });
      flushSys();
      return '<section class="dsec">' +
        '<h3>' + esc(s.title) + '</h3>' + out +
      '</section>';
    }).join('');
  }

  function openDetail(i) {
    if (typeof CHARACTERS === 'undefined' || !CHARACTERS.length) return;
    var n = CHARACTERS.length;
    current = ((i % n) + n) % n;
    var ch = CHARACTERS[current];
    var d = $('#detail'), sc = $('#detailScroll');

    sc.innerHTML =
      '<div class="detail-hero" style="--accent:' + ch.c1 + '">' +
        '<img src="' + (ch.banner || ch.art) + '" alt="' + esc(ch.name) + '">' +
        '<div class="detail-hero-txt">' +
          '<span class="detail-fire">火种 · ' + esc(ch.fire) + '</span>' +
          '<h2 class="detail-name">' + esc(ch.name) + '</h2>' +
          '<p class="detail-title">' + esc(ch.title) + '</p>' +
          '<p class="detail-city">' + esc(ch.city) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="detail-body" style="--accent:' + ch.c1 + '">' +
        '<div class="detail-portrait">' +
          '<p class="detail-role-b">' + esc(ch.role) + '</p>' +
          '<p class="detail-quote">' + esc(ch.quote) + '</p>' +
        '</div>' +
        (ch.art ? '<figure class="detail-art"><img src="' + ch.art + '" alt="' + esc(ch.name) + ' 立绘" loading="lazy" decoding="async"><figcaption>立绘 · ILLUSTRATION</figcaption></figure>' : '') +
        storyHTML(ch.sections, ch) +
        '<div class="detail-foot"><span>翁法罗斯档案 · ' + String(current + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0') + '</span><span>← → 切换席位 · Esc 关闭</span></div>' +
      '</div>';

    d.classList.add('open');
    d.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    sc.scrollTop = 0;
    $('#detailClose').focus({ preventScroll: true });
  }

  function closeDetail() {
    var d = $('#detail');
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
  }

  $('#detailClose').addEventListener('click', closeDetail);
  $('#detailBackdrop').addEventListener('click', closeDetail);
  $('#detailPrev').addEventListener('click', function () { openDetail(current - 1); });
  $('#detailNext').addEventListener('click', function () { openDetail(current + 1); });
  addEventListener('keydown', function (e) {
    var open = $('#detail').classList.contains('open');
    if (!open) return;
    if (e.key === 'Escape') closeDetail();
    if (e.key === 'ArrowLeft') openDetail(current - 1);
    if (e.key === 'ArrowRight') openDetail(current + 1);
  });

  /* ═══════ 11. 主题音乐 ═══════ */
  (function music() {
    var btn = $('#audioBtn'), bgm = $('#bgm'), on = false, fadeT = null;
    function fade(to, ms) {
      clearInterval(fadeT);
      var from = bgm.volume, steps = 24, n = 0;
      fadeT = setInterval(function () {
        n++;
        bgm.volume = Math.max(0, Math.min(1, from + (to - from) * (n / steps)));
        if (n >= steps) clearInterval(fadeT);
      }, ms / steps);
    }
    btn.addEventListener('click', function () {
      if (!on) {
        bgm.volume = 0;
        var p = bgm.play();
        if (p && p.catch) p.catch(function () { /* 浏览器拦截：忽略 */ });
        fade(.55, 1400);
        btn.classList.add('playing');
        btn.setAttribute('aria-label', '暂停主题音乐');
      } else {
        fade(0, 600);
        setTimeout(function () { bgm.pause(); }, 620);
        btn.classList.remove('playing');
        btn.setAttribute('aria-label', '播放主题音乐');
      }
      on = !on;
    });
  })();

  /* ═══════ 12. Hero 视差 + 视频省电 ═══════ */
  (function heroFx() {
    var v = $('#heroVideo'), hero = $('#hero');
    if (v) {
      var pp = v.play();
      if (pp && pp.catch) pp.catch(function () {});
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
            else v.pause();
          });
        }, { threshold: .02 }).observe(v);
      }
    }
    if (REDUCED || !hero) return;
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = scrollY;
        if (y < innerHeight * 1.2) {
          var c = $('.hero-content');
          if (c) { c.style.transform = 'translateY(' + (y * .18) + 'px)'; c.style.opacity = Math.max(0, 1 - y / (innerHeight * .78)); }
          if (v) v.style.transform = 'scale(' + (1.04 + y / (innerHeight * 8)) + ') translateY(' + (y * .07) + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  })();

  /* ═══════ 13. 数字监听启动 ═══════ */
  $$('.stat-num').forEach(function (el) { numIO.observe(el); });
  var counter = $('#counter');
  if (counter) {
    counter.dataset.count = '33550337';
    new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (e.isIntersecting) { animateNum(counter, 33550337, { duration: 3000 }); o.disconnect(); }
      });
    }, { threshold: .4 }).observe(counter);
  }

  watchReveal(document);

  /* 暴露给调试 */
  window.__amphoreus = { openDetail: openDetail, closeDetail: closeDetail, characters: (typeof CHARACTERS !== 'undefined' ? CHARACTERS.length : 0) };
})();
