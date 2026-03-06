// ============================================
// iOS Clock App Clone
// ============================================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const pad = (n, d=2) => String(n).padStart(d, '0');

// ---- Tab Navigation ----
$$('.tab').forEach(t => {
  t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    $$('.tab-content').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $('#tab-' + t.dataset.tab).classList.add('active');
  });
});

// ============================================
// Scroll Picker
// ============================================
function initPicker(col, onUpdate) {
  const type = col.dataset.type;
  const max = parseInt(col.dataset.max || '59');
  const min = parseInt(col.dataset.min || '0');
  col.innerHTML = '';

  let items = [];
  if (type === 'ampm') {
    items = ['오전', '오후'];
  } else {
    for (let i = min; i <= max; i++) items.push(i);
  }

  // Top padding
  const padTop = document.createElement('div');
  padTop.className = 'pk-pad';
  col.appendChild(padTop);

  items.forEach(val => {
    const el = document.createElement('div');
    el.className = 'pk-item';
    el.textContent = (type === 'ampm') ? val : pad(val);
    el.dataset.val = val;
    col.appendChild(el);
  });

  // Bottom padding
  const padBot = document.createElement('div');
  padBot.className = 'pk-pad';
  col.appendChild(padBot);

  // Scroll listener for highlighting
  const updateHighlight = () => {
    const center = col.scrollTop + 108; // half of 216
    const allItems = col.querySelectorAll('.pk-item');
    allItems.forEach(item => {
      const itemCenter = item.offsetTop + 18;
      const dist = Math.abs(center - itemCenter);
      item.classList.toggle('in-view', dist < 30);
    });
    if (onUpdate) onUpdate();
  };

  col.addEventListener('scroll', updateHighlight);
  // Initial
  setTimeout(updateHighlight, 50);

  return { items, col };
}

function setPickerValue(col, val) {
  const items = col.querySelectorAll('.pk-item');
  for (const item of items) {
    if (item.dataset.val == val) {
      col.scrollTop = item.offsetTop - 90;
      break;
    }
  }
}

function getPickerValue(col) {
  const center = col.scrollTop + 108;
  let closest = null, closestDist = Infinity;
  col.querySelectorAll('.pk-item').forEach(item => {
    const d = Math.abs((item.offsetTop + 18) - center);
    if (d < closestDist) { closestDist = d; closest = item; }
  });
  return closest ? closest.dataset.val : '0';
}

// ============================================
// 세계 시계
// ============================================
const CITIES = [
  {name:'서울',tz:'Asia/Seoul',country:'대한민국'},
  {name:'도쿄',tz:'Asia/Tokyo',country:'일본'},
  {name:'뉴욕',tz:'America/New_York',country:'미국'},
  {name:'런던',tz:'Europe/London',country:'영국'},
  {name:'파리',tz:'Europe/Paris',country:'프랑스'},
  {name:'시드니',tz:'Australia/Sydney',country:'호주'},
  {name:'베이징',tz:'Asia/Shanghai',country:'중국'},
  {name:'두바이',tz:'Asia/Dubai',country:'아랍에미리트'},
  {name:'모스크바',tz:'Europe/Moscow',country:'러시아'},
  {name:'로스앤젤레스',tz:'America/Los_Angeles',country:'미국'},
  {name:'시카고',tz:'America/Chicago',country:'미국'},
  {name:'호놀룰루',tz:'Pacific/Honolulu',country:'미국'},
  {name:'싱가포르',tz:'Asia/Singapore',country:'싱가포르'},
  {name:'방콕',tz:'Asia/Bangkok',country:'태국'},
  {name:'뭄바이',tz:'Asia/Kolkata',country:'인도'},
  {name:'카이로',tz:'Africa/Cairo',country:'이집트'},
  {name:'베를린',tz:'Europe/Berlin',country:'독일'},
  {name:'로마',tz:'Europe/Rome',country:'이탈리아'},
  {name:'오클랜드',tz:'Pacific/Auckland',country:'뉴질랜드'},
  {name:'하노이',tz:'Asia/Ho_Chi_Minh',country:'베트남'},
  {name:'마닐라',tz:'Asia/Manila',country:'필리핀'},
  {name:'자카르타',tz:'Asia/Jakarta',country:'인도네시아'},
  {name:'밴쿠버',tz:'America/Vancouver',country:'캐나다'},
  {name:'상파울루',tz:'America/Sao_Paulo',country:'브라질'},
  {name:'암스테르담',tz:'Europe/Amsterdam',country:'네덜란드'},
];

