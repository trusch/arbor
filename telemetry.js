/* Arbor client telemetry. Classic script, no deps, loaded synchronously from <head>
 * so it runs even if the module bundle fails. Posts JSON records to /log.
 * API: window.__tel.log(type, data), .phase(name), .setStats(fn), .info(obj).
 * Opt out with ?tel=0. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  if (q.get('tel') === '0') { window.__tel = { log: function () {}, phase: function () {}, setStats: function () {}, info: function () {} }; return; }
  var KEY = 'arbor.tel.last';
  var t0 = Date.now();
  var sid = Math.random().toString(36).slice(2, 10) + t0.toString(36);
  var seq = 0, curPhase = 'boot', phaseAt = 0, lastPersist = 0, statsFn = null, ended = false;
  var trail = []; // last phase transitions [ms, name]
  var prevRec = null;
  var page = location.pathname.split('/').pop() || 'index.html';
  var ms = function () { return Math.round(performance.now()); };

  var noServer = /\.github\.io$/.test(location.hostname); // static hosting: there is no /log endpoint
  function send(type, data) {
    if (noServer) return;
    var rec = { sid: sid, seq: seq++, t: ms(), type: type, page: page, phase: curPhase };
    if (data) for (var k in data) rec[k] = data[k];
    var body;
    try { body = JSON.stringify(rec); } catch (e) { body = JSON.stringify({ sid: sid, type: type, err: 'unserializable' }); }
    var ok = false;
    try { ok = navigator.sendBeacon && navigator.sendBeacon('log', new Blob([body], { type: 'text/plain' })); } catch (e) {}
    if (!ok) { try { fetch('log', { method: 'POST', body: body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(function () {}); } catch (e) {} }
  }

  function store(st) {
    var v = JSON.stringify(st);
    try { sessionStorage.setItem(KEY, v); } catch (e) {}
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function persist(force) {
    var now = ms();
    if (!force && now - lastPersist < 200) return;
    lastPersist = now;
    store({ sid: sid, phase: curPhase, t: now, wall: Date.now(), clean: ended, trail: trail.slice(-8), q: location.search, page: page });
  }

  // Previous session: if it never reached pagehide it was killed (tab crash, OOM, GPU-process kill, hard reload).
  (function () {
    var raw = null, src = 'session';
    try { raw = sessionStorage.getItem(KEY); } catch (e) {}
    if (!raw) { try { raw = localStorage.getItem(KEY); src = 'local'; } catch (e) {} }
    if (!raw) return;
    try {
      var prev = (prevRec = JSON.parse(raw));
      send(prev.clean ? 'prev_clean' : 'prev_unclean', { prev: prev, prevSrc: src, agoMs: Date.now() - (prev.wall || 0) });
    } catch (e) {}
  })();

  function device() {
    var c = navigator.connection || {};
    return {
      url: location.href, ua: navigator.userAgent, platform: navigator.platform,
      deviceMemory: navigator.deviceMemory, cores: navigator.hardwareConcurrency, touch: navigator.maxTouchPoints,
      screen: [screen.width, screen.height], inner: [innerWidth, innerHeight], dpr: devicePixelRatio,
      net: c.effectiveType, saveData: c.saveData,
    };
  }
  function glInfo(gl) {
    if (!gl) return { gl: 'none' };
    var o = { webgl2: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext };
    try {
      var d = gl.getExtension('WEBGL_debug_renderer_info');
      o.vendor = d ? gl.getParameter(d.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      o.renderer = d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      o.version = gl.getParameter(gl.VERSION);
      o.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      o.maxRb = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      o.maxVUnif = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
      o.maxFUnif = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
      o.maxVTex = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      o.maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      o.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
      var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      o.fragHighp = hp ? hp.precision : 0;
      if (o.webgl2) o.samples = gl.getParameter(gl.MAX_SAMPLES);
      var ex = gl.getSupportedExtensions() || [];
      o.ext = ex.filter(function (e) { return /float|half|uint|instanc|anisotropic|lose_context|color_buffer|depth/i.test(e); });
    } catch (e) { o.err = String(e); }
    return o;
  }
  function probeGl() {
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl2') || c.getContext('webgl');
      var info = glInfo(gl);
      var lose = gl && gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return info;
    } catch (e) { return { err: String(e) }; }
  }

  var api = {
    sid: sid,
    prev: function () { return prevRec; },
    log: send,
    /** Enter a phase. Risky phases persist immediately so a hard kill reports where it died. */
    phase: function (name, frequent) {
      if (name === curPhase) return;
      curPhase = name; phaseAt = ms();
      trail.push([phaseAt, name]); if (trail.length > 40) trail.shift();
      persist(!frequent);
    },
    setStats: function (fn) { statsFn = fn; },
    info: function (o) { send('info', o); },
    device: device, glInfo: glInfo, probeGl: probeGl,
  };
  window.__tel = api;

  send('start', { device: device(), gl: probeGl(), q: location.search });
  persist(true);

  // Errors (capture phase also sees failed <script>/<link> loads).
  addEventListener('error', function (e) {
    if (e.target && e.target !== window && e.target.tagName) {
      send('resource_error', { tag: e.target.tagName, src: e.target.src || e.target.href });
      return;
    }
    send('error', { msg: String(e.message), file: e.filename, line: e.lineno, col: e.colno, stack: e.error && e.error.stack ? String(e.error.stack).slice(0, 4000) : null, trail: trail.slice(-10) });
  }, true);
  addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    send('unhandledrejection', { msg: String(r && r.message || r), stack: r && r.stack ? String(r.stack).slice(0, 4000) : null, trail: trail.slice(-10) });
  });
  var cerr = console.error;
  var nErr = 0;
  console.error = function () {
    if (nErr++ < 20) {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; parts.push(a && a.stack ? String(a.stack) : String(a)); }
      send('console_error', { msg: parts.join(' ').slice(0, 4000) });
    }
    return cerr.apply(console, arguments);
  };
  var cwarn = console.warn, nWarn = 0;
  console.warn = function () {
    if (nWarn++ < 10) send('console_warn', { msg: Array.prototype.map.call(arguments, String).join(' ').slice(0, 2000) });
    return cwarn.apply(console, arguments);
  };

  // Context loss on any canvas (capture: the event does not bubble from the canvas otherwise).
  document.addEventListener('webglcontextlost', function (e) { send('webglcontextlost', { trail: trail.slice(-10), stats: safeStats() }); }, true);
  document.addEventListener('webglcontextrestored', function () { send('webglcontextrestored'); }, true);
  document.addEventListener('webglcontextcreationerror', function (e) { send('webglcontextcreationerror', { msg: e.statusMessage }); }, true);

  document.addEventListener('visibilitychange', function () { send('visibility', { state: document.visibilityState }); persist(true); });
  addEventListener('pagehide', function (e) { ended = true; send('pagehide', { persisted: e.persisted, stats: safeStats() }); persist(true); });
  addEventListener('pageshow', function (e) { if (e.persisted) { ended = false; send('pageshow', { persisted: true }); persist(true); } });
  addEventListener('freeze', function () { send('freeze'); });
  addEventListener('resume', function () { send('resume'); });
  addEventListener('beforeunload', function () { send('beforeunload'); });
  if (navigator.deviceMemory !== undefined && 'onmemorywarning' in window) addEventListener('memorywarning', function () { send('memorywarning'); });

  // Long main-thread tasks (Chrome): a freeze or "page unresponsive" kill shows up here first.
  var longN = 0;
  try {
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (en) {
        if (en.duration >= 200 && longN++ < 200) send('longtask', { dur: Math.round(en.duration), start: Math.round(en.startTime) });
      });
    }).observe({ type: 'longtask', buffered: true });
  } catch (e) {}

  function safeStats() {
    var o = {};
    if (statsFn) { try { o = statsFn() || {}; } catch (e) { o.statsErr = String(e); } }
    var pm = performance.memory;
    if (pm) o.jsHeap = { used: pm.usedJSHeapSize, total: pm.totalJSHeapSize, limit: pm.jsHeapSizeLimit };
    o.phaseMs = ms() - phaseAt;
    return o;
  }
  // Heartbeat: 1 s for the first 30 s, then 5 s. Gaps between beats in the log = main-thread stalls.
  var lastBeat = ms();
  function beat() {
    var now = ms();
    send('hb', { gap: now - lastBeat, vis: document.visibilityState, stats: safeStats() });
    lastBeat = now;
    persist(true);
    setTimeout(beat, now < 30000 ? 1000 : 5000);
  }
  setTimeout(beat, 1000);
})();
