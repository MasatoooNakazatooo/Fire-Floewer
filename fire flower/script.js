const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fireworks = [];
const particles = [];

class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = canvas.height;
    this.targetY = y;
    this.speed = 3;
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
    this.exploded = false;
    this.atTop = false;
    this.timer = 0; // 頂点に到達してからのカウント

    const launchSound = document.getElementById('launch-sound');
    if (launchSound) {
      launchSound.currentTime = 0;
      launchSound.play().catch(() => {});
    }
  }

  update() {
    if (!this.exploded && !this.atTop) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.y = this.targetY;
        this.atTop = true;
      }
    } else if (this.atTop && !this.exploded) {
      this.timer++;
      if (this.timer > 60) {
        // 1秒（60フレーム）経過しても爆発しなければ削除対象に
        this.exploded = true;
      }
    }
  }

  explode() {
    if (this.exploded) return;
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(this.x, this.y, this.color));
    }

    const explosionSound = document.getElementById('explosion-sound');
    if (explosionSound) {
      explosionSound.currentTime = 0;
      explosionSound.play().catch(() => {});
    }

    this.exploded = true;
  }

  draw() {
    if (!this.exploded) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, 3, 3);
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 5 + 1;
    this.dx = Math.cos(angle) * speed;
    this.dy = Math.sin(angle) * speed;
    this.life = 100;
    this.color = color;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.dy += 0.05;
    this.life--;
  }

  draw() {
    ctx.globalAlpha = this.life / 100;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 3, 3);
    ctx.globalAlpha = 1;
  }
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw();
    if (fireworks[i].exploded) fireworks.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

setInterval(() => {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height / 2;
  fireworks.push(new Firework(x, y));
}, 800);

// 近くの花火を爆発させる（ホバーまたはタップ・クリック）
function explodeNearbyFireworks(x, y) {
  for (let firework of fireworks) {
    const dx = firework.x - x;
    const dy = firework.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 30 && !firework.exploded) {
      firework.explode();
    }
  }
}

// マウス移動で爆発
canvas.addEventListener('mousemove', (e) => {
  explodeNearbyFireworks(e.clientX, e.clientY);
});

// タップまたはクリックで爆発
canvas.addEventListener('click', (e) => {
  explodeNearbyFireworks(e.clientX, e.clientY);
});
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    explodeNearbyFireworks(e.touches[0].clientX, e.touches[0].clientY);
  }
});

animate();
