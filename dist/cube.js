const canvas = document.querySelector('#brand-cube');
try {
  const [THREE, {RoundedBoxGeometry}, {RoomEnvironment}] = await Promise.all([
    import('three'), import('./assets/vendor/RoundedBoxGeometry.js'), import('./assets/vendor/RoomEnvironment.js')
  ]);
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0xf6f5ee,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.1;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,350/320,.1,50);
  camera.position.set(0,.15,8.8);
  camera.lookAt(0,-.12,0);
  const room=new RoomEnvironment();
  const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf9f9e9,0x53614b,1.2));
  const key=new THREE.DirectionalLight(0xfff8e9,3);
  key.position.set(-4,6,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xd5e8ce,1.3);
  fill.position.set(5,1,-3);scene.add(fill);

  const sculpture=new THREE.Group();scene.add(sculpture);
  const core=new THREE.Mesh(new RoundedBoxGeometry(1.16,1.16,1.16,5,.055),new THREE.MeshPhysicalMaterial({
    color:0x42644c,metalness:.18,roughness:.25,clearcoat:.8,clearcoatRoughness:.18,envMapIntensity:1.2
  }));
  sculpture.add(core);
  const shell=new THREE.Mesh(new RoundedBoxGeometry(2.52,2.52,2.52,6,.085),new THREE.MeshPhysicalMaterial({
    color:0xb8cea6,metalness:0,roughness:.075,transmission:.94,thickness:.6,ior:1.45,
    clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.3,
    attenuationColor:new THREE.Color(0x8fae75),attenuationDistance:2.8
  }));
  sculpture.add(shell);

  // A soft contact shadow gives the glass volume a little weight on the page.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const shadowCtx=shadowCanvas.getContext('2d');
  const gradient=shadowCtx.createRadialGradient(64,64,4,64,64,64);
  gradient.addColorStop(0,'rgba(41,63,37,.22)');gradient.addColorStop(.45,'rgba(41,63,37,.09)');gradient.addColorStop(1,'rgba(41,63,37,0)');
  shadowCtx.fillStyle=gradient;shadowCtx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.9,1.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));
  shadow.position.set(0,-2.15,-.4);scene.add(shadow);

  const initial={x:.34,y:-.6,z:-.08};
  let rotation={...initial},pointer=null,frame=0,lastTime=0,elapsed=0,visible=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  const toggle=document.querySelector('.motion-toggle');
  function animate(time){
    frame=0;
    const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
    if(!paused&&!pointer){elapsed+=dt;rotation.y+=dt*.15;}
    sculpture.rotation.set(rotation.x,rotation.y,rotation.z);
    sculpture.position.y=reduced.matches?0:Math.sin(elapsed*.65)*.065;
    renderer.render(scene,camera);
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
    const width=canvas.clientWidth,height=width*320/350;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();
  }
  toggle.addEventListener('click',()=>setPaused(!paused));
  canvas.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');
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
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(frame)cancelAnimationFrame(frame);frame=0;});
  canvas.addEventListener('webglcontextrestored',()=>{lastTime=0;render();});
  window.addEventListener('resize',resize);
  canvas.dataset.renderer='webgl';resize();setPaused(paused);
} catch(error) {
  // Preserve a visible, interactive cube on devices without WebGL.
  const replacement=canvas.cloneNode(true);canvas.replaceWith(replacement);
  replacement.dataset.renderer='canvas';
  await import('./cube-fallback.js');
}
