/**
 * WORMHOLE Gravitational Spacetime Mesh Engine
 * Minimalist, elegant 60 FPS geometric wireframe and singularity accretion mesh.
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
    this.gridPoints = [];
    this.numRings = 16;
    this.pointsPerRing = 32;
    this.rotation = 0;
    this.warpFactor = 1.0;
    this.targetWarp = 1.0;
    this.isHovering = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Interactive pointer gravitation
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
        this.isHovering = true;
      } else {
        this.isHovering = false;
        this.targetX = this.width / 2;
        this.targetY = this.height / 2;
      }
    });

    this.buildMesh();
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

  buildMesh() {
    this.gridPoints = [];
    const maxRadius = Math.max(this.width, this.height) * 0.65;

    for (let r = 1; r <= this.numRings; r++) {
      // Exponential spacing for realistic gravitational depth
      const radius = Math.pow(r / this.numRings, 1.6) * maxRadius + 20;
      const ring = [];
      for (let i = 0; i < this.pointsPerRing; i++) {
        const baseAngle = (i / this.pointsPerRing) * Math.PI * 2;
        ring.push({
          baseAngle,
          radius,
          baseRadius: radius,
          phase: Math.random() * Math.PI * 2,
        });
      }
      this.gridPoints.push(ring);
    }
  }

  triggerWarp() {
    this.targetWarp = 3.2;
    setTimeout(() => {
      this.targetWarp = 1.0;
    }, 380);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Inertial camera interpolation
    this.centerX += (this.targetX - this.centerX) * 0.06;
    this.centerY += (this.targetY - this.centerY) * 0.06;
    this.warpFactor += (this.targetWarp - this.warpFactor) * 0.08;
    this.rotation += 0.0018 * this.warpFactor;

    // Clear with subtle fade trail
    this.ctx.fillStyle = "rgba(8, 8, 10, 0.28)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render wireframe concentric rings
    for (let r = 0; r < this.gridPoints.length; r++) {
      const ring = this.gridPoints[r];
      const ringProgress = r / this.gridPoints.length;
      
      this.ctx.beginPath();
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i];
        const angle = p.baseAngle + this.rotation * (1 + (1 - ringProgress) * 0.8);
        
        // 3D perspective distortion
        const x = this.centerX + Math.cos(angle) * p.radius;
        const y = this.centerY + Math.sin(angle) * (p.radius * 0.45);

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();

      // Subtle hairline stroke with distance attenuation
      this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.04 + ringProgress * 0.12})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Render nodal junction points
      for (let i = 0; i < ring.length; i += 2) {
        const p = ring[i];
        const angle = p.baseAngle + this.rotation * (1 + (1 - ringProgress) * 0.8);
        const x = this.centerX + Math.cos(angle) * p.radius;
        const y = this.centerY + Math.sin(angle) * (p.radius * 0.45);

        this.ctx.fillStyle = r === this.numRings - 1 ? "rgba(255, 255, 255, 0.4)" : "rgba(139, 92, 246, 0.35)";
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Connect radial warp lines across rings
    for (let i = 0; i < this.pointsPerRing; i += 4) {
      this.ctx.beginPath();
      for (let r = 0; r < this.gridPoints.length; r++) {
        const p = this.gridPoints[r][i];
        const ringProgress = r / this.gridPoints.length;
        const angle = p.baseAngle + this.rotation * (1 + (1 - ringProgress) * 0.8);
        const x = this.centerX + Math.cos(angle) * p.radius;
        const y = this.centerY + Math.sin(angle) * (p.radius * 0.45);

        if (r === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
}

window.WormholeVortex = WormholeVortex;
