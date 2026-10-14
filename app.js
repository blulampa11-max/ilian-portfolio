// Общие меню, слайдер, переключение материалов проекта и форма.
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus();}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
matchMedia('(min-width:701px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const picture=document.querySelector('#slide-image');
if(picture){
 const slides=[['render-1.jpg','Underwater','Общий вид авторской модели.'],['render-2.jpg','Ближе к деталям','Конструкция, соединения и материалы.'],['render-3.jpg','Другой ракурс','Один проект — несколько точек зрения.']];let current=0;
 function show(n){current=(n+slides.length)%slides.length;const [src,title,description]=slides[current];picture.src=''+src;picture.alt='Underwater: '+description;document.querySelector('#slide-title').textContent=title;document.querySelector('#slide-description').textContent=description;document.querySelector('#slide-count').textContent=`0${current+1} / 03`;}
 document.querySelector('#prev').addEventListener('click',()=>show(current-1));document.querySelector('#next').addEventListener('click',()=>show(current+1));document.querySelector('.slider').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});
}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(b=>{const active=b===button;b.setAttribute('aria-pressed',String(active));document.getElementById(b.dataset.tab).hidden=!active;});if(button.dataset.tab!=='video')document.querySelector('video').pause();}));
const form=document.querySelector('#contact-form');
if(form){
 const name=form.elements.name,email=form.elements.email,message=form.elements.message;
 message.addEventListener('input',()=>document.querySelector('#char-count').textContent=`${message.value.length} / 3000`);
 function validate(input){let error='';const value=input.value.trim();if(!value)error='Заполните это поле.';else if(input===name&&value.length<2)error='Введите не менее 2 символов.';else if(input===email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))error='Введите корректный email.';else if(input===message&&value.length<10)error='Опишите идею: минимум 10 символов.';else if(value.length>input.maxLength)error='Текст превышает допустимую длину.';input.setAttribute('aria-invalid',String(Boolean(error)));document.getElementById(input.id+'-error').textContent=error;return !error;}
 [name,email,message].forEach(input=>input.addEventListener('input',()=>{if(input.hasAttribute('aria-invalid'))validate(input);document.querySelector('#form-result').hidden=true;}));
 form.addEventListener('submit',event=>{event.preventDefault();const valid=[name,email,message].map(validate);if(valid.includes(false)){[name,email,message][valid.indexOf(false)].focus();return;}document.querySelector('#request-text').value=`Имя: ${name.value.trim()}\nEmail: ${email.value.trim()}\nТема: ${form.elements.subject.value}\n\n${message.value.trim()}`;document.querySelector('#form-result').hidden=false;document.querySelector('#copy-status').textContent='';document.querySelector('#request-text').focus();});
 document.querySelector('#copy').addEventListener('click',async()=>{const text=document.querySelector('#request-text');try{await navigator.clipboard.writeText(text.value);document.querySelector('#copy-status').textContent='Текст скопирован.';}catch{text.focus();text.select();document.querySelector('#copy-status').textContent='Скопируйте выделенный текст вручную.';}});
}


// 3D запускается только на странице портфолио.
if(document.querySelector("#scene")){
(async()=>{
const [THREE,{OrbitControls},{FBXLoader}]=await Promise.all([import("three"),import("three/addons/controls/OrbitControls.js"),import("three/addons/loaders/FBXLoader.js")]);
const host=document.querySelector('#scene'),status=document.querySelector('#model-status');
const rotate=document.querySelector('#rotate'),wire=document.querySelector('#wire'),reset=document.querySelector('#reset');
try{
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e0e8e9');
 const camera=new THREE.PerspectiveCamera(35,1,.01,100);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#e0e8e9');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.append(renderer.domElement);
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Модель Underwater. Перетаскивайте мышью или используйте стрелки для вращения, плюс и минус для масштаба.');
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3;controls.maxDistance=12;controls.autoRotateSpeed=.7;
 scene.add(new THREE.HemisphereLight(0xffffff,0x7e9caa,3));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,6,5);scene.add(light);const rim=new THREE.DirectionalLight(0x7aa8ff,2);rim.position.set(-4,2,-3);scene.add(rim);
 let model;const materials=[];
 function resetView(){camera.position.set(5,3,6);controls.target.set(0,0,0);controls.autoRotate=false;rotate.setAttribute('aria-pressed','false');if(model)model.rotation.set(0,0,0);controls.update();}
 resetView();
 // Текстуры не приложены: вместо отсутствующих карт используем материалы по названиям FBX.
 const manager=new THREE.LoadingManager();manager.setURLModifier(url=>/\.(png|jpe?g|tga|tif|bmp|webp)(\?|$)/i.test(url)?'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==':url);
 new FBXLoader(manager).load('underwater.fbx',object=>{
  object.traverse(child=>{if(!child.isMesh)return;const source=Array.isArray(child.material)?child.material:[child.material];const mapped=source.map(old=>{let name=old.name.toLowerCase(),color='#8297a1',metalness=.65,roughness=.4;if(name.includes('yellow')||name.includes('004'))color='#e4b53b';if(name.includes('dirty'))color='#425f72';if(name.includes('leather')){color='#233039';metalness=0;roughness=.8;}if(name.includes('brass'))color='#bd914c';if(name.includes('001'))color='#2c68a9';if(name.includes('glass')){color='#63d9d8';metalness=.2;roughness=.2;}const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.push(m);old.map?.dispose();old.dispose();return m;});child.material=Array.isArray(child.material)?mapped:mapped[0];});
  const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=4/Math.max(size.x,size.y,size.z);object.scale.multiplyScalar(scale);object.position.sub(center.multiplyScalar(scale));model=new THREE.Group();model.add(object);scene.add(model);host.dataset.loaded='true';status.textContent='Модель загружена · 360°';[rotate,wire,reset].forEach(b=>b.disabled=false);
 },progress=>{if(progress.total)status.textContent=`Загрузка модели: ${Math.round(progress.loaded/progress.total*100)}%`;},()=>{status.textContent='Не удалось загрузить модель. Рендеры доступны выше.';host.dataset.error='true';});
 rotate.addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;rotate.setAttribute('aria-pressed',String(controls.autoRotate));});wire.addEventListener('click',()=>{const on=wire.getAttribute('aria-pressed')!=='true';materials.forEach(m=>m.wireframe=on);wire.setAttribute('aria-pressed',String(on));});reset.addEventListener('click',resetView);
 renderer.domElement.addEventListener('keydown',e=>{if(!model)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')model.rotation.y-=.15;if(e.key==='ArrowRight')model.rotation.y+=.15;if(e.key==='ArrowUp')model.rotation.x-=.15;if(e.key==='ArrowDown')model.rotation.x+=.15;if(['+','=','-'].includes(e.key)){camera.position.multiplyScalar(e.key==='-'?1.1:.9);camera.position.setLength(THREE.MathUtils.clamp(camera.position.length(),3,12));}}});
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}).observe(host);
 let visible=true;new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);renderer.setAnimationLoop(()=>{if(visible&&!document.hidden){controls.update();renderer.render(scene,camera);}});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='3D-просмотр прерван. Обновите страницу.';});
}catch(error){status.textContent='3D недоступно в этом браузере. Посмотрите рендеры выше.';host.dataset.error='true';console.error(error);}

})().catch(()=>{document.querySelector("#model-status").textContent="Для 3D нужен интернет. Рендеры доступны выше.";});
}
