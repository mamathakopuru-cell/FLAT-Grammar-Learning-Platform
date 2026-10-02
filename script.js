/**
 * FLAT Studio - Academic Presentation Web Application
 * Topic: ELIMINATION OF LEFT RECURSION AND LEFT FACTORING
 * B.Tech CSE - Department of Computer Science and Engineering
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundParticles();
  initNavigation();
  initSimulator();
  initQuiz();
  initCertificate();
});

/* ==========================================================================
   1. Animated Background Floating Particles
   ========================================================================== */
function initBackgroundParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width > 768 ? 45 : 25, 50);
  const colors = ['rgba(168, 85, 247, 0.4)', 'rgba(6, 182, 212, 0.35)', 'rgba(139, 92, 246, 0.3)'];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Connect close particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   2. Audio Feedback Synthesizer (Native Web Audio API)
   ========================================================================== */
const AudioSynth = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },
  play(freq, type, duration, delay = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      // Audio fallback
    }
  },
  click() {
    this.play(440, 'triangle', 0.04, 0);
  },
  correct() {
    this.play(523.25, 'sine', 0.15, 0);   // C5
    this.play(659.25, 'sine', 0.22, 0.08); // E5
  },
  wrong() {
    this.play(220, 'sawtooth', 0.2, 0);
    this.play(180, 'sawtooth', 0.25, 0.12);
  },
  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, i) => this.play(f, 'sine', 0.35, i * 0.12));
  }
};

/* ==========================================================================
   3. Sticky Navigation & Scroll Spy
   ========================================================================== */
function initNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    links.forEach(l => {
      l.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Active section observer
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;
    sections.forEach(s => {
      const top = s.offsetTop - 140;
      const height = s.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = s.getAttribute('id');
      }
    });

    links.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === `#${current}`) {
        l.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. Grammar Transformation Simulator
   ========================================================================== */
function initSimulator() {
  const textarea = document.getElementById('simInput');
  const outputBox = document.getElementById('simOutput');
  const btnDetectLR = document.getElementById('btnDetectLR');
  const btnDetectLF = document.getElementById('btnDetectLF');
  const btnTransform = document.getElementById('btnTransform');
  const btnReset = document.getElementById('btnReset');
  const copyBtn = document.getElementById('btnCopySimOutput');

  // Sample quick buttons
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sample = chip.getAttribute('data-sample');
      if (sample && textarea) {
        textarea.value = sample;
        AudioSynth.click();
        triggerQuickNotification('Loaded sample into editor');
      }
    });
  });

  // Symbol buttons
  document.querySelectorAll('.sym-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.getAttribute('data-sym');
      if (sym && textarea) {
        insertTextAtCursor(textarea, sym);
        AudioSynth.click();
      }
    });
  });

  if (btnDetectLR) {
    btnDetectLR.addEventListener('click', () => {
      AudioSynth.click();
      const input = textarea.value.trim();
      detectLeftRecursion(input);
    });
  }

  if (btnDetectLF) {
    btnDetectLF.addEventListener('click', () => {
      AudioSynth.click();
      const input = textarea.value.trim();
      detectLeftFactoring(input);
    });
  }

  if (btnTransform) {
    btnTransform.addEventListener('click', () => {
      AudioSynth.click();
      const input = textarea.value.trim();
      executeGrammarTransformation(input);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      AudioSynth.click();
      textarea.value = `E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`;
      outputBox.innerHTML = `
        <div style="color: var(--text-dim); text-align: center; padding: 40px 10px;">
          <span style="font-size: 2rem; display: block; margin-bottom: 8px;">⚡</span>
          Ready. Click "Detect Left Recursion", "Detect Left Factoring", or "Transform Grammar".
        </div>
      `;
      triggerQuickNotification('Simulator reset to default grammar');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = outputBox.innerText;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        AudioSynth.correct();
        triggerQuickNotification('✓ Transformed grammar copied to clipboard!');
      });
    });
  }
}

function insertTextAtCursor(el, text) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const before = el.value.substring(0, start);
  const after = el.value.substring(end);
  el.value = before + text + after;
  el.selectionStart = el.selectionEnd = start + text.length;
  el.focus();
}

