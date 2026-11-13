/* Warehouse Command Center v2. Read-only presentation enhancements.
   Existing dashboard.js, WebSocket protocol and mission handlers stay intact. */
(function () {
  'use strict';
  function init() {
    if (document.body.classList.contains('wcc-v2')) return;
    const required = ['map-canvas','btn-add-wp','mission-progress','mission-state','tel-health'];
    if (required.some(id => !document.getElementById(id))) {
      console.warn('Warehouse v2: required dashboard elements missing; keeping original UI');
      return;
    }
    document.body.classList.add('wcc-v2');
    document.title = 'WAREHOUSE COMMAND CENTER | SURVEILLANCE UGV';
    const title = document.querySelector('.top-title');
    if (title) title.firstChild.textContent = 'WAREHOUSE COMMAND CENTER | ';
    const sidebar=document.createElement('aside'); sidebar.className='wcc-sidebar';
    sidebar.innerHTML='<div class="wcc-brand" aria-hidden="true">⌂</div><nav class="wcc-nav" aria-label="Command center sections"></nav><div class="wcc-sidebar-note">UGV<br>CONTROL<br>v2</div>';
    document.querySelector('.top-bar').insertAdjacentElement('afterend',sidebar);
    const nav=sidebar.querySelector('.wcc-nav');
    function navButton(icon,label,fn){const b=document.createElement('button');b.type='button';b.innerHTML='<span class="wcc-icon"></span><span></span>';b.children[0].textContent=icon;b.children[1].textContent=label;b.addEventListener('click',()=>{nav.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');fn()});nav.appendChild(b);return b}
    const showTab=id=>{const b=document.querySelector('.tab-btn[data-target="'+id+'"]');if(b)b.click()};
    const mainBtn=navButton('▦','Mission',()=>{showTab('view-2d');document.querySelector('.view-panel')?.scrollIntoView({block:'nearest'})});mainBtn.classList.add('active');
    navButton('◇','3D SLAM',()=>showTab('view-3d'));
    navButton('▥','Map',()=>showTab('view-2d'));
    navButton('▤','Telemetry',()=>document.querySelector('.side-panel')?.scrollIntoView({block:'nearest'}));
    navButton('⚑','Waypoints',()=>document.querySelector('.waypoints-section')?.scrollIntoView({block:'nearest'}));
    navButton('◉','Safety',()=>document.getElementById('btn-estop')?.focus());
    const side=document.querySelector('.side-panel');
    if(!side) return;
    const progress=document.createElement('section');progress.className='wcc-card';progress.setAttribute('aria-label','Live patrol progress');
    progress.innerHTML='<h3>◉ PATROL MISSION</h3><div class="wcc-progress-head"><span>Waypoints completed</span><strong id="wcc-progress-count">0 / 0</strong></div><div class="wcc-progress-track"><div id="wcc-progress-fill"></div></div><div id="wcc-progress-label">Awaiting mission</div>';
    const log=document.createElement('section');log.className='wcc-card';log.setAttribute('aria-label','Mission event history');
    log.innerHTML='<h3>▤ EVENT HISTORY <small style="float:right;color:#85b9ca;font-weight:400">This session</small></h3><div id="wcc-log" class="wcc-log"><div class="wcc-log-row">Awaiting live mission events</div></div>';
    const sections=side.querySelectorAll('.panel-section');
    if(sections.length>=1) sections[0].insertAdjacentElement('afterend',progress);else side.append(progress);
    if(sections.length>=2) sections[1].insertAdjacentElement('afterend',log);else side.append(log);
    const controls=document.querySelector('.map-controls');
    if(controls){
      const extra=document.createElement('div');extra.className='wcc-map-tools';
      const follow=document.createElement('button');follow.type='button';follow.textContent='◎ Follow Robot';follow.title='Center 2D map or 3D view on the robot once';
      follow.addEventListener('click',()=>{
        try {
          const is2d=document.getElementById('view-2d')?.classList.contains('active');
          if(is2d && typeof viewer2d!=='undefined' && viewer2d && viewer2d.robotPose){
            viewer2d.center={x:viewer2d.robotPose.x,y:viewer2d.robotPose.y};viewer2d.autoFit=false;viewer2d.requestRender();
          }else if(typeof viewer3d!=='undefined' && viewer3d && viewer3d.robotMarker){
            const p=viewer3d.robotMarker.position;viewer3d.controls.target.copy(p);viewer3d.camera.position.copy(p).add(new THREE.Vector3(4,-5,4));viewer3d.controls.update();
          }
        } catch(e){console.warn('Follow robot unavailable:',e)}
      });
      extra.appendChild(follow);controls.appendChild(extra);
    }
    const events=[];let previousKey=null;let previousMission=null;let previousNav=null;let previousCount=null;
    function addEvent(message){const key=message;if(key===previousKey)return;previousKey=key;const t=new Date().toLocaleTimeString();events.unshift({t,message});if(events.length>28)events.pop();const parent=document.getElementById('wcc-log');parent.replaceChildren();for(const item of events){const row=document.createElement('div');row.className='wcc-log-row';const time=document.createElement('time');time.textContent=item.t;const text=document.createElement('span');text.textContent=item.message;row.append(time,text);parent.appendChild(row)}}
    // Monitor DOM fields updated by the original app. No WebSocket wrapping,
    // command sending, changes to callbacks, or invented sensor data.
    function refresh(){
      try {
        const source=(typeof waypoints!=='undefined' && Array.isArray(waypoints))?waypoints:[];
        const count=source.length, complete=source.filter(w=>w.status==='COMPLETED').length;
        document.getElementById('wcc-progress-count').textContent=`${complete} / ${count}`;
        document.getElementById('wcc-progress-fill').style.width=(count?100*complete/count:0)+'%';
        const m=document.getElementById('mission-state')?.textContent?.trim()||'IDLE';
        document.getElementById('wcc-progress-label').textContent=count?`${m} · ${complete} of ${count} waypoints verified`:'No mission loaded';
        if(previousCount!==null && complete>previousCount)addEvent(`Waypoint completion confirmed: ${complete} of ${count}`);
        previousCount=complete;
        if(previousMission!==null && m!==previousMission)addEvent('Mission status: '+m);
        previousMission=m;
        const nav=document.getElementById('navigation-status')?.textContent?.trim()||'';
        if(previousNav!==null && nav!==previousNav && /NAVIGATION:\s*(FAILED|COMPLETED|CANCELLED)/.test(nav))addEvent(nav);
        previousNav=nav;
      }catch(err){console.warn('Warehouse v2 read-only monitor error:',err)}
    }
    refresh();window.setInterval(refresh,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
