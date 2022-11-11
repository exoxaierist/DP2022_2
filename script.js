import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js';

let cards = document.querySelectorAll('#card');
let elements = document.querySelectorAll('#element');
let titles = document.querySelectorAll('#title');
let articles = document.querySelectorAll('#article');

let cardContainer = document.querySelector('#cardContainer');
let graphicContainer = document.querySelector('#container');
let articleContainer = document.querySelector('#articleContainer');
let cursor = document.querySelector('#cursor');

let deltaTime=0,prevTime=0; 
let centerX=cardContainer.offsetWidth*0.5,sizeX = 550,targetYScale=0,yScale=0;
let mouseX=0,mouseY=0,smoothX=0,smoothY=0;
let gap=(Math.PI*2)/cards.length;
let targetOffset=0,offset=0,minAngle=0,rotateDir=1,deltaAngle=0,lerp=1,lerpAngle=0,startOffset=0;
let deltaScroll=0,targetScroll=0,scrollDir=1;

let containerRotZ=0,containerRotX=0;

let articleMode = false,articleModeTransition = false;
let currentCard = 0;
let currentArticle = 0;
let prevCard = -1;
let prevArticle = 0;
let canChangeCard = true;

let blur = false;

///// 3D /////

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, 1920/1080, 0.1, 1000 );
let targetZ = 5,deltaZ=0,targetXRot = 0;

const renderer = new THREE.WebGLRenderer({ alpha:true,antialias:true});
renderer.setSize( 2000,1100 );
renderer.setPixelRatio(window.devicePixelRatio*1);
graphicContainer.appendChild( renderer.domElement );

const material = new THREE.PointsMaterial({color: 0x190d06,size:0.012});
const pointArray = [];

for (let i = 0; i < 2000; i++) {
  pointArray.push(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(Math.pow(Math.random(),1)));
}
for (let i = 0; i < 5000; i++) {
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
document.querySelector('#articleExitBtn').addEventListener('click',ExitArticleMode);
document.addEventListener('keydown',(e)=>{if(e.code === "Escape"&&articleMode) ExitArticleMode();});

Initialize();
Update();


function Initialize(){
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.add('elementInactive');
  }
  cardContainer.style.transform = "translateX(-50%) translateY(-50%) translateZ(-100px) rotateX(-20deg)";
}

function Update(){
  requestAnimationFrame(Update);
  
  GetDeltaTime();
  MousePosInteraction();
  Scroll();
  UpdateCardPosition();
  Animate3D();
}

function GetDeltaTime(){
  deltaTime = (performance.now()-prevTime)*0.001;
  prevTime = performance.now();
  //console.log(1/deltaTime);
}

function MousePosInteraction(){
  if(mouseY<=5 || mouseY>=window.innerHeight-5 || mouseX<=5 || mouseX>=window.innerWidth-5) return;
  smoothX += (mouseX-smoothX)*deltaTime*5;
  smoothY += (mouseY-smoothY)*deltaTime*5;
  cursor.style.left = smoothX+"px";
  cursor.style.top = smoothY+"px";
  var targetX,targetY;
  targetX = (mouseX/window.innerWidth)-0.5;
  targetY = (mouseY/window.innerHeight)-0.5;
  if(articleMode){
    targetX = 0;
    targetY *= 0.5;
  }
  if(Math.abs(containerRotX)<30) containerRotX += (targetX*10 - containerRotX)*deltaTime;
  if(Math.abs(containerRotX)<30) containerRotZ += (-targetY*25 - containerRotZ)*deltaTime;
  if(Math.abs(camera.rotation.z)<30) camera.rotation.z += (targetX*10*0.0174 - camera.rotation.z)*deltaTime*2;
  if(Math.abs(points.rotation.x)<30) points.rotation.x += (targetY*20*0.0174 - points.rotation.x + 10*0.0174)*deltaTime*2;
  cardContainer.style.transform = "translateX(-50%) translateY(-50%) translateZ(-100px) rotateZ("+(containerRotX)+"deg) rotateX("+(containerRotZ-20)+"deg)";
}

function Scroll(){
  deltaScroll = deltaScroll+(targetScroll*0.002-deltaScroll)*deltaTime;
  //deltaScroll = Math.max(Math.min(deltaScroll+(targetScroll*0.002-deltaScroll)*deltaTime,1),-1);
  if(articleMode&&targetScroll!=0) {TargetCard((currentCard-Math.sign(targetScroll))%cards.length);}
  targetScroll = 0;
}