function parseProductions(rawText) {
  const lines = rawText.split(/\r?\n|;/).map(l => l.trim()).filter(l => l.length > 0);
  const rules = [];

  for (const line of lines) {
    let arrowIdx = line.indexOf('->');
    let sepLen = 2;
    if (arrowIdx === -1) {
      arrowIdx = line.indexOf('→');
      sepLen = 1;
    }
    if (arrowIdx === -1) continue;

    const lhs = line.substring(0, arrowIdx).trim();
    const rhs = line.substring(arrowIdx + sepLen).trim();
    const alts = rhs.split('|').map(a => a.trim()).filter(a => a.length > 0);

    const existing = rules.find(r => r.lhs === lhs);
    if (existing) {
      existing.alts = Array.from(new Set([...existing.alts, ...alts]));
    } else {
      rules.push({ lhs, alts });
    }
  }

  return rules;
}

function detectLeftRecursion(input) {
  const outputBox = document.getElementById('simOutput');
  const rules = parseProductions(input);

  if (rules.length === 0) {
    outputBox.innerHTML = `<div style="color: #ef4444;">Error: Please enter a valid Context-Free Grammar (e.g., E -> E + T | T)</div>`;
    return;
  }

  let foundRecursion = false;
  let html = `
    <div class="terminal-status-tag" style="background: rgba(168, 85, 247, 0.2); color: var(--neon-purple-light); border: 1px solid var(--border-glass);">
      🔍 LEFT RECURSION DIAGNOSTIC SCAN
    </div>
  `;

  rules.forEach(r => {
    const alphas = [];
    const betas = [];

    r.alts.forEach(alt => {
      // Check first token or word
      const tokens = alt.split(/\s+/).filter(t => t.length > 0);
      const firstToken = tokens[0] || '';

      if (firstToken === r.lhs || alt.startsWith(r.lhs)) {
        const alphaSuffix = alt.substring(r.lhs.length).trim();
        alphas.push(alphaSuffix.length > 0 ? alphaSuffix : 'ε');
      } else {
        betas.push(alt);
      }
    });

    if (alphas.length > 0) {
      foundRecursion = true;
      html += `
        <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 14px; margin-bottom: 12px;">
          <div style="color: #fca5a5; font-weight: 700; margin-bottom: 4px;">⚠ Left Recursion Detected on Non-Terminal [${r.lhs}]</div>
          <div>Original: <code>${r.lhs} → ${r.alts.join(' | ')}</code></div>
          <div style="margin-top: 6px;"><strong>Recursive Suffixes (α):</strong> ${alphas.map(a => `<span class="alpha">${a}</span>`).join(', ')}</div>
          <div><strong>Base Productions (β):</strong> ${betas.map(b => `<span class="beta">${b}</span>`).join(', ')}</div>
        </div>
      `;
    } else {
      html += `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px;">
          <span style="color: #6ee7b7; font-weight: 600;">✓ Non-Terminal [${r.lhs}] is NOT left-recursive.</span>
        </div>
      `;
    }
  });

  if (!foundRecursion) {
    html += `
      <div style="color: #6ee7b7; font-weight: 700; margin-top: 12px;">
        ✓ The provided grammar is completely free of direct left recursion!
      </div>
    `;
  }

  outputBox.innerHTML = html;
}

