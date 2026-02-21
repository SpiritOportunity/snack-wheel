const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
let rotation = 0;

const snacks = ["🍕 Pizza", "🍫 Chocolate", "🍿 Popcorn", "🍎 Apple", "🧀 Cheese", "🍪 Cookie", "🥨 Pretzel", "🍇 Grapes"];
const segmentSize = 360 / snacks.length;

spinBtn.addEventListener("click", () => {
  const extra = Math.floor(Math.random() * 360);
  const spins = 3 + Math.floor(Math.random() * 3);
  rotation += spins * 360 + extra;
  wheel.style.transform = `rotate(${rotation}deg)`;

  wheel.addEventListener("transitionend", () => {
    const normalized = ((360 - (rotation % 360)) + 90) % 360;
    const index = Math.floor(normalized / segmentSize) % snacks.length;
    result.textContent = `You got: ${snacks[index]}!`;
  }, { once: true });
});
