const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

const snacks = [
  "Popcorn",
  "Fruit bowl",
  "Cookies",
  "Chips",
  "Ice cream",
  "Makhana",
  "Chocolate",
  "Trail mix"
];

let rotation = 0;

spinBtn.addEventListener("click", () => {
  const extra = Math.floor(Math.random() * 360);
  const spins = 3 + Math.floor(Math.random() * 3); // 3..5 full spins
  rotation += spins * 360 + extra;

  wheel.style.transform = rotate(${rotation}deg);

  const pick = snacks[Math.floor(Math.random() * snacks.length)];
  result.textContent = Chosen snack: ${pick} 🍽️;
});
