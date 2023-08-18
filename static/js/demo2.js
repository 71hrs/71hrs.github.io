const scene = new THREE.Scene();
let c_width = parseInt(cssVar("canvas3dWidth"))||600;
let c_height = parseInt(cssVar("canvas3dHeight"))||800;
const camera = new THREE.PerspectiveCamera(40, c_width/c_height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  alpha: true
});
renderer.setSize(c_width*2, c_height*2);
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.className = "canvas-3d";
renderer.domElement.style.width = cssVar("canvas3dWidth")||"600px";
renderer.domElement.style.height = cssVar("canvas3dHeight")||"800px";
let canvasContainer = document.querySelector(".canvas-container");
canvasContainer.append(renderer.domElement);
camera.position.z = 6;
camera.position.x = 0;
camera.position.y = 0;

let unit = 0.16;
const GROUP = new THREE.Group();

let likeButton = document.querySelector(".like-button");
likeButton.onclick = function () {
  boomAnimation.animate(ANIMAOPTIONS[OPTIONINDEX]);
  likeButton.classList.add('animate');
  likeButton.addEventListener('animationend', animationEndCallback);
  likeButton.style.opacity = "1";
};
let animationEndCallback = (e) => {
  likeButton.removeEventListener('animationend', animationEndCallback);
  likeButton.classList.remove('animate');
}

let OPTIONINDEX = 0;
let animaOptions = document.querySelectorAll("#animation-options li");
animaOptions.forEach(item => {
  item.onclick = function () {
    OPTIONINDEX = getOptionIndex(item.id, ANIMAOPTIONS);
    boomAnimation.animate(ANIMAOPTIONS[getOptionIndex(item.id, ANIMAOPTIONS)]);
    likeButton.classList.add('animate');
    likeButton.addEventListener('animationend', animationEndCallback);
    
    // Add active class to the current button (highlight it)
    let current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  };
});

function getOptionIndex(optionString, optionsList) { //()
  let options = JSON.parse(JSON.stringify(optionsList));
  let index = options.findIndex(item => {
    return item.key == optionString;
  });
  return index;
}

function init() {
  scene.add(GROUP);
  renderer.render(scene, camera);
}
init();


let boomAnimation = { // system of particleSystems,store the count of boom
  booms: [], //array of particleSystem
  animaState: 0, //keep track of whether the animation is finished
  preAnimaState: 0, //the animaState of the last frame

  render: function (loop) {
    this.preAnimaState = this.animaState;
    this.booms.forEach(boom => boom.run());
    if (this.booms.some(boom => boom.particles.length == 0)) this.booms.shift();
    this.animaState = this.booms.length;
    if (this.animaState == 0 && this.preAnimaState >= 0) { //stop the loop at the frame when the animation is finished
      setTimeout(function () {
        clearInterval(loop);
      }, 30);
    }
  },
  animate: function (animaoption) {
    // CURRENROPTION = JSON.parse(JSON.stringify(animaoption));
    this.booms.push(new ParticleSystem(animaoption)); //
    if (boomAnimation.preAnimaState == 0) {
      let loopFrame = setInterval(function () {
        renderer.render(scene, camera);
        boomAnimation.render(loopFrame);
      }, 16);
    }
  },
};




//-----------------------------------------------------------------------------------------//
let COUNT = 5;
let GRAVITY = 1;
let PARAMETERS = [];

let sliderContainder = document.querySelector(".parameter-adjusting");
let sliderCells = sliderContainder.querySelectorAll(".cell");
sliderCells.forEach((item,index) => {
  let slider = item.querySelector(".slider");
  let output = item.querySelectorAll("span")[1];
  output.innerHTML = slider.value;
  PARAMETERS[index]=slider.value;
  slider.oninput = function () {
    output.innerHTML = this.value;
    PARAMETERS[index]=slider.value;
    boomAnimation.animate(ANIMAOPTIONS[OPTIONINDEX]);
  }
});
// let resetParameter = function(input){
//   let
//  return
// };

