// JsSnake.js - የጨዋታው ሙሉ አእምሮ (Logic)

const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let speed = 100;
let d;
let playGame; // መጀመሪያውኑ እዚህ መታወቁ አስፈላጊ ነው

let snake = [
  {
    x: Math.floor(Math.random() * columns) * scale,
    y: Math.floor(Math.random() * rows) * scale,
  },
];

function spawnFood() {
  return {
    x: Math.floor(Math.random() * columns) * scale,
    y: Math.floor(Math.random() * rows) * scale,
  };
}

let food = spawnFood();

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x == array[i].x && head.y == array[i].y) return true;
  }
  return false;
}

// --- ሪፍሬሽን የሚከለክል የተስተካከለ Reset ---
function resetGame() {
  // 1. መጀመሪያ ኢንተርቫሉን በሃይል አቁም
  clearInterval(playGame);
  playGame = null;

  score = 0;
  speed = 100;
  d = undefined;

  const scoreBoard = document.getElementById("scoreBoard");
  if (scoreBoard) scoreBoard.innerHTML = `Result: 0 | High Score: ${highScore}`;

  snake = [
    {
      x: Math.floor(Math.random() * columns) * scale,
      y: Math.floor(Math.random() * rows) * scale,
    },
  ];

  food = spawnFood();

  const footerName = document.querySelector(".footer-name");
  if (footerName) {
    footerName.style.animation = "none";
    void footerName.offsetWidth;
    footerName.style.animation = "fadeInFooter 2s ease-in";
  }

  // 2. ድጋሚ አስጀምር
  playGame = setInterval(draw, speed);
}

document.addEventListener("keydown", (event) => {
  let key = event.keyCode;
  if (key == 37 && d != "right") d = "left";
  else if (key == 38 && d != "down") d = "up";
  else if (key == 39 && d != "left") d = "right";
  else if (key == 40 && d != "up") d = "down";
});

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      ctx.fillStyle = "#74aa85";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00d0ff";
      ctx.beginPath();
      ctx.roundRect(snake[i].x, snake[i].y, scale, scale, 5);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.shadowBlur = 0;
      let offset = d === "right" || d === "down" ? 12 : 4;
      if (d === "up" || d === "down") {
        ctx.fillRect(snake[i].x + 4, snake[i].y + offset, 4, 4);
        ctx.fillRect(snake[i].x + 12, snake[i].y + offset, 4, 4);
      } else {
        ctx.fillRect(snake[i].x + offset, snake[i].y + 4, 4, 4);
        ctx.fillRect(snake[i].x + offset, snake[i].y + 12, 4, 4);
      }
    } else {
      ctx.fillStyle = `rgba(0, 255, 0, ${1 - i / snake.length})`;
      ctx.beginPath();
      ctx.arc(
        snake[i].x + scale / 2,
        snake[i].y + scale / 2,
        scale / 2 - 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.fillStyle = "#FF3131";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "red";
  ctx.beginPath();
  let pulse = Math.sin(Date.now() / 150) * 3;
  ctx.arc(
    food.x + scale / 2,
    food.y + scale / 2,
    scale / 2 - 3 + pulse,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (d == "left") snakeX -= scale;
  if (d == "up") snakeY -= scale;
  if (d == "right") snakeX += scale;
  if (d == "down") snakeY += scale;

  if (snakeX == food.x && snakeY == food.y) {
    score++;
    if (speed > 40) {
      clearInterval(playGame);
      speed -= 2;
      playGame = setInterval(draw, speed);
    }
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }
    document.getElementById("scoreBoard").innerHTML =
      `Result: ${score} | High Score: ${highScore}`;
    food = spawnFood();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // --- GAME OVER LOGIC ---
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    // 1. መጀመሪያ ድርጊቱን አቁም
    clearInterval(playGame);

    // 2. ሜሴጁን ሳል
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 24px 'Segoe UI', Arial";
    ctx.fillStyle = "#00d2ff";
    ctx.textAlign = "center";
    ctx.fillText(
      "LEGEND!👑 RESTARTING...",
      canvas.width / 2,
      canvas.height / 2,
    );

    // 3. ከ 3 ሰከንድ በኋላ ResetGame ጥራ (Reload ሳይሆን)
    setTimeout(() => {
      resetGame();
    }, 3000);
    return; // ይሄኛው ድራው እንዳይቀጥል ያቆመዋል
  }
  snake.unshift(newHead);
}

// መጀመሪያ ሲከፈት
playGame = setInterval(draw, speed);

// --- የሞባይል ንክኪ እና ሪፍሬሽ መከላከያ ---
window.addEventListener(
  "touchstart",
  (e) => {
    if (
      e.target.tagName === "CANVAS" ||
      e.target.classList.contains("control-btn")
    ) {
      e.preventDefault();
    }
  },
  { passive: false },
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.tagName === "CANVAS") e.preventDefault();
  },
  { passive: false },
);

function handleButtonClick(direction) {
  if (direction === "left" && d !== "right") d = "left";
  else if (direction === "up" && d !== "down") d = "up";
  else if (direction === "right" && d !== "left") d = "right";
  else if (direction === "down" && d !== "up") d = "down";
}
