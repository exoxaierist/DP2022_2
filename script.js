import * as THREE from 'three';

let cards = document.querySelectorAll('#card');
let elements = document.querySelectorAll('#element');
let titles = document.querySelectorAll('#title');

let cardContainer = document.querySelector('#cardContainer');
let graphicContainer = document.querySelector('#graphicContainer');

let centerX,sizeX = 480;
let gap,targetOffset=0,offset=0,offsetCoroutine;
let deltaTime=0,prevTime=0;
let scroll=0,targetScroll=0,scrollDir=1;
let mouseX=0,mouseY=0;
let containerRotZ=0,containerRotX=0;

centerX = cardContainer.offsetWidth*0.5;

///// 3D /////

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, 1920/1080, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha:true,antialias:true});
renderer.setSize( 2000,1100 );
renderer.setPixelRatio(window.devicePixelRatio*1);
graphicContainer.appendChild( renderer.domElement );

const material = new THREE.PointsMaterial({color:0xbbbbbb,size:0.013});
const pointArray = [];

for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(Math.pow(Math.random(),2)));
}
for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(Math.random()*3));
}
for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiply(new THREE.Vector3(Math.random()*0.6,Math.random()*3,Math.random()*0.6)));
}
for (let i = 0; i < 1000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiply(new THREE.Vector3(Math.random()*0.4,Math.random()*1.5,Math.random()*0.4)));
}
for (let i = 0; i < 3000; i++) {
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
  //containerRotZ += ((-(mouseY/window.innerHeight)+0.5)*20 - containerRotZ)*deltaTime;
  camera.rotation.z += (((mouseX/window.innerWidth)-0.5)*10*0.0174 - camera.rotation.z)*deltaTime*2;
  points.rotation.x += (((mouseY/window.innerHeight)-0.5)*40*0.0174 - points.rotation.x + 10*0.0174)*deltaTime*2;
  a+=deltaTime*10;
  cardContainer.style.transform = "translateX(-50%) translateY(-50%) rotateZ("+containerRotX+"deg) rotateX("+(containerRotZ-30)+"deg)";
}

function Scroll(){
  scroll += (targetScroll*0.002-scroll)*deltaTime;
  offset += Math.max(Math.min(scroll,deltaTime*4),-deltaTime*4);
  targetScroll = 0;
}

function UpdateCardPosition(){
  offset += (targetOffset-offset)*0.05;
  //offset += (deltaTime*0.01*scrollDir);
  offset = (offset+Math.PI*2)%(Math.PI*2);
  gap = (Math.PI*2)/cards.length; 

  for (let i = 0; i < cards.length; i++) {
    const item = cards[i];
    let x,z,rotY,rad,flip;
    rad = gap*i+offset;
    
    x = centerX + Math.sin(rad)*sizeX - item.offsetWidth*0.5;
    z = Math.cos(rad)*sizeX - item.offsetHeight*0.5;
    rotY = ((720+(rad*(180/Math.PI) + 90)) % 360);
    flip = (rotY<90||rotY>270)?1:-1;
    //if(i==0) console.log(offset*58)
    
    item.style.transform = "translateX("+x+"px) translateZ("+z+"px) rotateY("+rotY+"deg) scale("+flip+",1)";
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
  targetOffset = ((Math.PI*0.5-i*gap)+(Math.PI*2))%(Math.PI*2);
  console.log((targetOffset)*57);
}