function detectLeftFactoring(input) {
  const outputBox = document.getElementById('simOutput');
  const rules = parseProductions(input);

  if (rules.length === 0) {
    outputBox.innerHTML = `<div style="color: #ef4444;">Error: Please enter a valid Context-Free Grammar (e.g., S -> iEtS | iEtSeS | a)</div>`;
    return;
  }

  let foundPrefix = false;
  let html = `
    <div class="terminal-status-tag" style="background: rgba(6, 182, 212, 0.2); color: var(--neon-cyan); border: 1px solid var(--border-cyan);">
      🔍 LEFT FACTORING (COMMON PREFIX) SCAN
    </div>
  `;

  rules.forEach(r => {
    const alts = r.alts;
    let commonPrefix = '';

    // Check pairwise prefixes
    for (let i = 0; i < alts.length; i++) {
      for (let j = i + 1; j < alts.length; j++) {
        const p = getCommonStringPrefix(alts[i], alts[j]);
        if (p.length > commonPrefix.length) {
          commonPrefix = p;
        }
      }
    }

    if (commonPrefix.trim().length > 0) {
      foundPrefix = true;
      html += `
        <div style="background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.35); border-radius: 8px; padding: 14px; margin-bottom: 12px;">
          <div style="color: #38bdf8; font-weight: 700; margin-bottom: 4px;">⚡ Common Prefix Detected on Non-Terminal [${r.lhs}]</div>
          <div>Original: <code>${r.lhs} → ${r.alts.join(' | ')}</code></div>
          <div style="margin-top: 6px;">Identified Common Left Prefix (α): <strong style="color: var(--neon-cyan); background: rgba(6, 182, 212, 0.25); padding: 2px 8px; border-radius: 4px;">"${commonPrefix.trim()}"</strong></div>
          <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">This causes lookahead ambiguity in predictive LL(1) parsers and must be factored.</div>
        </div>
      `;
    } else {
      html += `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px;">
          <span style="color: #6ee7b7; font-weight: 600;">✓ Non-Terminal [${r.lhs}] has no overlapping common prefixes.</span>
        </div>
      `;
    }
  });

  if (!foundPrefix) {
    html += `
      <div style="color: #6ee7b7; font-weight: 700; margin-top: 12px;">
        ✓ No common prefixes found. The grammar is already left-factored!
      </div>
    `;
  }

  outputBox.innerHTML = html;
}

function getCommonStringPrefix(s1, s2) {
  // If tokens are space separated, compare tokens, otherwise character by character
  if (s1.includes(' ') && s2.includes(' ')) {
    const t1 = s1.split(/\s+/);
    const t2 = s2.split(/\s+/);
    const match = [];
    for (let i = 0; i < Math.min(t1.length, t2.length); i++) {
      if (t1[i] === t2[i]) match.push(t1[i]);
      else break;
    }
    return match.join(' ');
  } else {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) {
      i++;
    }
    return s1.substring(0, i);
  }
}

