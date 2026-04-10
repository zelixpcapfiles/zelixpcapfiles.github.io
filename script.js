(function(){
"use strict";

/* ==============================================================
   PERFORMANCE DETECTION
   ============================================================== */
const isLowEnd = (navigator.hardwareConcurrency || 4) <= 2;

/* ==============================================================
   THEME SYSTEM
   ============================================================== */
const THEME_MAP = {
  rose:   {primary:'#e11d48',light:'#fb7185',dark:'#be123c',rgb:'225,29,72',   lRgb:'251,113,133'},
  purple: {primary:'#7c3aed',light:'#a78bfa',dark:'#5b21b6',rgb:'124,58,237', lRgb:'167,139,250'},
  blue:   {primary:'#2563eb',light:'#60a5fa',dark:'#1e40af',rgb:'37,99,235',   lRgb:'96,165,250'},
  green:  {primary:'#059669',light:'#34d399',dark:'#065f46',rgb:'5,150,105',   lRgb:'52,211,153'},
  orange: {primary:'#ea580c',light:'#f97316',dark:'#c2410c',rgb:'234,88,12',   lRgb:'249,115,22'}
};
function getThemeRGB(){ return (THEME_MAP[document.body.getAttribute('data-theme')]||THEME_MAP.rose).rgb; }
function getThemeColors(){ return THEME_MAP[document.body.getAttribute('data-theme')]||THEME_MAP.rose; }

(function(){
  const t=localStorage.getItem('pref-theme')||'rose';
  document.body.setAttribute('data-theme',t);
  document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('active',d.dataset.theme===t));
  const tColors={purple:'%237c3aed',blue:'%232563eb',green:'%23059669',rose:'%23e11d48',orange:'%23ea580c'};
  const svg=`%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${tColors[t]||'%23e11d48'}'%3E%3Cpath d='M13 2L3 14h7l-2 8 10-12h-7l2-8z'/%3E%3C/svg%3E`;
  document.querySelector('link[rel="icon"]').href='data:image/svg+xml,'+svg;
})();

function setTheme(t){
  document.body.setAttribute('data-theme',t);
  document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('active',d.dataset.theme===t));
  localStorage.setItem('pref-theme',t);
  const tColors={purple:'%237c3aed',blue:'%232563eb',green:'%23059669',rose:'%23e11d48',orange:'%23ea580c'};
  const svg=`%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${tColors[t]||'%23e11d48'}'%3E%3Cpath d='M13 2L3 14h7l-2 8 10-12h-7l2-8z'/%3E%3C/svg%3E`;
  document.querySelector('link[rel="icon"]').href=document.querySelector('link[rel="apple-touch-icon"]').href='data:image/svg+xml,'+svg;
  updateCursorColor();
  updateLoadingScreenTheme();
}
window.setTheme=setTheme;

function updateLoadingScreenTheme(){
  const c=getThemeColors(), ls=document.getElementById('loading-screen');
  if(!ls||ls.style.display==='none') return;
  ls.style.setProperty('--primary',c.primary);
  ls.style.setProperty('--primary-light',c.light);
  ls.style.setProperty('--primary-dark',c.dark);
  ls.style.setProperty('--primary-soft',`rgba(${c.rgb},.22)`);
}
updateLoadingScreenTheme();

/* ==============================================================
   ANTI-INSPECT
   ============================================================== */
(function(){
  document.addEventListener('contextmenu',e=>e.preventDefault());
  function blockDev(e){
    const {code,ctrlKey:ctrl,shiftKey:shift,metaKey:meta}=e;
    if(code==='F12'||(ctrl&&shift&&['KeyI','KeyJ','KeyC'].includes(code))||(ctrl&&['KeyU','KeyS'].includes(code))||(meta&&e.altKey&&['KeyI','KeyJ'].includes(code))){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return false;
    }
  }
  document.addEventListener('keydown',blockDev,true);
  let devOpen=false;
  setInterval(()=>{
    if(window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160){
      if(!devOpen){devOpen=true;alert('Developer tools detected.');}
    } else devOpen=false;
  },1500);
  document.addEventListener('selectstart',e=>e.preventDefault());
  document.addEventListener('dragstart',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{if(e.altKey)e.preventDefault();},true);
})();

/* ==============================================================
   CUSTOM CURSOR
   ============================================================== */
const cursor=document.getElementById('customCursor');
function updateCursorColor(){
  const colors={purple:'#7c3aed',blue:'#2563eb',green:'#059669',rose:'#e11d48',orange:'#ea580c'};
  cursor.style.color=colors[document.body.getAttribute('data-theme')]||'#e11d48';
}
updateCursorColor();

let _cx=0,_cy=0,_cursorRaf=null;
document.addEventListener('mousemove',e=>{
  _cx=e.clientX; _cy=e.clientY;
  if(!_cursorRaf){
    _cursorRaf=requestAnimationFrame(()=>{
      cursor.style.left=_cx+'px';
      cursor.style.top=_cy+'px';
      _cursorRaf=null;
    });
  }
  resetIdleTimer();
},{passive:true});

function attachCursorHovers(){
  document.querySelectorAll('a,button,.btn,.lang-option,.theme-dot,.accordion-header,.tech-pill,.product-card,.feature-item,.download-option-btn').forEach(el=>{
    if(el._cursorBound)return; el._cursorBound=true;
    el.addEventListener('mouseenter',()=>{cursor.classList.add('hover');cursor.style.transform=`translate(-50%,-50%) rotate(${(Math.random()*20-10).toFixed(1)}deg)`;});
    el.addEventListener('mouseleave',()=>{cursor.classList.remove('hover');cursor.style.transform='translate(-50%,-50%) rotate(0deg)';});
  });
}
attachCursorHovers();

document.addEventListener('click',e=>{
  const r=document.createElement('span');
  r.className='ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
  document.body.appendChild(r);setTimeout(()=>r.remove(),600);
  stopIdleAnimation();
  cursor.style.animation='none';void cursor.offsetWidth;
  cursor.style.animation='lightningPulse 0.4s ease-in-out 1';
  setTimeout(()=>{cursor.style.animation='';resetIdleTimer();},400);
});

let idleTimer;
function startIdleAnimation(){cursor.classList.add('idle-animation');}
function stopIdleAnimation(){cursor.classList.remove('idle-animation');}
function resetIdleTimer(){stopIdleAnimation();clearTimeout(idleTimer);idleTimer=setTimeout(startIdleAnimation,800);}
resetIdleTimer();

/* ==============================================================
   LIVE VISITOR COUNTER
   ============================================================== */
(function(){
  const el=document.getElementById('liveCount');
  let current=0;
  function getBase(){const h=new Date().getHours();return h>=20?29:h>=16?23:h>=11?17:h>=7?11:6;}
  function next(){return Math.max(4,getBase()+Math.round(Math.sin(Date.now()/90000)*5)+Math.floor(Math.random()*3-1));}
  function bump(v){el.classList.remove('bump');void el.offsetWidth;el.textContent=v;el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),450);}
  current=next();el.textContent=current;
  (function schedule(){setTimeout(()=>{const n=next();if(n!==current){bump(n);current=n;}schedule();},9000+Math.random()*7000);})();
})();