let myClocks = JSON.parse(localStorage.getItem('wc') || 'null') || [
  {name:'서울',tz:'Asia/Seoul'},
  {name:'뉴욕',tz:'America/New_York'},
  {name:'런던',tz:'Europe/London'},
];

function getOffset(tz) {
  const now = new Date();
  const here = new Date(now.toLocaleString('en-US',{timeZone:'Asia/Seoul'}));
  const there = new Date(now.toLocaleString('en-US',{timeZone:tz}));
  return Math.round((there - here) / 3600000);
}

function renderWC() {
  const list = $('#wc-list');
  list.innerHTML = '';
  myClocks.forEach(c => {
    const now = new Date();
    const str = now.toLocaleTimeString('ko-KR',{timeZone:c.tz,hour:'numeric',minute:'2-digit',hour12:true});
    const m = str.match(/(오전|오후)\s*(\d+):(\d+)/);
    const ampm = m?m[1]:'', h = m?m[2]:'', min = m?m[3]:'';
    const off = getOffset(c.tz);
    const offStr = off===0?'오늘, +0시간':off>0?`오늘, +${off}시간`:`오늘, ${off}시간`;

    const el = document.createElement('div');
    el.className = 'wc-item';
    el.innerHTML = `
      <div class="wc-left">
        <div class="wc-offset">${offStr}</div>
        <div class="wc-city">${c.name}</div>
      </div>
      <div class="wc-right">
        <span class="wc-time">${h}:${min}</span><span class="wc-ampm">${ampm}</span>
      </div>`;
    list.appendChild(el);
  });
}

renderWC();
setInterval(renderWC, 1000);

// World Clock Modal
$('#wc-add-btn').addEventListener('click', () => {
  $('#wc-modal').classList.add('show');
  $('#city-search').value = '';
  renderCities('');
});
$('#wc-modal-cancel').addEventListener('click', () => $('#wc-modal').classList.remove('show'));

$('#city-search').addEventListener('input', e => renderCities(e.target.value));

function renderCities(q) {
  const list = $('#city-list');
  list.innerHTML = '';
  CITIES.filter(c => c.name.includes(q)||c.country.includes(q)).forEach(c => {
    const el = document.createElement('div');
    el.className = 'city-row';
    el.textContent = `${c.name}, ${c.country}`;
    el.addEventListener('click', () => {
      if (!myClocks.find(x=>x.tz===c.tz)) {
        myClocks.push({name:c.name,tz:c.tz});
        localStorage.setItem('wc',JSON.stringify(myClocks));
        renderWC();
      }
      $('#wc-modal').classList.remove('show');
    });
    list.appendChild(el);
  });
}

// ============================================
// 알람
// ============================================
let alarms = JSON.parse(localStorage.getItem('al') || 'null') || [
  {id:1,h:6,m:30,ap:'오전',label:'알람',on:true},
  {id:2,h:7,m:0,ap:'오전',label:'출근',on:true},
];

function renderAlarms() {
  const list = $('#al-list');
  list.innerHTML = '';

  // 수면 | 기상 section
  const sec = document.createElement('div');
  sec.innerHTML = `
    <div class="al-section">
      <div class="al-section-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h1l1-3h4l1 3h1v3H3v-3zm5-5a2 2 0 100-4 2 2 0 000 4zm5 2h8v1.5a2 2 0 01-2 2h-4a2 2 0 01-2-2V10z"/></svg></div>
      <span class="al-section-title">수면 | 기상</span>
    </div>
    <div class="al-section-desc">수면 및 기상 시간표를 설정하려면 건강 앱에서 설정하십시오.</div>
    <div class="al-other-title">기타</div>`;
  list.appendChild(sec);

  alarms.forEach(a => {
    const el = document.createElement('div');
    el.className = 'al-item' + (a.on?'':' off');
    el.innerHTML = `
      <div class="al-left">
        <div><span class="al-time">${a.h}:${pad(a.m)}</span><span class="al-ampm">${a.ap}</span></div>
        <div class="al-label">${a.label}</div>
      </div>
      <label class="toggle">
        <input type="checkbox" ${a.on?'checked':''}>
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
      </label>`;
    el.querySelector('input').addEventListener('change', e => {
      a.on = e.target.checked;
      localStorage.setItem('al',JSON.stringify(alarms));
      renderAlarms();
    });
    list.appendChild(el);
  });
}