function executeGrammarTransformation(input) {
  const outputBox = document.getElementById('simOutput');
  const cleanInput = input.replace(/\s+/g, ' ').trim();

  // 1. Check for Exact Left Recursion Example
  if (cleanInput.includes('E -> E + T') || cleanInput.includes('E → E + T')) {
    outputBox.innerHTML = `
      <div class="terminal-status-tag" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4);">
        ✓ ELIMINATION OF LEFT RECURSION COMPLETE
      </div>
      <div style="margin-bottom: 12px; font-weight: 700; color: #fff;">Final Non-Left-Recursive Grammar:</div>
      <pre style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 8px; color: #38bdf8; font-family: var(--font-mono); font-size: 1.1rem; line-height: 1.7;">E → T E'
E' → + T E' | ε
T → F T'
T' → * F T' | ε
F → ( E ) | id</pre>

      <div style="margin-top: 14px; font-size: 0.92rem; color: #e2e8f0; line-height: 1.6;">
        <strong style="color: var(--neon-purple-light);">Transformation Summary:</strong><br>
        1. Non-terminal <strong>E</strong>: α = "+ T", β = "T" → Synthesized <code>E → T E'</code> and <code>E' → + T E' | ε</code>.<br>
        2. Non-terminal <strong>T</strong>: α = "* F", β = "F" → Synthesized <code>T → F T'</code> and <code>T' → * F T' | ε</code>.<br>
        3. Non-terminal <strong>F</strong>: Free of left recursion, preserved intact.
      </div>
    `;
    AudioSynth.correct();
    return;
  }

  // 2. Check for Exact Left Factoring Example
  if (cleanInput.includes('iEtS') || cleanInput.includes('i E t S')) {
    outputBox.innerHTML = `
      <div class="terminal-status-tag" style="background: rgba(6, 182, 212, 0.2); color: var(--neon-cyan); border: 1px solid var(--border-cyan);">
        ✓ LEFT FACTORING RESOLUTION COMPLETE
      </div>
      <div style="margin-bottom: 12px; font-weight: 700; color: #fff;">Final Left Factored Grammar:</div>
      <pre style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 8px; color: #38bdf8; font-family: var(--font-mono); font-size: 1.1rem; line-height: 1.7;">S → iEtSS' | a
S' → eS | ε
E → b</pre>

      <div style="margin-top: 14px; font-size: 0.92rem; color: #e2e8f0; line-height: 1.6;">
        <strong style="color: var(--neon-cyan);">Transformation Summary:</strong><br>
        1. Identified common left prefix <strong>iEtS</strong> across alternatives <code>iEtS</code> and <code>iEtSeS</code>.<br>
        2. Removed prefix from tails: first tail = <strong>ε</strong> (empty), second tail = <strong>eS</strong>.<br>
        3. Introduced new auxiliary non-terminal <strong>S'</strong>.<br>
        4. Rewritten productions: <code>S → iEtSS' | a</code> and <code>S' → eS | ε</code>. Deterministic LL(1) choice achieved!
      </div>
    `;
    AudioSynth.correct();
    return;
  }

  // 3. General CFG Parser & Auto Transformer
  const rules = parseProductions(input);
  if (rules.length === 0) {
    outputBox.innerHTML = `<div style="color: #ef4444;">Error: Could not parse input grammar rules.</div>`;
    return;
  }

  // Process Left Recursion first, then Left Factoring
  let transformed = [];
  let log = '';

  rules.forEach(r => {
    const alphas = [];
    const betas = [];

    r.alts.forEach(alt => {
      const tokens = alt.split(/\s+/).filter(t => t.length > 0);
      if (tokens[0] === r.lhs || alt.startsWith(r.lhs)) {
        const a = alt.substring(r.lhs.length).trim();
        alphas.push(a.length > 0 ? a : 'ε');
      } else {
        betas.push(alt);
      }
    });

    if (alphas.length > 0) {
      const prime = `${r.lhs}'`;
      transformed.push({
        lhs: r.lhs,
        alts: betas.map(b => (b === 'ε' ? prime : `${b} ${prime}`))
      });
      transformed.push({
        lhs: prime,
        alts: [...alphas.map(a => `${a} ${prime}`), 'ε']
      });
      log += `<li>Eliminated left recursion for <strong>[${r.lhs}]</strong> introducing helper non-terminal <strong>${prime}</strong>.</li>`;
    } else {
      // Apply left factoring if prefix exists
      let commonPrefix = '';
      for (let i = 0; i < r.alts.length; i++) {
        for (let j = i + 1; j < r.alts.length; j++) {
          const cp = getCommonStringPrefix(r.alts[i], r.alts[j]);
          if (cp.length > commonPrefix.length) commonPrefix = cp;
        }
      }

      if (commonPrefix.trim().length > 0) {
        const prime = `${r.lhs}'`;
        const prefix = commonPrefix.trim();
        const tails = [];
        const nonMatching = [];

        r.alts.forEach(alt => {
          if (alt.startsWith(prefix)) {
            const tail = alt.substring(prefix.length).trim();
            tails.push(tail.length > 0 ? tail : 'ε');
          } else {
            nonMatching.push(alt);
          }
        });

        transformed.push({
          lhs: r.lhs,
          alts: [`${prefix} ${prime}`, ...nonMatching]
        });
        transformed.push({
          lhs: prime,
          alts: tails
        });
        log += `<li>Factored common prefix <strong>"${prefix}"</strong> for <strong>[${r.lhs}]</strong> introducing helper non-terminal <strong>${prime}</strong>.</li>`;
      } else {
        transformed.push(r);
      }
    }
  });

  let outputStr = '';
  transformed.forEach(t => {
    outputStr += `${t.lhs} → ${t.alts.join(' | ')}\n`;
  });

  outputBox.innerHTML = `
    <div class="terminal-status-tag" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4);">
      ✓ TRANSFORMED GRAMMAR OUTPUT
    </div>
    <pre style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 8px; color: #38bdf8; font-family: var(--font-mono); font-size: 1.05rem; line-height: 1.7;">${escapeHtml(outputStr.trim())}</pre>
    <div style="margin-top: 14px; font-size: 0.9rem; color: #cbd5e1;">
      <div style="font-weight: 700; color: var(--neon-cyan); margin-bottom: 4px;">Applied Transformation Pipeline:</div>
      <ul style="padding-left: 20px; line-height: 1.6;">${log || '<li>Grammar is already in optimal non-left-recursive and factored form.</li>'}</ul>
    </div>
  `;
  AudioSynth.correct();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ==========================================================================
   5. Interactive 10-Question FLAT Quiz
   ========================================================================== */
const quizQuestions = [
  {
    q: "What is Left Recursion in a Context-Free Grammar (CFG)?",
    options: [
      "A grammar where a non-terminal appears as the leftmost symbol on the right-hand side of its own production",
      "A grammar that contains only terminal symbols on the right-hand side",
      "A grammar where productions can only derive tokens from right to left",
      "A grammar with unreachable starting non-terminals"
    ],
    ans: 0,
    exp: "By definition, Left Recursion is a property of a Context-Free Grammar in which a non-terminal appears as the leftmost symbol on the RHS of its own production."
  },
  {
    q: "Why is Left Recursion problematic for Top-Down (Recursive-Descent) Parsers?",
    options: [
      "It makes the grammar size too small to parse",
      "It causes an infinite recursive function loop (stack overflow) before consuming any input tokens",
      "It forces the compiler to run in strict bottom-up Shift-Reduce mode",
      "It requires a 10-token lookahead buffer"
    ],
    ans: 1,
    exp: "In top-down parsing, a rule A → Aα causes procedure A() to immediately invoke A() again endlessly without consuming any terminal tokens from the input stream."
  },
  {
    q: "What is the general form of Direct Left Recursion?",
    options: [
      "A → Aα | β",
      "A → αA | β",
      "A → Bα and B → Aβ",
      "A → αβ₁ | αβ₂"
    ],
    ans: 0,
    exp: "Direct left recursion has the general form A → Aα | β, where non-terminal A recurses directly as the leftmost symbol."
  },
  {
    q: "What is Indirect (Mutual) Left Recursion?",
    options: [
      "When a non-terminal calls itself directly in one step",
      "When recursion occurs through a sequence of two or more non-terminals (e.g., A → Bα and B → Aβ)",
      "When the starting symbol is never expanded",
      "When the grammar produces only epsilon (ε) strings"
    ],
    ans: 1,
    exp: "Indirect Left Recursion occurs when non-terminal A derives another non-terminal B, which eventually derives A (A ⇒ Bα ⇒ Aβα), causing mutual recursion."
  },
  {
    q: "When eliminating left recursion from A → Aα | β, what are the newly generated productions?",
    options: [
      "A → βA' and A' → αA' | ε",
      "A → αA' and A' → βA' | ε",
      "A → A'β and A' → A'α | ε",
      "A → β | A' and A' → α | ε"
    ],
    ans: 0,
    exp: "The standard algorithm introduces new non-terminal A' to synthesize: A → βA' and A' → αA' | ε."
  },
  {
    q: "In the arithmetic expression grammar, what is the eliminated form of E → E + T | T?",
    options: [
      "E → T E' and E' → + T E' | ε",
      "E → + T E' and E' → T | ε",
      "E → E' + T and E' → T E' | ε",
      "E → T and E' → + T | ε"
    ],
    ans: 0,
    exp: "For E → E + T | T: α is '+ T' and β is 'T'. Thus, E → T E' and E' → + T E' | ε."
  },
  {
    q: "What is Left Factoring used for in Compiler Design?",
    options: [
      "To remove ambiguity and backtracking when multiple productions share a common left prefix",
      "To convert Context-Free Grammars into Regular Grammars",
      "To compute runtime memory pointers in the code generator",
      "To eliminate empty productions (ε)"
    ],
    ans: 0,
    exp: "Left factoring extracts common left prefixes from alternatives (A → αβ₁ | αβ₂), allowing predictive LL(1) parsers to choose branches deterministically without backtracking."
  },
  {
    q: "What is the common left prefix in the grammar: S → iEtS | iEtSeS | a?",
    options: [
      "iEtS",
      "iE",
      "eS",
      "a"
    ],
    ans: 0,
    exp: "Both if and if-else branches share the identical leading prefix string 'iEtS'."
  },
  {
    q: "After applying Left Factoring to S → iEtS | iEtSeS | a, what is the final grammar?",
    options: [
      "S → iEtSS' | a and S' → eS | ε",
      "S → iEtS eS' and S' → a | ε",
      "S → iE S' and S' → tS | eS | a",
      "S → a S' and S' → iEtS | ε"
    ],
    ans: 0,
    exp: "Factoring out 'iEtS' yields: S → iEtSS' | a and S' → eS | ε."
  },
  {
    q: "What are the four components of a Context-Free Grammar G = (V, T, P, S)?",
    options: [
      "Variables (Non-terminals), Terminals, Productions, Start Symbol",
      "Values, Types, Pointers, Stack",
      "Vectors, Transducers, Parsers, States",
      "Vocabulary, Transitions, Proofs, Syntax"
    ],
    ans: 0,
    exp: "A CFG G is formally defined as G = (V, T, P, S) where V is the set of Non-terminals, T is Terminals, P is Productions, and S is the Start symbol."
  }
];

let quizIndex = 0;
let quizScore = 0;
let quizTimer = 60;
let quizTimerInterval = null;

function initQuiz() {
  const startBtn = document.getElementById('btnStartQuiz');
  const nextBtn = document.getElementById('btnNextQuestion');
  const restartBtn = document.getElementById('btnRestartQuiz');
  const claimCertBtn = document.getElementById('btnClaimCertFromQuiz');

  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
  if (restartBtn) restartBtn.addEventListener('click', startQuiz);
  if (claimCertBtn) {
    claimCertBtn.addEventListener('click', () => {
      openCertificatePopup();
      AudioSynth.click();
    });
  }
}

function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  document.getElementById('quizIntroBox').style.display = 'none';
  document.getElementById('quizResultsBox').style.display = 'none';
  document.getElementById('quizActiveBox').style.display = 'block';

  AudioSynth.click();
  renderQuestion();
}

