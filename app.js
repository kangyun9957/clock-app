const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const pad = (n, d=2) => String(n).padStart(d, '0');
const PI2 = Math.PI * 2;
const DEG = Math.PI / 180;

// ===== Tab Navigation =====
$$('.tab').forEach(t => {
  t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    $$('.tab-content').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $('#tab-' + t.dataset.tab).classList.add('active');
    if (t.dataset.tab === 'stopwatch') resizeCanvas();
  });
});

// ===== Scroll Picker =====
function initPicker(col) {
  const type = col.dataset.type;
  const max = parseInt(col.dataset.max || '59');
  const min = parseInt(col.dataset.min || '0');
  col.innerHTML = '';
  let items = [];
  if (type === 'ampm') items = ['오전', '오후'];
  else for (let i = min; i <= max; i++) items.push(i);
  const padTop = document.createElement('div'); padTop.className = 'pk-pad'; col.appendChild(padTop);
  items.forEach(val => {
    const el = document.createElement('div'); el.className = 'pk-item';
    el.textContent = (type === 'ampm') ? val : pad(val); el.dataset.val = val; col.appendChild(el);
  });
  const padBot = document.createElement('div'); padBot.className = 'pk-pad'; col.appendChild(padBot);
  const hl = () => { const c = col.scrollTop + 108; col.querySelectorAll('.pk-item').forEach(it => {
    it.classList.toggle('in-view', Math.abs(c - (it.offsetTop+18)) < 30);
  });};
  col.addEventListener('scroll', hl); setTimeout(hl, 50);
}
function setPickerValue(col, val) {
  for (const it of col.querySelectorAll('.pk-item')) {
    if (it.dataset.val == val) { col.scrollTop = it.offsetTop - 90; break; }
  }
}
function getPickerValue(col) {
  const c = col.scrollTop + 108; let best = null, bd = Infinity;
  col.querySelectorAll('.pk-item').forEach(it => { const d = Math.abs((it.offsetTop+18)-c); if(d<bd){bd=d;best=it;} });
  return best ? best.dataset.val : '0';
}

// ===== 세계 시계 =====
const CITIES=[
  {name:'서울',tz:'Asia/Seoul',country:'대한민국'},{name:'도쿄',tz:'Asia/Tokyo',country:'일본'},
  {name:'뉴욕',tz:'America/New_York',country:'미국'},{name:'런던',tz:'Europe/London',country:'영국'},
  {name:'파리',tz:'Europe/Paris',country:'프랑스'},{name:'시드니',tz:'Australia/Sydney',country:'호주'},
  {name:'베이징',tz:'Asia/Shanghai',country:'중국'},{name:'두바이',tz:'Asia/Dubai',country:'아랍에미리트'},
  {name:'모스크바',tz:'Europe/Moscow',country:'러시아'},{name:'로스앤젤레스',tz:'America/Los_Angeles',country:'미국'},
  {name:'시카고',tz:'America/Chicago',country:'미국'},{name:'호놀룰루',tz:'Pacific/Honolulu',country:'미국'},
  {name:'싱가포르',tz:'Asia/Singapore',country:'싱가포르'},{name:'방콕',tz:'Asia/Bangkok',country:'태국'},
  {name:'뭄바이',tz:'Asia/Kolkata',country:'인도'},{name:'카이로',tz:'Africa/Cairo',country:'이집트'},
  {name:'베를린',tz:'Europe/Berlin',country:'독일'},{name:'로마',tz:'Europe/Rome',country:'이탈리아'},
  {name:'오클랜드',tz:'Pacific/Auckland',country:'뉴질랜드'},{name:'하노이',tz:'Asia/Ho_Chi_Minh',country:'베트남'},
  {name:'마닐라',tz:'Asia/Manila',country:'필리핀'},{name:'자카르타',tz:'Asia/Jakarta',country:'인도네시아'},
  {name:'밴쿠버',tz:'America/Vancouver',country:'캐나다'},{name:'암스테르담',tz:'Europe/Amsterdam',country:'네덜란드'},
];
let myClocks = JSON.parse(localStorage.getItem('wc')||'null')||[
  {name:'서울',tz:'Asia/Seoul'},{name:'뉴욕',tz:'America/New_York'},{name:'런던',tz:'Europe/London'}
];
function getOffset(tz){const n=new Date();const h=new Date(n.toLocaleString('en-US',{timeZone:'Asia/Seoul'}));const t=new Date(n.toLocaleString('en-US',{timeZone:tz}));return Math.round((t-h)/3600000);}
function renderWC(){
  const list=$('#wc-list');list.innerHTML='';
  myClocks.forEach(c=>{
    const now=new Date();const str=now.toLocaleTimeString('ko-KR',{timeZone:c.tz,hour:'numeric',minute:'2-digit',hour12:true});
    const m=str.match(/(오전|오후)\s*(\d+):(\d+)/);
    const ampm=m?m[1]:'',h=m?m[2]:'',min=m?m[3]:'';
    const off=getOffset(c.tz);const offStr=off===0?'오늘, +0시간':off>0?`오늘, +${off}시간`:`오늘, ${off}시간`;
    const el=document.createElement('div');el.className='wc-item';
    el.innerHTML=`<div><div class="wc-offset">${offStr}</div><div class="wc-city">${c.name}</div></div>
      <div><span class="wc-time">${h}:${min}</span><span class="wc-ampm">${ampm}</span></div>`;
    list.appendChild(el);
  });
}
renderWC(); setInterval(renderWC,1000);
$('#wc-add-btn').addEventListener('click',()=>{$('#wc-modal').classList.add('show');$('#city-search').value='';renderCities('');});
$('#wc-modal-cancel').addEventListener('click',()=>$('#wc-modal').classList.remove('show'));
$('#city-search').addEventListener('input',e=>renderCities(e.target.value));
function renderCities(q){
  const list=$('#city-list');list.innerHTML='';
  CITIES.filter(c=>c.name.includes(q)||c.country.includes(q)).forEach(c=>{
    const el=document.createElement('div');el.className='city-row';el.textContent=`${c.name}, ${c.country}`;
    el.addEventListener('click',()=>{if(!myClocks.find(x=>x.tz===c.tz)){myClocks.push({name:c.name,tz:c.tz});localStorage.setItem('wc',JSON.stringify(myClocks));renderWC();}$('#wc-modal').classList.remove('show');});
    list.appendChild(el);
  });
}

