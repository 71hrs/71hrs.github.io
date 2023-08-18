var imageLoader = document.getElementById("image-loader");
var uiCover = document.getElementById("ui-cover");

var canvas = document.getElementById("glsl-canvas");
var sandbox = new GlslCanvas(canvas);

const preCanvas = document.getElementById("pre-canvas");
const preCanvasCtx = preCanvas.getContext("2d");
const buff = document.createElement("canvas");
buff.width = preCanvas.width;
buff.height = preCanvas.height;
const buffCtx = buff.getContext("2d");

// ################################## Shader ##################################
var computeNum = 0;

function initShader() {
  var frag = `
    #ifdef GL_ES
    precision highp float;
    #endif
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_slot1;
    uniform float u_slot2;
    uniform sampler2D u_tex0;
    uniform float noiseFactor;
    uniform float noiseDisplacement;
    uniform vec2 uv_offset;
    uniform float sampleScale;
    uniform float flowSpeed;
    uniform float u_saturation;
    #define uTexture u_tex0
    
    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      
      float snoise(vec2 v)
        {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
      // First corner
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
      
      // Other corners
        vec2 i1;
        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
        //i1.y = 1.0 - i1.x;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        // x0 = x0 - 0.0 + 0.0 * C.xx ;
        // x1 = x0 - i1 + 1.0 * C.xx ;
        // x2 = x0 - 1.0 + 2.0 * C.xx ;
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
      
      // Permutations
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
      
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
      
      // Gradients: 41 points uniformly over a line, mapped onto a diamond.
      // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
      
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
      
      // Normalise gradients implicitly by scaling m
      // Approximation of: m *= inversesqrt( a0*a0 + h*h );
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      
      // Compute final noise value at P
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return noiseFactor * dot(m, g);
      }
      
      float blendColorDodge(float base, float blend) {
          return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
      }
      
      vec3 blendColorDodge(vec3 base, vec3 blend) {
          return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
      }
      
      vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
          return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
      }
      
      
      vec3 brightnessContrast(in vec3 value, in float brightness,in float contrast)
      {
          value = ( value - 0.5 ) * contrast + 0.5 + brightness;
      
          return value;
      }
      
      vec3 czm_saturation(vec3 rgb, float adjustment)
      {
          const vec3 W = vec3(0.2125, 0.7154, 0.0721);
          vec3 intensity = vec3(dot(rgb, W));
          return mix(intensity, rgb, adjustment);
      }

      float gradientNoise(in vec2 uv)
      {
          const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
          return fract(magic.z * fract(dot(uv, magic.xy)));
      }
      
      void main() {
          vec2 st = gl_FragCoord.xy/u_resolution.xy;
          float s = snoise(vec2(st.x*1.,st.y*1.3+u_time*flowSpeed));
          
          // multiply the uv coord for 1 + the noise
          st*= vec2( 1.0 + s * (noiseDisplacement*u_slot1) );
          // apply page offset
          st.x += ( u_slot2 * 0.5 + 0.5 );
          // Web 一个 0.5
          // st.x += ( 0.5 );
          st += uv_offset;
          vec3 color = texture2D(uTexture,vec2(st.x*108./234.,st.y)/sampleScale).xyz;
          
          color.rgb = blendColorDodge(
              color.rgb,
              mix( vec3( 0.0, 0.0, 0.0 ),
                   vec3( 0.14, 0., 0.0),
                   0.
              )
          );
          
          // color.rgb = blendColorDodge(
          //     color.rgb,
          //     mix( vec3( 0.0, 0.0, 0.0 ),
          //          vec3(0.09, 0.08, 0.0),
          //          abs( sin( u_time ) )
          //     )
          // );
          
          color = czm_saturation(color,u_slot1*u_saturation);
          //brightness Effect
          color = brightnessContrast(color,-1.+u_slot1,1.);

          color += color *(10.5/255.0) * gradientNoise(gl_FragCoord.xy) - (10.5/255.0);
          
          // vec2 uv = gl_FragCoord.xy/u_resolution.xy;
          // uv.x += ( u_slot2 * 0.5);
          // vec3 tex = texture2D(uTexture,vec2(uv.x,uv.y)/1.).xyz;
          gl_FragColor = vec4(color ,1.0);
      }
    
    `;

  sandbox.load(frag);
  sandbox.setUniform("u_tex0", "imgs/cover-1.png");
  sandbox.setUniform("u_slot1", 1);
  sandbox.setUniform("u_slot2", 0);
  sandbox.setUniform("noiseDisplacement", 0.3);
  sandbox.setUniform("uv_offset", 0, 0);
  sandbox.setUniform("sampleScale", 1.25);
  sandbox.setUniform("flowSpeed", 0.25);
  sandbox.setUniform("u_saturation", 0.8);

}