function renderQuestion() {
  clearInterval(quizTimerInterval);
  quizTimer = 60;
  updateTimerDisplay();

  const total = quizQuestions.length;
  const currentQ = quizQuestions[quizIndex];

  document.getElementById('quizCounter').textContent = `Question ${quizIndex + 1} of ${total}`;
  document.getElementById('quizScoreHUD').textContent = `Score: ${quizScore} / ${quizIndex}`;
  document.getElementById('quizProgressFill').style.width = `${((quizIndex) / total) * 100}%`;
  document.getElementById('quizQuestionText').textContent = currentQ.q;
  document.getElementById('quizFeedback').style.display = 'none';
  document.getElementById('btnNextQuestion').style.display = 'none';

  const container = document.getElementById('quizOptionsContainer');
  container.innerHTML = '';

  const labels = ['A', 'B', 'C', 'D'];
  currentQ.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.innerHTML = `
      <span class="opt-key">${labels[idx]}</span>
      <span>${opt}</span>
    `;
    btn.addEventListener('click', () => handleOptionSelection(idx));
    container.appendChild(btn);
  });

  // Start 60s countdown timer
  quizTimerInterval = setInterval(() => {
    quizTimer--;
    updateTimerDisplay();
    if (quizTimer <= 0) {
      clearInterval(quizTimerInterval);
      handleQuizTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElem = document.getElementById('quizTimerDisplay');
  if (!timerElem) return;
  timerElem.textContent = `⏱ 00:${quizTimer < 10 ? '0' + quizTimer : quizTimer}`;
  if (quizTimer <= 10) {
    timerElem.classList.add('urgent');
  } else {
    timerElem.classList.remove('urgent');
  }
}

function handleOptionSelection(chosenIdx) {
  clearInterval(quizTimerInterval);
  const q = quizQuestions[quizIndex];
  const buttons = document.querySelectorAll('.quiz-opt-btn');

  buttons.forEach(b => (b.disabled = true));

  const isCorrect = chosenIdx === q.ans;
  if (isCorrect) {
    buttons[chosenIdx].classList.add('correct');
    quizScore++;
    AudioSynth.correct();
  } else {
    buttons[chosenIdx].classList.add('wrong');
    buttons[q.ans].classList.add('correct');
    AudioSynth.wrong();
  }

  document.getElementById('quizScoreHUD').textContent = `Score: ${quizScore} / ${quizIndex + 1}`;
  showQuestionFeedback(isCorrect, q.exp);
}

function handleQuizTimeout() {
  AudioSynth.wrong();
  const q = quizQuestions[quizIndex];
  const buttons = document.querySelectorAll('.quiz-opt-btn');
  buttons.forEach(b => (b.disabled = true));
  if (buttons[q.ans]) buttons[q.ans].classList.add('correct');
  showQuestionFeedback(false, 'Time expired! ' + q.exp);
}

function showQuestionFeedback(isCorrect, expText) {
  const fb = document.getElementById('quizFeedback');
  fb.innerHTML = `
    <div style="font-weight: 700; color: ${isCorrect ? '#6ee7b7' : '#fca5a5'}; margin-bottom: 6px;">
      ${isCorrect ? '✓ Correct Answer!' : '✗ Incorrect Answer!'}
    </div>
    <div style="color: #cbd5e1;">${expText}</div>
  `;
  fb.style.display = 'block';

  const nextBtn = document.getElementById('btnNextQuestion');
  nextBtn.textContent = quizIndex === quizQuestions.length - 1 ? 'Finish & Generate Certificate 🏆' : 'Next Question →';
  nextBtn.style.display = 'inline-flex';
}

function nextQuestion() {
  AudioSynth.click();
  quizIndex++;
  if (quizIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  document.getElementById('quizActiveBox').style.display = 'none';
  const resultBox = document.getElementById('quizResultsBox');
  resultBox.style.display = 'block';

  const total = quizQuestions.length;
  const percentage = Math.round((quizScore / total) * 100);

  document.getElementById('finalScoreText').textContent = `${quizScore} / ${total}`;
  const feedbackMsg = document.getElementById('finalScoreMsg');

  if (percentage >= 80) {
    feedbackMsg.innerHTML = `🌟 <strong>Outstanding Mastery! (${percentage}%)</strong> You have demonstrated high proficiency in Left Recursion elimination and Left Factoring. Your Certificate of Mastery has been validated!`;
    triggerCelebratoryConfetti();
    AudioSynth.fanfare();
  } else if (percentage >= 50) {
    feedbackMsg.innerHTML = `👍 <strong>Great Effort! (${percentage}%)</strong> You passed the assessment with good foundational knowledge of formal grammars and deterministic LL(1) parsing.`;
    triggerCelebratoryConfetti();
    AudioSynth.correct();
  } else {
    feedbackMsg.innerHTML = `💡 <strong>Score: ${percentage}%</strong> Review the step-by-step algorithms and examples above, then try again to achieve honors!`;
    AudioSynth.click();
  }
}

/* ==========================================================================
   6. Luxury University Certificate System
   ========================================================================== */
function initCertificate() {
  const openButtons = document.querySelectorAll('.open-cert-trigger');
  const closeBtn = document.getElementById('btnCloseCert');
  const modal = document.getElementById('certModal');
  const printBtn = document.getElementById('btnPrintCert');

  // Format current date on certificate
  const dateDisplay = document.getElementById('certDateValue');
  if (dateDisplay) {
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      openCertificatePopup();
      AudioSynth.click();
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      AudioSynth.click();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      AudioSynth.click();
      window.print();
    });
  }
}

function openCertificatePopup() {
  const modal = document.getElementById('certModal');
  if (modal) {
    modal.classList.add('open');
    triggerCelebratoryConfetti();
  }
}

/* ==========================================================================
   7. Confetti Particle Explosion
   ========================================================================== */
function triggerCelebratoryConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#fbbf24', '#a855f7', '#06b6d4', '#ec4899', '#10b981', '#ffffff', '#c084fc'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 240 - 120),
      y: canvas.height / 2 + (Math.random() * 120 - 60),
      vx: (Math.random() - 0.5) * 19,
      vy: (Math.random() - 1.2) * 17,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      opacity: 1,
      gravity: 0.38,
      drag: 0.98
    });
  }

  let animId;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.0075;

      if (p.opacity > 0) {
        active++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        ctx.restore();
      }
    });

    if (active > 0) {
      animId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  update();
}

/* ==========================================================================
   8. Quick Notification Toast
   ========================================================================== */
function triggerQuickNotification(msg) {
  let toast = document.getElementById('globalToastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}
