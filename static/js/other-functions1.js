//customize mouse cursor
(function () {
    let cursor = document.querySelector('.cursor');
    let width = 60;
    let height = 60;
    cursor.style.width = width + 'px';
    cursor.style.height = height + 'px';
    function moveCursor(event) {
      cursor.style.left = event.clientX - width / 2 + 'px';
      cursor.style.top = event.clientY - height / 2 + 'px';
    }
    function mouseDown(event) {
      cursor.style.backgroundColor = "rgba(80, 80, 80, 0.28)";
      cursor.style.transform = "scale(0.9,0.9)";
    }
    function mouseUp() {
      cursor.style.backgroundColor = "rgba(80, 80, 80, 0.15)";
      cursor.style.transform = "scale(1,1)";
    }
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);
  })();


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

