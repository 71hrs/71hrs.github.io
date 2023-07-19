THREE.Sprite.prototype.initParticle = function (opt) {
    this.position.set(opt.setInitPosition().x,opt.setInitPosition().y,opt.setInitPosition().z);
    this.scale.set(unit*(opt.scalar || 1), unit*(opt.scalar || 1), unit*(opt.scalar || 1));
    this.vel = opt.setInitVelocity();
    this.acc = new THREE.Vector3(0, 0, 0);
    this.mass = opt.mass;
    this.material.rotation = Math.random()*Math.PI/2-Math.PI/4;

    this.force = opt.force ? JSON.parse(JSON.stringify(opt.force)) : 0; //opt.force.clone();
    this.maxVel = opt.maxVel;
    this.minVel = opt.minVel;
    this.maxAcc = opt.maxAcc;
    this.damping = opt.damping;

    this.lifespan = opt.lifespan; //frameCount, how long the particle will be alive
    this.lifeCount = 0; //frameCount
    this.offsetT = opt.setOffsetT(this)||0;
    this.collide = opt.collide || 0;
    this.customParticleUpdate = opt.customParticleUpdate;
}

THREE.Sprite.prototype.applyForce = function (force) {
    this.acc.add(new THREE.Vector3(force.x / this.mass, force.y / this.mass, force.z / this.mass));
    this.acc.clampLength(0, this.maxAcc);
}

THREE.Sprite.prototype.update = function () {
        //update physical feature
        this.force.forEach(element => {
            this.applyForce(element);
        });
        this.customParticleUpdate();
        this.vel.add(this.acc);
        if(this.vel.length ()>this.minVel)this.vel.multiplyScalar(this.damping);//energy damping
        this.vel.clampLength(0, this.maxVel);
        this.position.add(this.vel);
        this.acc.multiplyScalar(0); //clear the acceleration for each frame

        //update graphical feature
        this.alpha = map_range(this.lifeCount-this.offsetT, 0, this.lifespan, 1.8, 0);
        this.material.opacity = this.alpha;
       //this.lifeCount++;
    },


    THREE.Sprite.prototype.isDead = function () {
        return this.lifeCount > this.lifespan+this.offsetT ? true : false;
    }
