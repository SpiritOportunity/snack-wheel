const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

const snacks = ["🍕 Pizza", "🍫 Choc", "🍿 Popcorn", "🍎 Apple", "🧀 Cheese", "🍪 Cookie", "🥨 Pretzel", "🍇 Grapes"];
const colors = ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff"];
const numSegments = snacks.length;
const arc = (2 * Math.PI) / numSegments;
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = cx - 5;

let currentAngle = 0;

function drawWheel(angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < numSegments; i++) {
    const start = angle + i * arc;
    const end = start + arc;

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#333";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(snacks[i], radius - 8, 4);
    ctx.restore();
  }

  // Outer border
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 10;
  ctx.stroke();
}

drawWheel(0);

let rotation = 0;
let animating = false;

spinBtn.addEventListener("click", () => {
  if (animating) return;
  animating = true;
  result.textContent = "";

  const extra = Math.random() * 2 * Math.PI;
  const spins = (3 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
  const totalRotation = spins + extra;
  const duration = 3000;
  const start = performance.now();
  const startAngle = rotation;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    currentAngle = startAngle + totalRotation * ease;
    drawWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation = currentAngle;
      animating = false;
      const normalized = (2 * Math.PI - (rotation % (2 * Math.PI))) % (2 * Math.PI);
      const index = Math.floor(normalized / arc) % numSegments;
      result.textContent = `You got: ${snacks[index]}!`;
    }
  }

  requestAnimationFrame(animate);
});