renderAlarms();

// Alarm Modal
$('#al-add-btn').addEventListener('click', () => {
  $('#al-modal').classList.add('show');
  initAlarmPicker();
});
$('#al-modal-cancel').addEventListener('click', () => $('#al-modal').classList.remove('show'));
$('#al-modal-save').addEventListener('click', () => {
  const h = parseInt(getPickerValue($('#alpk-h')));
  const m = parseInt(getPickerValue($('#alpk-m')));
  const ap = getPickerValue($('#alpk-ap'));
  const label = $('#al-label-input').value || '알람';
  alarms.push({id:Date.now(),h,m,ap,label,on:true});
  localStorage.setItem('al',JSON.stringify(alarms));
  renderAlarms();
  $('#al-modal').classList.remove('show');
});

function initAlarmPicker() {
  const now = new Date();
  initPicker($('#alpk-h'));
  initPicker($('#alpk-m'));
  initPicker($('#alpk-ap'));
  setTimeout(() => {
    setPickerValue($('#alpk-h'), now.getHours()%12||12);
    setPickerValue($('#alpk-m'), now.getMinutes());
    setPickerValue($('#alpk-ap'), now.getHours()>=12?'오후':'오전');
  }, 100);
}

// ============================================
// 스톱워치
// ============================================
let swRunning = false, swStart = 0, swElapsed = 0, swTimer = null;
let laps = [], lapStart = 0;
const swDisp = $('#sw-display');
const swStartBtn = $('#sw-start-btn');
const swLapBtn = $('#sw-lap-btn');
const swLaps = $('#sw-laps');

function fmtSW(ms) {
  const min = Math.floor(ms/60000);
  const sec = Math.floor((ms%60000)/1000);
  const cs = Math.floor((ms%1000)/10);
  return `${pad(min)}:${pad(sec)}<span class="sw-ms">.${pad(cs)}</span>`;
}
function fmtLap(ms) {
  const min = Math.floor(ms/60000);
  const sec = Math.floor((ms%60000)/1000);
  const cs = Math.floor((ms%1000)/10);
  return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
}

function updateSW() {
  const e = swElapsed + (performance.now() - swStart);
  swDisp.innerHTML = fmtSW(e);
}

function renderLaps() {
  swLaps.innerHTML = '';
  if (laps.length === 0) return;
  const times = laps.map(l=>l.t);
  const best = laps.length >= 2 ? Math.min(...times) : null;
  const worst = laps.length >= 2 ? Math.max(...times) : null;
  laps.forEach((l,i) => {
    const el = document.createElement('div');
    let cls = 'lap-row';
    if (best !== null && l.t === best) cls += ' best';
    else if (worst !== null && l.t === worst) cls += ' worst';
    el.className = cls;
    el.innerHTML = `<span>랩 ${laps.length-i}</span><span>${fmtLap(l.t)}</span>`;
    swLaps.appendChild(el);
  });
}

swStartBtn.addEventListener('click', () => {
  if (!swRunning) {
    swRunning = true;
    swStart = performance.now();
    if (!laps.length) lapStart = swStart;
    swTimer = setInterval(updateSW, 16);
    swStartBtn.textContent = '중단';
    swStartBtn.className = 'circle-btn red';
    swStartBtn.closest('.circle-btn-ring').className = 'circle-btn-ring red-ring';
    swLapBtn.textContent = '랩';
    swLapBtn.disabled = false;
  } else {
    swRunning = false;
    swElapsed += performance.now() - swStart;
    clearInterval(swTimer);
    swStartBtn.textContent = '시작';
    swStartBtn.className = 'circle-btn green';
    swStartBtn.closest('.circle-btn-ring').className = 'circle-btn-ring green-ring';
    swLapBtn.textContent = '재설정';
  }
});

