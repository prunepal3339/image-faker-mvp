// Inline SVG placeholder (no external request)
const placeholder = (() => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
    <rect width='100%' height='100%' fill='#eee'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
      font-family='Arial' font-size='24' fill='#888'>FAKER</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
})();

function replaceImg(img) {
  try {
    img.src = placeholder;
    img.srcset = "";
    img.removeAttribute("srcset");
  } catch (e) {}
}

function replaceBg(el) {
  try {
    el.style.setProperty("background-image", `url("${placeholder}")`, "important");
  } catch (e) {}
}

// Initial scan
function scan() {
  document.querySelectorAll("img").forEach(replaceImg);

  document.querySelectorAll("*").forEach(el => {
    const s = getComputedStyle(el);
    if (s.backgroundImage && s.backgroundImage !== "none") {
      replaceBg(el);
    }
  });
}

scan();

// Observe dynamically added nodes
const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.type === "childList") {
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;

        // If <img>
        if (n.tagName === "IMG") replaceImg(n);

        // If subtree contains images or backgrounds
        n.querySelectorAll?.("img").forEach(replaceImg);
        n.querySelectorAll?.("*").forEach(el => {
          const s = getComputedStyle(el);
          if (s.backgroundImage && s.backgroundImage !== "none") {
            replaceBg(el);
          }
        });
      });
    }

    if (m.type === "attributes" && m.target.tagName === "IMG") {
      replaceImg(m.target);
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "srcset", "style"]
});
