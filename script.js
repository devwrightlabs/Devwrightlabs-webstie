const quickNav = document.getElementById("quickNav");

if (quickNav) {
  const allowedTargets = new Set(
    Array.from(quickNav.options)
      .map((option) => option.value)
      .filter(Boolean),
  );

  quickNav.addEventListener("change", (event) => {
    const target = event.target.value;

    if (!target || !allowedTargets.has(target)) {
      return;
    }

    if (target.startsWith("#")) {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = target;
    }
  });
}

const canvas = document.getElementById("networkCanvas");

if (canvas) {
  const context = canvas.getContext("2d");
  const points = [];
  const links = [];
  const pointCount = 28;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  for (let i = 0; i < pointCount; i += 1) {
    points.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * 420,
      z: Math.random() * 1,
      speedX: (Math.random() - 0.5) * 0.7,
      speedY: (Math.random() - 0.5) * 0.5,
    });
  }

  for (let i = 0; i < pointCount; i += 1) {
    for (let j = i + 1; j < pointCount; j += 1) {
      if (Math.random() > 0.86) {
        links.push([i, j]);
      }
    }
  }

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "rgba(102, 252, 180, 0.22)";
    context.lineWidth = 1;

    links.forEach(([a, b]) => {
      const pointA = points[a];
      const pointB = points[b];
      context.beginPath();
      context.moveTo(pointA.x, pointA.y);
      context.lineTo(pointB.x, pointB.y);
      context.stroke();
    });

    points.forEach((point) => {
      point.x += point.speedX;
      point.y += point.speedY;

      if (point.x < 0 || point.x > canvas.width) {
        point.speedX *= -1;
      }

      if (point.y < 0 || point.y > canvas.height * 0.75) {
        point.speedY *= -1;
      }

      context.beginPath();
      context.fillStyle = "rgba(151, 255, 206, 0.95)";
      context.arc(point.x, point.y, 2 + point.z * 2.2, 0, Math.PI * 2);
      context.fill();
    });

    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
}
