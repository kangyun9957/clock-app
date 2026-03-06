// ============================================
// iPhone Clock App - Full Functionality
// ============================================

// ---- Tab Navigation ----
const tabItems = document.querySelectorAll('.tab-item');
const tabContents = document.querySelectorAll('.tab-content');

tabItems.forEach(item => {
  item.addEventListener('click', () => {
    const tabId = item.dataset.tab;
    tabItems.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
  });
});

// ---- Utility ----
function padZero(n, digits = 2) {
  return String(n).padStart(digits, '0');
}

function formatTime12(date) {
  let h = date.getHours();
  const m = padZero(date.getMinutes());
  const ampm = h >= 12 ? '오후' : '오전';
  h = h % 12 || 12;
  return { h, m, ampm };
}

// ---- World Clock ----
const CITIES = [
  { name: '서울', timezone: 'Asia/Seoul', country: '대한민국' },
  { name: '도쿄', timezone: 'Asia/Tokyo', country: '일본' },
  { name: '뉴욕', timezone: 'America/New_York', country: '미국' },
  { name: '런던', timezone: 'Europe/London', country: '영국' },
  { name: '파리', timezone: 'Europe/Paris', country: '프랑스' },
  { name: '시드니', timezone: 'Australia/Sydney', country: '호주' },
  { name: '베이징', timezone: 'Asia/Shanghai', country: '중국' },
  { name: '두바이', timezone: 'Asia/Dubai', country: '아랍에미리트' },
  { name: '모스크바', timezone: 'Europe/Moscow', country: '러시아' },
  { name: '로스앤젤레스', timezone: 'America/Los_Angeles', country: '미국' },
  { name: '시카고', timezone: 'America/Chicago', country: '미국' },
  { name: '호놀룰루', timezone: 'Pacific/Honolulu', country: '미국' },
  { name: '싱가포르', timezone: 'Asia/Singapore', country: '싱가포르' },
  { name: '방콕', timezone: 'Asia/Bangkok', country: '태국' },
  { name: '뭄바이', timezone: 'Asia/Kolkata', country: '인도' },
  { name: '카이로', timezone: 'Africa/Cairo', country: '이집트' },
  { name: '상파울루', timezone: 'America/Sao_Paulo', country: '브라질' },
  { name: '밴쿠버', timezone: 'America/Vancouver', country: '캐나다' },
  { name: '베를린', timezone: 'Europe/Berlin', country: '독일' },
  { name: '로마', timezone: 'Europe/Rome', country: '이탈리아' },
  { name: '암스테르담', timezone: 'Europe/Amsterdam', country: '네덜란드' },
  { name: '오클랜드', timezone: 'Pacific/Auckland', country: '뉴질랜드' },
  { name: '자카르타', timezone: 'Asia/Jakarta', country: '인도네시아' },
  { name: '마닐라', timezone: 'Asia/Manila', country: '필리핀' },
  { name: '하노이', timezone: 'Asia/Ho_Chi_Minh', country: '베트남' },
];

let worldClocks = JSON.parse(localStorage.getItem('worldClocks') || '[]');
if (worldClocks.length === 0) {
  worldClocks = [
    { name: '서울', timezone: 'Asia/Seoul' },
    { name: '뉴욕', timezone: 'America/New_York' },
    { name: '런던', timezone: 'Europe/London' },
  ];
  localStorage.setItem('worldClocks', JSON.stringify(worldClocks));
}

function getTimezoneOffset(tz) {
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const target = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const diff = (target - local) / (1000 * 60 * 60);
  return diff;
}

function renderWorldClocks() {
  const list = document.getElementById('worldclock-list');
  list.innerHTML = '';
  worldClocks.forEach(clock => {
    const now = new Date();
    const options = { timeZone: clock.timezone, hour: 'numeric', minute: '2-digit', hour12: true };
    const timeStr = now.toLocaleTimeString('ko-KR', options);
    const parts = timeStr.match(/(오전|오후)\s*(\d+):(\d+)/);
    const ampm = parts ? parts[1] : '';
    const h = parts ? parts[2] : '';
    const m = parts ? parts[3] : '';

    const offset = getTimezoneOffset(clock.timezone);
    let offsetStr = '';
    if (offset === 0) offsetStr = '오늘, +0시간';
    else if (offset > 0) offsetStr = `오늘, +${offset}시간`;
    else offsetStr = `오늘, ${offset}시간`;

    const item = document.createElement('div');
    item.className = 'worldclock-item';
    item.innerHTML = `
      <div class="worldclock-info">
        <span class="worldclock-offset">${offsetStr}</span>
        <span class="worldclock-city">${clock.name}</span>
      </div>
      <div class="worldclock-time">${h}:${m}<span class="time-ampm">${ampm}</span></div>
    `;
    list.appendChild(item);
  });
}

