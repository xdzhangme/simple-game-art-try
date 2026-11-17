const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function frame() {
  ctx.fillStyle = '#333c57';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f4f4f4';
  ctx.font = '16px monospace';
  ctx.fillText('Pixel Office', 100, 124);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
