/**
 * WORMHOLE Particle Canvas Engine
 * High-performance 60 FPS interactive gravitational singularity and accretion disk.
 */

class WormholeVortex {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.numParticles = window.innerWidth < 768 ? 160 : 320;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.targetCenterX = 0;
    this.targetCenterY = 0;
    this.warpSpeed = 1.0;
    this.targetWarpSpeed = 1.0;
    this.animationFrame = null;
    this.isHovering = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Interactive mouse gravitation
    window.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      ) {
        this.targetCenterX = e.clientX - rect.left;
        this.targetCenterY = e.clientY - rect.top;
        this.isHovering = true;
      } else {
        this.isHovering = false;
        this.targetCenterX = this.width / 2;
        this.targetCenterY = this.height / 2;
      }
    });

    this.createParticles();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = this.canvas.width = parent ? parent.offsetWidth : window.innerWidth;
    this.height = this.canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.targetCenterX = this.centerX;
    this.targetCenterY = this.centerY;
  }

  createParticles() {
    this.particles = [];
    const colors = ["#00F0FF", "#9D00FF", "#00FF9D", "#7928CA", "#FFFFFF"];

    for (let i = 0; i < this.numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.max(this.width, this.height) * 0.7 + 30;
      const speed = (0.003 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1);
      const size = Math.random() * 2 + 0.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const radialSpeed = 0.2 + Math.random() * 0.5;

      this.particles.push({
        angle,
        radius,
        baseRadius: radius,
        speed,
        radialSpeed,
        size,
        color,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
  }

  triggerWarp() {
    this.targetWarpSpeed = 4.5;
    setTimeout(() => {
      this.targetWarpSpeed = 1.0;
    }, 450);
  }

  animate() {
    this.animationFrame = requestAnimationFrame(() => this.animate());

    // Smooth camera / center interpolation
    this.centerX += (this.targetCenterX - this.centerX) * 0.05;
    this.centerY += (this.targetCenterY - this.centerY) * 0.05;
    this.warpSpeed += (this.targetWarpSpeed - this.warpSpeed) * 0.1;

    // Fade trail effect for cosmic motion blur
    this.ctx.fillStyle = "rgba(5, 7, 13, 0.22)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Singularity glow in the center
    const gradient = this.ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      10,
      this.centerX,
      this.centerY,
      260
    );
    gradient.addColorStop(0, "rgba(0, 240, 255, 0.18)");
    gradient.addColorStop(0.3, "rgba(157, 0, 255, 0.08)");
    gradient.addColorStop(1, "rgba(5, 7, 13, 0)");
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 260, 0, Math.PI * 2);
    this.ctx.fill();

    // Render & update accretion particles
    for (let p of this.particles) {
      p.angle += p.speed * this.warpSpeed;
      p.radius -= p.radialSpeed * this.warpSpeed;

      // When sucked into singularity, regenerate on outer perimeter
      if (p.radius < 18) {
        p.radius = Math.max(this.width, this.height) * 0.65 + Math.random() * 100;
        p.angle = Math.random() * Math.PI * 2;
      }

      const x = this.centerX + Math.cos(p.angle) * p.radius;
      const y = this.centerY + Math.sin(p.angle) * (p.radius * 0.62); // 3D tilt perspective

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha * (p.radius / (Math.max(this.width, this.height) * 0.5));
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;

      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size * (this.warpSpeed > 2 ? 1.5 : 1), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}

window.WormholeVortex = WormholeVortex;