// ===== 알람 =====
let alarms=JSON.parse(localStorage.getItem('al')||'null')||[{id:1,h:6,m:30,ap:'오전',label:'알람',on:true},{id:2,h:7,m:0,ap:'오전',label:'출근',on:true}];
function renderAlarms(){
  const list=$('#al-list');list.innerHTML='';
  const sec=document.createElement('div');
  sec.innerHTML=`<div class="al-section"><div class="al-section-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h1l1-3h4l1 3h1v3H3v-3zm5-5a2 2 0 100-4 2 2 0 000 4zm5 2h8v1.5a2 2 0 01-2 2h-4a2 2 0 01-2-2V10z"/></svg></div><span class="al-section-title">수면 | 기상</span></div><div class="al-section-desc">수면 및 기상 시간표를 설정하려면 건강 앱에서 설정하십시오.</div><div class="al-other-title">기타</div>`;
  list.appendChild(sec);
  alarms.forEach(a=>{
    const el=document.createElement('div');el.className='al-item'+(a.on?'':' off');
    el.innerHTML=`<div><div><span class="al-time">${a.h}:${pad(a.m)}</span><span class="al-ampm">${a.ap}</span></div><div class="al-label">${a.label}</div></div><label class="toggle"><input type="checkbox" ${a.on?'checked':''}><span class="toggle-track"><span class="toggle-thumb"></span></span></label>`;
    el.querySelector('input').addEventListener('change',e=>{a.on=e.target.checked;localStorage.setItem('al',JSON.stringify(alarms));renderAlarms();});
    list.appendChild(el);
  });
}
renderAlarms();
$('#al-add-btn').addEventListener('click',()=>{$('#al-modal').classList.add('show');initAlarmPicker();});
$('#al-modal-cancel').addEventListener('click',()=>$('#al-modal').classList.remove('show'));
$('#al-modal-save').addEventListener('click',()=>{
  const h=parseInt(getPickerValue($('#alpk-h'))),m=parseInt(getPickerValue($('#alpk-m'))),ap=getPickerValue($('#alpk-ap'));
  alarms.push({id:Date.now(),h,m,ap,label:$('#al-label-input').value||'알람',on:true});
  localStorage.setItem('al',JSON.stringify(alarms));renderAlarms();$('#al-modal').classList.remove('show');
});
function initAlarmPicker(){
  const now=new Date();initPicker($('#alpk-h'));initPicker($('#alpk-m'));initPicker($('#alpk-ap'));
  setTimeout(()=>{setPickerValue($('#alpk-h'),now.getHours()%12||12);setPickerValue($('#alpk-m'),now.getMinutes());setPickerValue($('#alpk-ap'),now.getHours()>=12?'오후':'오전');},100);
}

