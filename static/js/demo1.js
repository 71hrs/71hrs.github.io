"use strict"

//------------------Instruction Animation------------------//
let COUNT = 0;
let Count_ = 0;
let OPTIONINDEX = 0;
let OptionIndex_=0;
let LineLength=0;

//states;
let FistClicked = 0; // 第一次点击like button
let firstChanged =0; // 第一次选择“directional shooting”
let instruction02Played = 0; 
let instruction01IsOver = 0; 
let state_shot02=0;
let state_shot01=0;

let finger = document.getElementById("instructionIcon");
let cursor = document.getElementById("instructionCursor");
let instructionText01= document.getElementById("instruction-text-01");
let instructionText02= document.getElementById("instruction-text-02");



var properties = {
    x: 0,
    y: 0,
    opacity: 1,
}
var cursorProperties = {
    x: 0,
    y: 0,
    opacity: cursor.style.opacity,
    scale: 1,
}

let tween_fingerUpDown = new TWEEN.Tween(properties)
    .to({
        y: 20,
    }, 600).repeat(Infinity).yoyo(true)
    .easing(TWEEN.Easing.Cubic.InOut).onUpdate(() => {
        finger.style.transform = `translateY(${properties.y}px)`;
    }).start();


let tween_fingerHide = new TWEEN.Tween(properties)
    .to({
        opacity: 0,
    }, 200)
    .easing(TWEEN.Easing.Linear.None).onUpdate(() => {
        finger.style.opacity = `${properties.opacity}`;
    }).onComplete(()=>{instruction01IsOver=true});



let tween_cursor01 = new TWEEN.Tween(cursorProperties)
    .to({
        x: 0,
        y: 0,
        opacity: 1,
        scale: 0.8
    }, 100)
    .easing(TWEEN.Easing.Cubic.Out).onUpdate(() => {
        cursor.style.transform = `translateX(${cursorProperties.x}px) translateY(${cursorProperties.y}px) scale(${cursorProperties.scale},${cursorProperties.scale})`;
        cursor.style.opacity = `${cursorProperties.opacity}`;
    }).delay(700);

let tween_cursor02 = new TWEEN.Tween(cursorProperties)
    .to({
        x: -120,
        y: -150,
        opacity: 1,
        scale: 0.8
    }, 800)
    .easing(TWEEN.Easing.Cubic.Out).onUpdate(() => {
        cursor.style.transform = `translateX(${cursorProperties.x}px) translateY(${cursorProperties.y}px) scale(${cursorProperties.scale},${cursorProperties.scale})`;
        cursor.style.opacity = `${cursorProperties.opacity}`;
    }).delay(500);


let tween_cursor03 = new TWEEN.Tween(cursorProperties)
    .to({
        x: -120,
        y: -150,
        opacity: 0.5,
        scale: 1
    }, 100)
    .easing(TWEEN.Easing.Cubic.Out).onUpdate(() => {
        cursor.style.transform = `translateX(${cursorProperties.x}px) translateY(${cursorProperties.y}px) scale(${cursorProperties.scale},${cursorProperties.scale})`;
        cursor.style.opacity = `${cursorProperties.opacity}`;
    }).delay(300);

tween_cursor01.chain(tween_cursor02);
tween_cursor02.chain(tween_cursor03);

tween_cursor03.onComplete(() => {
    setTimeout(()=>{
        cursor.style.transform = `translateX(0px) translateY(0px) scale(1,1)`;
        cursor.style.opacity = `0.5`;
        tween_cursor01.start()
    },500);
});




animateInstruction();

function animateInstruction() {
    requestAnimationFrame(animateInstruction)

    FistClicked = COUNT == 1 && !Count_ == 1 ? 1 : 0;
    Count_ = COUNT;

    if(!firstChanged && !instruction02Played){
        firstChanged =  OPTIONINDEX == 1 && !OptionIndex_ == 1 ? 1 : 0;
    }

    OptionIndex_=OPTIONINDEX;

    if (FistClicked) {
        if(!instruction01IsOver)tween_fingerHide.start();
        setTimeout(()=>{
            instructionText01.style.opacity=1;
            setTimeout(()=>{
                instructionText01.style.display="none";
            },5000);
        },800);
    }

    if(firstChanged && !instruction02Played){
        instruction02Played=1;
    }
    

    // console.log( finger.style.transform);
    TWEEN.update();
}





let likeButton = document.querySelector(".like-button");
let buttonIsHover = false;
likeButton.onmouseover = function () {
    buttonIsHover = true
};
likeButton.onmouseleave = function () {
    buttonIsHover = false
};