/* ==============================================================
   BACKGROUND: WIREFRAME
   ============================================================== */
(function(){
  const wc=document.getElementById('wireframe-canvas'),wx=wc.getContext('2d');
  if(isLowEnd){wc.style.display='none';return;}
  function resize(){wc.width=window.innerWidth;wc.height=window.innerHeight;}
  window.addEventListener('resize',resize,{passive:true});resize();
  const GRID=60;
  (function draw(){
    wx.clearRect(0,0,wc.width,wc.height);
    wx.strokeStyle='rgba('+getThemeRGB()+',0.12)';wx.lineWidth=1;
    const t=Date.now()*.001;
    for(let x=0;x<wc.width;x+=GRID){const oy=Math.sin(x*.01+t)*18;wx.beginPath();wx.moveTo(x,0);wx.lineTo(x+oy*.5,wc.height);wx.stroke();}
    for(let y=0;y<wc.height;y+=GRID){const ox=Math.cos(y*.01+t)*18;wx.beginPath();wx.moveTo(0,y);wx.lineTo(wc.width,y+ox*.5);wx.stroke();}
    requestAnimationFrame(draw);
  })();
})();

/* ==============================================================
   BACKGROUND: PARTICLE SNOW
   ============================================================== */
(function(){
  const pc=document.getElementById('particle-canvas'),px=pc.getContext('2d');
  function resize(){pc.width=window.innerWidth;pc.height=window.innerHeight;}
  window.addEventListener('resize',resize,{passive:true});resize();
  const COUNT=isLowEnd?40:80;
  const pts=Array.from({length:COUNT},()=>({
    x:Math.random()*pc.width,y:Math.random()*pc.height,
    r:Math.random()*3+1,sy:Math.random()*1.2+.4,
    sx:Math.random()*.4-.2,op:Math.random()*.5+.3
  }));
  (function draw(){
    px.clearRect(0,0,pc.width,pc.height);
    const rgb=getThemeRGB();
    pts.forEach(p=>{
      px.beginPath();px.arc(p.x,p.y,p.r,0,Math.PI*2);
      px.fillStyle=`rgba(${rgb},${p.op})`;
      px.shadowColor=`rgba(${rgb},.8)`;px.shadowBlur=isLowEnd?4:8;px.fill();
      p.y+=p.sy;p.x+=p.sx;
      if(p.y>pc.height+10)p.y=-10;
      if(p.x>pc.width+10)p.x=-10;else if(p.x<-10)p.x=pc.width+10;
    });
    requestAnimationFrame(draw);
  })();
})();

/* ==============================================================
   BACKGROUND: LIGHTNING FLASHES
   ============================================================== */
(function(){
  const lc=document.getElementById('lightning-canvas'),lx=lc.getContext('2d');
  function resize(){lc.width=window.innerWidth;lc.height=window.innerHeight;}
  window.addEventListener('resize',resize,{passive:true});resize();
  function drawBolt(ctx,x1,y1,x2,y2,rough,alpha,depth){
    if(depth===0||alpha<0.05)return;
    const mx=(x1+x2)/2+(Math.random()-.5)*rough,my=(y1+y2)/2+(Math.random()-.5)*rough;
    const rgb=getThemeRGB();
    ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=depth*1.4;ctx.shadowColor=`rgba(${rgb},.9)`;ctx.shadowBlur=depth*8;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(mx,my);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle=`rgba(255,255,255,${alpha*.35})`;ctx.lineWidth=depth*.4;ctx.shadowBlur=0;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(mx,my);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(x2,y2);ctx.stroke();
    if(Math.random()<.35&&depth>1)drawBolt(ctx,mx,my,mx+(Math.random()-.5)*140,my+Math.random()*90,rough*.6,alpha*.5,depth-1);
    drawBolt(ctx,x1,y1,mx,my,rough*.6,alpha*.72,depth-1);
    drawBolt(ctx,mx,my,x2,y2,rough*.6,alpha*.72,depth-1);
  }
  function spawn(){
    const x=80+Math.random()*(lc.width-160);let a=1;
    const iv=setInterval(()=>{
      lx.clearRect(0,0,lc.width,lc.height);
      if(a>0){drawBolt(lx,x,0,x+(Math.random()-.5)*220,lc.height*.35+Math.random()*180,130,a,isLowEnd?4:5);a-=.09;}
      else{clearInterval(iv);lx.clearRect(0,0,lc.width,lc.height);}
    },28);
  }
  const MIN_INT=isLowEnd?5000:3000, MAX_INT=isLowEnd?9000:4500;
  (function sched(){spawn();setTimeout(sched,MIN_INT+Math.random()*MAX_INT);})();
})();

/* ==============================================================
   LOADING SCREEN — ELECTRIC STORM ENGINE
   ============================================================== */
