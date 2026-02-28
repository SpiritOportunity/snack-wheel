const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

const snacks = ["seaweed/sushi", "chocolate", "chips", " fruits", "yogurt", "cookie", "protein bar", "spin again"];
const colors = ["#B45253","#8C1007","#B12C00","#8A0000","#8A2D3B","#8C1007","#BF3131","#B82132"];
const numSegments = snacks.length;
const arc = (2 * Math.PI) / numSegments;
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = cx - 10;

let currentRotation = 0;
let animating = false;

function drawWheel(angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSegments; i++) {
    const startAngle = angle + i * arc;
    const endAngle = startAngle + arc;
    const centerAngle = startAngle + arc / 2;

    // 1. Draw the Slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Draw the Text (The Fix)
    ctx.save();
    ctx.translate(cx, cy); // Move to center
    ctx.rotate(centerAngle); // Rotate to the middle of the slice
    
    ctx.textAlign = "right"; // Align text to the outer edge
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px sans-serif";
    
    // Draw the text slightly inside the outer rim (radius - 15)
    ctx.fillText(snacks[i], radius - 15, 5); 
    ctx.restore();
  }

  // 3. Draw Center Pin
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
  ctx.fillStyle = "#333";
  ctx.fill();
}

// Initial Render
drawWheel(currentRotation);

spinBtn.addEventListener("click", () => {
  if (animating) return;
  animating = true;
  result.textContent = "";

  const spins = (4 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
  const extra = Math.random() * 2 * Math.PI;
  const totalRotation = spins + extra;
  const duration = 3000;
  const start = performance.now();
  const startAngle = currentRotation;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth deceleration
    const ease = 1 - Math.pow(1 - progress, 3);
    
    currentRotation = startAngle + totalRotation * ease;
    drawWheel(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
      
      // Calculate winner based on the TOP pointer (-90 degrees)
      const pointerAngle = -Math.PI / 2;
      const relativeRotation = (pointerAngle - currentRotation) % (2 * Math.PI);
      const winningIndex = Math.floor(((relativeRotation + 2 * Math.PI) % (2 * Math.PI)) / arc);
      
      result.textContent = `You got: ${snacks[winningIndex]}!`;
    }
  }

  requestAnimationFrame(animate);
});