// ################################## Image Blur ##################################

function drawBlur(val) {
  preCanvasCtx.drawImage(buff, 0, 0);
  StackBlur.canvasRGB(preCanvas, 0, 0, preCanvas.width, preCanvas.height, val);
  sandbox.setUniform("u_tex0", preCanvas.toDataURL());
}

// ################################## Dat GUI ##################################

const options = {
  blur: 75,
  noise_factor: 130,
  noise_displacement: 0.3,
  x_offset: 0,
  y_offset: 0,
  sample_scale: 1.25,
  flow_speed: 0.25,
  saturation: 0.8,
};

var chooseImage = {
  loadFile: function () {
    imageLoader.click();
  },
};

const gui = new dat.GUI({ autoPlace: true, width: 300 });
// gui.close();
gui0 = gui.add(options, "blur", 0, 150).step(1).name("blur");
gui1 = gui.add(options, "noise_factor", 0, 500).step(0.5).name("noise_factor");
gui2 = gui.add(options, "noise_displacement", 0, 1).step(0.01).name("noise_displacement");
gui3 = gui.add(options, "x_offset", -1, 1).step(0.01).name("x_offset");
gui4 = gui.add(options, "y_offset", -1, 1).step(0.01).name("y_offset");
gui5 = gui.add(options, "sample_scale", 0, 2).step(0.01).name("sample_scale");
gui6 = gui.add(options, "flow_speed", 0, 1).step(0.01).name("flow_speed");
gui7 = gui.add(options, "saturation", 0, 4).step(0.01).name("saturation");


var guiN = [gui0, gui1, gui2, gui3, gui4, gui5, gui6, gui7];

for (let i = 0; i < guiN.length; i++) {
  guiN[i].onChange(function (value) {
    updateEffect();
  });

  guiN[i].onFinishChange(function (value) {
    // Fires when a controller loses focus.
  });
}

const updateEffect = () => {
  drawBlur(options.blur);
  sandbox.setUniform("noiseFactor", options.noise_factor);
  sandbox.setUniform("noiseDisplacement", options.noise_displacement);
  sandbox.setUniform("uv_offset", options.x_offset, options.y_offset);
  sandbox.setUniform("sampleScale", options.sample_scale);
  sandbox.setUniform("flowSpeed", options.flow_speed);
  sandbox.setUniform("u_saturation", options.saturation);
};

// ################################## Click to Upload ##################################

preCanvas.onclick = function(event){
  imageLoader.click();
}

imageLoader.addEventListener("change", onClickUploaded, false);
var imgOnLoad = false;
var drawing = new Image();
var scaleRatio = 1;

window.addEventListener("load", drawDefault, true);

function getMeta(url) {
  var img = new Image();
  img.src = url;
  img.addEventListener("load", function () {
    alert(this.naturalWidth + " " + this.naturalHeight);
  });
}

function drawDefault() {
  imgOnLoad = false;
  sandbox.setUniform("u_tex0", "imgs/cover-1.png");
  uiCover.style.backgroundImage = "url(./imgs/cover-1.png)";

  var img = new Image();
  img.src = "./imgs/cover-1.png";
  img.onload = function () {
    buffCtx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height, // source rectangle
      0,
      0,
      buff.width,
      buff.height
    );
    drawBlur(100);
  };

  drawing.onload = function () {
    imgOnLoad = true;
  };
}

function onClickUploaded(e) {
  var reader = new FileReader();
  imgOnLoad = false;
  reader.onload = function (event) {
    drawing = new Image();
    drawing.onload = function () {
      buffCtx.drawImage(
        drawing,
        0,
        0,
        drawing.width,
        drawing.height, // source rectangle
        0,
        0,
        buff.width,
        buff.height
      );
      imgOnLoad = true;
      drawBlur(options.blur);
    };
    drawing.src = event.target.result;
    sandbox.setUniform("u_tex0", drawing.src);
    uiCover.style.backgroundImage = "url(" + drawing.src + ")";
  };
  reader.readAsDataURL(e.target.files[0]);
}

initShader();
updateEffect();