// ============================================
// MONEY, DECODED — Shared scripts
// ============================================

// Progress bar
(function() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + '%';
  });
})();

// Active section tracking
(function() {
  const sections = document.querySelectorAll('section[id]');
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (!sections.length || !tocLinks.length) return;

  function update() {
    let current = '';
    const scrollPos = window.scrollY + 140;
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', update);
  update();
})();

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('tocSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// Close sidebar when link clicked on mobile
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toc-list a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 950) {
        const sb = document.getElementById('tocSidebar');
        if (sb) sb.classList.remove('open');
      }
    });
  });
});

// Currency formatting
function fmtEur(n) {
  if (!isFinite(n)) return '€0';
  return '€' + Math.round(n).toLocaleString('en-US');
}

// EROSION CALCULATOR (used on Ch.2)
function setupErosionCalc() {
  const a = document.getElementById('erode-amount');
  if (!a) return;
  function calc() {
    const amount = parseFloat(document.getElementById('erode-amount').value) || 0;
    const rate = (parseFloat(document.getElementById('erode-rate').value) || 0) / 100;
    const inflation = (parseFloat(document.getElementById('erode-inflation').value) || 0) / 100;
    const years = parseFloat(document.getElementById('erode-years').value) || 0;
    const nominal = amount * Math.pow(1 + rate, years);
    const realPurchasingPower = nominal / Math.pow(1 + inflation, years);
    const lossPercent = ((amount - realPurchasingPower) / amount) * 100;
    document.getElementById('erode-result').textContent = fmtEur(realPurchasingPower);
    if (lossPercent > 0) {
      document.getElementById('erode-detail').textContent =
        `Account balance: ${fmtEur(nominal)}. Real buying power shrinks by ${lossPercent.toFixed(0)}%.`;
    } else {
      document.getElementById('erode-detail').textContent =
        `Account balance: ${fmtEur(nominal)}. Real buying power grows by ${Math.abs(lossPercent).toFixed(0)}%.`;
    }
  }
  ['erode-amount','erode-rate','erode-inflation','erode-years'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calc);
  });
  calc();
}

// COMPOUNDING CALCULATOR (used on Ch.4)
function setupCompoundCalc() {
  const a = document.getElementById('comp-amount');
  if (!a) return;
  function calc() {
    const start = parseFloat(document.getElementById('comp-amount').value) || 0;
    const monthly = parseFloat(document.getElementById('comp-monthly').value) || 0;
    const rate = (parseFloat(document.getElementById('comp-rate').value) || 0) / 100;
    const years = parseFloat(document.getElementById('comp-years').value) || 0;
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fvStart = start * Math.pow(1 + monthlyRate, months);
    const fvContributions = monthlyRate > 0
      ? monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
      : monthly * months;
    const total = fvStart + fvContributions;
    const totalContributed = start + (monthly * months);
    const interestEarned = total - totalContributed;
    document.getElementById('comp-result').textContent = fmtEur(total);
    document.getElementById('comp-detail').textContent =
      `You contributed ${fmtEur(totalContributed)}. Compounding gave you ${fmtEur(interestEarned)} — ${((interestEarned/total)*100).toFixed(0)}% of the total.`;
  }
  ['comp-amount','comp-monthly','comp-rate','comp-years'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calc);
  });
  calc();
}

// FEE EROSION (Ch.4)
function setupFeeCalc() {
  const a = document.getElementById('fee-amount');
  if (!a) return;
  function calc() {
    const amount = parseFloat(document.getElementById('fee-amount').value) || 0;
    const rate = (parseFloat(document.getElementById('fee-rate').value) || 0) / 100;
    const years = parseFloat(document.getElementById('fee-years').value) || 0;
    const lowFee = (parseFloat(document.getElementById('fee-low').value) || 0) / 100;
    const highFee = (parseFloat(document.getElementById('fee-high').value) || 0) / 100;
    const lowResult = amount * Math.pow(1 + rate - lowFee, years);
    const highResult = amount * Math.pow(1 + rate - highFee, years);
    const difference = lowResult - highResult;
    const pctLost = (difference / lowResult) * 100;
    document.getElementById('fee-result-low').textContent = fmtEur(lowResult);
    document.getElementById('fee-result-high').textContent = fmtEur(highResult);
    document.getElementById('fee-result-diff').textContent =
      `${fmtEur(difference)} lost to fees — that's ${pctLost.toFixed(0)}% of your portfolio gone.`;
  }
  ['fee-amount','fee-rate','fee-years','fee-low','fee-high'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calc);
  });
  calc();
}

// Init all calculators
document.addEventListener('DOMContentLoaded', () => {
  setupErosionCalc();
  setupCompoundCalc();
  setupFeeCalc();
});

// ============================================
// Responsive nav — collapse chapter links into a
// hamburger dropdown on small screens. Built here so
// no per-page HTML changes are needed. The language
// toggle and logo are left untouched (always visible).
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.site-nav').forEach(nav => {
    // Direct anchor children are the chapter/section links.
    // The language toggle is a .lang-toggle <div>, so it's excluded.
    const links = Array.from(nav.querySelectorAll(':scope > a'));
    if (links.length === 0) return; // e.g. the hub: nothing to collapse

    const toggle = nav.querySelector('.lang-toggle');

    const wrap = document.createElement('div');
    wrap.className = 'nav-links';
    links.forEach(a => wrap.appendChild(a));

    const burger = document.createElement('button');
    burger.className = 'nav-hamburger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Toggle navigation');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';

    // Order: [hamburger] [chapter links] [language toggle]
    if (toggle) nav.insertBefore(wrap, toggle);
    else nav.appendChild(wrap);
    nav.insertBefore(burger, wrap);

    function close() {
      nav.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    wrap.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('click', (e) => { if (!nav.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  });
});
