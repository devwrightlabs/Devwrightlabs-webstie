/* ============================================================
   DevWright Labs — Interactions
   Stack: Three.js (fixed background scene)
          GSAP + ScrollTrigger (scroll scrub, parallax)
   ============================================================ */

(() => {
  "use strict";

  /* -----------------------------------------------------------
     Footer year
     ----------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -----------------------------------------------------------
     Quick-jump dropdown — bypasses scroll pacing for instant nav
     ----------------------------------------------------------- */
  const jumpMenu = document.getElementById("jumpMenu");
  if (jumpMenu) {
    const allowed = new Set(
      Array.from(jumpMenu.options).map((o) => o.value).filter(Boolean),
    );
    jumpMenu.addEventListener("change", (event) => {
      const target = event.target.value;
      if (!target || !allowed.has(target)) return;
      if (target.startsWith("#")) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.href = target;
      }
      // reset to placeholder so the same option can be re-selected
      jumpMenu.selectedIndex = 0;
    });
  }

  /* -----------------------------------------------------------
     Three.js — fixed glowing cross-chain network background
     ----------------------------------------------------------- */
  const canvas = document.getElementById("bgCanvas");
  const hasThree = typeof window.THREE !== "undefined";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let scene, camera, renderer, networkGroup;
  let nodes = []; // { mesh, basePos, pulseOffset }
  let lines = []; // THREE.Line objects
  let scrollProgress = 0; // 0..1, drives forward/reverse animation
  let targetProgress = 0;

  function initThreeScene() {
    if (!hasThree || !canvas) return false;

    const THREE = window.THREE;

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // ---- Build nodes on a sphere shell (cross-chain network metaphor)
    const NODE_COUNT = 36;
    const radius = 3.4;
    const nodeGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x0fa866 });

    for (let i = 0; i < NODE_COUNT; i += 1) {
      // Fibonacci sphere distribution for even coverage
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
      mesh.position.set(x, y, z);
      networkGroup.add(mesh);
      nodes.push({
        mesh,
        basePos: new THREE.Vector3(x, y, z),
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // ---- Build connecting links between near-neighbors
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x14c87a,
      transparent: true,
      opacity: 0.35,
    });
    const maxDist = 2.6;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const d = nodes[i].basePos.distanceTo(nodes[j].basePos);
        if (d < maxDist) {
          const geom = new THREE.BufferGeometry().setFromPoints([
            nodes[i].basePos.clone(),
            nodes[j].basePos.clone(),
          ]);
          const line = new THREE.Line(geom, lineMat.clone());
          line.userData = { a: i, b: j };
          networkGroup.add(line);
          lines.push(line);
        }
      }
    }

    // ---- Soft inner glow (additive sprite via large faint sphere)
    const glowGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x5be3a6,
      transparent: true,
      opacity: 0.12,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    networkGroup.add(glow);

    resize();
    return true;
  }

  function resize() {
    if (!renderer || !canvas) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* -----------------------------------------------------------
     Scroll-driven animation loop
     ----------------------------------------------------------- */
  let rafId = null;
  function animate(t) {
    rafId = requestAnimationFrame(animate);
    if (!renderer || !scene || !camera) return;

    // Smooth-damp toward the latest target scroll progress. A small factor
    // (0.08) yields a soft, low-pass-filtered response so the 3D scene never
    // jitters when the scroll wheel fires bursts of events.
    scrollProgress += (targetProgress - scrollProgress) * 0.08;

    const time = t * 0.0005;

    // Forward when scrolling down (progress increases) — implicit because
    // rotations are a function of scrollProgress. When the user scrolls up,
    // scrollProgress decreases and the scene reverses naturally.
    if (networkGroup) {
      networkGroup.rotation.y = scrollProgress * Math.PI * 2 + time * 0.05;
      networkGroup.rotation.x = scrollProgress * Math.PI * 0.6 - 0.15;

      // Subtle node pulse (independent of scroll for ambient life)
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        const pulse = 1 + Math.sin(time * 2 + n.pulseOffset) * 0.15;
        n.mesh.scale.setScalar(pulse);
      }
    }

    // Camera dolly tied to scroll for parallax depth
    camera.position.z = 8 - scrollProgress * 1.6;

    renderer.render(scene, camera);
  }

  /* -----------------------------------------------------------
     GSAP / ScrollTrigger bindings
       · Scrub the 3D scene to the page scroll (40% slower pacing)
       · Parallax on header + section headings
     ----------------------------------------------------------- */
  function initScrollTriggers() {
    const hasGsap = typeof window.gsap !== "undefined";
    const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
    if (!hasGsap) return;

    const gsap = window.gsap;
    if (hasST) gsap.registerPlugin(window.ScrollTrigger);

    // 40% slower scrub: a standard ~1.0s scrub becomes 1.0 * 1.4 = 1.4s,
    // making the scroll-driven animations feel deliberate, not rushed.
    const SCRUB = 1.4;

    if (hasST) {
      // Drive the 3D scene from the full page scroll
      window.ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB,
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
      });

      // Parallax for sticky header (subtle vertical drift)
      gsap.utils.toArray("[data-parallax-header]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: -6,
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "bottom bottom",
              scrub: SCRUB,
            },
          },
        );
      });

      // Parallax on each section heading / hero copy
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        const intensity = parseFloat(el.dataset.parallax) || 0.15;
        gsap.fromTo(
          el,
          { y: 60 * intensity * 2, opacity: 0.0 },
          {
            y: -60 * intensity * 2,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: SCRUB,
            },
          },
        );
      });
    }
  }

  /* -----------------------------------------------------------
     Testimonials carousel
     ----------------------------------------------------------- */
  function initCarousel() {
    const carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = Array.from(track.children);
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const dotsHost = carousel.querySelector("[data-carousel-dots]");

    let index = 0;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      dot.addEventListener("click", () => go(i));
      dotsHost.appendChild(dot);
    });

    function render() {
      slides.forEach((s, i) => {
        s.style.transform = `translateX(${-index * 100}%)`;
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      Array.from(dotsHost.children).forEach((d, i) => {
        if (i === index) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }

    function go(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    prev?.addEventListener("click", () => go(index - 1));
    next?.addEventListener("click", () => go(index + 1));

    // Auto-advance, paused on hover
    let timer = window.setInterval(() => go(index + 1), 7000);
    carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
    carousel.addEventListener("mouseleave", () => {
      timer = window.setInterval(() => go(index + 1), 7000);
    });

    render();
  }

  /* -----------------------------------------------------------
     Contact form (client-side validation + status feedback)
     Replace the submit handler with your backend / Formspree etc.
     ----------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("error");
      status.textContent = "";

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail || !message) {
        status.classList.add("error");
        status.textContent = "Please complete name, a valid email, and a message.";
        return;
      }

      // TODO: wire to backend — e.g. fetch('/api/contact', { method: 'POST', body: data })
      status.textContent = "Thanks — your message is queued. We'll respond within one business day.";
      form.reset();
    });
  }

  /* -----------------------------------------------------------
     Boot
     ----------------------------------------------------------- */
  function boot() {
    const ok = initThreeScene();
    if (ok && !prefersReduced) {
      rafId = requestAnimationFrame(animate);
      window.addEventListener("resize", resize);
    } else if (ok) {
      // Render a single frame for non-animated background
      renderer.render(scene, camera);
    }

    initScrollTriggers();
    initCarousel();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