// World clock modal
const worldclockModal = document.getElementById('worldclock-modal');
const citySearch = document.getElementById('city-search');
const cityList = document.getElementById('city-list');

document.getElementById('worldclock-add-btn').addEventListener('click', () => {
  worldclockModal.style.display = 'flex';
  citySearch.value = '';
  renderCityList('');
});

document.getElementById('worldclock-cancel-btn').addEventListener('click', () => {
  worldclockModal.style.display = 'none';
});

citySearch.addEventListener('input', (e) => {
  renderCityList(e.target.value);
});

function renderCityList(query) {
  cityList.innerHTML = '';
  const filtered = CITIES.filter(c =>
    c.name.includes(query) || c.country.includes(query)
  );
  filtered.forEach(city => {
    const item = document.createElement('div');
    item.className = 'city-item';
    item.innerHTML = `<span class="city-item-name">${city.name}</span><span class="city-item-country">${city.country}</span>`;
    item.addEventListener('click', () => {
      if (!worldClocks.find(c => c.timezone === city.timezone)) {
        worldClocks.push({ name: city.name, timezone: city.timezone });
        localStorage.setItem('worldClocks', JSON.stringify(worldClocks));
        renderWorldClocks();
      }
      worldclockModal.style.display = 'none';
    });
    cityList.appendChild(item);
  });
}

// Update world clocks every second
setInterval(renderWorldClocks, 1000);
renderWorldClocks();


// ---- Alarm ----
let alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
if (alarms.length === 0) {
  alarms = [
    { id: 1, hour: 6, minute: 30, ampm: '오전', label: '알람', enabled: true },
    { id: 2, hour: 7, minute: 0, ampm: '오전', label: '출근', enabled: true },
  ];
  localStorage.setItem('alarms', JSON.stringify(alarms));
}

function renderAlarms() {
  const list = document.getElementById('alarm-list');
  list.innerHTML = '';

  // "수면 | 기상" section
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'alarm-section-header';
  sectionHeader.innerHTML = `
    <svg class="bed-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12V7a1 1 0 011-1h6a3 3 0 013 3v3h7a2 2 0 012 2v4h-2v-2H3v2H1v-6h2zm2-3a2 2 0 104 0 2 2 0 00-4 0z"/></svg>
    <span class="alarm-section-title">수면 | 기상</span>
  `;
  list.appendChild(sectionHeader);

  const desc = document.createElement('div');
  desc.className = 'alarm-section-desc';
  desc.textContent = '수면 및 기상 시간표를 설정하려면 건강 앱에서 설정하십시오.';
  list.appendChild(desc);

  // "기타" section
  const otherHeader = document.createElement('div');
  otherHeader.className = 'alarm-other-header';
  otherHeader.textContent = '기타';
  list.appendChild(otherHeader);

  alarms.forEach(alarm => {
    const item = document.createElement('div');
    item.className = 'alarm-item' + (alarm.enabled ? '' : ' disabled');
    item.innerHTML = `
      <div class="alarm-info">
        <div class="alarm-time-row">
          <span class="alarm-time">${alarm.hour}:${padZero(alarm.minute)}</span>
          <span class="alarm-ampm">${alarm.ampm}</span>
        </div>
        <span class="alarm-label">${alarm.label}</span>
      </div>
      <label class="ios-switch">
        <input type="checkbox" ${alarm.enabled ? 'checked' : ''} data-alarm-id="${alarm.id}" />
        <span class="slider"></span>
      </label>
    `;
    const toggle = item.querySelector('input[type="checkbox"]');
    toggle.addEventListener('change', (e) => {
      alarm.enabled = e.target.checked;
      localStorage.setItem('alarms', JSON.stringify(alarms));
      renderAlarms();
    });
    list.appendChild(item);
  });
}

renderAlarms();

// Alarm modal
const alarmModal = document.getElementById('alarm-modal');

document.getElementById('alarm-add-btn').addEventListener('click', () => {
  alarmModal.style.display = 'flex';
  initAlarmPicker();
});

document.getElementById('alarm-cancel-btn').addEventListener('click', () => {
  alarmModal.style.display = 'none';
});

document.getElementById('alarm-save-btn').addEventListener('click', () => {
  const ampmCol = document.getElementById('alarm-picker-ampm');
  const hourCol = document.getElementById('alarm-picker-hours');
  const minCol = document.getElementById('alarm-picker-minutes');

  const ampm = getPickerValue(ampmCol, ['오전', '오후']);
  const hour = getPickerValue(hourCol, Array.from({ length: 12 }, (_, i) => i + 1));
  const minute = getPickerValue(minCol, Array.from({ length: 60 }, (_, i) => i));

  const label = document.getElementById('alarm-label-input').value || '알람';
  const newAlarm = {
    id: Date.now(),
    hour: hour,
    minute: minute,
    ampm: ampm,
    label: label,
    enabled: true,
  };
  alarms.push(newAlarm);
  localStorage.setItem('alarms', JSON.stringify(alarms));
  renderAlarms();
  alarmModal.style.display = 'none';

  // Schedule notification
  scheduleAlarmNotification(newAlarm);
});

