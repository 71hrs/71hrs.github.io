function Explode(x, y, n = 30, scale = 5, spreadAngle = [0, TWO_PI]) {
  this.spark = [];
  this.scale = scale;
  this.spreadAngle = spreadAngle;
  this.isDead = false;

  for (i = 0; i < n; i++) {
    let p = new Particle(x, y);
    p.sprite = 'ellipse';
    let colors = ['#F9D347', '#F29F39', '#ec4940', '#CF4DEF', '#3F99F7', '#5BC339'];
    noStroke();
    p.c = colors[int(random(colors.length - 1))];
    p.scale = this.scale;
    let angle = random(this.spreadAngle[0], this.spreadAngle[1]);
    let vel = createVector(cos(angle), -sin(angle)).normalize().mult(random(5, 10));
    p.vel = vel.copy();
    p.lifeSpan = 20;
    p.customUpdateFunction = function () {
      this.alpha = map(this.lifeCount, 0, this.lifeSpan, 400, 0);
    }
    this.spark.push(p);
  }
  this.run = function () {
    for (i = this.spark.length - 1; i >= 0; i--) {
      this.spark[i].run();
    }
    if (this.spark.every(item => {
        return item.isDead ? true : false
      })) {
      this.spark.length = 0;
      this.isDead = true;
    }
  }
}

class Particle {
  constructor(x, y) {
    this.location = createVector(x, y);
    this.rotation = random(-PI / 3, PI / 3);
    this.vel = createVector(random(-1, 1), random(-1, 0)).normalize().mult(random(10, 15));
    this.acc = createVector(0, 0);
    this.alpha = 255;
    let sprites = ['💖', '🥰', '😍', '🥳'];
    this.sprite = random(sprites);
    this.lifeSpan = 40;
    this.lifeCount = 0;
    this.offsetT = 0;
    this.damping = 0.98;
    this.c = color(0, 0, 0);
    this.gravity = createVector(0, 0.2);
    this.scale = 8;
    this.isDead = false;
    this.customUpdateFunction = function () {};
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.applyForce(this.gravity);
    this.vel.add(this.acc);
    this.location.add(this.vel);
    this.acc.mult(0); //clear the acceleration for each frame
    this.vel.mult(this.damping);
    this.gravity.mult(this.damping);
    this.customUpdateFunction();
  }

  display() {
    if (this.sprite == 'ellipse') {
      if (typeof this.c == 'string') this.c = color(hexToRGB(this.c)[0], hexToRGB(this.c)[1], hexToRGB(this.c)[2])
      this.c.setAlpha(this.alpha);
      noStroke();
      fill(this.c);
      ellipse(this.location.x, this.location.y, this.scale, this.scale);
    } else {
      noStroke();
      fill(255, 200, 100, 255);
      push();
      translate(this.location.x, this.location.y);
      rotate(this.rotation);
      text(this.sprite, 0, 0)
      pop();
    }
  }
  run() {
    if (this.lifeCount <= this.offsetT + this.lifeSpan) {
      if (this.lifeCount > this.offsetT) {
        this.update();
        this.display();
      }
      this.lifeCount++;
    } else this.isDead = true;
  }
}