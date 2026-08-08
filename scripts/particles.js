/**
 * WORMHOLE Gravitational Singularity & Accretion Engine
 * High-performance 60 FPS relativistic lensing, celestial accretion rings, and cursor gravitational pull.
 */

class WormholeVortex {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.targetX = 0;
    this.targetY = 0;
    
    // Physics & Particles
    this.particles = [];
    this.numParticles = 160;
    this.rings = 6;
    this.rotation = 0;
    this.warpFactor = 1.0;
    this.targetWarp = 1.0;
    this.ripples = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Mouse pointer gravitational attraction
    window.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      ) {
        this.targetX = e.clientX - rect.left;
        this.targetY = e.clientY - rect.top;
      } else {
        this.targetX = this.width / 2;
        this.targetY = this.height / 2;
      }
    });

    this.buildParticles();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = this.canvas.width = parent ? parent.offsetWidth : window.innerWidth;
    this.height = this.canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.targetX = this.centerX;
    this.targetY = this.centerY;
  }

  buildParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * (Math.min(this.width, this.height) * 0.48);
      const speed = (0.003 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1);
      const size = 1 + Math.random() * 1.8;
      const hue = Math.random() > 0.4 ? 240 : 270; // Indigo / Violet
      this.particles.push({
        angle,
        distance,
        baseDistance: distance,
        speed,
        size,
        alpha: 0.2 + Math.random() * 0.6,
        hue,
      });
    }
  }

  triggerWarp() {
    this.targetWarp = 4.0;
    this.ripples.push({
      radius: 10,
      maxRadius: Math.max(this.width, this.height) * 0.7,
      alpha: 0.8,
    });
    setTimeout(() => {
      this.targetWarp = 1.0;
    }, 450);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Inertial center smoothing
    this.centerX += (this.targetX - this.centerX) * 0.05;
    this.centerY += (this.targetY - this.centerY) * 0.05;
    this.warpFactor += (this.targetWarp - this.warpFactor) * 0.06;
    this.rotation += 0.002 * this.warpFactor;

    // Fade trail
    this.ctx.fillStyle = "rgba(8, 8, 10, 0.22)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render Relativistic Accretion Rings
    for (let r = 1; r <= this.rings; r++) {
      const radius = (r / this.rings) * (Math.min(this.width, this.height) * 0.45);
      this.ctx.beginPath();
      this.ctx.ellipse(
        this.centerX,
        this.centerY,
        radius * this.warpFactor,
        radius * 0.42 * this.warpFactor,
        this.rotation * 0.5,
        0,
        Math.PI * 2
      );
      this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.03 + (r / this.rings) * 0.08})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Render Ripples from Spacetime Jumps
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += 12 * this.warpFactor;
      rip.alpha -= 0.02;

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.ellipse(
        this.centerX,
        this.centerY,
        rip.radius,
        rip.radius * 0.45,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.strokeStyle = `rgba(139, 92, 246, ${rip.alpha * 0.5})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Render Swarm Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.angle += p.speed * this.warpFactor;

      const currentDist = p.distance * (1 + (this.warpFactor - 1) * 0.3);
      const x = this.centerX + Math.cos(p.angle) * currentDist;
      const y = this.centerY + Math.sin(p.angle) * (currentDist * 0.42);

      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha})`;
      this.ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Central Singularity Glow
    const gradient = this.ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      0,
      this.centerX,
      this.centerY,
      50 * this.warpFactor
    );
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.25)");
    gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.08)");
    gradient.addColorStop(1, "transparent");

    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 50 * this.warpFactor, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }
}

window.WormholeVortex = WormholeVortex;