swLapBtn.addEventListener('click', () => {
  if (swRunning) {
    const now = performance.now();
    laps.unshift({t: now - lapStart});
    lapStart = now;
    renderLaps();
  } else if (swElapsed > 0) {
    swElapsed = 0; laps = [];
    swDisp.innerHTML = fmtSW(0);
    renderLaps();
    swLapBtn.textContent = '랩';
    swLapBtn.disabled = true;
  }
});

// ============================================
// 타이머
// ============================================
let tmRunning = false, tmTotal = 0, tmRemain = 0, tmTimer = null;
const CIRC = 2 * Math.PI * 92; // ~578.05

function initTimerPickers() {
  initPicker($('#pk-h'));
  initPicker($('#pk-m'));
  initPicker($('#pk-s'));
  setTimeout(() => {
    setPickerValue($('#pk-h'), 0);
    setPickerValue($('#pk-m'), 5);
    setPickerValue($('#pk-s'), 0);
  }, 100);
}
initTimerPickers();

function fmtTimer(s) {
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  return h>0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function updateRing() {
  const frac = tmRemain / tmTotal;
  const offset = CIRC * (1 - frac);
  $('#tm-ring-circle').setAttribute('stroke-dashoffset', offset);
  $('#tm-ring-time').textContent = fmtTimer(tmRemain);
}

$('#tm-start-btn').addEventListener('click', () => {
  if (!tmRunning) {
    if (tmRemain <= 0) {
      const h = parseInt(getPickerValue($('#pk-h')));
      const m = parseInt(getPickerValue($('#pk-m')));
      const s = parseInt(getPickerValue($('#pk-s')));
      tmTotal = h*3600 + m*60 + s;
      if (tmTotal <= 0) return;
      tmRemain = tmTotal;
    }
    $('#tm-picker-area').style.display = 'none';
    $('#tm-ring-area').style.display = 'flex';
    updateRing();
    tmRunning = true;
    $('#tm-cancel-btn').disabled = false;
    $('#tm-start-btn').textContent = '일시 정지';
    $('#tm-start-btn').className = 'circle-btn red';
    $('#tm-start-btn').closest('.circle-btn-ring').className = 'circle-btn-ring red-ring';

    tmTimer = setInterval(() => {
      tmRemain--;
      updateRing();
      if (tmRemain <= 0) {
        clearInterval(tmTimer);
        tmRunning = false;
        $('#tm-start-btn').textContent = '시작';
        $('#tm-start-btn').className = 'circle-btn green';
        $('#tm-start-btn').closest('.circle-btn-ring').className = 'circle-btn-ring green-ring';
        if ('vibrate' in navigator) navigator.vibrate([200,100,200,100,200]);
        if ('Notification' in window && Notification.permission === 'granted')
          new Notification('타이머',{body:'타이머가 종료되었습니다.'});
        else alert('타이머가 종료되었습니다!');
      }
    }, 1000);
  } else {
    clearInterval(tmTimer);
    tmRunning = false;
    $('#tm-start-btn').textContent = '재개';
    $('#tm-start-btn').className = 'circle-btn green';
    $('#tm-start-btn').closest('.circle-btn-ring').className = 'circle-btn-ring green-ring';
  }
});

$('#tm-cancel-btn').addEventListener('click', () => {
  clearInterval(tmTimer);
  tmRunning = false; tmRemain = 0; tmTotal = 0;
  $('#tm-picker-area').style.display = '';
  $('#tm-ring-area').style.display = 'none';
  $('#tm-start-btn').textContent = '시작';
  $('#tm-start-btn').className = 'circle-btn green';
  $('#tm-start-btn').closest('.circle-btn-ring').className = 'circle-btn-ring green-ring';
  $('#tm-cancel-btn').disabled = true;
  initTimerPickers();
});

// ---- Notifications ----
if ('Notification' in window && Notification.permission === 'default')
  Notification.requestPermission();

// ---- Service Worker ----
if ('serviceWorker' in navigator)
  navigator.serviceWorker.register('sw.js').catch(()=>{});