let ANIMAOPTIONS = [{
    key: "option_gravity",
    particleCount: [4,7],
    lifespan: 32,
    groupScale: 1,
    setInitPosition: function () {
      return {
        x: 0,
        y: 0,
        z: 0
      }
    },
    setInitVelocity: function () {
      let angle = randomInRange(0, Math.PI);
      let theta = randomInRange(0.1 * Math.PI, Math.PI);
      let startSpeed = unit * randomInRange(0.4, 0.7);
      return new THREE.Vector3(Math.cos(angle) * Math.abs(Math.cos(theta)), Math.sin(theta), Math.abs(Math.cos(angle)) * Math.sin(theta)).normalize().multiplyScalar(startSpeed);
    },
    mass: 1,
    maxVel: unit * 0.7,
    minVel: unit * 0.1,
    maxAcc: unit * 0.3,
    damping: 0.98,
    force: [new THREE.Vector3(0, -unit * 0.015, 0)], //[force1,force2,...]
    getDynamicForce: function () {
      return new THREE.Vector3(0, 0, 0);
    },
    customParticleUpdate: function () {},
    customSystemUpdate: function () {}
  },
  {
    key: "option_colision3d",
    lifespan: 45,
    maxVel: unit * 0.7,
    minVel: unit * 0.1,
    maxAcc: unit * 0.3,
    damping: 0.99,
    groupScale: 0.9,
    preY: 0,
    setInitVelocity: function () {
      let startSpeed = unit * randomInRange(0.4, 0.75);
      return new THREE.Vector3(randomInRange(-0.7, 0.5), randomInRange(0.5, 1.3), randomInRange(0.3, 1.5)).normalize().multiplyScalar(startSpeed);
    },
    force: [new THREE.Vector3(0, -unit * 0.02, 0)],
    customParticleUpdate: function () {
      if (this.position.y < 0 && this.preY > this.position.y) {
        if (this.position.z <= 10 * unit) {
          this.vel.y *= (-1);
        }
      }
      this.preY = this.position.y;
    },
  },
  {
    key: "option_float",
    damping: 0.97,
    mass: 1,
    lifeSpan: 40,
    setInitVelocity: function () {
      let startSpeed = unit * randomInRange(0.1, 0.7);
      return new THREE.Vector3(randomInRange(-1.5, 1.5), randomInRange(-0.6, 1), randomInRange(0, 2)).normalize().multiplyScalar(startSpeed);
    },
    force: [new THREE.Vector3(0, unit * 0.018, 0), new THREE.Vector3(0, 0, -unit * 0.01)], //float force, z-back force
  },
  {
    key: "option_cohesion",
    particleCount: [6, 10],
    damping: 0.95,
    mass: 1.5,
    lifeSpan: 45,
    scalar: 1.1,
    setInitVelocity: function () {
      let startSpeed = unit * randomInRange(0.2, 0.8);
      return new THREE.Vector3(randomInRange(-1, 1), randomInRange(-1, 1), randomInRange(-1, 2)).normalize().multiplyScalar(startSpeed);
    },
    customParticleUpdate: function () {
      let center = new THREE.Vector3(-4 * unit, 4.5 * unit, -7 * unit);
      let d = center.distanceTo(this.position);
      let cohesionForce = center.sub(this.position).normalize().multiplyScalar(0.06 * unit * d);
      this.force[0] = cohesionForce;
    },
  },
  {
    key: "option_showAndFall",
    particleCount: [10, 20],
    damping: 0.95,
    mass: 0.8,
    scalar: 1,
    force: [new THREE.Vector3(0, -unit * 0.01, 0)],
    setOffsetT: function (particle) {
      let d = particle.position.distanceTo(new THREE.Vector3(0, 0, 0));
      return Math.floor(d * 15);
    },
    setInitPosition: function (particle) {
      return {
        x: randomInRanges(-unit * 9, unit * 2),
        y: randomInRanges(0, unit * 10),
        z: 0 //randomInRanges(-unit * 20, 0)
      }
    },
    setInitVelocity: function () {
      let startSpeed = unit * randomInRange(0.1, 0.2);
      return new THREE.Vector3(0, 1, 0).normalize().multiplyScalar(startSpeed);
    },
  },
  {
    key: "option_spaceRotate",
    particleCount: [2, 7],
    mass: 1,
    maxVel: 0.3 * unit,
    minVel: 0,
    maxAcc: 0.04 * unit,
    damping: 0.99,
    force: [new THREE.Vector3(0, 0, 0)], //[force1,force2,...]
    lifespan: 100,
    groupScale: 0.5,

    setInitVelocity: function () {
      let startSpeed = randomInRange(unit * 0.1, unit * 0.8);
      return new THREE.Vector3(-1, randomInRange(-1, 1), randomInRange(-0.5, 0.5)).normalize().multiplyScalar(startSpeed);
    },
    customParticleUpdate: function () {
      let target = new THREE.Vector3();
      this.getWorldPosition(target);
      if (target.z > 2) {};
    },
    customSystemUpdate: function () {
      this.group.rotation.y += 0.03;
      this.group.scale.set(this.groupScale, this.groupScale, this.groupScale);
      if (this.groupScale < 2) this.groupScale += 0.02;
    }
  }
];