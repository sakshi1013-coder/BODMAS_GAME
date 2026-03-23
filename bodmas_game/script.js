/* ============================================
   BODMAS BATTLE — Game Logic
   ============================================ */

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const Utils = {
  $(id) { return document.getElementById(id); },

  rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },

  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  showToast(message, type = 'info') {
    const container = Utils.$('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },

  showConfetti() {
    const container = Utils.$('confetti-container');
    container.classList.remove('hidden');
    const colors = ['#FFE156', '#FF3B3B', '#3B82F6', '#22C55E', '#A855F7', '#FF9F43', '#F472B6'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = Utils.pick(colors);
      piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
      piece.style.animationDelay = (Math.random() * 0.8) + 's';
      piece.style.width = (Math.random() * 10 + 6) + 'px';
      piece.style.height = (Math.random() * 10 + 6) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      container.appendChild(piece);
    }
    setTimeout(() => {
      container.innerHTML = '';
      container.classList.add('hidden');
    }, 4000);
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  // Safe eval for BODMAS expressions (only numbers and basic operators)
  safeEval(expr) {
    try {
      // Replace × with * and ÷ with /
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
      // Validate: only numbers, operators, parentheses, spaces, dots
      if (!/^[\d+\-*/().² ³^]+$/.test(sanitized.replace(/\*\*/g, '^'))) return NaN;
      return Function('"use strict"; return (' + sanitized + ')')();
    } catch {
      return NaN;
    }
  }
};

// ==========================================
// EXPRESSION GENERATOR
// ==========================================

const ExprGen = {
  // Generate expressions with known BODMAS steps
  generate(difficulty = 'easy') {
    const templates = this.getTemplates(difficulty);
    const template = Utils.pick(templates);
    return this.buildFromTemplate(template);
  },

  getTemplates(difficulty) {
    const easy = [
      { pattern: 'a + b × c', ops: ['+', '×'] },
      { pattern: 'a × b + c', ops: ['×', '+'] },
      { pattern: 'a + b ÷ c', ops: ['+', '÷'] },
      { pattern: 'a - b × c', ops: ['-', '×'] },
      { pattern: 'a × b - c', ops: ['×', '-'] },
      { pattern: 'a ÷ b + c', ops: ['÷', '+'] },
    ];

    const medium = [
      { pattern: 'a + b × c - d', ops: ['×', '+', '-'] },
      { pattern: '(a + b) × c', ops: ['+', '×'], hasBrackets: true },
      { pattern: 'a × (b - c)', ops: ['-', '×'], hasBrackets: true },
      { pattern: 'a × b + c ÷ d', ops: ['×', '÷', '+'] },
      { pattern: '(a + b) ÷ c', ops: ['+', '÷'], hasBrackets: true },
      { pattern: 'a + b × c + d', ops: ['×', '+', '+'] },
    ];

    const hard = [
      { pattern: '(a + b) × (c - d)', ops: ['+', '-', '×'], hasBrackets: true },
      { pattern: 'a × b + c × d - e', ops: ['×', '×', '+', '-'] },
      { pattern: '(a + b × c) ÷ d', ops: ['×', '+', '÷'], hasBrackets: true },
      { pattern: 'a + (b - c) × d', ops: ['-', '×', '+'], hasBrackets: true },
      { pattern: '(a × b - c) + d ÷ e', ops: ['×', '-', '÷', '+'], hasBrackets: true },
      { pattern: 'a ÷ b + c × (d - e)', ops: ['÷', '-', '×', '+'], hasBrackets: true },
    ];

    if (difficulty === 'easy') return easy;
    if (difficulty === 'medium') return medium;
    return hard;
  },

  buildFromTemplate(template) {
    const nums = this.generateNumbers(template);
    let expression = template.pattern;
    const letters = ['a', 'b', 'c', 'd', 'e'];
    letters.forEach((letter, i) => {
      if (nums[i] !== undefined) {
        expression = expression.replace(letter, nums[i].toString());
      }
    });

    const answer = Utils.safeEval(expression);
    const steps = this.computeSteps(expression);

    return {
      expression,
      answer: Math.round(answer * 100) / 100,
      steps,
      tokens: this.tokenize(expression)
    };
  },

  generateNumbers(template) {
    const nums = [];
    const count = (template.pattern.match(/[a-e]/g) || []).length;
    const hasDivision = template.ops.includes('÷');

    for (let i = 0; i < count; i++) {
      nums.push(Utils.rand(1, 12));
    }

    // Make sure division results in whole numbers
    if (hasDivision) {
      const divIdx = template.pattern.indexOf('÷');
      // Find which letter is right before and after ÷
      const beforeChar = template.pattern[divIdx - 2];
      const afterChar = template.pattern[divIdx + 2];
      const letters = ['a', 'b', 'c', 'd', 'e'];
      const beforeIdx = letters.indexOf(beforeChar);
      const afterIdx = letters.indexOf(afterChar);

      if (beforeIdx >= 0 && afterIdx >= 0) {
        // Set divisor first, then make dividend a multiple
        nums[afterIdx] = Utils.rand(1, 6);
        const multiplier = Utils.rand(1, 6);
        // Check if there's a bracket expression being divided
        if (template.hasBrackets && template.pattern.includes(')') && template.pattern.indexOf('÷') > template.pattern.indexOf(')')) {
          // For brackets, just make sure numbers work out
          nums[beforeIdx] = nums[afterIdx] * multiplier;
        } else {
          nums[beforeIdx] = nums[afterIdx] * multiplier;
        }
      }
    }

    return nums;
  },

  tokenize(expression) {
    const tokens = [];
    let current = '';
    for (const char of expression) {
      if (char === ' ') {
        if (current) { tokens.push(current); current = ''; }
      } else if ('+-×÷()^'.includes(char)) {
        if (current) { tokens.push(current); current = ''; }
        tokens.push(char);
      } else {
        current += char;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  },

  computeSteps(expression) {
    const steps = [];
    let current = expression;

    const maxIter = 20;
    let iter = 0;

    while (iter++ < maxIter) {
      // Find next operation according to BODMAS
      const op = this.findNextOperation(current);
      if (!op) break;

      const result = Utils.safeEval(op.subExpr);
      if (isNaN(result)) break;

      const roundedResult = Math.round(result * 100) / 100;
      steps.push({
        rule: op.rule,
        subExpr: op.subExpr,
        result: roundedResult,
        fullExpr: current,
        description: `${op.rule}: ${op.subExpr} = ${roundedResult}`
      });

      // Replace the sub-expression in the current expression
      current = this.replaceSubExpr(current, op.subExpr, roundedResult.toString());
      
      // Clean up brackets that now contain just a number
      current = current.replace(/\((\d+\.?\d*)\)/g, '$1');
      current = current.replace(/\(\-(\d+\.?\d*)\)/g, '-$1');
    }

    return steps;
  },

  findNextOperation(expr) {
    // 1. Brackets — find innermost bracket content
    const bracketMatch = expr.match(/\(([^()]+)\)/);
    if (bracketMatch) {
      // Recursively find the next op inside the bracket
      const innerOp = this.findNextOperation(bracketMatch[1]);
      if (innerOp) {
        return { ...innerOp, subExpr: innerOp.subExpr };
      }
      // If bracket contains a simple expression, evaluate it
      return { rule: 'Brackets', subExpr: bracketMatch[1] };
    }

    // 2. Orders (powers) — skip for simplicity except in hard mode

    // 3. Division & Multiplication (left to right)
    const dmMatch = expr.match(/(\d+\.?\d*)\s*([×÷])\s*(\d+\.?\d*)/);
    if (dmMatch) {
      return {
        rule: dmMatch[2] === '×' ? 'Multiplication' : 'Division',
        subExpr: dmMatch[0].trim()
      };
    }

    // 4. Addition & Subtraction (left to right)
    const asMatch = expr.match(/(\d+\.?\d*)\s*([+\-])\s*(\d+\.?\d*)/);
    if (asMatch) {
      return {
        rule: asMatch[2] === '+' ? 'Addition' : 'Subtraction',
        subExpr: asMatch[0].trim()
      };
    }

    return null;
  },

  replaceSubExpr(fullExpr, subExpr, replacement) {
    // Escape special regex characters in the sub-expression
    const escaped = subExpr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return fullExpr.replace(new RegExp(escaped), replacement);
  }
};


// ==========================================
// TIMER
// ==========================================

class Timer {
  constructor(displayId) {
    this.displayId = displayId;
    this.seconds = 0;
    this.interval = null;
    this.running = false;
  }

  start() {
    this.seconds = 0;
    this.running = true;
    this.update();
    this.interval = setInterval(() => {
      this.seconds++;
      this.update();
    }, 1000);
  }

  stop() {
    this.running = false;
    clearInterval(this.interval);
    return this.seconds;
  }

  reset() {
    this.stop();
    this.seconds = 0;
    this.update();
  }

  update() {
    const el = Utils.$(this.displayId);
    if (el) el.textContent = Utils.formatTime(this.seconds);
  }
}


// ==========================================
// LEADERBOARD (uses PHP backend or localStorage fallback)
// ==========================================

const Leaderboard = {
  scores: [],
  currentFilter: 'all',

  async load() {
    try {
      const res = await fetch('api.php?action=get_scores');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.scores = data.scores || [];
          return;
        }
      }
    } catch (e) {
      console.log('PHP backend not available, using localStorage');
    }
    // Fallback to localStorage
    this.scores = JSON.parse(localStorage.getItem('bodmas_scores') || '[]');
  },

  async saveScore(playerName, score, mode, level, time) {
    const entry = {
      name: playerName || 'Anonymous',
      score,
      mode,
      level,
      time,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_score', ...entry })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.scores = data.scores || this.scores;
          this.scores.push(entry);
          return;
        }
      }
    } catch (e) {
      console.log('PHP save failed, using localStorage');
    }

    // Fallback
    this.scores.push(entry);
    localStorage.setItem('bodmas_scores', JSON.stringify(this.scores));
  },

  async reset() {
    if (!confirm('Are you sure you want to reset ALL scores? This cannot be undone!')) return;

    try {
      const res = await fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_scores' })
      });
    } catch (e) {}

    this.scores = [];
    localStorage.removeItem('bodmas_scores');
    this.render();
    Utils.showToast('🗑️ Leaderboard has been reset!', 'info');
  },

  show() {
    this.load().then(() => {
      Game.showScreen('leaderboard-screen');
      this.render();
    });
  },

  filter(mode) {
    this.currentFilter = mode;
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === mode);
    });
    this.render();
  },

  render() {
    let filtered = this.currentFilter === 'all'
      ? this.scores
      : this.scores.filter(s => s.mode === this.currentFilter);

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    const tbody = Utils.$('leaderboard-body');
    const emptyEl = Utils.$('leaderboard-empty');
    const tableEl = Utils.$('leaderboard-table');

    if (filtered.length === 0) {
      tableEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      return;
    }

    tableEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');

    const modeLabels = { busjam: '🚌 Bus Jam', solve: '🧠 Solve', arrange: '🧩 Arrange' };
    const medals = ['🥇', '🥈', '🥉'];

    tbody.innerHTML = filtered.slice(0, 20).map((s, i) => {
      const rankClass = i < 3 ? `rank-${i + 1}` : '';
      const medal = i < 3 ? `<span class="rank-medal">${medals[i]}</span>` : (i + 1);
      return `
        <tr class="${rankClass}">
          <td>${medal}</td>
          <td>${this.escapeHtml(s.name)}</td>
          <td><strong>${s.score}</strong></td>
          <td>${modeLabels[s.mode] || s.mode}</td>
          <td>${s.level || '-'}</td>
          <td>${s.time ? Utils.formatTime(s.time) : '-'}</td>
        </tr>
      `;
    }).join('');
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ==========================================
// GAME CONTROLLER
// ==========================================

const Game = {
  currentMode: null,
  playerName: '',

  init() {
    // Load saved player name
    const saved = localStorage.getItem('bodmas_player_name');
    if (saved) {
      Utils.$('player-name').value = saved;
    }

    // Listen for Enter key on answer input
    Utils.$('solve-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') SolveMode.submitAnswer();
    });

    // Load leaderboard
    Leaderboard.load();
  },

  getPlayerName() {
    const name = Utils.$('player-name').value.trim() || 'Player';
    localStorage.setItem('bodmas_player_name', name);
    return name;
  },

  showScreen(screenId) {
    document.querySelectorAll('#main-menu, .game-screen, .leaderboard-screen').forEach(el => {
      el.classList.add('hidden');
    });
    Utils.$(screenId).classList.remove('hidden');
    window.scrollTo(0, 0);
  },

  goToMenu() {
    // Stop any running timers
    if (BusJam.timer) BusJam.timer.stop();
    if (SolveMode.timer) SolveMode.timer.stop();
    if (ArrangeMode.timer) ArrangeMode.timer.stop();

    // Hide modals
    Utils.$('level-complete-modal').classList.add('hidden');
    
    this.showScreen('main-menu');
  },

  startMode(mode) {
    this.currentMode = mode;
    this.playerName = this.getPlayerName();

    switch (mode) {
      case 'busjam':
        this.showScreen('game-busjam');
        BusJam.init();
        break;
      case 'solve':
        this.showScreen('game-solve');
        SolveMode.init();
        break;
      case 'arrange':
        this.showScreen('game-arrange');
        ArrangeMode.init();
        break;
    }
  },

  showLevelComplete(score, breakdown, mode) {
    const modal = Utils.$('level-complete-modal');
    Utils.$('level-complete-score').textContent = `+${score}`;
    
    let breakdownHtml = '';
    for (const [label, value] of Object.entries(breakdown)) {
      breakdownHtml += `<p><span>${label}</span><span>${value}</span></p>`;
    }
    Utils.$('level-complete-breakdown').innerHTML = breakdownHtml;
    
    modal.classList.remove('hidden');
    Utils.showConfetti();

    // Save score
    const timer = mode === 'busjam' ? BusJam.timer :
                  mode === 'solve' ? SolveMode.timer :
                  ArrangeMode.timer;
    const level = mode === 'busjam' ? BusJam.level :
                  mode === 'solve' ? SolveMode.level :
                  ArrangeMode.level;

    Leaderboard.saveScore(this.playerName, score, mode, level, timer ? timer.seconds : 0);
  },

  nextLevel() {
    Utils.$('level-complete-modal').classList.add('hidden');
    
    switch (this.currentMode) {
      case 'busjam': BusJam.nextLevel(); break;
      case 'solve': SolveMode.nextLevel(); break;
      case 'arrange': ArrangeMode.nextLevel(); break;
    }
  },

  showHowToPlay() {
    Utils.$('how-to-play-modal').classList.remove('hidden');
  },

  closeHowToPlay(e) {
    if (e && e.target !== e.currentTarget) return;
    Utils.$('how-to-play-modal').classList.add('hidden');
  }
};