// ============================================
// 스톱워치 - Analog Dial (Canvas)
// ============================================
const canvas = $('#sw-canvas');
const ctx = canvas.getContext('2d');
let cw, ch, cx, cy, radius;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cw = rect.width * dpr;
  ch = rect.height * dpr;
  canvas.width = cw;
  canvas.height = ch;
  cx = cw / 2;
  cy = ch / 2;
  radius = Math.min(cw, ch) / 2 - 4;
  drawDial();
}

function drawDial() {
  ctx.clearRect(0, 0, cw, ch);
  const r = radius;

  // Outer tick marks (60 seconds)
  for (let i = 0; i < 300; i++) {
    const angle = (i / 300) * PI2 - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const isMid = i % 1 === 0;
    const outerR = r;
    const innerR = isMajor ? r - r * 0.08 : r - r * 0.04;
    const lw = isMajor ? 2 : 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.strokeStyle = (i % 25 === 0) ? '#FFF' : '#888';
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  // Big 5-second marks
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * PI2 - Math.PI / 2;
    const isFive = i % 5 === 0;
    if (!isFive) continue;
    const outerR = r;
    const innerR = r - r * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Outer numbers (60, 5, 10, 15, ... 55)
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const numR = r - r * 0.2;
  const outerNums = [60,5,10,15,20,25,30,35,40,45,50,55];
  outerNums.forEach((num, i) => {
    const angle = (i / 12) * PI2 - Math.PI / 2;
    const fontSize = r * 0.14;
    ctx.font = `${num===60?'600':'300'} ${fontSize}px -apple-system, 'SF Pro Display', sans-serif`;
    ctx.fillText(String(num), cx + Math.cos(angle) * numR, cy + Math.sin(angle) * numR);
  });

  // Inner minute sub-dial
  const subR = r * 0.18;
  const subCx = cx;
  const subCy = cy - r * 0.32;

  // Sub-dial circle
  ctx.beginPath();
  ctx.arc(subCx, subCy, subR, 0, PI2);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Sub-dial ticks
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * PI2 - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const oR = subR;
    const iR = isMajor ? subR - subR * 0.2 : subR - subR * 0.1;
    ctx.beginPath();
    ctx.moveTo(subCx + Math.cos(angle) * iR, subCy + Math.sin(angle) * iR);
    ctx.lineTo(subCx + Math.cos(angle) * oR, subCy + Math.sin(angle) * oR);
    ctx.strokeStyle = isMajor ? '#CCC' : '#666';
    ctx.lineWidth = isMajor ? 1.2 : 0.6;
    ctx.stroke();
  }

  // Sub-dial numbers
  const subNumR = subR - subR * 0.42;
  const subNums = [30, 5, 10, 15, 20, 25];
  ctx.fillStyle = '#CCC';
  subNums.forEach((num, i) => {
    const angle = (i / 6) * PI2 - Math.PI / 2;
    const fs = subR * 0.32;
    ctx.font = `400 ${fs}px -apple-system, 'SF Pro Display', sans-serif`;
    ctx.fillText(String(num), subCx + Math.cos(angle) * subNumR, subCy + Math.sin(angle) * subNumR);
  });

  // Draw hands
  const elapsed = swElapsed + (swRunning ? (performance.now() - swStart) : 0);
  const totalSec = elapsed / 1000;
  const secFrac = (totalSec % 60) / 60;
  const minFrac = (totalSec / 60 % 30) / 30;

  // Lap elapsed
  let lapElapsed = 0;
  if (swRunning) {
    lapElapsed = performance.now() - lapStart;
  } else if (laps.length > 0 && swElapsed > 0) {
    // show last position
    lapElapsed = 0;
  }
  const lapSec = lapElapsed / 1000;
  const lapSecFrac = (lapSec % 60) / 60;

  // Orange second hand (total)
  const secAngle = secFrac * PI2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(secAngle) * r * 0.12, cy - Math.sin(secAngle) * r * 0.12);
  ctx.lineTo(cx + Math.cos(secAngle) * (r * 0.72), cy + Math.sin(secAngle) * (r * 0.72));
  ctx.strokeStyle = '#FF9F0A';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Orange second hand tip circle
  ctx.beginPath();
  ctx.arc(cx + Math.cos(secAngle) * (r * 0.72), cy + Math.sin(secAngle) * (r * 0.72), 4, 0, PI2);
  ctx.fillStyle = '#FF9F0A';
  ctx.fill();

  // Blue lap hand
  if (swRunning || (laps.length > 0 && swElapsed > 0)) {
    const lapAngle = lapSecFrac * PI2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(lapAngle) * (r * 0.72), cy + Math.sin(lapAngle) * (r * 0.72));
    ctx.strokeStyle = '#007AFF';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Sub-dial minute hand (orange)
  const minAngle = minFrac * PI2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(subCx, subCy);
  ctx.lineTo(subCx + Math.cos(minAngle) * (subR * 0.7), subCy + Math.sin(minAngle) * (subR * 0.7));
  ctx.strokeStyle = '#FF9F0A';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, PI2);
  ctx.fillStyle = '#FF9F0A';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, PI2);
  ctx.fillStyle = '#000';
  ctx.fill();

  // Sub-dial center dot
  ctx.beginPath();
  ctx.arc(subCx, subCy, 2.5, 0, PI2);
  ctx.fillStyle = '#FF9F0A';
  ctx.fill();

  // Digital time in center
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);
  const cs = Math.floor((elapsed % 1000) / 10);
  let timeStr;
  if (hrs > 0) timeStr = `${hrs}:${pad(mins)}:${pad(secs)}.${pad(cs)}`;
  else timeStr = `${pad(mins)}:${pad(secs)}.${pad(cs)}`;

  const timeFontSize = r * 0.11;
  ctx.font = `300 ${timeFontSize}px -apple-system, 'SF Pro Display', sans-serif`;
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeStr, cx, cy + r * 0.22);
}

