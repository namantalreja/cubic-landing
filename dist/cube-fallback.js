(() => {
  const canvas = document.querySelector('#brand-cube');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const toggle = document.querySelector('.motion-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const initial = { x: 0.42, y: -0.62 };
  let rotation = {...initial}, pointer = null, paused = reduced.matches;
  let frame = 0, lastTime = 0, visible = true;
  const tiles = [];
  // Each face is a regular 3 × 3 surface. The cube is simply Cubic's mark in 3D.
  for (let axis = 0; axis < 3; axis++) for (const side of [-1,1]) {
    const normal = [0,0,0]; normal[axis] = side;
    const axes = [0,1,2].filter(n => n !== axis);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const points = [[-.497,-.497],[.497,-.497],[.497,.497],[-.497,.497]].map(([u,v]) => {
        const p = [0,0,0]; p[axis] = side * 1.5;
        p[axes[0]] = i - 1 + u; p[axes[1]] = j - 1 + v;
        return p;
      });
      tiles.push({points,normal});
    }
  }
  function rotate([x,y,z]) {
    const a = x*Math.cos(rotation.y)+z*Math.sin(rotation.y);
    const b = z*Math.cos(rotation.y)-x*Math.sin(rotation.y);
    return [a,y*Math.cos(rotation.x)-b*Math.sin(rotation.x),y*Math.sin(rotation.x)+b*Math.cos(rotation.x)];
  }
  function project(v) {
    const [x,y,z] = rotate(v), scale = 7/(7-z)*53;
    return [175+x*scale,153-y*scale,z];
  }
  function draw() {
    ctx.clearRect(0,0,350,320);
    const faces = tiles.map(tile=>{
      const normal=rotate(tile.normal), points=tile.points.map(project);
      const light=.68+Math.max(0,-normal[0]*.35+normal[1]*.65+normal[2]*.45)*.4;
      return {points,depth:points.reduce((s,p)=>s+p[2],0)/4,color:`rgb(${Math.round(151*light)},${Math.round(173*light)},${Math.round(124*light)})`};
    }).sort((a,b)=>a.depth-b.depth);
    for(const face of faces){
      ctx.beginPath();face.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='rgba(61,86,43,.65)';ctx.lineWidth=.55;ctx.stroke();
    }
  }
  function animate(time) {
    frame=0;
    if(!paused&&!pointer&&lastTime)rotation.y+=Math.min(time-lastTime,40)*.00013;
    lastTime=time;draw();
    if(!paused&&!pointer&&visible&&!document.hidden)frame=requestAnimationFrame(animate);
  }
  function render(){if(!frame)frame=requestAnimationFrame(animate);}
  function setPaused(value){
    paused=value;lastTime=0;
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused?'Resume cube animation':'Pause cube animation');
    toggle.title=paused?'Resume animation':'Pause animation';
    toggle.firstElementChild.textContent=paused?'▷':'Ⅱ';render();
  }
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2.5);
    canvas.width=Math.round(350*dpr);canvas.height=Math.round(320*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);render();
  }
  toggle.addEventListener('click',()=>setPaused(!paused));
  canvas.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
    canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    rotation.y+=(event.clientX-pointer.x)*.009;
    rotation.x=Math.max(-1.25,Math.min(1.25,rotation.x+(event.clientY-pointer.y)*.009));
    pointer.x=event.clientX;pointer.y=event.clientY;render();
  });
  function release(){pointer=null;canvas.classList.remove('dragging');lastTime=0;render();}
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,release));
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home',' '].includes(event.key))return;
    event.preventDefault();
    if(event.key===' '){setPaused(!paused);return;}
    setPaused(true);
    if(event.key==='ArrowLeft')rotation.y-=.14;
    if(event.key==='ArrowRight')rotation.y+=.14;
    if(event.key==='ArrowUp')rotation.x=Math.max(-1.25,rotation.x-.14);
    if(event.key==='ArrowDown')rotation.x=Math.min(1.25,rotation.x+.14);
    if(event.key==='Home')rotation={...initial};render();
  });
  reduced.addEventListener('change',event=>setPaused(event.matches));
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden)render();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;if(visible)render();}).observe(canvas);
  window.addEventListener('resize',resize);resize();setPaused(paused);
})();