(function(){
  const stormC   = document.getElementById('ls-storm-canvas');
  const lsCrack  = document.getElementById('ls-crack-canvas');
  const lsFlash  = document.getElementById('ls-flash');
  const lsBar    = document.getElementById('ls-bar-fill');
  const lsPerc   = document.getElementById('ls-percent');
  const lsStat   = document.getElementById('ls-status');
  const lsSparkC = document.getElementById('ls-spark-canvas');
  const lsScreen = document.getElementById('loading-screen');

  const sCtx  = stormC.getContext('2d');
  const crackCtx = lsCrack.getContext('2d');
  const sparkCtx = lsSparkC.getContext('2d');

  function resize(){
    stormC.width = lsCrack.width = window.innerWidth;
    stormC.height = lsCrack.height = window.innerHeight;
    lsSparkC.width = lsSparkC.offsetWidth || 320;
  }
  window.addEventListener('resize', resize, {passive:true}); resize();

  function lsBolt(ctx, x1, y1, x2, y2, rough, alpha, depth){
    if(depth===0||alpha<0.04) return;
    const c = getThemeColors(), col = c.rgb;
    const mx=(x1+x2)/2+(Math.random()-.5)*rough;
    const my=(y1+y2)/2+(Math.random()-.5)*rough*.35;
    ctx.strokeStyle=`rgba(${col},${alpha})`;
    ctx.lineWidth=depth*1.8; ctx.shadowColor=`rgba(${col},.95)`; ctx.shadowBlur=depth*12;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(mx,my);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle=`rgba(255,255,255,${alpha*.45})`; ctx.lineWidth=depth*.5; ctx.shadowBlur=0;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(mx,my);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(x2,y2);ctx.stroke();
    if(Math.random()<.4&&depth>1)lsBolt(ctx,mx,my,mx+(Math.random()-.5)*200,my+Math.random()*140,rough*.55,alpha*.42,depth-1);
    lsBolt(ctx,x1,y1,mx,my,rough*.55,alpha*.76,depth-1);
    lsBolt(ctx,mx,my,x2,y2,rough*.55,alpha*.76,depth-1);
  }

  const MAX_BOLTS  = isLowEnd ? 3 : 7;
  const MAX_ARCS   = isLowEnd ? 0 : 3;
  const SPAWN_MS   = isLowEnd ? 220 : 80;
  const stormBolts = [];
  const stormArcs  = [];
  let stormFlash   = 0;
  let stormAnimId  = null;
  let stormRunning = true;
  let stormLastSpawn = 0;

  function spawnBolt(isSuper){
    if(stormBolts.length >= MAX_BOLTS) return;
    const w = stormC.width, h = stormC.height;
    const x  = w * (.05 + Math.random() * .9);
    const tx = x + (Math.random() - .5) * (isLowEnd ? 160 : 300);
    const ty = h * (.18 + Math.random() * .58);
    stormBolts.push({
      x, tx, ty,
      alpha: isSuper ? 1.5 : (.6 + Math.random() * .75),
      decay: isSuper ? .02 : (.042 + Math.random() * .068),
      depth: isSuper ? (isLowEnd ? 6 : 9) : (isLowEnd ? 4 : 6),
      rough: isSuper ? 240 : (70 + Math.random() * 120),
      isSuper
    });
    if(isSuper) stormFlash = Math.min(stormFlash + .6, 1);
  }

  function spawnArc(){
    if(stormArcs.length >= MAX_ARCS) return;
    const h = stormC.height;
    const y = h * (.15 + Math.random() * .7);
    stormArcs.push({
      x1:-10, y1:y+(Math.random()-.5)*70,
      x2:stormC.width+10, y2:y+(Math.random()-.5)*70,
      alpha:.3+Math.random()*.35,
      decay:.022+Math.random()*.038,
      depth:isLowEnd?4:6,
      rough:55+Math.random()*100
    });
  }

  function drawStormFrame(t){
    sCtx.clearRect(0,0,stormC.width,stormC.height);
    const c = getThemeColors();
    const glowAlpha = (.025 + Math.sin(t*.0008)*.015) + stormFlash * .055;
    const grd = sCtx.createRadialGradient(
      stormC.width*.5, stormC.height*.42, 0,
      stormC.width*.5, stormC.height*.42, stormC.width * .62
    );
    grd.addColorStop(0,  `rgba(${c.rgb},${glowAlpha.toFixed(3)})`);
    grd.addColorStop(.5, `rgba(${c.rgb},${(glowAlpha*.4).toFixed(3)})`);
    grd.addColorStop(1,  'rgba(0,0,0,0)');
    sCtx.fillStyle = grd;
    sCtx.fillRect(0,0,stormC.width,stormC.height);
    if(stormFlash > .01){
      sCtx.fillStyle = `rgba(${c.rgb},${(stormFlash*.1).toFixed(3)})`;
      sCtx.fillRect(0,0,stormC.width,stormC.height);
      stormFlash *= .88;
    }
    for(let i=stormArcs.length-1;i>=0;i--){
      const a=stormArcs[i];
      if(a.alpha>.02){
        lsBolt(sCtx,a.x1,a.y1,a.x2,a.y2,a.rough,Math.min(a.alpha,1),a.depth);
        a.alpha-=a.decay;
      } else stormArcs.splice(i,1);
    }
    for(let i=stormBolts.length-1;i>=0;i--){
      const b=stormBolts[i];
      if(b.alpha>.02){
        lsBolt(sCtx,b.x,-12,b.tx,b.ty,b.rough,Math.min(b.alpha,1),b.depth);
        b.alpha-=b.decay;
      } else stormBolts.splice(i,1);
    }
  }

  function stormTick(t){
    if(!stormRunning) return;
    if(t - stormLastSpawn > SPAWN_MS){
      stormLastSpawn = t;
      const isSuper = Math.random() < .11;
      if(Math.random() < .80) spawnBolt(isSuper);
      if(!isLowEnd && Math.random() < .05) spawnArc();
    }
    drawStormFrame(t);
    stormAnimId = requestAnimationFrame(stormTick);
  }

  spawnBolt(true);
  setTimeout(()=>spawnBolt(false),180);
  setTimeout(()=>spawnBolt(false),380);
  stormAnimId = requestAnimationFrame(stormTick);

  const sparks = [];
  function spawnSparks(){
    const c=getThemeColors();
    for(let i=0;i<(isLowEnd?2:4);i++){
      sparks.push({
        x:lsBar.offsetWidth-3+(Math.random()-.5)*7, y:20,
        vx:(Math.random()-.5)*4.5, vy:-(Math.random()*3.2+.8),
        life:1, decay:Math.random()*.09+.05, r:Math.random()*2.2+.8,
        col:Math.random()>.5?c.rgb:c.lRgb
      });
    }
  }
  (function sparkLoop(){
    lsSparkC.width = lsBar.offsetWidth || 10;
    sparkCtx.clearRect(0,0,lsSparkC.width,40);
    for(let i=sparks.length-1;i>=0;i--){
      const s=sparks[i];
      s.x+=s.vx;s.y+=s.vy;s.vy+=.2;s.life-=s.decay;
      if(s.life<=0){sparks.splice(i,1);continue;}
      sparkCtx.beginPath();sparkCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
      sparkCtx.fillStyle=`rgba(${s.col},${s.life})`;
      sparkCtx.shadowColor=`rgba(${s.col},${s.life*.8})`;sparkCtx.shadowBlur=9;sparkCtx.fill();
    }
    requestAnimationFrame(sparkLoop);
  })();

  const statusMsgs=['Initializing...','Loading assets...','Charging power...','Calibrating aim...','Bypassing firewall...','Almost ready...'];
  let pct=0;
  function updateBar(p){
    lsBar.style.width=p+'%';
    lsPerc.textContent=Math.floor(p)+'%';
    lsStat.textContent=statusMsgs[Math.min(Math.floor(p/20),statusMsgs.length-1)];
    spawnSparks();
  }
  const loadIv=setInterval(()=>{
    const spd=pct<70?(Math.random()*3.2+1):(Math.random()*1.3+.3);
    pct=Math.min(pct+spd,100);updateBar(pct);
    if(pct>=100){clearInterval(loadIv);setTimeout(triggerTransition,320);}
  },52);

  function drawCracks(cx,cy,w,h,prog){
    crackCtx.clearRect(0,0,w,h);
    const c=getThemeColors();
    const n=Math.floor(prog*15)+3;
    crackCtx.lineCap='round';
    for(let ci=0;ci<n;ci++){
      const seed=ci*137.5;
      let x=cx+Math.cos(seed*.28%6.28)*(seed%120),y=cy+Math.sin(seed*.22%6.28)*(seed%80);
      const len=(85+(seed%210))*prog,alpha=Math.min(1,prog*2.5),width=1+(ci%3)*.8;
      let ang=(seed%360)*Math.PI/180;
      crackCtx.strokeStyle=`rgba(${c.rgb},${alpha*.9})`;crackCtx.lineWidth=width+1.6;
      crackCtx.shadowColor=`rgba(${c.rgb},.85)`;crackCtx.shadowBlur=13*prog;
      crackCtx.beginPath();crackCtx.moveTo(x,y);
      const segs=4+(ci%5);
      for(let s=0;s<segs;s++){
        ang+=(Math.random()-.5)*.95;x+=Math.cos(ang)*(len/segs);y+=Math.sin(ang)*(len/segs);
        crackCtx.lineTo(x,y);
        if(s===Math.floor(segs/2)&&prog>.35){
          const bx=x,by=y,ba=ang+(Math.random()>.5?.85:-.85),bl=(len/segs)*(.4+Math.random()*.4);
          crackCtx.moveTo(bx,by);crackCtx.lineTo(bx+Math.cos(ba)*bl,by+Math.sin(ba)*bl);crackCtx.moveTo(x,y);
        }
      }
      crackCtx.stroke();
      crackCtx.strokeStyle=`rgba(255,255,255,${alpha*.32})`;crackCtx.lineWidth=width*.35;crackCtx.shadowBlur=0;crackCtx.stroke();
    }
  }

  function triggerTransition(){
    stormRunning=false;
    if(stormAnimId){cancelAnimationFrame(stormAnimId);stormAnimId=null;}
    const w=window.innerWidth,h=window.innerHeight,cx=w/2,cy=h/2;
    let a=1.4;
    const strikeIv=setInterval(()=>{
      sCtx.clearRect(0,0,w,h);
      if(a>0){lsBolt(sCtx,cx,-20,cx+(Math.random()-.5)*60,cy*.6,100,Math.min(a,1),isLowEnd?7:9);a-=.05;}
      else clearInterval(strikeIv);
    },16);
    setTimeout(()=>{
      lsFlash.style.transition='opacity .06s';lsFlash.style.opacity='1';
      setTimeout(()=>lsFlash.style.opacity='0',75);
      lsCrack.style.opacity='1';
      let cp=0;
      const crackIv=setInterval(()=>{cp=Math.min(cp+.028,1);drawCracks(cx,cy,w,h,cp);if(cp>=1)clearInterval(crackIv);},18);
      setTimeout(()=>{
        lsFlash.style.transition='opacity .06s';lsFlash.style.opacity='.9';
        setTimeout(()=>lsFlash.style.opacity='0',90);
        if(!document.getElementById('ls-shatter-kf')){
          const st=document.createElement('style');st.id='ls-shatter-kf';
          st.textContent=`@keyframes lsShatter{0%{opacity:1;transform:scale(1) skewX(0);filter:brightness(1) blur(0);}18%{opacity:1;transform:scale(1.04) skewX(1deg);filter:brightness(3.5) blur(1px);}45%{opacity:.65;transform:scale(1.12) skewX(2deg);filter:brightness(1.6) blur(3px);}75%{opacity:.25;transform:scale(1.28) skewX(-1deg);filter:brightness(.7) blur(10px);}100%{opacity:0;transform:scale(1.55) skewX(0);filter:brightness(0) blur(22px);}}`;
          document.head.appendChild(st);
        }
        lsScreen.style.animation='lsShatter .52s cubic-bezier(.55,0,1,.45) both';
        setTimeout(()=>{
          lsScreen.style.display='none';
          lsFlash.style.position='fixed';lsFlash.style.zIndex='9998';
          lsFlash.style.opacity='.65';
          setTimeout(()=>lsFlash.style.opacity='0',110);
          if(window.AOS)AOS.refresh();
          attachCursorHovers();
        },490);
      },680);
    },400);
  }
})();

