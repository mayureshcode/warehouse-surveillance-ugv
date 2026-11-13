/* Warehouse Command Center V3 — frontend presentation only.
   Keeps the existing app DOM IDs, ROS/WebSocket handlers and safety controls intact. */
(() => {
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const el = (tag, cls, html) => { const n=document.createElement(tag); if(cls)n.className=cls; if(html!==undefined)n.innerHTML=html; return n; };
  const svg = (name) => {
    const paths={
      grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
      layers:'<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
      video:'<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-3v10l-4-3"/>',
      activity:'<path d="M2 12h4l3-8 5 16 3-8h5"/>',
      shield:'<path d="m12 22 7-4V6l-7-3-7 3v12l7 4Z"/><path d="m9 12 2 2 4-4"/>',
      list:'<path d="M9 6h12M9 12h12M9 18h12"/><path d="M3 6h2M3 12h2M3 18h2"/>',
      maximize:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5m13-5v5h-5"/>',
      target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
      flag:'<path d="M5 22V3m0 1q5-3 9 0t7 0v11q-4 3-7 0t-9 0"/>',
      close:'<path d="M6 6l12 12M18 6 6 18"/>',
      menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
      arrow:'<path d="m5 12 14 0m-6-6 6 6-6 6"/>',
      pause:'<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>',
      stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
      lock:'<path d="M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4"/>',
    };
    return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.grid}</svg>`;
  };
  function init(){
    const required=['.top-bar','.main-layout','.view-panel','.side-panel','.bottom-panel','.mission-global-actions','.exec-actions','#map-canvas','#camera-stream','#btn-estop','#btn-add-wp','#btn-start-mission','#mission-state','#wp-list'];
    if(required.some(k=>!$(k))){ console.error('WCC V3: expected dashboard DOM missing; not applying layout'); return; }
    if(document.body.classList.contains('wcc-v3'))return;
    const body=document.body; body.classList.add('wcc-v3');
    document.title='Warehouse Command Center • UGV Mission Control';
    const top=$('.top-bar'), main=$('.main-layout'), side=$('.side-panel'), map=$('.view-panel'), drawer=$('.bottom-panel');
    const title=$('.top-title');
    if(title){title.insertAdjacentHTML('afterbegin',`<span class="v3-title-mark">${svg('layers')}</span>`);title.insertAdjacentHTML('beforeend','<small>AUTONOMOUS SURVEILLANCE · ROS 2 / GAZEBO</small>');}
    const clock=el('span','v3-clock');clock.title='Local time on this computer';clock.textContent='--:--:--';top.append(clock);
    const updateClock=()=>clock.textContent=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());updateClock();setInterval(updateClock,1000);
    // Sidebar navigation uses the original tab buttons and existing controls.
    const rail=el('aside','v3-rail');rail.innerHTML=`<div class="v3-rail-logo">${svg('layers')}<span>WCC</span></div><nav class="v3-rail-nav" aria-label="Command center navigation"></nav><div class="v3-rail-foot">UGV-01<br><span>V3.0</span></div>`;top.insertAdjacentElement('afterend',rail);
    const railNav=$('.v3-rail-nav',rail);
    function activateRail(button){railNav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));button.classList.add('active');}
    function railButton(icon,title,handler){const b=el('button','v3-rail-btn',`${svg(icon)}<span>${title}</span>`);b.type='button';b.title=title;b.addEventListener('click',()=>{activateRail(b);handler();});railNav.append(b);return b;}
    const tab=type=>{const b=$(`.tab-btn[data-target="view-${type}"]`);if(b)b.click();};
    const mainRail=railButton('grid','Mission',()=>{tab('2d');closeDrawer();});mainRail.classList.add('active');
    railButton('map','2D Map',()=>{tab('2d');closeDrawer();});
    railButton('layers','3D SLAM',()=>{tab('3d');closeDrawer();});
    railButton('video','Camera',()=>{$('.v3-camera')?.scrollIntoView({behavior:'smooth',block:'nearest'});});
    railButton('list','Waypoints',()=>openDrawer());
    railButton('shield','Safety',()=>{$('.v3-safety')?.scrollIntoView({behavior:'smooth',block:'nearest'});});
    // Original map visualizations and callbacks are unchanged.
    const mapHeader=$('.view-tabs',map);
    const mapHeading=el('div','v3-map-heading','<span>OPERATIONS MAP</span><small>LIVE LOCALIZATION &amp; PATH PLANNING</small>');mapHeader.prepend(mapHeading);
    const mapActions=el('div','v3-map-actions');mapHeader.append(mapActions);
    const wpActions=$('.mission-global-actions',drawer);mapActions.append(wpActions);
    const fit=$('#btn-fit-map');if(fit)fit.textContent='FIT MAP';
    const tools=el('div','v3-map-toolbar');
    const follow=el('button','v3-tool',svg('target')+'<span>FOLLOW</span>');follow.type='button';follow.title='Follow rover position in the selected map';
    let followEnabled=false;
    follow.addEventListener('click',()=>{followEnabled=!followEnabled;follow.classList.toggle('active',followEnabled);follow.setAttribute('aria-pressed',String(followEnabled));});
    tools.append(follow);
    const full=el('button','v3-tool',svg('maximize')+'<span>EXPAND</span>');full.type='button';full.title='Expand map (press Escape to exit)';full.addEventListener('click',()=>{const active=body.classList.toggle('v3-map-expanded');full.classList.toggle('active',active);full.setAttribute('aria-pressed',String(active));try{window.dispatchEvent(new Event('resize'));const selected=$('.view-container.active');if(selected?.id==='view-3d' && typeof viewer3d!=='undefined' && viewer3d)viewer3d.onWindowResize();else if(typeof viewer2d!=='undefined'&&viewer2d)viewer2d.onWindowResize();}catch(e){console.warn('Map resize:',e)}});tools.append(full);
    map.append(tools);
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && body.classList.contains('v3-map-expanded'))full.click();});
    const unfollow=()=>{if(followEnabled){followEnabled=false;follow.classList.remove('active');follow.setAttribute('aria-pressed','false');}};
    $('#map-canvas')?.addEventListener('pointerdown',unfollow);$('#map-canvas')?.addEventListener('wheel',unfollow,{passive:true});
    // In the side rail, preserve original camera, telemetry and joystick DOM nodes.
    const camera=$('.panel-section',side);camera.classList.add('v3-camera');
    const origTitle=$('.section-title',camera);if(origTitle)origTitle.textContent='ROVER CAMERA';
    const cameraStatus=el('span','v3-live-badge','● WAITING');camera.prepend(cameraStatus);
    const telemetry=[...side.querySelectorAll('.panel-section')][1];telemetry.classList.add('v3-telemetry');
    const telemetryTitle=$('.section-title',telemetry);if(telemetryTitle)telemetryTitle.textContent='ROBOT TELEMETRY';
    // Keep all original manual-control buttons and joystick in the document.
    const joystick=$('.joystick-wrapper',telemetry);
    if(joystick){const details=el('details','v3-manual-details');details.innerHTML='<summary>MANUAL JOYSTICK <span>OPEN CONTROL</span></summary>';joystick.parentNode.insertBefore(details,joystick);details.append(joystick);}
    const progress=el('section','v3-mission-card');progress.innerHTML=`<div class="v3-section-header"><span>${svg('flag')} PATROL MISSION</span><strong id="v3-mission-count">0 / 0</strong></div><div class="v3-progress-track"><div id="v3-progress-fill"></div></div><div class="v3-mission-sub"><span id="v3-mission-label">Awaiting mission data</span><span id="v3-mission-percent">0%</span></div><div id="v3-timeline" class="v3-timeline" aria-label="Waypoint progress"></div>`;
    camera.insertAdjacentElement('afterend',progress);
    const health=el('section','v3-safety');health.innerHTML=`<div class="v3-section-header"><span>${svg('shield')} SYSTEM HEALTH</span><span class="v3-status-dot" id="v3-health-state">WAITING</span></div><div class="v3-health-details"><div><span>Nav2</span><strong id="v3-nav-text">CHECKING</strong></div><div><span>Localization</span><strong id="v3-loc-text">WAITING</strong></div><div><span>Drive supervisor</span><strong id="v3-drive-text">WAITING</strong></div></div>`;telemetry.insertAdjacentElement('afterend',health);
    const events=el('section','v3-events');events.innerHTML=`<div class="v3-section-header"><span>${svg('activity')} EVENT HISTORY</span><small>THIS SESSION</small></div><div class="v3-events-content" id="v3-events-content"><p class="v3-empty">Monitoring live mission state</p></div>`;health.insertAdjacentElement('afterend',events);
    // Move original live mission status, commands and waypoint table; never clone IDs.
    const dock=el('footer','v3-command-dock');dock.innerHTML=`<div class="v3-dock-brand">${svg('target')}<div><strong>MISSION CONTROL</strong><small>Commands routed through existing dashboard</small></div></div>`;
    const missionControls=$('.exec-actions',drawer);dock.append(missionControls);
    const drawerTrigger=el('button','v3-drawer-trigger',svg('list')+' WAYPOINT EDITOR');drawerTrigger.type='button';drawerTrigger.addEventListener('click',()=>body.classList.contains('v3-drawer-open')?closeDrawer():openDrawer());dock.append(drawerTrigger);
    const originalEstop=$('#btn-estop'),originalClear=$('#btn-clear-estop');
    const estopZone=el('div','v3-dock-estop');estopZone.append(originalEstop,originalClear);dock.append(estopZone);body.append(dock);
    const status=$('.exec-status',drawer);
    const feedback=el('div','v3-feedback');
    for(const id of ['navigation-status','command-status']) {const item=document.getElementById(id);if(item)feedback.append(item);}
    progress.append(feedback,status);
    const titlebar=$('.mission-header',drawer);const close=el('button','v3-close',svg('close')+' CLOSE');close.type='button';close.setAttribute('aria-label','Close waypoint editor');close.addEventListener('click',closeDrawer);titlebar.append(close);
    function openDrawer(){body.classList.add('v3-drawer-open');drawer.setAttribute('aria-hidden','false');close.focus();}
    function closeDrawer(){body.classList.remove('v3-drawer-open');drawer.setAttribute('aria-hidden','true');}
    drawer.setAttribute('aria-hidden','true');
    const table=$('.waypoints-section',drawer);if(table){const h=el('div','v3-drawer-help','Edit waypoint coordinates, reorder or delete waypoints here. Mission execution remains controlled by the main dock.');table.prepend(h);}
    // Make write/clear and geofence actions available in the waypoint editor; add waypoint is in map header.
    const overlays=el('div','v3-drawer-backdrop');overlays.addEventListener('click',closeDrawer);body.append(overlays);
    // Factual, read-only UX panels built from existing telemetry and DOM state.
    let priorMission='',priorNavigation='',priorCommand='',priorWaypointStatuses=new Map();const history=[];
    const entries=$('#v3-events-content');
    function record(message,type='info'){
      if(!message || history[0]?.text===message)return;
      history.unshift({text:message,type,time:new Date().toLocaleTimeString()});if(history.length>30)history.pop();
      entries.replaceChildren();for(const h of history){const row=el('div','v3-event '+h.type);const time=el('time','',h.time);const icon=el('span','v3-event-bullet',h.type==='good'?'✓':h.type==='alert'?'!':'•');const text=el('span','v3-event-text');text.textContent=h.text;row.append(time,icon,text);entries.append(row);}
    }
    function monitor(){try{
      const wp=(typeof waypoints!=='undefined' && Array.isArray(waypoints))?waypoints:[];
      const completed=wp.filter(w=>w.status==='COMPLETED').length, count=wp.length;
      $('#v3-mission-count').textContent=`${completed} / ${count}`;$('#v3-progress-fill').style.width=`${count?Math.round(completed/count*100):0}%`;$('#v3-mission-percent').textContent=`${count?Math.round(completed/count*100):0}%`;
      const state=($('#mission-state')?.textContent||'IDLE').trim();$('#v3-mission-label').textContent=`${state} · ${count} planned waypoint${count===1?'':'s'}`;
      const timeline=$('#v3-timeline');const signature=JSON.stringify(wp.map(w=>[w.id,w.status]));if(timeline.dataset.last!==signature){timeline.dataset.last=signature;timeline.replaceChildren();wp.slice(0,24).forEach(w=>{const chip=el('span','v3-wp '+(w.status||'PLANNED').toLowerCase());chip.title=`Waypoint ${w.id}: ${w.status}`;chip.textContent=`${w.status==='COMPLETED'?'✓ ':''}WP${w.id}`;timeline.append(chip);});if(count>24)timeline.append(el('span','v3-wp',`+${count-24} more`));}
      if(priorMission && state!==priorMission)record(`Mission state: ${state}`,state==='COMPLETED'?'good':state==='FAILED'?'alert':'info');priorMission=state;
      const nav=($('#navigation-status')?.textContent||'').trim();if(priorNavigation && nav!==priorNavigation && /NAVIGATION:\s*(FAILED|COMPLETED|CANCELLED|RUNNING)/.test(nav))record(nav.slice(0,180),/FAILED/.test(nav)?'alert':/COMPLETED/.test(nav)?'good':'info');priorNavigation=nav;
      const command=($('#command-status')?.textContent||'').trim();if(priorCommand && command && command!==priorCommand)record(command.slice(0,135),$('#command-status')?.classList.contains('error')?'alert':'info');priorCommand=command;
      for(const w of wp){const prev=priorWaypointStatuses.get(w.id);if(prev && prev!==w.status && ['COMPLETED','FAILED','MISSED'].includes(w.status))record(`Waypoint ${w.id} ${String(w.status).toLowerCase()}`,w.status==='COMPLETED'?'good':'alert');priorWaypointStatuses.set(w.id,w.status);}if(!wp.length)priorWaypointStatuses.clear();
      const ok=($('#tel-health')?.textContent||'').trim();$('#v3-drive-text').textContent=ok.length>38?ok.slice(0,35)+'…':ok||'WAITING';
      $('#v3-nav-text').textContent=($('#nav-status')?.textContent||'WAITING').replace('NAV2:','').trim();
      $('#v3-loc-text').textContent=($('#loc-status')?.textContent||'WAITING').replace('LOC:','').trim();
      const healthy=($('#conn-status')?.textContent||'')==='CONNECTED' && ($('#tel-health')?.textContent||'').includes('Sensors ready');const h=$('#v3-health-state');h.textContent=healthy?'READY':'CHECK';h.classList.toggle('good',healthy);
      const img=$('#camera-stream');cameraStatus.textContent=img?.complete && img?.naturalWidth>0?'● LIVE':'● WAITING';cameraStatus.classList.toggle('good',img?.complete && img?.naturalWidth>0);
      if(followEnabled){const is2d=$('#view-2d')?.classList.contains('active');if(is2d && typeof viewer2d!=='undefined' && viewer2d?.robotPose){viewer2d.center={x:viewer2d.robotPose.x,y:viewer2d.robotPose.y};viewer2d.autoFit=false;viewer2d.requestRender();}else if(!is2d && typeof viewer3d!=='undefined' && viewer3d?.robotMarker && viewer3d?.controls){const prev=viewer3d.controls.target.clone(),next=viewer3d.robotMarker.position;viewer3d.camera.position.add(next.clone().sub(prev));viewer3d.controls.target.copy(next);viewer3d.controls.update();}}
    }catch(e){console.warn('Warehouse V3 monitoring:',e);}}
    monitor();setInterval(monitor,850);
    // Start with map-focused workspace. This invokes the existing tab handler.
    requestAnimationFrame(()=>tab('2d'));
    console.info('Warehouse Command Center V3 ready (frontend-only)');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
