// JavaScript DOM Activity — Navbar Dropdown Menu (Vanilla JavaScript only)

// ---------- 1. Select the elements using DOM selectors ----------
const dropdownBtn = document.querySelector("#dropdownBtn");
const dropdownMenu = document.querySelector("#dropdownMenu");
const dropdownArrow = document.querySelector("#dropdownArrow");
const dropdownLinks = dropdownMenu.querySelectorAll("a");

// Navbar items (used by the dropdown AND the active highlight below)
const homeLink = document.querySelector('.nav-links a[href="#top"]');
const aboutLink = document.querySelector('.nav-links a[href="#about"]');
const contactLink = document.querySelector('.nav-links a[href="#contact"]');
const projectsBtn = dropdownBtn; // the "Projects ▼" item
const navItems = [homeLink, aboutLink, projectsBtn, contactLink].filter(Boolean);

// Keeps aria-expanded and the arrow (▼ / ▲) in sync with the menu state
function syncDropdownState() {
  const isOpen = dropdownMenu.classList.contains("show");
  dropdownBtn.setAttribute("aria-expanded", isOpen);
  dropdownArrow.textContent = isOpen ? "▲" : "▼"; // Bonus 2: arrow indicator
}

function closeDropdown() {
  dropdownMenu.classList.remove("show");
  syncDropdownState();
}

// ---------- 2. Click event + classList.toggle() ----------
// 1st click opens the menu, 2nd click closes it
dropdownBtn.addEventListener("click", function (event) {
  event.stopPropagation(); // so the "click outside" listener below doesn't close it right away
  dropdownMenu.classList.toggle("show");
  syncDropdownState();
  setActiveItem(projectsBtn); // choosing "Projects" highlights it, like the other menu items
});

// Close the menu after choosing an item (Projects stays highlighted)
dropdownLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    closeDropdown();
    setActiveItem(projectsBtn);
  });
});

// ---------- 3. Bonus 1: close when clicking outside ----------
document.addEventListener("click", function (event) {
  const clickedInside = dropdownMenu.contains(event.target) || dropdownBtn.contains(event.target);
  if (!clickedInside && dropdownMenu.classList.contains("show")) {
    closeDropdown();
  }
});

// Extra: close with the Escape key and give focus back to the button
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && dropdownMenu.classList.contains("show")) {
    closeDropdown();
    dropdownBtn.focus();
  }
});

// ---------- 4. Active highlight for ALL menu items (Home, About, Projects, Contact) ----------
function setActiveItem(item) {
  navItems.forEach(function (n) { n.classList.remove("active"); });
  if (item) item.classList.add("active");
}

// (a) When the user CLICKS an item, highlight it right away.
//     The scroll-spy is paused while the page is smooth-scrolling, so the highlight
//     doesn't flicker through the other items on the way.
let spyPaused = false;
let resumeTimer;

function pauseSpy() {
  spyPaused = true;
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(resumeSpy, 600); // fallback if the page doesn't scroll at all
}

function resumeSpy() {
  spyPaused = false;
  updateActiveItem();
}

[homeLink, aboutLink, contactLink].filter(Boolean).forEach(function (link) {
  link.addEventListener("click", function () {
    setActiveItem(link);
    pauseSpy();
  });
});

// (b) When the user SCROLLS, highlight the item of the section they are reading.
//     Skills & Tools belongs to About.
const spySections = [
  { el: document.querySelector("#about"), item: aboutLink },
  { el: document.querySelector("#skills"), item: aboutLink },
  { el: document.querySelector("#projects"), item: projectsBtn },
  { el: document.querySelector("#contact"), item: contactLink }
].filter(function (s) { return s.el && s.item; });

function updateActiveItem() {
  // At the very bottom of the page, Contact is always the active one
  const atBottom = window.scrollY > 0 &&
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom && contactLink) {
    setActiveItem(contactLink);
    return;
  }

  // A section becomes "current" once its top passes this line
  const line = Math.min(window.innerHeight * 0.4, 320);
  let current = homeLink; // above the first section = Home
  let bestTop = -Infinity;

  spySections.forEach(function (s) {
    const top = s.el.getBoundingClientRect().top;
    if (top <= line && top > bestTop) {
      bestTop = top;
      current = s.item;
    }
  });

  setActiveItem(current);
}

// Run on scroll (throttled with requestAnimationFrame) and on load/resize
let ticking = false;
window.addEventListener("scroll", function () {
  if (spyPaused) {
    // still scrolling because of a click: resume ~150ms after the scrolling stops
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(resumeSpy, 150);
    return;
  }
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(function () {
    updateActiveItem();
    ticking = false;
  });
}, { passive: true });
window.addEventListener("resize", updateActiveItem);

// Home is the active item on page load
updateActiveItem();

// ---------- 5. Contact form: opens your email app with the message filled in ----------
const CONTACT_EMAIL = "camposanjelyn08@gmail.com";
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

function buildMailtoLink(name, email, message) {
  const subject = "Portfolio message from " + name;
  const body = message + "\n\n— " + name + " (" + email + ")";
  return "mailto:" + CONTACT_EMAIL +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
}

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault(); // the browser already checked required fields + email format

    const name = document.querySelector("#contactName").value.trim();
    const email = document.querySelector("#contactEmail").value.trim();
    const message = document.querySelector("#contactMessage").value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please fill in your name, email, and message.";
      return;
    }

    formStatus.textContent = "Opening your email app… If nothing opens, email me directly at " + CONTACT_EMAIL + ".";
    window.location.href = buildMailtoLink(name, email, message);
  });
}