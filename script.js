const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");

let rotation = 0;

spinBtn.addEventListener("click", () => {
  // spin 3–6 times plus a random angle
  const extra = Math.floor(Math.random() * 360);
  const spins = 3 + Math.floor(Math.random() * 3); 
  rotation += spins * 360 + extra;

  wheel.style.transform = rotate(${rotation}deg);
});
