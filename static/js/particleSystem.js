function ParticleSystem(customized) {
	let opt = {
		particleCount: [4, 7],
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
		customParticleUpdate: function () {

		},
		setOffsetT:function(){},
		customSystemUpdate: function () {}
	};
	Object.assign(opt, customized);
	this.group = new THREE.Group();
	this.groupScale = opt.groupScale;
	this.group.scale.set(opt.groupScale, opt.groupScale, opt.groupScale);
	this.particles = [];
	this.customSystemUpdate = opt.customSystemUpdate;
	for (let i = 0; i < randomInRange(opt.particleCount[0] || 4, opt.particleCount[1] || 8); i++) {
		let emojiMaterial = new THREE.SpriteMaterial({
			map: getRandomTexture('💖', '🥰', '✨', '💗', '🌟', '😍', '🥳', '👏', '👍', '🥳'),
		});

		let particle = new THREE.Sprite(emojiMaterial);
		particle.initParticle(opt); /// set animation!
		this.particles.push(particle);
	}

	this.run = function () {
		this.particles.forEach((item) => {
			if(item.lifeCount>item.offsetT){
				item.update();
				this.group.add(item);
				GROUP.add(this.group);
			}
			item.lifeCount++;
			!item.isDead() || scene.remove(item);
		});
		if (this.particles.every(item =>
				item.isDead() == true
			)) this.particles.length = 0;
		this.customSystemUpdate();
	}
}
