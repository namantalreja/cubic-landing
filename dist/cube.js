const canvas = document.querySelector('#brand-cube');
try {
  const [THREE, {RoundedBoxGeometry}, {RoomEnvironment}] = await Promise.all([
    import('three'), import('./assets/vendor/RoundedBoxGeometry.js'), import('./assets/vendor/RoomEnvironment.js')
  ]);
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0xf6f5ee,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();
  const viewHeight=5.05;
  const camera=new THREE.OrthographicCamera(-viewHeight*350/320/2,viewHeight*350/320/2,viewHeight/2,-viewHeight/2,.1,50);
  camera.position.set(5,3.6,6.5);
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

  const {route,branch,frameState}=await import('./cube-motion.js');
  const sculpture=new THREE.Group();scene.add(sculpture);
  const rodGeometry=new THREE.CylinderGeometry(1,1,1,10);
  const beadGeometry=new THREE.SphereGeometry(.023,16,12);
  const milestoneGeometry=new RoundedBoxGeometry(.175,.175,.175,5,.024);
  const frameMaterial=new THREE.MeshStandardMaterial({color:0x506d58,metalness:.42,roughness:.32,transparent:true,opacity:.82});
  const gridMaterial=new THREE.MeshStandardMaterial({color:0x84977a,metalness:.2,roughness:.45,transparent:true,opacity:.24});
  const nodeMaterial=new THREE.MeshStandardMaterial({color:0x607c5a,metalness:.35,roughness:.3});
  const routeMaterial=new THREE.MeshPhysicalMaterial({color:0x9f7934,metalness:.4,roughness:.28,clearcoat:.8,emissive:0x705023,emissiveIntensity:.08,transparent:true});
  const branchMaterial=new THREE.MeshStandardMaterial({color:0x9d8d65,metalness:.2,roughness:.5,transparent:true,opacity:.5});
  const milestoneMaterial=new THREE.MeshPhysicalMaterial({color:0x477456,metalness:.15,roughness:.3,clearcoat:.65,clearcoatRoughness:.2,transparent:true});
  const tipMaterial=new THREE.MeshPhysicalMaterial({color:0xc2ac68,metalness:.5,roughness:.2,clearcoat:.8,emissive:0x69511d,emissiveIntensity:.1,transparent:true});
  const lattice=[],beads=[],segments=[],failedSegments=[],milestones=[];
  const up=new THREE.Vector3(0,1,0);
  function rod(material,radius){const mesh=new THREE.Mesh(rodGeometry,material);mesh.userData.radius=radius;sculpture.add(mesh);return mesh;}
  function point(index,spread){return new THREE.Vector3((index[0]-1.5)*.9,(index[1]-1.5)*.9*spread,(index[2]-1.5)*.9);}
  function positionRod(mesh,a,b){
    const delta=new THREE.Vector3().subVectors(b,a),length=delta.length();
    mesh.visible=length>.001;if(!mesh.visible)return;
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(up,delta.multiplyScalar(1/length));
    mesh.scale.set(mesh.userData.radius,length,mesh.userData.radius);
  }
  for(let axis=0;axis<3;axis++)for(let i=0;i<4;i++)for(let j=0;j<4;j++){
    const others=[0,1,2].filter(v=>v!==axis),a=[0,0,0],b=[0,0,0];
    a[axis]=0;b[axis]=3;a[others[0]]=b[others[0]]=i;a[others[1]]=b[others[1]]=j;
    const outside=(i===0||i===3)&&(j===0||j===3);
    lattice.push({a,b,mesh:rod(outside?frameMaterial:gridMaterial,outside?.014:.0045)});
  }
  for(let x=0;x<4;x++)for(let y=0;y<4;y++)for(let z=0;z<4;z++){
    if(![x,y,z].every(v=>v===0||v===3))continue;
    const mesh=new THREE.Mesh(beadGeometry,nodeMaterial);sculpture.add(mesh);beads.push({index:[x,y,z],mesh});
  }
  for(let i=0;i<route.length-1;i++)segments.push(rod(routeMaterial,.023));
  for(let i=0;i<branch.length-1;i++)failedSegments.push(rod(branchMaterial,.012));
  route.forEach(index=>{const mesh=new THREE.Mesh(milestoneGeometry,milestoneMaterial);sculpture.add(mesh);milestones.push({index,mesh});});
  const tip=new THREE.Mesh(new THREE.SphereGeometry(.045,24,16),tipMaterial);sculpture.add(tip);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;
  const glowCtx=glowCanvas.getContext('2d');
  const glowGradient=glowCtx.createRadialGradient(32,32,0,32,32,32);
  glowGradient.addColorStop(0,'rgba(255,234,175,.9)');glowGradient.addColorStop(.15,'rgba(235,199,107,.5)');glowGradient.addColorStop(1,'rgba(235,199,107,0)');
  glowCtx.fillStyle=glowGradient;glowCtx.fillRect(0,0,64,64);
  const glint=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,opacity:.55,depthWrite:false}));
  glint.scale.set(.28,.28,1);sculpture.add(glint);
  function updateStructure(time,still){
    const state=frameState(time,still),spread=state.spread;
    for(const part of lattice)positionRod(part.mesh,point(part.a,spread),point(part.b,spread));
    for(const bead of beads)bead.mesh.position.copy(point(bead.index,spread));
    function trace(meshes,indices,progress){
      meshes.forEach((mesh,i)=>{
        const amount=Math.max(0,Math.min(1,progress-i));
        const a=point(indices[i],spread),b=point(indices[i+1],spread);
        positionRod(mesh,a,a.clone().lerp(b,amount));
      });
    }
    trace(segments,route,state.progress);trace(failedSegments,branch,state.branch);
    milestones.forEach(({mesh,index},i)=>{
      mesh.position.copy(point(index,spread));
      const reveal=Math.max(0,Math.min(1,(state.progress-i+.12)/.3));
      const scale=reveal*reveal*(3-2*reveal);
      mesh.visible=scale>.001;mesh.scale.setScalar(Math.max(.001,scale));
    });
    const current=Math.min(route.length-2,Math.floor(state.progress));
    tip.position.copy(point(route[current],spread)).lerp(point(route[current+1],spread),state.progress-current);
    glint.position.copy(tip.position);glint.material.opacity=.55*state.opacity;
    routeMaterial.opacity=state.opacity;milestoneMaterial.opacity=state.opacity;tipMaterial.opacity=state.opacity;
    branchMaterial.opacity=.55*state.opacity;
    canvas.dataset.cycle=state.branch>.1?'reconsidering':state.progress<8.9?'exploring':'connecting';
  }

  // A diffuse shadow anchors the light wire structure.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const shadowCtx=shadowCanvas.getContext('2d');
  const gradient=shadowCtx.createRadialGradient(64,64,4,64,64,64);
  gradient.addColorStop(0,'rgba(41,63,37,.13)');gradient.addColorStop(.45,'rgba(41,63,37,.05)');gradient.addColorStop(1,'rgba(41,63,37,0)');
  shadowCtx.fillStyle=gradient;shadowCtx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.5,.72),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));
  shadow.position.set(0,-1.91,-.3);scene.add(shadow);

  const initial={x:0,y:0,z:0};
  let rotation={...initial},pointer=null,frame=0,lastTime=0,elapsed=2.7,visible=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  const toggle=document.querySelector('.motion-toggle');
  function animate(time){
    frame=0;
    const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
    if(!paused&&!pointer)elapsed+=dt;
    sculpture.rotation.set(rotation.x,rotation.y+(reduced.matches?0:Math.sin(elapsed*.22)*.09),rotation.z);
    updateStructure(elapsed,reduced.matches);
    sculpture.position.y=-.03;
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
    renderer.setSize(width,height,false);camera.left=-viewHeight*width/height/2;camera.right=viewHeight*width/height/2;camera.updateProjectionMatrix();render();
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
