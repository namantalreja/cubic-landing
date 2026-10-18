import {route,branch,frameState} from './cube-motion.js';
(() => {
  const canvas=document.querySelector('#brand-cube'),ctx=canvas.getContext('2d');if(!ctx)return;
  const toggle=document.querySelector('.motion-toggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let rotation={x:.4,y:-.72},elapsed=2.7,frame=0,last=0,paused=reduced.matches,pointer=null,visible=true;
  const initial={...rotation};
  function project(index,spread){
    const [x,y,z]=[(index[0]-1.5)*.9,(index[1]-1.5)*.9*spread,(index[2]-1.5)*.9];
    const a=x*Math.cos(rotation.y)+z*Math.sin(rotation.y),b=z*Math.cos(rotation.y)-x*Math.sin(rotation.y);
    const yy=y*Math.cos(rotation.x)-b*Math.sin(rotation.x),zz=y*Math.sin(rotation.x)+b*Math.cos(rotation.x),scale=7/(7-zz)*54;
    return [175+a*scale,155-yy*scale];
  }
  function line(a,b,spread,color,width){const p=project(a,spread),q=project(b,spread);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function draw(){
    ctx.clearRect(0,0,350,320);const f=frameState(elapsed,reduced.matches);
    for(let axis=0;axis<3;axis++)for(let i=0;i<4;i++)for(let j=0;j<4;j++){
      const axes=[0,1,2].filter(v=>v!==axis),a=[0,0,0],b=[0,0,0];b[axis]=3;a[axes[0]]=b[axes[0]]=i;a[axes[1]]=b[axes[1]]=j;
      const outside=(i===0||i===3)&&(j===0||j===3);line(a,b,f.spread,outside?'#6e8465':'#bbc5ad',outside?1:.5);
    }
    function trace(indices,progress,color,width){
      for(let i=0;i<indices.length-1;i++){
        const part=Math.max(0,Math.min(1,progress-i)),a=indices[i],b=a.map((v,j)=>v+(indices[i+1][j]-v)*part);
        line(a,b,f.spread,color,width);
      }
    }
    trace(route,f.progress,`rgba(167,128,58,${f.opacity})`,2.5);
    trace(branch,f.branch,'rgba(157,141,101,.5)',1.4);
    route.forEach((v,i)=>{if(i>f.progress)return;const p=project(v,f.spread);ctx.fillStyle=`rgba(52,93,65,${f.opacity})`;ctx.fillRect(p[0]-3,p[1]-3,6,6);});
  }
  function tick(time){frame=0;const dt=last?Math.min((time-last)/1000,.05):0;last=time;if(!paused&&!pointer)elapsed+=dt;draw();if(!paused&&!pointer&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  function render(){if(!frame)frame=requestAnimationFrame(tick);}
  function pause(value){paused=value;last=0;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume cube animation':'Pause cube animation');toggle.firstElementChild.textContent=paused?'▷':'Ⅱ';render();}
  function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=350*dpr;canvas.height=320*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);render();}
  toggle.addEventListener('click',()=>pause(!paused));
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;rotation.y+=(e.clientX-pointer.x)*.009;rotation.x=Math.max(-1.25,Math.min(1.25,rotation.x+(e.clientY-pointer.y)*.009));pointer.x=e.clientX;pointer.y=e.clientY;render();});
  function release(){pointer=null;last=0;canvas.classList.remove('dragging');render();}
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,release));
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home',' '].includes(e.key))return;e.preventDefault();if(e.key===' '){pause(!paused);return;}pause(true);if(e.key==='ArrowLeft')rotation.y-=.14;if(e.key==='ArrowRight')rotation.y+=.14;if(e.key==='ArrowUp')rotation.x-=.14;if(e.key==='ArrowDown')rotation.x+=.14;if(e.key==='Home')rotation={...initial};render();});
  reduced.addEventListener('change',e=>pause(e.matches));
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)render();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;render();}}).observe(canvas);
  window.addEventListener('resize',resize);resize();pause(paused);
})();