function scheduleAlarmNotification(alarm) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ---- Scroll Picker ----
function createPicker(container, items, initial) {
  container.innerHTML = '';
  // Add padding items for scroll
  const padCount = 2;
  for (let i = 0; i < padCount; i++) {
    const pad = document.createElement('div');
    pad.className = 'picker-item';
    pad.style.visibility = 'hidden';
    pad.textContent = '';
    container.appendChild(pad);
  }
  items.forEach((val, idx) => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.textContent = typeof val === 'number' ? padZero(val) : val;
    item.dataset.value = val;
    item.addEventListener('click', () => {
      container.scrollTo({ top: idx * 36, behavior: 'smooth' });
    });
    container.appendChild(item);
  });
  for (let i = 0; i < padCount; i++) {
    const pad = document.createElement('div');
    pad.className = 'picker-item';
    pad.style.visibility = 'hidden';
    pad.textContent = '';
    container.appendChild(pad);
  }
  // Set initial scroll
  const initialIdx = items.indexOf(initial);
  if (initialIdx >= 0) {
    setTimeout(() => {
      container.scrollTop = initialIdx * 36;
    }, 50);
  }
}

function getPickerValue(container, items) {
  const scrollTop = container.scrollTop;
  const idx = Math.round(scrollTop / 36);
  return items[Math.min(Math.max(idx, 0), items.length - 1)];
}

function initAlarmPicker() {
  const now = new Date();
  const ampmItems = ['오전', '오후'];
  const hourItems = Array.from({ length: 12 }, (_, i) => i + 1);
  const minItems = Array.from({ length: 60 }, (_, i) => i);

  const currentAmpm = now.getHours() >= 12 ? '오후' : '오전';
  const currentHour = now.getHours() % 12 || 12;
  const currentMin = now.getMinutes();

  createPicker(document.getElementById('alarm-picker-ampm'), ampmItems, currentAmpm);
  createPicker(document.getElementById('alarm-picker-hours'), hourItems, currentHour);
  createPicker(document.getElementById('alarm-picker-minutes'), minItems, currentMin);
}


// ---- Timer Picker ----
function initTimerPicker() {
  const hourItems = Array.from({ length: 24 }, (_, i) => i);
  const minItems = Array.from({ length: 60 }, (_, i) => i);
  const secItems = Array.from({ length: 60 }, (_, i) => i);

  createPicker(document.getElementById('picker-hours'), hourItems, 0);
  createPicker(document.getElementById('picker-minutes'), minItems, 5);
  createPicker(document.getElementById('picker-seconds'), secItems, 0);
}

initTimerPicker();


// ---- Stopwatch ----
let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;
let laps = [];
let lapStartTime = 0;

const swDisplay = document.getElementById('stopwatch-display');
const swStartBtn = document.getElementById('stopwatch-start-btn');
const swLapBtn = document.getElementById('stopwatch-lap-btn');
const lapList = document.getElementById('lap-list');

swLapBtn.classList.add('btn-disabled');

function formatStopwatch(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const cent = Math.floor((ms % 1000) / 10);
  return `${padZero(min)}:${padZero(sec)}<span class="stopwatch-fraction">.${padZero(cent)}</span>`;
}

function formatLapTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const cent = Math.floor((ms % 1000) / 10);
  return `${padZero(min)}:${padZero(sec)}.${padZero(cent)}`;
}

function updateStopwatch() {
  const now = performance.now();
  const elapsed = stopwatchElapsed + (now - stopwatchStartTime);
  swDisplay.innerHTML = formatStopwatch(elapsed);
}

function renderLaps() {
  lapList.innerHTML = '';
  if (laps.length < 2) {
    laps.forEach((lap, i) => {
      const item = document.createElement('div');
      item.className = 'lap-item';
      item.innerHTML = `<span>랩 ${laps.length - i}</span><span>${formatLapTime(lap.time)}</span>`;
      lapList.appendChild(item);
    });
    return;
  }

  const times = laps.map(l => l.time);
  const best = Math.min(...times);
  const worst = Math.max(...times);

  laps.forEach((lap, i) => {
    const item = document.createElement('div');
    let cls = 'lap-item';
    if (lap.time === best) cls += ' best';
    else if (lap.time === worst) cls += ' worst';
    item.className = cls;
    item.innerHTML = `<span>랩 ${laps.length - i}</span><span>${formatLapTime(lap.time)}</span>`;
    lapList.appendChild(item);
  });
}