function UpdateCardPosition(){
  if(articleMode){
    if(targetOffset-offset>Math.PI || targetOffset-offset<-Math.PI) {
      if(rotateDir>0) offset+=((targetOffset+Math.PI*2)-offset)*deltaTime*8+0.003;
      else offset+=(targetOffset-(offset+Math.PI*2))*deltaTime*8-0.003;
    }
    else{offset+=(targetOffset-offset)*deltaTime*8;}

    if(Math.abs(targetOffset-offset)<0.08) {canChangeCard = true;}
  } else{
    if(lerp<1){
      if((1-lerp)<deltaTime) lerp=1;
      else lerp+=deltaTime*0.8;
      deltaAngle = lerpAngle;
      lerpAngle = Lerp(0,minAngle,lerp<0.5?Math.pow(lerp*2,2)*0.5:0.5-Math.pow(1-(lerp-0.5)*2,2)*0.5+0.5);
      deltaAngle = lerpAngle-deltaAngle;
      offset += deltaAngle*rotateDir;
    }else{
      lerpAngle = 0;
      deltaAngle = 0;
      canChangeCard = true;
      if(articleModeTransition){
        articleModeTransition = false;
        articleMode = true;
        TargetCard(currentCard);
      }
      offset+=deltaTime*0.1+deltaScroll;
    }
  }

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

    item.style.transform = "translateY("+(y*yScale)+"px) translateX("+x+"px) translateZ("+z+"px) rotateY("+rotY+"deg) scale("+flip+",1)";
  }
}

function Animate3D() {
  if(articleMode) points.rotation.y += deltaTime*0.05*rotateDir;
  else points.rotation.y = offset
  deltaZ += deltaZ>0?Math.min((targetZ-camera.position.z)*deltaTime*4-deltaZ,deltaTime*0.08):Math.max((targetZ-camera.position.z)*deltaTime*4-deltaZ,-deltaTime*0.08);
  camera.position.z += deltaZ;
  renderer.render( scene, camera );
};



function ElementHover(e){
  ElementHoverEvent(Array.from(cards).indexOf(e.currentTarget));
}

function ElementClick(e){
  ElementClickEvent(Array.from(cards).indexOf(e.currentTarget));
}

function ElementHoverEvent(i){
  if(!articleMode && !articleModeTransition) TargetTitle(i);
}

function ElementClickEvent(i){
  TargetCard(i);
}

function TargetCard(i){
  if(!canChangeCard) return;
  i = (i+elements.length)%(elements.length);
  if(articleMode) {
    elements[currentCard].classList.remove('elementActiveMain');
    elements[i].classList.add('elementActiveMain');
  }
  canChangeCard = false;
  targetOffset = ((Math.PI*0.5-i*gap)+(Math.PI*2))%(Math.PI*2);
  minAngle = targetOffset-offset;
  rotateDir = Math.sign(minAngle);
  minAngle = Math.abs(minAngle);
  if(minAngle>Math.PI) {minAngle = Math.PI*2-minAngle;rotateDir*=-1;}
  deltaScroll=0;
  deltaAngle=0;
  lerpAngle=0;
  lerp=0;
  if(prevCard<0) prevCard = (i+1)%elements.length;
  else prevCard = currentCard;
  currentCard = i;
  scrollDir = rotateDir;

  TargetArticle();
  if(articleMode) TargetTitle(currentArticle);
  else EnterArticleMode();
}

function TargetArticle(){
  var prev = prevArticle;
  var current = currentCard;

  for (let i = 0; i < articles.length; i++) articles[i].classList.remove('articleActive');
  articles[current%articles.length].classList.add('articleActive');
  currentArticle = currentCard;

  if(prev%articles.length == current%articles.length) return;

  if(rotateDir<0){
    articles[prev%articles.length].classList.add('articleDisappearDown');
    articles[current%articles.length].classList.add('articleAppearDown');
    
    setTimeout(() => {
      articles[prev%articles.length].classList.remove('articleDisappearDown');
      articles[current%articles.length].classList.remove('articleAppearDown');
    }, 200);
  }
  else{
    articles[prev%articles.length].classList.add('articleDisappearUp');
    articles[current%articles.length].classList.add('articleAppearUp');
    
    setTimeout(() => {
      articles[prev%articles.length].classList.remove('articleDisappearUp');
      articles[current%articles.length].classList.remove('articleAppearUp');
    }, 200);
  }
  prevArticle = currentArticle;
}
function TargetTitle(i){
  for (let j = 0; j < titles.length; j++) {
    titles[j].classList.remove('titleActive');
  }
  titles[i%titles.length].classList.add('titleActive');
}

function EnterArticleMode(){
  articleModeTransition = true;
  targetYScale = 400;
  targetZ = 3;
  deltaZ = -0.001;

  cardContainer.classList.add('cardConActive');
  articleContainer.classList.add('articleConActive');
  renderer.domElement.classList.add('canvasActive');
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.remove('elementInactive');
    elements[i].classList.add('elementActive');
  }
}

function ExitArticleMode(){
  if(articleModeTransition) return;
  TargetCard(Math.floor(Math.random()*cards.length));
  articleMode=false;
  articleModeTransition = false;
  targetYScale = 0;
  targetZ=5;
  deltaZ = 0.001;
  
  cardContainer.classList.remove('cardConActive');
  articleContainer.classList.remove('articleConActive');
  renderer.domElement.classList.remove('canvasActive');
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.add('elementInactive');
    elements[i].classList.remove('elementActive');
    elements[i].classList.remove('elementActive');
    elements[i].classList.remove('elementActiveMain');
  }
}

function Lerp(A, B, t) {
  return A + (B - A) * t;
}





