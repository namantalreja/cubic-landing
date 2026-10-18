(() => {
  const canvas = document.querySelector('#research-cube');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const buttons = [...document.querySelectorAll('[data-stage]')];
  const detail = document.querySelector('.stage-detail');
  const descriptions = [
    'Choosing which question is worth asking.',
    'Designing tests and learning from failure.',
    'Knowing what to pursue, revise, or leave behind.'
  ];
  const initial = { x: 0.38, y: -0.62 };
  let rotation = { ...initial }, stage = 0, pointer = null;
  const path = [[-1.08,-1.08,1.08],[0,-1.08,1.08],[0,0,1.08],[0,0,0],[1.08,0,0],[1.08,1.08,0]];
  const faces = [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]];
  let frame = 0;

  function rotate([x,y,z]) {
    const a = x * Math.cos(rotation.y) + z * Math.sin(rotation.y);
    const b = z * Math.cos(rotation.y) - x * Math.sin(rotation.y);
    return [a, y * Math.cos(rotation.x) - b * Math.sin(rotation.x), y * Math.sin(rotation.x) + b * Math.cos(rotation.x)];
  }
  function project(v) {
    const [x,y,z] = rotate(v), scale = 7 / (7 - z) * 53;
    return [175 + x * scale, 153 - y * scale, z];
  }
  function stroke(points, color, width = 0.7) {
    ctx.beginPath();
    points.forEach((p,i) => { const q=project(p); i ? ctx.lineTo(q[0],q[1]) : ctx.moveTo(q[0],q[1]); });
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  }
  function block(center, active) {
    const d = 0.34;
    const verts = [[-d,-d,-d],[d,-d,-d],[d,d,-d],[-d,d,-d],[-d,-d,d],[d,-d,d],[d,d,d],[-d,d,d]].map(v=>v.map((n,i)=>n+center[i]));
    return faces.map((face,i)=>({
      points:face.map(n=>project(verts[n])),
      depth:face.reduce((sum,n)=>sum+project(verts[n])[2],0)/4,
      color:active ? ['#36553b','#3e6241','#547347','#668452','#2d4c34','#799161'][i] : ['#c1cfa8','#cdd8b7','#dbe2cb','#b1c497','#bccda2','#e0e7d1'][i]
    }));
  }
  function draw() {
    frame=0;
    ctx.clearRect(0,0,350,320);
    const edges=[];
    for (let a=0;a<4;a++) for(let b=0;b<4;b++) {
      const u=-1.62+a*1.08, v=-1.62+b*1.08;
      edges.push([[-1.62,u,v],[1.62,u,v]],[[u,-1.62,v],[u,1.62,v]],[[u,v,-1.62],[u,v,1.62]]);
    }
    edges.sort((a,b)=>(project(a[0])[2]+project(a[1])[2])-(project(b[0])[2]+project(b[1])[2]));
    edges.forEach(e=>{
      const depth=(project(e[0])[2]+project(e[1])[2])/2;
      stroke(e,`rgba(100,126,78,${0.12+(depth+3.1)/6.2*0.25})`,0.65);
    });
    stroke(path,'#5d7950',1.7);
    const polygons=path.flatMap((p,i)=>block(p,Math.floor(i/2)===stage));
    polygons.sort((a,b)=>a.depth-b.depth);
    for(const polygon of polygons){
      ctx.beginPath();polygon.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      ctx.fillStyle=polygon.color;ctx.fill();ctx.strokeStyle='rgba(51,77,40,.65)';ctx.lineWidth=.65;ctx.stroke();
    }
  }
  function render() { if(!frame) frame=requestAnimationFrame(draw); }
  function resize() {
    const dpr=Math.min(window.devicePixelRatio||1,2.5);
    canvas.width=Math.round(350*dpr);canvas.height=Math.round(320*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);render();
  }
  function selectStage(value) {
    stage=value;
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));
    detail.textContent=descriptions[stage];render();
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>selectStage(i)));
  document.querySelector('.reset').addEventListener('click',()=>{rotation={...initial};render();});
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
  function release(){pointer=null;canvas.classList.remove('dragging');}
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','1','2','3'].includes(event.key))event.preventDefault();
    else return;
    if(event.key==='ArrowLeft')rotation.y-=.14;
    if(event.key==='ArrowRight')rotation.y+=.14;
    if(event.key==='ArrowUp')rotation.x=Math.max(-1.25,rotation.x-.14);
    if(event.key==='ArrowDown')rotation.x=Math.min(1.25,rotation.x+.14);
    if(event.key==='Home')rotation={...initial};
    if(['1','2','3'].includes(event.key))selectStage(Number(event.key)-1);
    render();
  });
  window.addEventListener('resize',resize);resize();
})();