/* ==============================================================
   TRANSLATIONS
   ============================================================== */
const T={
  id:{dl_modal_title:'Pilih Versi',dl_modal_desc:'Pilih versi Free Fire yang sesuai dengan perangkatmu:',dl_ff:'Free Fire',dl_ffmax:'Free Fire MAX',dl_v7a:'ARM v7a (32-bit)',dl_v8a:'ARM v8a (64-bit)',dl_hint:'Tidak tahu arsitektur perangkatmu? Coba v7a dulu, jika tidak bisa gunakan v8a.',nav_home:'Beranda',nav_products:'Produk',nav_features:'Fitur',nav_testi:'Testimoni',nav_downloads:'Unduh',nav_discord:'Discord',hero_line1:'Tingkatkan',hero_line2:'Bidikanmu',hero_line3:'Tanpa Batas',hero_desc:'Injector next-gen dengan akurasi 0.01ms. Performa maksimal untuk gaming kompetitif.',get_started:'Mulai Sekarang',learn_more:'Pelajari',product_heading:'Paket X!T',product_sub:'Pilih paket yang sesuai dengan gaya bermainmu.',basic_name:'ESP',basic_feat1:'1 perangkat',basic_feat2:'Melihat musuh dari balik tembok',basic_feat3:'Update setiap pergantian OBB',basic_feat4:'Support 12 jam',premium_name:'AIMBOT EXTERNAL',premium_feat1:'1 perangkat',premium_feat2:'Mempermudah Headshot',premium_feat3:'Update real-time',premium_feat4:'Support 24/7 prioritas',per_day:'/hari',buy_now:'Beli Sekarang',popular:'POPULER',features_title:'Kenapa X!T?',feat1_title:'Respons Instan',feat1_desc:'Latensi ultra rendah dengan algoritma proprietary.',feat2_title:'Anti-Banned',feat2_desc:'Sistem keamanan berlapis, 100% aman digunakan.',feat3_title:'Akurasi Tinggi',feat3_desc:'Kalibrasi presisi hingga 0.01 untuk setiap gerakan.',testi_title:'Apa Kata Mereka',faq_title:'Pertanyaan Umum',faq_q1:'Bagaimana cara aktivasi?',faq_a1:'Setelah pembayaran, kamu akan mendapat kode aktivasi via WhatsApp.',faq_q2:'Apakah bisa untuk semua game?',faq_a2:'Tidak, ini khusus game Free Fire.',payment_title:'QRIS Allpay',product_label:'Produk',total_label:'Total',wa_confirm:'Kirim Bukti via WhatsApp',manual_verify:'Admin akan verifikasi manual.',download_title:'Unduh Free Fire',download_desc:'Dapatkan apk FF terbaru langsung dari Website ini.',download_button:'Download Sekarang',discord_title:'Gabung Discord',discord_desc:'Dapatkan update terbaru, bantuan langsung, dan komunitas eksklusif.',discord_button:'Join Discord',visitor_label:'Penonton',visitor_live:'LIVE'},
  en:{dl_modal_title:'Choose Version',dl_modal_desc:'Choose the Free Fire version that matches your device:',dl_ff:'Free Fire',dl_ffmax:'Free Fire MAX',dl_v7a:'ARM v7a (32-bit)',dl_v8a:'ARM v8a (64-bit)',dl_hint:"Don't know your device architecture? Try v7a first, if it doesn't work use v8a.",nav_home:'Home',nav_products:'Products',nav_features:'Features',nav_testi:'Testimonials',nav_downloads:'Downloads',nav_discord:'Discord',hero_line1:'Enhance',hero_line2:'Your Aim',hero_line3:'Without Limits',hero_desc:'Next-gen injector with 0.01ms accuracy. Maximum performance for competitive gaming.',get_started:'Get Started',learn_more:'Learn More',product_heading:'X!T Plans',product_sub:'Choose the plan that fits your playstyle.',basic_name:'ESP',basic_feat1:'1 device',basic_feat2:'See enemies through walls',basic_feat3:'Updated with every OBB change',basic_feat4:'12h support',premium_name:'AIMBOT EXTERNAL',premium_feat1:'1 device',premium_feat2:'Makes headshots easier',premium_feat3:'Real-time updates',premium_feat4:'24/7 priority support',per_day:'/day',buy_now:'Buy Now',popular:'POPULAR',features_title:'Why X!T?',feat1_title:'Instant Response',feat1_desc:'Ultra low latency with proprietary algorithm.',feat2_title:'Anti-Ban',feat2_desc:'Multi-layer security, 100% safe to use.',feat3_title:'High Accuracy',feat3_desc:'Precision calibration up to 0.01 for every movement.',testi_title:'What They Say',faq_title:'FAQ',faq_q1:'How to activate?',faq_a1:'After payment, you will receive an activation code via WhatsApp.',faq_q2:'Does it work for all games?',faq_a2:'No, this is specifically for Free Fire.',payment_title:'QRIS Allpay',product_label:'Product',total_label:'Total',wa_confirm:'Send Proof via WhatsApp',manual_verify:'Admin will verify manually.',download_title:'Download Free Fire',download_desc:'Get the latest FF apk directly from this website.',download_button:'Download Now',discord_title:'Join Discord',discord_desc:'Get the latest updates, direct support, and an exclusive community.',discord_button:'Join Discord',visitor_label:'Viewers',visitor_live:'LIVE'},
  fr:{dl_modal_title:'Choisir la version',dl_modal_desc:'Choisissez la version de Free Fire adaptée:',dl_ff:'Free Fire',dl_ffmax:'Free Fire MAX',dl_v7a:'ARM v7a (32-bit)',dl_v8a:'ARM v8a (64-bit)',dl_hint:"Essayez v7a d'abord, sinon utilisez v8a.",nav_home:'Accueil',nav_products:'Produits',nav_features:'Fonctionnalités',nav_testi:'Témoignages',nav_downloads:'Téléchargements',nav_discord:'Discord',hero_line1:'Améliorez',hero_line2:'Votre visée',hero_line3:'Sans Limites',hero_desc:'Injecteur nouvelle génération avec une précision de 0,01 ms.',get_started:'Commencer',learn_more:'En savoir plus',product_heading:'Plans X!T',product_sub:'Choisissez le forfait adapté.',basic_name:'ESP',basic_feat1:'1 appareil',basic_feat2:'Voir les ennemis à travers les murs',basic_feat3:'Mis à jour chaque OBB',basic_feat4:'Support 12h',premium_name:'AIMBOT EXTERNAL',premium_feat1:'1 appareil',premium_feat2:'Facilite les tirs à la tête',premium_feat3:'Mises à jour en temps réel',premium_feat4:'Support prioritaire 24/7',per_day:'/jour',buy_now:'Acheter',popular:'POPULAIRE',features_title:'Pourquoi X!T?',feat1_title:'Réponse instantanée',feat1_desc:'Latence ultra faible.',feat2_title:'Anti-Bannissement',feat2_desc:'Sécurité multicouche.',feat3_title:'Haute précision',feat3_desc:'Calibration précise.',testi_title:"Ce qu'ils disent",faq_title:'Questions fréquentes',faq_q1:'Comment activer?',faq_a1:'Après paiement, vous recevrez un code via WhatsApp.',faq_q2:'Fonctionne pour tous les jeux?',faq_a2:"Non, c'est spécifique à Free Fire.",payment_title:'QRIS Allpay',product_label:'Produit',total_label:'Total',wa_confirm:'Envoyer preuve WhatsApp',manual_verify:'Vérification manuelle.',download_title:'Telecharger Free Fire',download_desc:'Obtenez le dernier apk FF directement sur ce site.',download_button:'Télécharger',discord_title:'Rejoindre Discord',discord_desc:'Mises à jour, assistance et communauté exclusive.',discord_button:'Rejoindre Discord',visitor_label:'Spectateurs',visitor_live:'EN DIRECT'},
  vi:{dl_modal_title:'Chọn phiên bản',dl_modal_desc:'Chọn phiên bản Free Fire phù hợp:',dl_ff:'Free Fire',dl_ffmax:'Free Fire MAX',dl_v7a:'ARM v7a (32-bit)',dl_v8a:'ARM v8a (64-bit)',dl_hint:'Không biết kiến trúc? Thử v7a trước.',nav_home:'Trang chủ',nav_products:'Sản phẩm',nav_features:'Tính năng',nav_testi:'Đánh giá',nav_downloads:'Tải xuống',nav_discord:'Discord',hero_line1:'Tăng cường',hero_line2:'Độ nhắm của bạn',hero_line3:'Không giới hạn',hero_desc:'Kim phun thế hệ mới với độ chính xác 0,01ms.',get_started:'Bắt đầu',learn_more:'Tìm hiểu',product_heading:'Các kế hoạch X!T',product_sub:'Chọn gói phù hợp.',basic_name:'ESP',basic_feat1:'1 thiết bị',basic_feat2:'Nhìn xuyên tường',basic_feat3:'Cập nhật sau mỗi OBB',basic_feat4:'Hỗ trợ 12h',premium_name:'AIMBOT EXTERNAL',premium_feat1:'1 thiết bị',premium_feat2:'Dễ headshot hơn',premium_feat3:'Cập nhật thời gian thực',premium_feat4:'Hỗ trợ ưu tiên 24/7',per_day:'/ngày',buy_now:'Mua ngay',popular:'PHỔ BIẾN',features_title:'Tại sao chọn X!T?',feat1_title:'Phản hồi tức thì',feat1_desc:'Độ trễ cực thấp.',feat2_title:'Chống cấm',feat2_desc:'Bảo mật đa lớp.',feat3_title:'Độ chính xác cao',feat3_desc:'Hiệu chuẩn chính xác.',testi_title:'Khách hàng nói gì',faq_title:'Câu hỏi thường gặp',faq_q1:'Cách kích hoạt?',faq_a1:'Sau khi thanh toán, bạn sẽ nhận mã qua WhatsApp.',faq_q2:'Có hoạt động với mọi game?',faq_a2:'Không, dành riêng cho Free Fire.',payment_title:'QRIS Allpay',product_label:'Sản phẩm',total_label:'Tổng',wa_confirm:'Gửi bằng chứng WhatsApp',manual_verify:'Xác minh thủ công.',download_title:'Tải Free Fire',download_desc:'Nhận bản apk FF mới nhất.',download_button:'Tải ngay',discord_title:'Tham gia Discord',discord_desc:'Cập nhật, hỗ trợ và cộng đồng độc quyền.',discord_button:'Tham gia Discord',visitor_label:'Người xem',visitor_live:'TRỰC TIẾP'},
  es:{dl_modal_title:'Elegir versión',dl_modal_desc:'Elige la versión de Free Fire adecuada:',dl_ff:'Free Fire',dl_ffmax:'Free Fire MAX',dl_v7a:'ARM v7a (32-bit)',dl_v8a:'ARM v8a (64-bit)',dl_hint:'¿No sabes la arquitectura? Prueba v7a primero.',nav_home:'Inicio',nav_products:'Productos',nav_features:'Características',nav_testi:'Testimonios',nav_downloads:'Descargas',nav_discord:'Discord',hero_line1:'Mejora',hero_line2:'Tu puntería',hero_line3:'Sin Límites',hero_desc:'Inyector de nueva generación con precisión de 0.01ms.',get_started:'Empezar',learn_more:'Aprender más',product_heading:'Planes X!T',product_sub:'Elige tu plan.',basic_name:'ESP',basic_feat1:'1 dispositivo',basic_feat2:'Ver enemigos a través de paredes',basic_feat3:'Actualizado con cada OBB',basic_feat4:'Soporte 12h',premium_name:'AIMBOT EXTERNAL',premium_feat1:'1 dispositivo',premium_feat2:'Facilita los headshots',premium_feat3:'Actualizaciones en tiempo real',premium_feat4:'Soporte prioritario 24/7',per_day:'/día',buy_now:'Comprar',popular:'POPULAR',features_title:'Por qué X!T?',feat1_title:'Respuesta instantánea',feat1_desc:'Latencia ultra baja.',feat2_title:'Anti-Baneo',feat2_desc:'Seguridad multicapa.',feat3_title:'Alta precisión',feat3_desc:'Calibración precisa.',testi_title:'Lo que dicen',faq_title:'Preguntas frecuentes',faq_q1:'Cómo activar?',faq_a1:'Después del pago, recibirás un código por WhatsApp.',faq_q2:'Funciona en todos los juegos?',faq_a2:'No, esto es específicamente para Free Fire.',payment_title:'QRIS Allpay',product_label:'Producto',total_label:'Total',wa_confirm:'Enviar comprobante WhatsApp',manual_verify:'Verificación manual.',download_title:'Descargar Free Fire',download_desc:'Obtén el último apk de FF.',download_button:'Descargar Ahora',discord_title:'Únete a Discord',discord_desc:'Actualizaciones, soporte y comunidad exclusiva.',discord_button:'Únete a Discord',visitor_label:'Espectadores',visitor_live:'EN VIVO'}
};
let currentLang='id';
function applyLanguage(lang){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(T[lang]&&T[lang][k])el.textContent=T[lang][k];
  });
  document.querySelectorAll('.glitch[data-i18n]').forEach(el=>el.setAttribute('data-text',el.textContent));
  const names={id:'Indonesia',en:'English',fr:'Français',vi:'Tiếng Việt',es:'Español'};
  document.getElementById('currentLang').textContent=names[lang];
  document.querySelectorAll('.lang-option').forEach(o=>o.classList.toggle('active',o.dataset.lang===lang));
  currentLang=lang;localStorage.setItem('pref-lang',lang);
  renderDynamicContent();
}