let swRunning = false, swStart = 0, swElapsed = 0, swAnimFrame = null;
let laps = [], lapStart = 0;

function updateDigital() {
  const elapsed = swElapsed + (swRunning ? (performance.now() - swStart) : 0);
  const hrs = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const cs = Math.floor((elapsed % 1000) / 10);
  let str;
  if (hrs > 0) str = `${hrs}:${pad(mins)}:${pad(secs)}<span class="sw-digital-ms">.${pad(cs)}</span>`;
  else str = `${pad(mins)}:${pad(secs)}<span class="sw-digital-ms">.${pad(cs)}</span>`;
  $('#sw-display').innerHTML = str;
}

function swLoop() {
  drawDial();
  updateDigital();
  swAnimFrame = requestAnimationFrame(swLoop);
}

function fmtLap(ms) {
  const h = Math.floor(ms/3600000);
  const m = Math.floor((ms%3600000)/60000);
  const s = Math.floor((ms%60000)/1000);
  const cs = Math.floor((ms%1000)/10);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function renderLaps() {
  const el = $('#sw-laps'); el.innerHTML = '';
  if (!laps.length) return;
  const times = laps.map(l=>l.t);
  const best = laps.length >= 2 ? Math.min(...times) : null;
  const worst = laps.length >= 2 ? Math.max(...times) : null;
  laps.forEach((l,i) => {
    const row = document.createElement('div');
    let cls = 'lap-row';
    if (best !== null && l.t === best) cls += ' best';
    else if (worst !== null && l.t === worst) cls += ' worst';
    row.className = cls;
    row.innerHTML = `<span>랩 ${laps.length-i}</span><span>${fmtLap(l.t)}</span>`;
    el.appendChild(row);
  });
}

$('#sw-start-btn').addEventListener('click', () => {
  if (!swRunning) {
    swRunning = true;
    swStart = performance.now();
    if (!laps.length) lapStart = swStart;
    swLoop();
    $('#sw-start-btn').textContent = '중단';
    $('#sw-start-btn').className = 'circle-btn red';
    $('#sw-start-ring').className = 'circle-btn-ring red-ring';
    $('#sw-lap-btn').textContent = '랩';
    $('#sw-lap-btn').disabled = false;
  } else {
    swRunning = false;
    swElapsed += performance.now() - swStart;
    cancelAnimationFrame(swAnimFrame);
    drawDial(); updateDigital();
    $('#sw-start-btn').textContent = '시작';
    $('#sw-start-btn').className = 'circle-btn green';
    $('#sw-start-ring').className = 'circle-btn-ring green-ring';
    $('#sw-lap-btn').textContent = '재설정';
  }
});

$('#sw-lap-btn').addEventListener('click', () => {
  if (swRunning) {
    const now = performance.now();
    laps.unshift({t: now - lapStart});
    lapStart = now;
    renderLaps();
  } else if (swElapsed > 0) {
    swElapsed = 0; laps = [];
    drawDial(); updateDigital(); renderLaps();
    $('#sw-lap-btn').textContent = '랩';
    $('#sw-lap-btn').disabled = true;
  }
});

// Initial canvas setup
setTimeout(resizeCanvas, 50);
window.addEventListener('resize', resizeCanvas);

// Swipe pages + dots
const swPages = $('#sw-pages');
const swDots = $$('.sw-dot');
swPages.addEventListener('scroll', () => {
  const page = Math.round(swPages.scrollLeft / swPages.offsetWidth);
  swDots.forEach((d, i) => d.classList.toggle('active', i === page));
});
swDots.forEach(d => d.addEventListener('click', () => {
  const p = parseInt(d.dataset.page);
  swPages.scrollTo({ left: p * swPages.offsetWidth, behavior: 'smooth' });
}));

// ===== 타이머 =====
let tmRunning=false,tmTotal=0,tmRemain=0,tmTimer=null;
const CIRC=2*Math.PI*92;
function initTimerPickers(){initPicker($('#pk-h'));initPicker($('#pk-m'));initPicker($('#pk-s'));setTimeout(()=>{setPickerValue($('#pk-h'),0);setPickerValue($('#pk-m'),5);setPickerValue($('#pk-s'),0);},100);}
initTimerPickers();
function fmtTimer(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?`${pad(h)}:${pad(m)}:${pad(sec)}`:`${pad(m)}:${pad(sec)}`;}
function updateRing(){const f=tmRemain/tmTotal;$('#tm-ring-circle').setAttribute('stroke-dashoffset',CIRC*(1-f));$('#tm-ring-time').textContent=fmtTimer(tmRemain);}

$('#tm-start-btn').addEventListener('click',()=>{
  if(!tmRunning){
    if(tmRemain<=0){const h=parseInt(getPickerValue($('#pk-h'))),m=parseInt(getPickerValue($('#pk-m'))),s=parseInt(getPickerValue($('#pk-s')));tmTotal=h*3600+m*60+s;if(tmTotal<=0)return;tmRemain=tmTotal;}
    $('#tm-picker-area').style.display='none';$('#tm-ring-area').style.display='flex';updateRing();
    tmRunning=true;$('#tm-cancel-btn').disabled=false;
    $('#tm-start-btn').textContent='일시 정지';$('#tm-start-btn').className='circle-btn red';$('#tm-start-btn').closest('.circle-btn-ring').className='circle-btn-ring red-ring';
    tmTimer=setInterval(()=>{tmRemain--;updateRing();if(tmRemain<=0){clearInterval(tmTimer);tmRunning=false;$('#tm-start-btn').textContent='시작';$('#tm-start-btn').className='circle-btn green';$('#tm-start-btn').closest('.circle-btn-ring').className='circle-btn-ring green-ring';if('vibrate' in navigator)navigator.vibrate([200,100,200,100,200]);if('Notification' in window&&Notification.permission==='granted')new Notification('타이머',{body:'타이머가 종료되었습니다.'});else alert('타이머가 종료되었습니다!');}},1000);
  } else {clearInterval(tmTimer);tmRunning=false;$('#tm-start-btn').textContent='재개';$('#tm-start-btn').className='circle-btn green';$('#tm-start-btn').closest('.circle-btn-ring').className='circle-btn-ring green-ring';}
});
$('#tm-cancel-btn').addEventListener('click',()=>{clearInterval(tmTimer);tmRunning=false;tmRemain=0;tmTotal=0;$('#tm-picker-area').style.display='';$('#tm-ring-area').style.display='none';$('#tm-start-btn').textContent='시작';$('#tm-start-btn').className='circle-btn green';$('#tm-start-btn').closest('.circle-btn-ring').className='circle-btn-ring green-ring';$('#tm-cancel-btn').disabled=true;initTimerPickers();});

// Notifications
if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();
// SW
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