var data = [{
    key: "randomdirection",
    draw: function (cnv = CNV) {
        drawingContext.clearRect(0, 0, cnv.width, cnv.height);
        shootStars.forEach(item => item.run());
        if (shootStars.every(item => {
                return item.isDead ? true : false
            })) shootStars.length = 0;
        if (shootStars.length == 0 && !mouseIsPressed) {
            noLoop();
        }
        noStroke();
    },

    mousePressed: function () {
        if (buttonIsHover) {
            let s = new RandomDirectionShoot(like.x, like.y);
            shootStars.push(s);
            loop();
            state_shot01=1;
       
        }
    },
    mouseReleased: function () {},
}, {
    key: "presstocontroldirection",
    draw: function (cnv = CNV) {
        drawingContext.clearRect(0, 0, cnv.width, cnv.height);
        shootStars.forEach(item => {
            item.run();
        });
        if (shootStars.every(item => {
                return item.isDead ? true : false
            })) shootStars.length = 0;
        if (shootStars.length == 0 && !mouseIsPressed) {
            noLoop();
        }
        noFill();
        strokeWeight(7);
        stroke('rgba(100%,80%,10%,0.2)');
        // rect(like.x, like.y, like.l, like.l);
        if (mouseIsPressed && active) {
            line(like.x, like.y, mouseX, mouseY);
            LineLength = dist(like.x, like.y, mouseX, mouseY);
        }
        if(LineLength>100){
            tween_cursor01.stop();
            cursor.style.opacity=0;
            state_shot02=1;

            setTimeout(()=>{
                instructionText02.style.opacity=1;
                setTimeout(()=>{
                    instructionText02.style.display="none";
                },4000);
            },800);
        };
    },
    mousePressed: function () {
        loop();
        if (buttonIsHover) {

            myShoot = setInterval(continueShoot, 80);
            active = true;
        }
    },
    mouseReleased: function () {
        active = false;
        clearInterval(myShoot);
    },
}];



//------------------randomdirection & presstocontroldirection----------------------------
let shootStars = [];
let e;
let CNV;
let CANVASWIDTH = parseInt(cssVar("device-width"))||375;
let CANVASHEIGHT = parseInt(cssVar("device-height"))||812;
let emojiSize = 38;


//--------------------------presstocontroldirection------------------------------------------
let active = false;

let like = {
    y: CANVASHEIGHT*parseInt(cssVar("likeButtonTop"))/100+10,
    x: CANVASWIDTH*parseInt(cssVar("likeButtonLeft"))/100+10,
    l: 20
};
let myShoot;

function continueShoot() {
    let angle = Math.atan2(-(mouseY - like.y), mouseX - like.x);
    let s = new RainballShoot(like.x, like.y, [angle - 0.2 * PI, angle + 0.2 * PI]);
    shootStars.push(s);
}
// ----------------------------------------------------------------------------
function setup() {
    CNV = createCanvas(CANVASWIDTH, CANVASHEIGHT);
    CNV.class("canvas");
    let cnvContainer = document.querySelector(".canvas-container");
    let cnvNode = document.querySelector(".canvas")
    cnvContainer.appendChild(cnvNode);
    textAlign(CENTER, CENTER);
    textSize(emojiSize);
    rectMode(CENTER);
}

function draw() {}

function mousePressed() {}

function mouseReleased() {}
draw = data[0].draw;
mousePressed = data[0].mousePressed;
mouseReleased = data[0].mouseReleased;


//--------------Click the like button to trigger the icon animation-------------//

likeButton.onclick = function () {
    likeButton.classList.add('animate');
    likeButton.addEventListener('animationend', animationEndCallback);
    likeButton.style.opacity = "1";
    COUNT += 1;
};
let animationEndCallback = (e) => {
    likeButton.removeEventListener('animationend', animationEndCallback);
    likeButton.classList.remove('animate');
}

//--------------Click option list to trigger the canvas animation-------------//

let animaOptions = document.querySelectorAll("#animation-options li");
animaOptions.forEach((item, index) => {

    item.onclick = function () {
   
        // Add active class to the current button (highlight it)
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";

        draw = data[index].draw;
        OPTIONINDEX = index;
        console.log("option==", index);

        if(index==1){
            tween_fingerUpDown.stop();
            finger.style.opacity=0;
             if(!state_shot02){
                cursor.style.opacity='0.5';
                cursor.style.transform = `translateX(0px) translateY(0px) scale(1,1)`;
                tween_cursor01.start();
            }
        }

        if(index==0){
            tween_cursor01.stop();
            cursor.style.opacity=0;
        }

        mousePressed = data[index].mousePressed;
        mouseReleased = data[index].mouseReleased;

        COUNT = 0;

    };
});

