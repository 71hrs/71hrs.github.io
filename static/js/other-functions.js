function cssVar(name,value){
  if(name[0]!='-') name = '--'+name //allow passing with or without --
  if(value) document.documentElement.style.setProperty(name, value)
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}




function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0,
    a = 0;
  //without alpha
  if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  } else if (h.length == 6) {
    r = "0x" + h[0] + h[1];
    g = "0x" + h[2] + h[3];
    b = "0x" + h[4] + h[5];
  }
  return [Number(r), Number(g), Number(b)]
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function getRandomTexture(...arg) {
	let textures = [];
	for (let i = 0; i < arg.length; i++) {
		let txtcanvas = document.createElement('canvas');
		var txtctx = txtcanvas.getContext('2d');
		txtcanvas.width = 100;
		txtcanvas.height = 100;
		txtctx.font = 'Bold 100px Arial';
		txtctx.fillStyle = 'white';
		txtctx.textAlign = "center";
		txtctx.fillText(arg[i], 50, 85);
		let texture = new THREE.Texture(txtcanvas);
		texture.needsUpdate = true;
		textures.push(texture);
	}
	return textures[Math.floor(Math.random() * (textures.length - 1))]
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
};

function randomInRanges(...arg) {
  let arr = [];
  for (i = 0; i <= arg.length - 2; i += 2) {
    arr.push(randomInRange(arg[i], arg[i + 1]))
  }
  return arr[Math.floor(Math.random() * arg.length / 2)]
};