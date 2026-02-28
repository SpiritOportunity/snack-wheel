const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
const soundSelect = document.getElementById("soundSelect");
const muteBtn = document.getElementById("muteBtn");

const snacks = ["seaweed/sushi", "chocolate", "chips", "fruits", "yogurt", "cookie", "protein bar", "spin again"];
const colors = ["#7B0000","#A31515","#8B0000","#C0392B","#6E1010","#B22222","#96281B","#922B21"];
const numSegments = snacks.length;
const arc = (2 * Math.PI) / numSegments;
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = cx - 10;

let currentRotation = 0;
let animating = false;
let muted = false;
let lastTickIndex = -1;

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTick(style) {
  if (muted) return;
  const ac = getAudioCtx();
  const now = ac.currentTime;

  if (style === "drum") {
    const bufferSize = Math.floor(ac.sampleRate * 0.05);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    source.connect(g); g.connect(ac.destination);
    source.start(now);
    return;
  }

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain); gain.connect(ac.destination);

  if (style === "classic") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  } else if (style === "retro") {
    osc.type = "square";
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  } else if (style === "soft") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  }

  osc.start(now);
  osc.stop(now + 0.15);
}

function playWin(style) {
  if (muted) return;
  const ac = getAudioCtx();
  const now = ac.currentTime;

  const freqs = style === "soft" ? [440, 554, 659, 880] : [523, 659, 784, 1047];
  const type  = style === "retro" ? "square" : "sine";

  if (style === "drum") {
    [200, 280, 360, 480, 600].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      g.gain.setValueAtTime(0.3, now + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.25);
    });
    return;
  }

  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + i * 0.13);
    g.gain.setValueAtTime(0.25, now + i * 0.13);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.13 + 0.35);
    osc.start(now + i * 0.13); osc.stop(now + i * 0.13 + 0.4);
  });
}

function drawWheel(angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSegments; i++) {
    const startAngle = angle + i * arc;
    const endAngle = startAngle + arc;
    const centerAngle = startAngle + arc / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(centerAngle);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f0f0f0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(snacks[i], radius - 15, 5);
    ctx.restore();
  }

  const pinGrd = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 12);
  pinGrd.addColorStop(0, "#666");
  pinGrd.addColorStop(1, "#1a1a1a");
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
  ctx.fillStyle = pinGrd;
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

drawWheel(currentRotation);

spinBtn.addEventListener("click", () => {
  if (animating) return;
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();

  animating = true;
  result.textContent = "";
  spinBtn.disabled = true;
  lastTickIndex = -1;

  const spins = (4 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
  const extra = Math.random() * 2 * Math.PI;
  const totalRotation = spins + extra;
  const duration = 3500;
  const start = performance.now();
  const startAngle = currentRotation;
  const style = soundSelect.value;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    currentRotation = startAngle + totalRotation * ease;
    drawWheel(currentRotation);

    const pointerAngle = -Math.PI / 2;
    const rel = (pointerAngle - currentRotation % (2 * Math.PI) + 4 * Math.PI) % (2 * Math.PI);
    const tickIndex = Math.floor(rel / arc) % numSegments;
    if (tickIndex !== lastTickIndex) {
      playTick(style);
      lastTickIndex = tickIndex;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
      spinBtn.disabled = false;
      const finalRel = (pointerAngle - currentRotation) % (2 * Math.PI);
      const winningIndex = Math.floor(((finalRel + 2 * Math.PI) % (2 * Math.PI)) / arc);
      playWin(style);
      result.textContent = "🎉 You got: " + snacks[winningIndex] + "!";
      result.classList.remove("pop");
      void result.offsetWidth;
      result.classList.add("pop");
      launchConfetti();
    }
  }

  requestAnimationFrame(animate);
});

muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
});

// ── Confetti ─────────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const pieces = [];
  const colors = ["#c0392b","#e74c3c","#922B21","#f0f0f0","#7B0000","#ff6b6b","#fff","#A31515"];
  const count = 160;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      opacity: 1,
    });
  }

  let frame;
  let startTime = null;
  const duration = 3000;

  function draw(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.rotation += p.rotationSpeed;
      if (elapsed > duration * 0.6) p.opacity -= 0.012;
      if (p.opacity <= 0) continue;
      alive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive && elapsed < duration + 1000) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
      cancelAnimationFrame(frame);
    }
  }

  frame = requestAnimationFrame(draw);
}