function RainballShoot(x, y, spreadAngle = [0, TWO_PI], cnv = CNV) {
    this.particles = [];
    this.explodes = [];
    this.currentState = false; // whether is collided
    this.preState = false;
    this.spreadAngle = spreadAngle;
    this.isDead = false;


    let angle = random(this.spreadAngle[0], this.spreadAngle[1]);
    this.vel = createVector(cos(angle), -sin(angle)).normalize().mult(random(7, 18));


    let colors = ['#FFFFFF', '#F9D347', '#F29F39', '#ec4940', '#CF4DEF', '#3F99F7', '#5BC339'];
    for (let i = 0; i < colors.length; i++) {
        let star = new Particle(x, y);
        star.lifeSpan = 30;
        star.rotation = random(-PI / 3, PI / 3);
        star.offsetT = i * 0.4;
        star.vel = this.vel.copy();
        star.c = colors[i];
        star.edge = "none";
        if (i > 0) star.sprite = 'ellipse';
        star.customUpdateFunction = function () {
            let d = (emojiSize - this.scale) / colors.length;
            this.scale = this.scale < emojiSize ? this.scale + d : emojiSize;
            switch (true) {
                case this.location.x <= 0:
                    this.vel.x *= -1;
                    this.edge = "left";
                    break;
                case this.location.x >= cnv.width - emojiSize / 3:
                    this.vel.x *= -1;
                    this.edge = "right";
                    break;
                case this.location.y <= 0 + emojiSize / 2:
                    this.vel.y *= -1;
                    this.edge = "top";
                    break;
                case this.location.y >= cnv.height - emojiSize / 2:
                    this.vel.y *= -1;
                    this.edge = "bottom";
                    break;
                default:
                    this.edge = "none"
            }
        }
        this.particles.push(star);
    }

    this.run = function () {
        let lastP = this.particles[0];
        this.currentSate = lastP.lifeCount == lastP.lifeSpan || lastP.edge != "none";
        if (!this.currentSate) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].run();
            }
        } else if (this.currentSate && !this.preState) {
            let n = lastP.edge == "left" || lastP.edge == "right" ? 50 : 30;
            let spreadAngle = lastP.edge == "left" ? [-0.5 * PI, 0.5 * PI] : lastP.edge == "right" ? [0.5 * PI, 1.5 * PI] : [0, 2 * PI];
            let e = new Explode(lastP.location.x, lastP.location.y, n, 5, spreadAngle);
            this.explodes.push(e);
        }
        this.explodes.forEach(item => item.run());
        this.preState = this.currentSate;
        if (this.explodes.length != 0) {
            if (this.explodes.every(item => {
                    return item.isDead ? true : false
                })) {
                this.explodes.length = 0;
                this.isDead = true;
            }
        }
    }

}

function RandomDirectionShoot(x, y, emojiSize_ = emojiSize,cnv = CNV) {
    this.particles = [];
    this.explodes = [];
    this.currentState = false;
    this.preState = false;
    this.isDead = false;
    let vel = createVector(random(-1, 1), random(-1, 1)).normalize().mult(random(9, 17));
    let colors = ['#FFFFFF', '#F9D347', '#F29F39', '#ec4940', '#CF4DEF', '#3F99F7', '#5BC339'];
    for (let i = 0; i < colors.length; i++) {
        let star = new Particle(x, y);
        star.lifeSpan = 30;
        star.offsetT = i * 1.6;
        star.vel = vel.copy();
        star.c = colors[i];
        star.edge = "none";
        star.rotation = random(-PI / 4, PI / 4);
        if (i > 0) star.sprite = 'ellipse';
        star.customUpdateFunction = function () {
            this.scale = this.scale < emojiSize_ ? this.scale + 1 : emojiSize_;
            switch (true) {
                case this.location.x <= 0:
                    this.vel.x *= -1;
                    this.edge = "left";
                    break;
                case this.location.x >= cnv.width - emojiSize_ / 3:
                    this.vel.x *= -1;
                    this.edge = "right";
                    break;
                case this.location.y <= 0 + emojiSize_ / 2:
                    this.vel.y *= -1;
                    this.edge = "top";
                    break;
                case this.location.y >= cnv.height - emojiSize_ / 2:
                    this.vel.y *= -1;
                    this.edge = "bottom";
                    break;
                default:
                    this.edge = "none"
            }
        }
        this.particles.push(star);
    }

    this.run = function () {
        let lastP = this.particles[0];
        this.currentSate = lastP.lifeCount == lastP.lifeSpan || lastP.edge != "none";
        if (!this.currentSate) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].run();
            }
        } else if (this.currentSate && !this.preState) {
            let n = lastP.edge == "left" || lastP.edge == "right" ? 50 : 30;
            let spreadAngle = lastP.edge == "left" ? [-0.5 * PI, 0.5 * PI] : lastP.edge == "right" ? [0.5 * PI, 1.5 * PI] : [0, 2 * PI];
            let e = new Explode(lastP.location.x, lastP.location.y, n, 7, spreadAngle);
            this.explodes.push(e);
        }
        this.explodes.forEach(item => item.run());
        this.preState = this.currentSate;
        if (this.explodes.length != 0) {
            if (this.explodes.every(item => {
                    return item.isDead ? true : false
                })) {
                this.explodes.length = 0;
                this.isDead = true;
            }
        }
    }

}