import * as THREE from 'three';

let cards = document.querySelectorAll('#card');
let elements = document.querySelectorAll('#element');
let titles = document.querySelectorAll('#title');

let cardContainer = document.querySelector('#cardContainer');
let graphicContainer = document.querySelector('#container');
let articleContainer = document.querySelector('#articleContainer');

let deltaTime=0,prevTime=0; 
let centerX=cardContainer.offsetWidth*0.5,sizeX = 480,targetYScale=0,yScale=0;
let mouseX=0,mouseY=0;
let gap=(Math.PI*2)/cards.length;
let targetOffset=0,offset=0,minAngle=0,rotateDir=1,deltaAngle=0,lerpAngle=0.001;
let deltaScroll=0,targetScroll=0,scrollDir=1;

let containerRotZ=0,containerRotX=0;

let articleMode = false;
let articleTarget = 0;
let canChangeCard = true;

///// 3D /////

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, 1920/1080, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha:true,antialias:true});
renderer.setSize( 2000,1100 );
renderer.setPixelRatio(window.devicePixelRatio*1);
graphicContainer.appendChild( renderer.domElement );

const material = new THREE.PointsMaterial({color:0xbbbbbb,size:0.012});
const pointArray = [];

for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(Math.pow(Math.random(),2)));
}
for (let i = 0; i < 2000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(Math.random()*3));
}
for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiply(new THREE.Vector3(Math.random()*0.6,Math.random()*3,Math.random()*0.6)));
}
for (let i = 0; i < 500; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiply(new THREE.Vector3(Math.random()*0.4,Math.random()*1.5,Math.random()*0.4)));
}
for (let i = 0; i < 2000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiply(new THREE.Vector3(Math.random()*0.2,Math.random()*1,Math.random()*0.2)));
}
for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiply(new THREE.Vector3(Math.random()*0.05,Math.random()*4,Math.random()*0.05)));
}

const points = new THREE.Points(new THREE.BufferGeometry().setFromPoints(pointArray),material);

scene.add(points);

camera.position.z = 5;
points.rotation.x =20*0.0174;


document.addEventListener('wheel',(e) => {targetScroll = e.deltaY;scrollDir=Math.sign(e.deltaY);});
document.addEventListener('mousemove',(e) => {mouseX = e.clientX; mouseY = e.clientY;});
for (let i = 0; i < cards.length; i++) {
  cards[i].addEventListener('mouseover',(e) => ElementHover(e));
  cards[i].addEventListener('click',(e) => ElementClick(e));
}


let a=0;
Update();


function Update(){
  GetDeltaTime();
  MousePosInteraction();
  Scroll();
  UpdateCardPosition();
  Animate3D();
  
  requestAnimationFrame(Update);
}

function GetDeltaTime(){
  deltaTime = (performance.now()-prevTime)*0.001;
  prevTime = performance.now();
  //console.log(1/deltaTime);
}

function MousePosInteraction(){
  //containerRotX += ((Math.min(mouseX/window.innerWidth,1)-0.5)*20 - containerRotX)*deltaTime;
  containerRotZ += ((-(mouseY/window.innerHeight)+0.5)*20 - containerRotZ)*deltaTime;
  camera.rotation.z += (((mouseX/window.innerWidth)-0.5)*10*0.0174 - camera.rotation.z)*deltaTime*2;
  points.rotation.x += (((mouseY/window.innerHeight)-0.5)*40*0.0174 - points.rotation.x + 10*0.0174)*deltaTime*2;
  a+=deltaTime*10;
  cardContainer.style.transform = "translateX(-50%) translateY(-50%) translateZ(-100px) rotateZ("+containerRotX+"deg) rotateX("+(-20)+"deg)";
}

function Scroll(){
  deltaScroll = Math.max(Math.min(deltaScroll+(targetScroll*0.002-deltaScroll)*deltaTime,1),-1);
  targetScroll = 0;
  if(articleMode && Math.abs(deltaScroll)>0.002) TargetCard((articleTarget+Math.sign(deltaScroll))%cards.length);
}

function UpdateCardPosition(){
  if(lerpAngle/minAngle<0.5) deltaAngle = (lerpAngle/minAngle+0.03)*deltaTime*minAngle*5;
  else deltaAngle = (1-lerpAngle/minAngle)*deltaTime*minAngle*4;

  if((Math.abs(minAngle-lerpAngle))>0.01) lerpAngle+=deltaAngle;
  else {deltaAngle=0; canChangeCard=true;}

  offset += deltaAngle*rotateDir;
  if(!articleMode) offset += deltaScroll + deltaTime*0.1;
  offset = (offset+Math.PI*2)%(Math.PI*2);

  yScale += (targetYScale-yScale)*deltaTime;

  for (let i = 0; i < cards.length; i++) {
    const item = cards[i];
    let x,y,z,rotY,rad,flip;
    rad = gap*i+offset;
    
    x = centerX + Math.sin(rad)*sizeX - item.offsetWidth*0.5;
    y = Math.cos(rad)-0.5;
    z = Math.cos(rad)*sizeX - item.offsetHeight*0.5;
    rotY = ((720+(rad*(180/Math.PI) + 90)) % 360);
    flip = (rotY<90||rotY>270)?1:-1;
    
    if(rotY<180||rotY>270) item.classList.add('elementFlip');
    else item.classList.remove('elementFlip');

    item.style.transform = "translateY("+(y*yScale)+"px) translateX("+x+"px) translateZ("+z+"px) rotateY("+rotY+"deg) scale("+flip+",1)";
  }
}

function Animate3D() {
  points.rotation.y = offset
  //camera.position.z -= 0.01;
  renderer.render( scene, camera );
};

function ElementHover(e){
  ElementHoverEvent(Array.from(cards).indexOf(e.currentTarget));
}

function ElementClick(e){
  ElementClickEvent(Array.from(cards).indexOf(e.currentTarget));
}

function ElementHoverEvent(i){
  for (let j = 0; j < elements.length; j++) {
    if(j<elements.length) elements[j].classList.remove('elementHover');
    if(j<titles.length) titles[j].classList.remove('titleActive');
  }
  elements[i].classList.add('elementHover');
  titles[i].classList.add('titleActive');
}

function ElementClickEvent(i){
  TargetCard(i);
  if(!articleMode) EnterArticleMode();
  else ExitArticleMode();
}

function TargetCard(i){
  console.log(canChangeCard);
  if(!canChangeCard) return;
  canChangeCard = false;
  targetOffset = ((Math.PI*0.5-i*gap)+(Math.PI*2))%(Math.PI*2);
  minAngle = targetOffset-offset;
  rotateDir = Math.sign(minAngle);
  minAngle = Math.abs(minAngle);
  if(minAngle>Math.PI) {minAngle = Math.PI*2-minAngle;rotateDir*=-1;}
  deltaScroll=0;
  deltaAngle=0;
  lerpAngle=0;

  articleTarget = i;
}

function EnterArticleMode(){
  articleMode=true;
  targetYScale = 200;

  cardContainer.classList.add('containerActive');
  articleContainer.classList.add('articleConActive');
  renderer.domElement.classList.add('containerActive');
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.add('elementActive');
  }
}

function ExitArticleMode(){
  articleMode=false;
  targetYScale = 0;

  TargetCard(Math.floor(Math.random()*cards.length));

  cardContainer.classList.remove('containerActive');
  articleContainer.classList.remove('articleConActive');
  renderer.domElement.classList.remove('containerActive');
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.remove('elementActive');
  }
}