// ==========================================
// GAME MODE 1: BUS JAM (Step-by-Step)
// ==========================================

const BusJam = {
  score: 0,
  level: 1,
  difficulty: 'easy',
  timer: null,
  currentProblem: null,
  currentStepIndex: 0,
  totalCorrect: 0,

  init() {
    this.score = 0;
    this.level = 1;
    this.totalCorrect = 0;
    this.timer = new Timer('busjam-timer');
    this.updateUI();
    this.generateLevel();
  },

  setDifficulty(diff) {
    this.difficulty = diff;
    document.querySelectorAll('#busjam-difficulty .difficulty-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    this.generateLevel();
  },

  generateLevel() {
    this.currentStepIndex = 0;
    this.timer.start();
    
    this.currentProblem = ExprGen.generate(this.difficulty);
    
    // Guard: If no steps were generated, try again
    if (!this.currentProblem.steps || this.currentProblem.steps.length === 0) {
      this.generateLevel();
      return;
    }

    Utils.$('busjam-expression').textContent = this.currentProblem.expression;
    Utils.$('busjam-instruction').textContent = 
      'Tap the sub-expression that should be evaluated FIRST according to BODMAS!';
    Utils.$('busjam-instruction').style.background = 'var(--blue)';

    this.renderBlocks();
    this.renderSteps();
    this.updateUI();
  },

  renderBlocks() {
    const container = Utils.$('busjam-blocks');
    const steps = this.currentProblem.steps;
    
    // Show clickable sub-expressions for the current step
    const step = steps[this.currentStepIndex];
    if (!step) return;

    // Build clickable options: the correct sub-expression + some distractors
    const options = this.generateOptions(step);

    container.innerHTML = options.map((opt, i) => {
      const classes = opt.isOperator ? 'busjam-block operator' : 
                      opt.isBracket ? 'busjam-block bracket' : 'busjam-block number';
      return `<div class="${classes}" data-index="${i}" data-expr="${this.escapeAttr(opt.expr)}" 
                   data-correct="${opt.correct}" onclick="BusJam.selectBlock(this)">
                ${opt.display}
              </div>`;
    }).join('');
  },

  generateOptions(step) {
    const options = [];
    const correctExpr = step.subExpr;
    
    // Add the correct answer
    options.push({
      expr: correctExpr,
      display: correctExpr,
      correct: true,
      isOperator: false
    });

    // Generate wrong options from the expression
    const tokens = this.currentProblem.tokens;
    const allSubExprs = [];
    
    // Build wrong sub-expressions from adjacent tokens
    for (let i = 0; i < tokens.length; i++) {
      if ('+-×÷'.includes(tokens[i]) && i > 0 && i < tokens.length - 1) {
        const sub = `${tokens[i-1]} ${tokens[i]} ${tokens[i+1]}`;
        if (sub !== correctExpr && !allSubExprs.includes(sub)) {
          allSubExprs.push(sub);
        }
      }
    }

    // Add up to 2-3 distractors
    const distractors = Utils.shuffle(allSubExprs).slice(0, Math.min(3, allSubExprs.length));
    distractors.forEach(d => {
      options.push({ expr: d, display: d, correct: false, isOperator: false });
    });

    // If we don't have enough distractors, add synthetic ones
    while (options.length < 3) {
      const a = Utils.rand(1, 12);
      const b = Utils.rand(1, 12);
      const op = Utils.pick(['+', '-', '×', '÷']);
      const fake = `${a} ${op} ${b}`;
      if (!options.find(o => o.expr === fake)) {
        options.push({ expr: fake, display: fake, correct: false, isOperator: false });
      }
    }

    return Utils.shuffle(options);
  },

  selectBlock(el) {
    const isCorrect = el.dataset.correct === 'true';
    
    if (isCorrect) {
      el.classList.add('correct');
      this.totalCorrect++;
      const step = this.currentProblem.steps[this.currentStepIndex];

      // Update step display
      const stepItems = document.querySelectorAll('#busjam-steps-list .step-item');
      if (stepItems[this.currentStepIndex]) {
        stepItems[this.currentStepIndex].classList.remove('active');
        stepItems[this.currentStepIndex].classList.add('completed');
        stepItems[this.currentStepIndex].innerHTML =
          `<span class="step-num">✓</span> ${step.description}`;
      }

      const points = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 20 : 30;
      this.score += points;
      this.updateUI();
      Utils.showToast(`✅ Correct! ${step.rule}: ${step.subExpr} = ${step.result}`, 'success');

      // Move to next step
      this.currentStepIndex++;

      if (this.currentStepIndex >= this.currentProblem.steps.length) {
        // Level complete!
        setTimeout(() => this.completeLevel(), 800);
      } else {
        // Show next step
        setTimeout(() => {
          const nextStep = this.currentProblem.steps[this.currentStepIndex];
          // Update the expression display to show simplified version
          Utils.$('busjam-expression').textContent = nextStep.fullExpr;
          
          // Highlight next step
          const nextStepItems = document.querySelectorAll('#busjam-steps-list .step-item');
          if (nextStepItems[this.currentStepIndex]) {
            nextStepItems[this.currentStepIndex].classList.add('active');
          }
          
          Utils.$('busjam-instruction').textContent = 
            `Step ${this.currentStepIndex + 1}: What should be evaluated next?`;
          this.renderBlocks();
        }, 600);
      }
    } else {
      el.classList.add('wrong');
      Utils.showToast('❌ Wrong! Think about BODMAS order.', 'error');
      this.score = Math.max(0, this.score - 5);
      this.updateUI();
      setTimeout(() => el.classList.remove('wrong'), 500);
    }
  },

  renderSteps() {
    const container = Utils.$('busjam-steps-list');
    const steps = this.currentProblem.steps;

    container.innerHTML = steps.map((step, i) => {
      const activeClass = i === 0 ? 'active' : '';
      return `<div class="step-item ${activeClass}">
                <span class="step-num">${i + 1}</span>
                <span>${step.rule}: ???</span>
              </div>`;
    }).join('');
  },

  completeLevel() {
    const timeTaken = this.timer.stop();
    const timeBonus = Math.max(0, 60 - timeTaken) * 2;
    const levelScore = this.score + timeBonus;

    Game.showLevelComplete(levelScore, {
      'Accuracy Points': this.score,
      'Time Bonus': `+${timeBonus}`,
      'Time Taken': Utils.formatTime(timeTaken),
      'Total': levelScore
    }, 'busjam');

    this.score = levelScore;
  },

  nextLevel() {
    this.level++;
    // Auto-increase difficulty
    if (this.level > 3 && this.difficulty === 'easy') this.setDifficulty('medium');
    if (this.level > 6 && this.difficulty === 'medium') this.setDifficulty('hard');
    this.generateLevel();
  },

  updateUI() {
    Utils.$('busjam-score').textContent = this.score;
    Utils.$('busjam-level').textContent = this.level;
  },

  escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};


// ==========================================
// GAME MODE 2: SOLVE EXPRESSION
// ==========================================

const SolveMode = {
  score: 0,
  level: 1,
  difficulty: 'easy',
  timer: null,
  currentProblem: null,
  hintsUsed: 0,
  questionsInLevel: 0,
  correctInLevel: 0,
  targetQuestions: 5,

  init() {
    this.score = 0;
    this.level = 1;
    this.hintsUsed = 0;
    this.questionsInLevel = 0;
    this.correctInLevel = 0;
    this.timer = new Timer('solve-timer');
    this.updateUI();
    this.generateQuestion();
  },

  setDifficulty(diff) {
    this.difficulty = diff;
    document.querySelectorAll('#solve-difficulty .difficulty-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    this.generateQuestion();
  },

  generateQuestion() {
    this.currentProblem = ExprGen.generate(this.difficulty);
    
    // Guard
    if (isNaN(this.currentProblem.answer)) {
      this.generateQuestion();
      return;
    }

    this.timer.start();

    Utils.$('solve-expression').textContent = this.currentProblem.expression;
    Utils.$('solve-answer').value = '';
    Utils.$('solve-answer').focus();
    Utils.$('solve-feedback').classList.add('hidden');
    Utils.$('solve-hint-panel').classList.add('hidden');
    Utils.$('solve-hint-btn').disabled = false;
    Utils.$('solve-submit-btn').disabled = false;
    this.updateUI();
  },

  submitAnswer() {
    const input = Utils.$('solve-answer');
    const userAnswer = parseFloat(input.value);
    
    if (isNaN(userAnswer)) {
      Utils.showToast('⚠️ Please enter a number!', 'error');
      return;
    }

    const correct = Math.abs(userAnswer - this.currentProblem.answer) < 0.01;
    const feedbackEl = Utils.$('solve-feedback');
    feedbackEl.classList.remove('hidden', 'correct', 'wrong');
    
    this.questionsInLevel++;

    if (correct) {
      this.correctInLevel++;
      const timeTaken = this.timer.stop();
      const basePoints = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 20 : 30;
      const timeBonus = Math.max(0, 30 - timeTaken);
      const hintPenalty = this.hintsUsed * 5;
      const points = Math.max(5, basePoints + timeBonus - hintPenalty);

      this.score += points;
      feedbackEl.className = 'feedback correct';
      feedbackEl.innerHTML = `✅ Correct! The answer is <strong>${this.currentProblem.answer}</strong>. +${points} points!`;
      Utils.showToast(`🎉 +${points} points!`, 'success');

      Utils.$('solve-submit-btn').disabled = true;

      // Check if level is complete
      if (this.questionsInLevel >= this.targetQuestions) {
        setTimeout(() => this.completeLevel(), 1200);
      } else {
        setTimeout(() => this.generateQuestion(), 1500);
      }
    } else {
      feedbackEl.className = 'feedback wrong';
      feedbackEl.innerHTML = `❌ Wrong! Try again. Your answer: ${userAnswer}`;
      this.score = Math.max(0, this.score - 3);
      input.classList.add('anim-shake');
      setTimeout(() => input.classList.remove('anim-shake'), 500);
    }

    this.hintsUsed = 0;
    this.updateUI();
  },

  showHint() {
    this.hintsUsed++;
    const hintPanel = Utils.$('solve-hint-panel');
    const hintSteps = Utils.$('solve-hint-steps');
    hintPanel.classList.remove('hidden');

    const steps = this.currentProblem.steps;
    hintSteps.innerHTML = steps.map((step, i) => `
      <div class="hint-step">
        <span class="hint-label">Step ${i + 1} — ${step.rule}</span>
        ${step.subExpr} = ${step.result}
        ${i < steps.length - 1 ? ` → ${steps[i + 1] ? steps[i + 1].fullExpr : ''}` : ''}
      </div>
    `).join('');

    Utils.showToast('💡 Hint shown! (-5 points penalty)', 'info');
  },

  skipQuestion() {
    this.questionsInLevel++;
    Utils.showToast(`⏭️ Skipped! Answer was: ${this.currentProblem.answer}`, 'info');
    
    if (this.questionsInLevel >= this.targetQuestions) {
      setTimeout(() => this.completeLevel(), 800);
    } else {
      this.generateQuestion();
    }
  },

  completeLevel() {
    const timeTaken = this.timer.stop();
    
    Game.showLevelComplete(this.score, {
      'Questions': `${this.correctInLevel}/${this.targetQuestions} correct`,
      'Accuracy': `${Math.round((this.correctInLevel / this.targetQuestions) * 100)}%`,
      'Time Taken': Utils.formatTime(timeTaken),
      'Total Score': this.score
    }, 'solve');
  },

  nextLevel() {
    this.level++;
    this.questionsInLevel = 0;
    this.correctInLevel = 0;
    if (this.level > 3 && this.difficulty === 'easy') this.setDifficulty('medium');
    if (this.level > 6 && this.difficulty === 'medium') this.setDifficulty('hard');
    this.generateQuestion();
  },

  updateUI() {
    Utils.$('solve-score').textContent = this.score;
    Utils.$('solve-level').textContent = this.level;
  }
};


// ==========================================
// GAME MODE 3: ARRANGE TO MATCH
// ==========================================

const ArrangeMode = {
  score: 0,
  level: 1,
  difficulty: 'easy',
  timer: null,
  currentProblem: null,
  placedPieces: [],
  availablePieces: [],
  attempts: 0,
  correctInLevel: 0,
  questionsInLevel: 0,
  targetQuestions: 5,

  init() {
    this.score = 0;
    this.level = 1;
    this.attempts = 0;
    this.correctInLevel = 0;
    this.questionsInLevel = 0;
    this.timer = new Timer('arrange-timer');
    this.updateUI();
    this.generatePuzzle();
  },

  setDifficulty(diff) {
    this.difficulty = diff;
    document.querySelectorAll('#arrange-difficulty .difficulty-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    this.generatePuzzle();
  },

  generatePuzzle() {
    this.placedPieces = [];
    this.attempts = 0;
    this.timer.start();

    this.currentProblem = ExprGen.generate(this.difficulty);
    
    // Guard
    if (isNaN(this.currentProblem.answer)) {
      this.generatePuzzle();
      return;
    }

    // Target is the answer
    Utils.$('arrange-target-value').textContent = this.currentProblem.answer;

    // Available pieces are the shuffled tokens
    this.availablePieces = Utils.shuffle([...this.currentProblem.tokens]);
    
    this.renderPieces();
    this.renderBuilder();
    Utils.$('arrange-feedback').classList.add('hidden');
    Utils.$('arrange-result').textContent = '= ?';
    this.updateUI();
  },

  renderPieces() {
    const container = Utils.$('arrange-pieces');
    container.innerHTML = this.availablePieces.map((piece, i) => {
      const isPlaced = this.placedPieces.includes(i);
      const type = this.getPieceType(piece);
      return `<div class="arrange-piece ${type} ${isPlaced ? 'placed' : ''}" 
                   data-index="${i}" data-value="${piece}"
                   onclick="ArrangeMode.placePiece(${i})">
                ${piece}
              </div>`;
    }).join('');
  },

  renderBuilder() {
    const container = Utils.$('arrange-slots');
    if (this.placedPieces.length === 0) {
      container.innerHTML = '<span class="drop-zone-label">Click pieces to build your expression...</span>';
    } else {
      container.innerHTML = this.placedPieces.map((pieceIdx, i) => {
        const piece = this.availablePieces[pieceIdx];
        const type = this.getPieceType(piece);
        return `<div class="arrange-slot ${type}" data-slot="${i}" 
                     onclick="ArrangeMode.removePiece(${i})" 
                     title="Click to remove">
                  ${piece}
                </div>`;
      }).join('');
    }

    // Update result preview
    this.updateResult();
  },

  placePiece(index) {
    if (this.placedPieces.includes(index)) return;
    this.placedPieces.push(index);
    this.renderPieces();
    this.renderBuilder();
  },

  removePiece(slotIndex) {
    this.placedPieces.splice(slotIndex, 1);
    this.renderPieces();
    this.renderBuilder();
  },

  clearBuilder() {
    this.placedPieces = [];
    this.renderPieces();
    this.renderBuilder();
    Utils.$('arrange-feedback').classList.add('hidden');
  },

  updateResult() {
    const expr = this.getBuiltExpression();
    const resultEl = Utils.$('arrange-result');
    
    if (!expr) {
      resultEl.textContent = '= ?';
      return;
    }

    const result = Utils.safeEval(expr);
    if (isNaN(result)) {
      resultEl.textContent = `${expr} = ???`;
    } else {
      resultEl.textContent = `${expr} = ${Math.round(result * 100) / 100}`;
    }
  },

  getBuiltExpression() {
    if (this.placedPieces.length === 0) return '';
    return this.placedPieces.map(i => this.availablePieces[i]).join(' ');
  },

  checkAnswer() {
    const expr = this.getBuiltExpression();
    if (!expr) {
      Utils.showToast('⚠️ Build an expression first!', 'error');
      return;
    }

    this.attempts++;
    this.questionsInLevel++;
    const result = Utils.safeEval(expr);
    const target = this.currentProblem.answer;
    const feedbackEl = Utils.$('arrange-feedback');
    feedbackEl.classList.remove('hidden', 'correct', 'wrong');

    if (Math.abs(result - target) < 0.01) {
      this.correctInLevel++;
      const basePoints = this.difficulty === 'easy' ? 15 : this.difficulty === 'medium' ? 25 : 40;
      const attemptPenalty = (this.attempts - 1) * 5;
      const points = Math.max(5, basePoints - attemptPenalty);
      this.score += points;

      feedbackEl.className = 'feedback correct';
      feedbackEl.innerHTML = `🎉 Correct! ${expr} = ${target}. +${points} points!`;
      Utils.showToast(`✅ Perfect! +${points}`, 'success');

      if (this.questionsInLevel >= this.targetQuestions) {
        setTimeout(() => this.completeLevel(), 1200);
      } else {
        setTimeout(() => this.generatePuzzle(), 1500);
      }
    } else {
      feedbackEl.className = 'feedback wrong';
      feedbackEl.innerHTML = `❌ Your expression gives ${Math.round(result * 100) / 100}, but the target is ${target}. Try again!`;
      this.score = Math.max(0, this.score - 3);
      Utils.showToast('❌ Not quite! Rearrange and try again.', 'error');
    }

    this.updateUI();
  },

  skipQuestion() {
    this.questionsInLevel++;
    Utils.showToast(`⏭️ Skipped! The expression was: ${this.currentProblem.expression}`, 'info');
    
    if (this.questionsInLevel >= this.targetQuestions) {
      setTimeout(() => this.completeLevel(), 800);
    } else {
      this.generatePuzzle();
    }
  },

  completeLevel() {
    const timeTaken = this.timer.stop();

    Game.showLevelComplete(this.score, {
      'Puzzles Solved': `${this.correctInLevel}/${this.targetQuestions}`,
      'Total Attempts': this.attempts,
      'Time Taken': Utils.formatTime(timeTaken),
      'Total Score': this.score
    }, 'arrange');
  },

  nextLevel() {
    this.level++;
    this.questionsInLevel = 0;
    this.correctInLevel = 0;
    this.attempts = 0;
    if (this.level > 3 && this.difficulty === 'easy') this.setDifficulty('medium');
    if (this.level > 6 && this.difficulty === 'medium') this.setDifficulty('hard');
    this.generatePuzzle();
  },

  getPieceType(piece) {
    if ('+-×÷^'.includes(piece)) return 'operator';
    if ('()'.includes(piece)) return 'bracket';
    return 'number';
  },

  updateUI() {
    Utils.$('arrange-score').textContent = this.score;
    Utils.$('arrange-level').textContent = this.level;
  }
};


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