/* ==============================================================
   DYNAMIC CONTENT RENDER
   ============================================================== */
let swiperInstance = null;

const productsData = [
  { id:'esp', icon:'fa-gauge-low', nameKey:'basic_name', price:2500, popular:true, featuresKeys:['basic_feat1','basic_feat2','basic_feat3','basic_feat4'], dataProduct:'ESP' },
  { id:'aimbot', icon:'fa-crown', nameKey:'premium_name', price:10000, popular:false, featuresKeys:['premium_feat1','premium_feat2','premium_feat3','premium_feat4'], dataProduct:'AIMBOT EXTERNAL' }
];
const testimonialsData = [
  { text:'"X!T gila! Aim jadi jauh lebih presisi."<br>— Rizky, Pro Player' },
  { text:'"Murah tapi kualitas premium. Recommended!"<br>— Sinta, Streamer' },
  { text:'"Support cepat, injector paling stabil."<br>— Bayu, Gamer' }
];
const faqData = [
  { qKey:'faq_q1', aKey:'faq_a1' },
  { qKey:'faq_q2', aKey:'faq_a2' }
];

function renderProductCards(){
  const grid=document.getElementById('dynamic-product-grid');
  if(!grid)return;
  grid.innerHTML='';
  const lang=currentLang;
  productsData.forEach(prod=>{
    const card=document.createElement('div');
    card.className='product-card';
    card.setAttribute('data-aos','zoom-in-up');
    if(prod.popular){
      const badge=document.createElement('span');
      badge.className='product-badge';
      badge.setAttribute('data-i18n','popular');
      badge.textContent=T[lang]?.popular||'POPULER';
      card.appendChild(badge);
    }
    const iconDiv=document.createElement('div');
    iconDiv.className='product-icon';
    iconDiv.innerHTML=`<i class="fas ${prod.icon}"></i>`;
    card.appendChild(iconDiv);
    const nameDiv=document.createElement('div');
    nameDiv.className='product-name';
    nameDiv.setAttribute('data-i18n',prod.nameKey);
    nameDiv.textContent=T[lang]?.[prod.nameKey]||prod.dataProduct;
    card.appendChild(nameDiv);
    const priceDiv=document.createElement('div');
    priceDiv.className='product-price';
    priceDiv.innerHTML=`Rp${prod.price.toLocaleString('id')} <small>${T[lang]?.per_day||'/hari'}</small>`;
    card.appendChild(priceDiv);
    const ul=document.createElement('ul');
    ul.className='product-features';
    prod.featuresKeys.forEach(key=>{
      const li=document.createElement('li');
      li.innerHTML=`<i class="fas fa-check-circle"></i><span data-i18n="${key}">${T[lang]?.[key]||''}</span>`;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    const wrap=document.createElement('div');
    wrap.className='magnetic-wrap';
    wrap.style.width='100%';
    const btn=document.createElement('button');
    btn.className='btn btn-primary buy-now mag-btn';
    btn.style.width='100%';
    btn.setAttribute('data-product',prod.dataProduct);
    btn.setAttribute('data-price',prod.price);
    btn.innerHTML=`<i class="fas fa-bolt"></i> <span data-i18n="buy_now">${T[lang]?.buy_now||'Beli Sekarang'}</span>`;
    wrap.appendChild(btn);
    card.appendChild(wrap);
    grid.appendChild(card);
  });
  attachBuyListeners();
  if(!isLowEnd)initTilt();
  initMagneticBtns();
  AOS.refresh();
}

function renderTestimonials(){
  const wrapper=document.getElementById('dynamic-swiper-wrapper');
  if(!wrapper)return;
  wrapper.innerHTML='';
  testimonialsData.forEach(t=>{
    const slide=document.createElement('div');
    slide.className='swiper-slide';
    const card=document.createElement('div');
    card.className='testimonial-card';
    card.innerHTML=t.text;
    slide.appendChild(card);
    wrapper.appendChild(slide);
  });
  if(swiperInstance)swiperInstance.destroy(true,true);
  swiperInstance=new Swiper('.swiper',{
    loop:true,autoplay:{delay:3000,disableOnInteraction:false},
    pagination:{el:'.swiper-pagination',clickable:true}
  });
}

function renderFaq(){
  const accordion=document.getElementById('dynamic-accordion');
  if(!accordion)return;
  accordion.innerHTML='';
  const lang=currentLang;
  faqData.forEach(item=>{
    const itemDiv=document.createElement('div');
    itemDiv.className='accordion-item';
    const header=document.createElement('div');
    header.className='accordion-header';
    header.innerHTML=`<span data-i18n="${item.qKey}">${T[lang]?.[item.qKey]||''}</span><i class="fas fa-plus"></i>`;
    const content=document.createElement('div');
    content.className='accordion-content';
    content.setAttribute('data-i18n',item.aKey);
    content.textContent=T[lang]?.[item.aKey]||'';
    itemDiv.appendChild(header);
    itemDiv.appendChild(content);
    accordion.appendChild(itemDiv);
    header.addEventListener('click',()=>{
      const isShow=content.classList.contains('show');
      document.querySelectorAll('.accordion-content').forEach(c=>{c.classList.remove('show');c.style.maxHeight=null;});
      document.querySelectorAll('.accordion-header i').forEach(i=>i.className='fas fa-plus');
      if(!isShow){
        content.classList.add('show');
        content.style.maxHeight=content.scrollHeight+'px';
        header.querySelector('i').className='fas fa-minus';
      }
    });
  });
}

function renderDynamicContent(){
  renderProductCards();
  renderTestimonials();
  renderFaq();
  attachCursorHovers();
  if(typeof initScrollAnim==='function') initScrollAnim();
}

function attachBuyListeners(){
  document.querySelectorAll('.buy-now').forEach(btn=>{
    if(btn._buyBound)return; btn._buyBound=true;
    btn.addEventListener('click',()=>{
      const p=btn.dataset.product,price=parseInt(btn.dataset.price);
      document.getElementById('modalProductName').textContent=p;
      document.getElementById('modalPrice').textContent='Rp'+price.toLocaleString('id');
      document.getElementById('whatsappLink').href='https://wa.me/6289677648795?text=Halo%20saya%20mau%20konfirmasi%20pembelian%20'+encodeURIComponent(p)+'%20sebesar%20Rp'+price;
      document.getElementById('paymentModal').classList.add('show');
    });
  });
}

function initTilt(){
  document.querySelectorAll('.product-card').forEach(card=>{
    // Desktop - mouse
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect(),cx=r.width/2,cy=r.height/2;
      card.style.transform=`perspective(1000px) rotateX(${(e.clientY-r.top-cy)/cy*-8}deg) rotateY(${(e.clientX-r.left-cx)/cx*8}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='perspective(1000px) rotateX(0) rotateY(0) translateY(0)');
    // Mobile - touch
    card.addEventListener('touchmove',e=>{
      e.preventDefault();
      const t=e.touches[0],r=card.getBoundingClientRect(),cx=r.width/2,cy=r.height/2;
      card.style.transform=`perspective(1000px) rotateX(${(t.clientY-r.top-cy)/cy*-6}deg) rotateY(${(t.clientX-r.left-cx)/cx*6}deg) translateY(-6px)`;
    },{passive:false});
    card.addEventListener('touchend',()=>{
      card.style.transition='transform .5s cubic-bezier(.23,1,.32,1)';
      card.style.transform='perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      setTimeout(()=>card.style.transition='',500);
    });
  });
}
function initMagneticBtns(){
  document.querySelectorAll('.mag-btn').forEach(btn=>{
    const wrap=btn.closest('.magnetic-wrap');
    if(!wrap||wrap._magBound)return; wrap._magBound=true;
    wrap.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))*.3, dy=(e.clientY-(r.top+r.height/2))*.3;
      btn.style.transform=`translate(${dx}px,${dy}px) scale(1.06)`;
      btn.style.transition='transform .1s ease';
    });
    wrap.addEventListener('mouseleave',()=>{
      btn.style.transform='translate(0,0) scale(1)';
      btn.style.transition='transform .5s cubic-bezier(.23,1,.32,1)';
    });
  });
}

/* ==============================================================
   COUNTER ANIMATION
   ============================================================== */
(function(){
  function animCounter(el,finalText,dur){
    const hasDot=finalText.includes('.'),suffix=finalText.replace(/[\d.]/g,''),num=parseFloat(finalText),start=performance.now();
    function step(now){const p=Math.min((now-start)/dur,1),ease=1-Math.pow(1-p,4);el.textContent=(hasDot?(num*ease).toFixed(2):Math.round(num*ease))+suffix;if(p<1)requestAnimationFrame(step);else el.textContent=finalText;}
    requestAnimationFrame(step);
  }
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){const el=e.target,f=el.getAttribute('data-final');if(f){animCounter(el,f,1800);obs.unobserve(el);}}});
  },{threshold:.5});
  ['cnt1','cnt2','cnt3'].forEach(id=>{const el=document.getElementById(id);if(el){el.setAttribute('data-final',el.textContent.trim());obs.observe(el);}});
})();

/* ==============================================================
   INTERSECTION OBSERVER - NAV
   ============================================================== */
(function(){
  const sections=document.querySelectorAll('section[id]');
  const navLinks=document.querySelectorAll('.nav-menu a');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id=e.target.getAttribute('id');
        navLinks.forEach(l=>{l.classList.remove('active');if(l.getAttribute('href')==='#'+id)l.classList.add('active');});
        history.replaceState(null,null,'#'+id);
      }
    });
  },{root:null,rootMargin:'-20% 0px -60% 0px',threshold:.1});
  sections.forEach(s=>obs.observe(s));
})();

/* ==============================================================
   SMOOTH SCROLL + DYNAMIC LIGHTNING
   ============================================================== */
(function(){
  const DURATION=800, EASING=t=>1-Math.pow(1-t,3);
  const dynCanvas=document.createElement('canvas');
  dynCanvas.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;opacity:0;transition:opacity .2s;';
  document.body.appendChild(dynCanvas);
  const ctx=dynCanvas.getContext('2d');
  let scrollAnim=null,lightAnim=null,isScrolling=false,scrollDir=0,cW,cH;
  function resize(){cW=window.innerWidth;cH=window.innerHeight;dynCanvas.width=cW;dynCanvas.height=cH;}
  window.addEventListener('resize',resize,{passive:true});resize();
  const BOLT_N=isLowEnd?5:10;let bolts=[];
  function genPts(sx,sy,len,dir,tOff){const pts=[{x:sx,y:sy}],segs=8+Math.floor(Math.random()*6),stepY=(len/segs)*dir;let cx=sx,cy=sy;const noise=i=>Math.sin(tOff*.02+i*1.5)*8+(Math.random()*12-6);for(let i=0;i<segs;i++){cx+=noise(i)*2.5;cy+=stepY;pts.push({x:cx,y:cy});}return pts;}
  function drawDynBolt(ctx,bolt,t){
    const rgb=getThemeRGB(),mp=bolt.points;if(mp.length<2)return;
    ctx.beginPath();ctx.moveTo(mp[0].x,mp[0].y);for(let i=1;i<mp.length;i++)ctx.lineTo(mp[i].x,mp[i].y);
    ctx.strokeStyle=`rgba(${rgb},.25)`;ctx.lineWidth=bolt.width*3.5;ctx.shadowColor=`rgba(${rgb},.9)`;ctx.shadowBlur=30;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    ctx.beginPath();ctx.moveTo(mp[0].x,mp[0].y);for(let i=1;i<mp.length;i++)ctx.lineTo(mp[i].x,mp[i].y);
    const g=ctx.createLinearGradient(mp[0].x,mp[0].y,mp[mp.length-1].x,mp[mp.length-1].y);
    g.addColorStop(0,`rgba(255,255,255,${bolt.alpha})`);g.addColorStop(.3,`rgba(${rgb},${bolt.alpha})`);g.addColorStop(1,`rgba(${rgb},${bolt.alpha*.6})`);
    ctx.strokeStyle=g;ctx.lineWidth=bolt.width*1.8;ctx.shadowBlur=25;ctx.stroke();
    ctx.beginPath();ctx.moveTo(mp[0].x,mp[0].y);for(let i=1;i<mp.length;i++)ctx.lineTo(mp[i].x,mp[i].y);
    ctx.strokeStyle=`rgba(255,255,255,${bolt.alpha*1.1})`;ctx.lineWidth=bolt.width*.7;ctx.shadowBlur=15;ctx.shadowColor='white';ctx.stroke();
    ctx.shadowBlur=0;
  }
  function initBolts(dir,t){bolts=[];for(let i=0;i<BOLT_N;i++){const x=Math.random()*cW,y=Math.random()*cH,len=130+Math.random()*220,w=2.5+Math.random()*4,a=.5+Math.random()*.4,spd=14+Math.random()*22;bolts.push({baseX:x,baseY:y,len,width:w,alpha:a,speed:spd,dir,points:[],forks:[]});} updateBoltsGeo(t);}
  function updateBoltsGeo(t){bolts.forEach(b=>{b.points=genPts(b.baseX,b.baseY,b.len,b.dir,t);});}
  function moveBolts(){bolts.forEach(b=>{b.baseY+=b.speed*scrollDir;if(scrollDir>0){if(b.baseY-b.len>cH){b.baseY=-b.len-Math.random()*120;b.baseX=Math.random()*cW;}}else{if(b.baseY+b.len<0){b.baseY=cH+b.len+Math.random()*120;b.baseX=Math.random()*cW;}}});}
  function animLight(t){if(!isScrolling)return;ctx.clearRect(0,0,cW,cH);moveBolts();updateBoltsGeo(t);bolts.forEach(b=>drawDynBolt(ctx,b,t));lightAnim=requestAnimationFrame(animLight);}
  function startLight(dir){scrollDir=dir;initBolts(dir,performance.now());dynCanvas.style.opacity='1';if(lightAnim)cancelAnimationFrame(lightAnim);lightAnim=requestAnimationFrame(animLight);}
  function stopLight(){if(lightAnim){cancelAnimationFrame(lightAnim);lightAnim=null;}dynCanvas.style.opacity='0';setTimeout(()=>{if(!isScrolling)ctx.clearRect(0,0,cW,cH);},200);}
  function stopAll(){if(scrollAnim){cancelAnimationFrame(scrollAnim.id);scrollAnim=null;}isScrolling=false;stopLight();document.body.style.pointerEvents='';}
  function smoothScrollTo(tY){
    const sY=window.scrollY,dist=tY-sY;if(Math.abs(dist)<5)return;
    stopAll();const t0=performance.now();isScrolling=true;document.body.style.pointerEvents='none';
    startLight(dist>0?1:-1);
    function step(now){const p=Math.min((now-t0)/DURATION,1),ease=EASING(p);window.scrollTo(0,sY+dist*ease);if(p<1)scrollAnim={id:requestAnimationFrame(step)};else{stopAll();window.scrollTo(0,tY);}}
    scrollAnim={id:requestAnimationFrame(step)};
  }
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link=>{
    link.addEventListener('click',function(e){
      const tEl=document.querySelector(this.getAttribute('href'));
      if(tEl){
        e.preventDefault();
        document.getElementById('langDropdown')?.classList.remove('show');
        document.querySelectorAll('.nav-menu a').forEach(l=>l.classList.remove('active'));
        this.classList.add('active');
        const ho=document.querySelector('.header')?.offsetHeight||70;
        smoothScrollTo(tEl.getBoundingClientRect().top+window.scrollY-ho);
        history.pushState(null,null,this.getAttribute('href'));
      }
    });
  });
  if(window.location.hash){setTimeout(()=>{const tEl=document.querySelector(window.location.hash);if(tEl){const ho=document.querySelector('.header')?.offsetHeight||70;smoothScrollTo(tEl.getBoundingClientRect().top+window.scrollY-ho);}},250);}
  window.addEventListener('wheel',()=>{if(isScrolling)stopAll();},{passive:true});
})();

/* ==============================================================
   INIT
   ============================================================== */
window.addEventListener('DOMContentLoaded',()=>{
  renderDynamicContent();
  const lt=document.getElementById('langToggle'),ld=document.getElementById('langDropdown');
  lt.addEventListener('click',e=>{e.stopPropagation();ld.classList.toggle('show');});
  document.addEventListener('click',()=>ld.classList.remove('show'));
  document.querySelectorAll('.lang-option').forEach(o=>o.addEventListener('click',()=>{applyLanguage(o.dataset.lang);ld.classList.remove('show');}));
  document.querySelectorAll('.theme-dot').forEach(d=>d.addEventListener('click',()=>setTheme(d.dataset.theme)));
  applyLanguage(localStorage.getItem('pref-lang')||'id');
  
  const dlModal=document.getElementById('downloadModal');
  document.getElementById('openDownloadModal').addEventListener('click',()=>dlModal.classList.add('show'));
  document.querySelector('.close-download-modal').addEventListener('click',()=>dlModal.classList.remove('show'));
  dlModal.addEventListener('click',e=>{if(e.target===dlModal)dlModal.classList.remove('show');});
  
  const payModal=document.getElementById('paymentModal');
  document.querySelector('.close-modal').addEventListener('click',()=>payModal.classList.remove('show'));
  payModal.addEventListener('click',e=>{if(e.target===payModal)payModal.classList.remove('show');});
  
  document.querySelectorAll('.download-option-btn').forEach(a=>{
    a.addEventListener('click',function(e){
      e.preventDefault();
      const base=this.getAttribute('href').split('?')[0];
      const url=base+'?t='+Date.now();
      const tmp=document.createElement('a');
      tmp.href=url; tmp.download=''; tmp.style.display='none';
      document.body.appendChild(tmp); tmp.click();
      setTimeout(()=>document.body.removeChild(tmp),300);
    });
  });
  
  // Touch hologram effect for mobile
  document.querySelectorAll('.product-card').forEach(card=>{
    card.addEventListener('touchstart',()=>card.classList.add('touch-active'),{passive:true});
    card.addEventListener('touchend',()=>setTimeout(()=>card.classList.remove('touch-active'),600),{passive:true});
  });

  AOS.init({duration:800, once:true, offset:80});

  // Bidirectional scroll animation - works both scroll down & up
  function initScrollAnim(){
    const els = document.querySelectorAll('[data-aos]');
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('aos-animate');
        } else {
          e.target.classList.remove('aos-animate');
        }
      });
    },{threshold:0.1, rootMargin:'0px 0px -40px 0px'});
    els.forEach(el=>{
      if(!el._scrollAnimBound){ el._scrollAnimBound=true; obs.observe(el); }
    });
  }
  initScrollAnim();
  initTilt();
  initMagneticBtns();
  attachCursorHovers();
});

})();
