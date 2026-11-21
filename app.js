import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
const $=id=>document.getElementById(id);
const canvas=$('scene'),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);
camera.position.set(0,.1,6.2);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
scene.add(new THREE.AmbientLight(0xb8d6c1,1.5));
const key=new THREE.PointLight(0xffd69a,15,12);key.position.set(0,0,2);scene.add(key);
const rim=new THREE.DirectionalLight(0xa6d9c1,2.2);rim.position.set(-3,3,-2);scene.add(rim);
const texCanvas=document.createElement('canvas');texCanvas.width=1024;texCanvas.height=512;const tx=texCanvas.getContext('2d');
function paperBase(color='#c9d9b0'){let g=tx.createLinearGradient(0,0,1024,0);g.addColorStop(0,'#819b76');g.addColorStop(.2,color);g.addColorStop(.5,'#f2f0d7');g.addColorStop(.8,color);g.addColorStop(1,'#819b76');tx.fillStyle=g;tx.fillRect(0,0,1024,512);for(let i=0;i<700;i++){tx.fillStyle=`rgba(60,75,48,${Math.random()*.045})`;tx.fillRect(Math.random()*1024,Math.random()*512,2,2)}}
paperBase();const texture=new THREE.CanvasTexture(texCanvas);texture.colorSpace=THREE.SRGBColorSpace;
const lantern=new THREE.Group();scene.add(lantern);
const profile=[[-1.2,.5],[-1.08,.67],[-.84,.77],[.78,.77],[1.04,.67],[1.17,.5]],seg=64,verts=[],uvs=[],idx=[];
profile.forEach(([y,r],j)=>{for(let i=0;i<=seg;i++){let a=i/seg*Math.PI*2;verts.push(Math.cos(a)*r,y,Math.sin(a)*r);uvs.push(i/seg,j/(profile.length-1))}});
for(let j=0;j<profile.length-1;j++)for(let i=0;i<seg;i++){let a=j*(seg+1)+i,b=a+seg+1;idx.push(a,b,a+1,b,b+1,a+1)}
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(idx);geo.computeVertexNormals();
lantern.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:texture,roughness:.78,side:THREE.DoubleSide,emissive:0x536c3d,emissiveIntensity:.14})));
const ribMat=new THREE.MeshStandardMaterial({color:0x806b49,roughness:.8});
for(let i=0;i<12;i++){let a=i/12*Math.PI*2;let pts=profile.map(([y,r])=>new THREE.Vector3(Math.cos(a)*r*1.01,y,Math.sin(a)*r*1.01));lantern.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.009,5,false),ribMat))}
for(let [y,r] of [[-1.1,.6],[1.08,.6]]){let m=new THREE.Mesh(new THREE.TorusGeometry(r,.024,8,64),ribMat);m.rotation.x=Math.PI/2;m.position.y=y;lantern.add(m)}
let base=new THREE.Mesh(new THREE.TorusGeometry(.46,.03,8,48),new THREE.MeshStandardMaterial({color:0x9d8254,emissive:0xe6ad65,emissiveIntensity:.45}));base.rotation.x=Math.PI/2;base.position.y=-1.2;lantern.add(base);
const inner=new THREE.PointLight(0xffc77c,4,3);inner.position.y=-.5;lantern.add(inner);
const starsGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<230;i++)positions.push((Math.random()-.5)*13,(Math.random()-.5)*7,(Math.random()-.5)*7-2);starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xd8ead9,size:.018,transparent:true,opacity:.8})));
function resize(){let w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();
let rx=0,ry=0,drag=false,lx=0,ly=0,t=0;canvas.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;ry+=(e.clientX-lx)*.008;rx+=(e.clientY-ly)*.006;rx=Math.max(-.6,Math.min(.6,rx));lx=e.clientX;ly=e.clientY});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
function loop(){requestAnimationFrame(loop);t+=.012;lantern.rotation.y+=(ry-lantern.rotation.y)*.08;lantern.rotation.x+=(rx-lantern.rotation.x)*.08;lantern.position.y=Math.sin(t)*.065;renderer.render(scene,camera)}loop();
function setColor(c){paperBase(c);texture.needsUpdate=true}
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.swatch').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');setColor(b.dataset.color)}));
const dc=$('drawing'),dctx=dc.getContext('2d');let drawing=false,eraser=false,last=null;
function point(e){let r=dc.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*dc.width,y:(e.clientY-r.top)/r.height*dc.height}}
function syncDrawing(){paperBase();tx.drawImage(dc,0,0,1024,512);texture.needsUpdate=true}
dc.addEventListener('pointerdown',e=>{drawing=true;last=point(e);dc.setPointerCapture(e.pointerId)});dc.addEventListener('pointermove',e=>{if(!drawing)return;let p=point(e);dctx.strokeStyle=eraser?'#c9d9b0':$('color').value;dctx.lineWidth=Number($('size').value)*2;dctx.lineCap='round';dctx.beginPath();dctx.moveTo(last.x,last.y);dctx.lineTo(p.x,p.y);dctx.stroke();last=p;syncDrawing()});dc.addEventListener('pointerup',()=>drawing=false);dc.addEventListener('pointercancel',()=>drawing=false);
$('clear').onclick=()=>{dctx.clearRect(0,0,dc.width,dc.height);syncDrawing()};$('clear').insertAdjacentText('afterend','');
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('classicPanel').classList.toggle('hidden',b.dataset.tab!=='classic');$('drawPanel').classList.toggle('hidden',b.dataset.tab!=='draw');if(b.dataset.tab==='draw')syncDrawing()});
const KEY='star-sea-green-wishes-v1';let wishes=[];try{wishes=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}
function toast(s){let el=$('toast');el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}
function render(){let box=$('cards');$('total').textContent=`✦ ${wishes.length} 盞心願`;box.innerHTML='';if(!wishes.length){box.innerHTML='<div class="empty">星海還很安靜，等第一盞天燈加入。</div>';return}wishes.slice().reverse().forEach(w=>{let card=document.createElement('article');card.className='card';let icon=document.createElement('span');icon.textContent='✧';icon.style.color='#d5ddb3';let name=document.createElement('b');name.textContent=w.name||'匿名星光';let p=document.createElement('p');p.textContent=w.wish;card.append(icon,name,p);card.onclick=()=>{ $('wishName').textContent=w.name||'匿名星光';$('wishText').textContent=w.wish;$('wishDate').textContent=new Date(w.date).toLocaleString('zh-TW');$('wishDialog').showModal()};box.append(card)})}
$('wish').oninput=()=> $('counter').textContent=`${$('wish').value.length} / 180`;
$('release').onclick=()=>{let wish=$('wish').value.trim(),name=$('nickname').value.trim();if(!wish){toast('先寫下一句想傳達的祝福吧');return}let item={name,wish,date:new Date().toISOString()};wishes.push(item);try{localStorage.setItem(KEY,JSON.stringify(wishes))}catch{}$('wish').value='';$('counter').textContent='0 / 180';render();toast('你的天燈已加入這台裝置的星海 ✦')};
$('closeWish').onclick=()=>$('wishDialog').close();$('about').onclick=()=>$('aboutDialog').showModal();$('closeAbout').onclick=()=>$('aboutDialog').close();render();
