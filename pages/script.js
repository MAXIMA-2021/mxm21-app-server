let click1 = 0;
let click2 = 0;

document.getElementById("tombol-hiu").addEventListener("click", (event) => {
  const sharkImages = document.querySelectorAll('img[alt="shark"]');
  click1++;

  if (click1 === 8) {
    for (let i = 0; i <= sharkImages.length; i++) {
      sharkImages[i].style.display = "block";
    }
  }
});

document.getElementById("tombol-credit").addEventListener("click", (event) => {
  click2++;

  if (click2 % 8 == 0) {
    var op = 0.1;
    document.getElementById("show").style.display = "flex";
    var timer = setInterval(function () {
      if (op >= 0.9) {
        clearInterval(timer);
      }
      document.getElementById("show").style.opacity = op;
      document.getElementById("show").style.filter =
        "alpha(opacity=" + op * 100 + ")";
      op += op * 0.1;
    }, 50);
  }
});

document.getElementById("close").addEventListener("click", (event) => {
  var op = 0.9;
  var timer = setInterval(function () {
    if (op <= 0.1) {
      clearInterval(timer);
      document.getElementById("show").style.display = "none";
    }
    document.getElementById("show").style.opacity = op;
    document.getElementById("show").style.filter =
      "alpha(opacity=" + op * 100 + ")";
    op -= op * 0.1;
  }, 50);
});
