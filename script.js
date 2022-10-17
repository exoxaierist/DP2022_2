import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let cards = document.querySelectorAll('#card');
let cardContainer = document.querySelector('#cardContainer');

let centerX,centerY,sizeX = 300;
let offset=0;
let deltaTime=0,prevTime=0;
let scroll=0,targetScroll=0,scrollDir=1;
let mouseX=0,mouseY=0;
let containerRotZ=0,containerRotX=0;

centerX = cardContainer.offsetWidth*0.5;
centerY = 0;


document.addEventListener('wheel',(e) => {targetScroll = e.deltaY;scrollDir=Math.sign(e.deltaY);});
document.addEventListener('mousemove',(e) => {mouseX = e.clientX; mouseY = e.clientY;});


GetDeltaTime();
UpdateMousePos();
UpdateScroll();
UpdatePosition();


function GetDeltaTime(){
  deltaTime = (performance.now()-prevTime)*0.001;
  prevTime = performance.now();
  //console.log(1/deltaTime);
  requestAnimationFrame(GetDeltaTime);
}

function UpdateMousePos(){
  containerRotX += (((mouseX/window.innerWidth)-0.5)*15 - containerRotX)*0.008;
  containerRotZ += ((-(mouseY/window.innerWidth)+0.5)*15 - containerRotZ)*0.008;
  cardContainer.style.transform = "rotateZ("+containerRotX+"deg) rotateX("+containerRotZ+"deg)";
  requestAnimationFrame(UpdateMousePos);
}

function UpdateScroll(){
  scroll += (targetScroll*0.002-scroll)*deltaTime;
  offset += Math.max(Math.min(scroll,deltaTime*4),-deltaTime*4);
  targetScroll = 0;
  requestAnimationFrame(UpdateScroll);
}

function UpdatePosition(){
  for (let i = 0; i < cards.length; i++) {
      const item = cards[i];
      let x,z,rotY,rad,gap;
      offset += deltaTime*0.01*scrollDir;
      gap = (Math.PI*2)/cards.length;
      rad = gap*i+offset;
      
      x = centerX + Math.sin(rad)*sizeX - item.offsetWidth*0.5;
      z = Math.cos(rad)*sizeX - item.offsetHeight*0.5 + 500;
      rotY = ((rad*(180/Math.PI) + 90) % 360);
      
      item.style.transform = "translateX("+x+"px) translateY(0px) translateZ("+z+"px) rotateY("+rotY+"deg)";
  }
  requestAnimationFrame(UpdatePosition);
}



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, cardContainer.offsetWidth / cardContainer.offsetHeight, 0.1, 1000 );
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();
let gltf = new THREE.Group();
rgbeLoader.load("/src/env/brown_photostudio_07_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});
gltfLoader.load("/src/model/wheel/scene.gltf",(g) => {
  gltf = g.scene;
  
gltf.scale.set(3,3,3);
  scene.add(gltf);
})

const renderer = new THREE.WebGLRenderer({ alpha:true });
renderer.setSize( cardContainer.offsetWidth, cardContainer.offsetHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
const canvas = document.querySelector("#cardContainer").appendChild( renderer.domElement );
canvas.style.transform = "translateY("+(-300)+"px) translateZ("+(400)+"px)";
canvas.style.pointerEvents = "none";

camera.position.z = 5;

function animate() {
  requestAnimationFrame( animate );

  gltf.rotation.x+=0.01;
  gltf.rotation.z+=0.01;
  gltf.rotation.y+=0.01;

  renderer.render( scene, camera );
};

animate();





