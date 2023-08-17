
class Particle {
    constructor(opt) {
      this.scale = opt.scale || 10;
      this.m = this.scale / 2 * 100;
      this.position = opt.position.copy() || createVector(0, 0);
      this.rotation = opt.rotation || 0;
      this.vel = opt.vel.copy() || createVector(random(-1, 1), random(-1, 0)).normalize().mult(random(10, 15));
      this.minVel = opt.minVel || 2;
      this.lifeSpan = opt.lifeSpan || 40;
      this.offsetT = opt.offsetT || 0;
      this.damping = opt.damping || 0.98;
      this.c = opt.c || color(255, 255, 20);
      this.gravity = opt.gravity || createVector(0, 0.1);
      this.customUpdateFunction = opt.customUpdateFunction || function () {};
  
      this.lifeCount = 0;
      this.acc = createVector(0, 0);
      this.alpha = 255;
      let sprites = ['🙄'] //['🤮'];//['🥶'];['😭'];['🙄'];//['😤'];
      this.sprite = random(sprites);
      this.isDead = false;
    }
    applyForce(force) {
      this.acc.add(force);
    }
    update() {
      this.applyForce(this.gravity);
      this.vel.add(this.acc);
      this.position.add(this.vel);
      this.acc.mult(0); //clear the acceleration for each frame
      if (this.vel.mag() > this.minVel) this.vel.mult(this.damping);
      this.customUpdateFunction();
    }
  
    display() {
      if (this.sprite == 'ellipse') {
        if (typeof this.c == 'string') this.c = color(hexToRGB(this.c)[0], hexToRGB(this.c)[1], hexToRGB(this.c)[2])
        this.c.setAlpha(this.alpha);
        // noStroke();
        fill(this.c);
        ellipse(this.position.x, this.position.y, this.scale, this.scale);
      } else {
        noStroke();
        this.c.setAlpha(this.alpha);
        fill(this.c);
        textSize(this.scale);
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        text(this.sprite, 0, 0);
        pop();
      }
    }
    checkCollision(other) {
      let distanceVect = p5.Vector.sub(other.position, this.position);
      let distanceVectMag = distanceVect.mag();
      let minDistance = this.scale / 2 + other.scale / 2;
      if (distanceVectMag < minDistance) {
        let distanceCorrection = (minDistance - distanceVectMag) / 2.0;
        let d = distanceVect.copy();
        let correctionVector = d.normalize().mult(distanceCorrection);
        other.position.add(correctionVector);
        this.position.sub(correctionVector);
  
        let theta = distanceVect.heading();
        let sine = sin(theta);
        let cosine = cos(theta);
        let bTemp = [new p5.Vector(), new p5.Vector()];
        bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;
  
  
        let vTemp = [new p5.Vector(), new p5.Vector()];
  
        vTemp[0].x = cosine * this.vel.x + sine * this.vel.y;
        vTemp[0].y = cosine * this.vel.y - sine * this.vel.x;
        vTemp[1].x = cosine * other.vel.x + sine * other.vel.y;
        vTemp[1].y = cosine * other.vel.y - sine * other.vel.x;
        let vFinal = [new p5.Vector(), new p5.Vector()];
  
        vFinal[0].x =
          ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) /
          (this.m + other.m);
        vFinal[0].y = vTemp[0].y;
  
        vFinal[1].x =
          ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
          (this.m + other.m);
        vFinal[1].y = vTemp[1].y;
  
        bTemp[0].x += vFinal[0].x;
        bTemp[1].x += vFinal[1].x;
  
        let bFinal = [new p5.Vector(), new p5.Vector()];
  
        bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
        bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
        bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
        bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;
  
  
        other.position.x = this.position.x + bFinal[1].x;
        other.position.y = this.position.y + bFinal[1].y;
  
        this.position.add(bFinal[0]);
  
        this.vel.x = cosine * vFinal[0].x - sine * vFinal[0].y;
        this.vel.y = cosine * vFinal[0].y + sine * vFinal[0].x;
        other.vel.x = cosine * vFinal[1].x - sine * vFinal[1].y;
        other.vel.y = cosine * vFinal[1].y + sine * vFinal[1].x;
      }
    }
  
    run() {
      if (this.lifeCount >= this.offsetT) {
        this.update();
        this.display();
      }
      if (this.lifeCount > this.lifeSpan + this.offsetT) this.isDead = true;
      this.lifeCount++;
    }
  }
  