swStartBtn.addEventListener('click', () => {
  if (!stopwatchRunning) {
    // Start
    stopwatchRunning = true;
    stopwatchStartTime = performance.now();
    if (laps.length === 0) {
      lapStartTime = stopwatchStartTime;
    }
    stopwatchInterval = setInterval(updateStopwatch, 10);
    swStartBtn.textContent = '중단';
    swStartBtn.className = 'stopwatch-btn btn-red';
    swLapBtn.textContent = '랩';
    swLapBtn.classList.remove('btn-disabled');
  } else {
    // Stop
    stopwatchRunning = false;
    stopwatchElapsed += performance.now() - stopwatchStartTime;
    clearInterval(stopwatchInterval);
    swStartBtn.textContent = '시작';
    swStartBtn.className = 'stopwatch-btn btn-green';
    swLapBtn.textContent = '재설정';
  }
});

swLapBtn.addEventListener('click', () => {
  if (stopwatchRunning) {
    // Lap
    const now = performance.now();
    const lapTime = now - lapStartTime;
    laps.unshift({ time: lapTime });
    lapStartTime = now;
    renderLaps();
  } else if (stopwatchElapsed > 0) {
    // Reset
    stopwatchElapsed = 0;
    laps = [];
    swDisplay.innerHTML = formatStopwatch(0);
    renderLaps();
    swLapBtn.textContent = '랩';
    swLapBtn.classList.add('btn-disabled');
  }
});


// ---- Timer ----
let timerRunning = false;
let timerTotalSeconds = 0;
let timerRemaining = 0;
let timerInterval = null;

const timerPickerWrapper = document.getElementById('timer-picker-wrapper');
const timerRingWrapper = document.getElementById('timer-ring-wrapper');
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-ring-progress');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerCancelBtn = document.getElementById('timer-cancel-btn');

const CIRCUMFERENCE = 2 * Math.PI * 90; // ~565.48

timerCancelBtn.classList.add('btn-disabled');

function formatTimer(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${padZero(h)}:${padZero(m)}:${padZero(s)}`;
  return `${padZero(m)}:${padZero(s)}`;
}

function updateTimerRing() {
  const fraction = timerRemaining / timerTotalSeconds;
  const offset = CIRCUMFERENCE * (1 - fraction);
  timerProgress.style.strokeDasharray = CIRCUMFERENCE;
  timerProgress.style.strokeDashoffset = offset;
}

function getPickerTimerValues() {
  const hourItems = Array.from({ length: 24 }, (_, i) => i);
  const minItems = Array.from({ length: 60 }, (_, i) => i);
  const secItems = Array.from({ length: 60 }, (_, i) => i);

  const h = getPickerValue(document.getElementById('picker-hours'), hourItems);
  const m = getPickerValue(document.getElementById('picker-minutes'), minItems);
  const s = getPickerValue(document.getElementById('picker-seconds'), secItems);
  return h * 3600 + m * 60 + s;
}

timerStartBtn.addEventListener('click', () => {
  if (!timerRunning) {
    if (timerRemaining <= 0) {
      // Start from picker
      timerTotalSeconds = getPickerTimerValues();
      if (timerTotalSeconds <= 0) return;
      timerRemaining = timerTotalSeconds;
    }
    // Show ring, hide picker
    timerPickerWrapper.style.display = 'none';
    timerRingWrapper.style.display = 'flex';
    timerDisplay.textContent = formatTimer(timerRemaining);
    updateTimerRing();

    timerRunning = true;
    timerCancelBtn.classList.remove('btn-disabled');
    timerStartBtn.textContent = '일시 정지';
    timerStartBtn.className = 'stopwatch-btn btn-red';

    timerInterval = setInterval(() => {
      timerRemaining--;
      timerDisplay.textContent = formatTimer(timerRemaining);
      updateTimerRing();

      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerStartBtn.textContent = '시작';
        timerStartBtn.className = 'stopwatch-btn btn-green';

        // Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('타이머', { body: '타이머가 종료되었습니다.', icon: 'icons/icon-192.png' });
        }

        // Vibrate
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }

        // Alert as fallback
        setTimeout(() => alert('타이머가 종료되었습니다!'), 100);
      }
    }, 1000);
  } else {
    // Pause
    clearInterval(timerInterval);
    timerRunning = false;
    timerStartBtn.textContent = '재개';
    timerStartBtn.className = 'stopwatch-btn btn-green';
  }
});

timerCancelBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = 0;
  timerTotalSeconds = 0;
  timerPickerWrapper.style.display = '';
  timerRingWrapper.style.display = 'none';
  timerStartBtn.textContent = '시작';
  timerStartBtn.className = 'stopwatch-btn btn-green';
  timerCancelBtn.classList.add('btn-disabled');
  initTimerPicker();
});


// ---- Request Notification Permission ----
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// ---- Service Worker Registration ----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
