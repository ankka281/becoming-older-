document.addEventListener("DOMContentLoaded", () => {
  // Nav
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  });

  navToggle?.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );

  // Study tabs (interactive research)
  const tabs = document.querySelectorAll(".study-tab");
  const panels = document.querySelectorAll(".study-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.panel;
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`panel-${id}`)?.classList.add("active");
    });
  });

  // Waveform bars
  const waveform = document.getElementById("waveform");
  if (waveform) {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.style.animationDelay = `${(i % 5) * 0.12}s`;
      waveform.appendChild(s);
    }
  }

  // Audio
  const audio = new Audio();
  // audio.src = "podcast.mp3";

  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  let isPlaying = false;

  function fmt(sec) {
    if (!isFinite(sec)) return "—:—";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function toggle() {
    if (!audio.src) {
      alert("Add podcast.mp3 to the repo and uncomment audio.src in script.js");
      return;
    }
    if (isPlaying) {
      audio.pause();
      playBtn.textContent = "Play";
      playIcon.textContent = "▶";
    } else {
      audio.play();
      playBtn.textContent = "Pause";
      playIcon.textContent = "❚❚";
    }
    isPlaying = !isPlaying;
  }

  playBtn?.addEventListener("click", toggle);
  document.getElementById("playerArtwork")?.addEventListener("click", toggle);

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = fmt(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    progressFill.style.width = `${(audio.currentTime / audio.duration) * 100 || 0}%`;
    currentTimeEl.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener("ended", () => {
    isPlaying = false;
    playBtn.textContent = "Play";
    playIcon.textContent = "▶";
    progressFill.style.width = "0%";
  });

  progressBar?.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  document.getElementById("rewindBtn")?.addEventListener("click", () => {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  });
  document.getElementById("forwardBtn")?.addEventListener("click", () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
  });

  // Capsule chips
  const toInput = document.getElementById("capsuleTo");
  document.querySelectorAll("#toChips .chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#toChips .chip-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      toInput.value = btn.dataset.v;
    });
  });

  // Capsule storage
  const KEY = "growing-older-capsule";
  const form = document.getElementById("capsuleForm");
  const list = document.getElementById("messagesList");
  const msgInput = document.getElementById("capsuleMessage");
  const charCount = document.getElementById("charCount");

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }
  function save(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function label(v) {
    return (
      {
        "future-self": "Future self",
        younger: "Someone younger",
        older: "Someone older",
        community: "Community",
      }[v] || v
    );
  }
  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function render() {
    const msgs = load();
    if (!msgs.length) {
      list.innerHTML = `<p class="empty">None yet.</p>`;
      return;
    }
    list.innerHTML = msgs
      .map(
        (m) => `
      <div class="msg">
        <div class="meta">${m.name || "Anonymous"} · ${label(m.to)} · ${m.date}</div>
        <div>${esc(m.text)}</div>
      </div>`
      )
      .join("");
  }

  msgInput?.addEventListener("input", () => {
    charCount.textContent = msgInput.value.length;
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text) return;
    const msgs = load();
    msgs.unshift({
      name: document.getElementById("capsuleName").value.trim(),
      to: toInput.value,
      text,
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });
    save(msgs);
    form.reset();
    charCount.textContent = "0";
    document.querySelectorAll("#toChips .chip-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('#toChips .chip-btn[data-v="future-self"]')?.classList.add("active");
    toInput.value = "future-self";
    render();
  });

  document.getElementById("clearCapsule")?.addEventListener("click", () => {
    if (confirm("Clear all local messages?")) {
      localStorage.removeItem(KEY);
      render();
    }
  });
  render();

  // Scroll reveal
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          const delay = en.target.dataset.delay || 0;
          en.target.style.transitionDelay = `${delay}ms`;
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.dataset.delay = (i % 5) * 60;
    io.observe(el);
  });

  // Light tilt on cards
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
});
