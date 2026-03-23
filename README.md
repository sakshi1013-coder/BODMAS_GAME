# 🧮 BODMAS Battle — Interactive Math Game

> **Transform learning BODMAS into a fun, competitive, and interactive experience with visual gameplay and a scoring system.**

An interactive web-based educational game that teaches **BODMAS** (Brackets, Orders, Division, Multiplication, Addition, Subtraction) through engaging visual gameplay — inspired by puzzle and sorting games like Bus Jam.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)

---

## 🎯 Objective

Help students understand and apply BODMAS rules through **interactive, visual, and gamified experiences** rather than traditional text-based problem solving.

---

## 🎨 Design Theme — Neobrutalism

The UI follows a **Neobrutalist Game Theme**, featuring:

- 🟡 Bold, high-contrast colors (yellow, black, red, blue, purple)
- 🔲 Thick borders and sharp edges
- 🔤 Large typography (Space Grotesk + Space Mono)
- 🎨 Raw, playful, slightly "unpolished" aesthetic
- 🧱 Flat UI with strong offset shadows
- 📦 Boxy buttons and elements
- 🔵 Dotted background pattern

---

## 🎮 Game Modes

### 1. 🚌 Bus Jam — Step by Step
Tap the correct sub-expression to evaluate at each step, following BODMAS order.

- Multiple-choice sub-expression blocks
- Visual feedback — ✅ green for correct, ❌ red shake for wrong
- Step-by-step solution tracking panel
- Score increases for correct steps

### 2. 🧠 Solve — Expression Challenge
Classic expression solving with a built-in hint system.

- Type your answer in the input field
- **💡 Hint button** reveals step-by-step BODMAS breakdown
- Scoring based on accuracy + time taken − hint penalty
- 5 questions per level

### 3. 🧩 Arrange — Build the Expression
Given a target output, arrange numbers and operators to form the correct expression.

- Click pieces to place them in the builder area
- **Real-time evaluation** as you build
- Click placed pieces to remove them
- Score based on correctness and attempts

---

## 🏆 Leaderboard System

- **PHP backend** stores scores in `leaderboard.json`
- **localStorage fallback** when PHP is unavailable
- Filter by game mode: All / Bus Jam / Solve / Arrange
- Top 20 scores with 🥇🥈🥉 medals
- Reset option available

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5 |
| **Styling** | Vanilla CSS (Neobrutalist theme) |
| **Logic** | Vanilla JavaScript |
| **Backend** | PHP (score storage & leaderboard API) |
| **Storage** | File-based JSON + localStorage fallback |

**No frameworks. No dependencies. No build tools.** Just pure web tech.

---

## 📁 Project Structure

```
bodmas_game/
├── index.html          # Main page — all screens & game modes
├── style.css           # Complete Neobrutalist theme (810+ lines)
├── script.js           # Game engine — expression generator, BODMAS solver, 3 modes
├── api.php             # PHP backend for leaderboard CRUD
├── index.php           # PHP entry point / router
└── leaderboard.json    # File-based score storage
```

---

## ⚙️ Core Features

| Feature | Description |
|---------|-------------|
| 🎮 3 Game Modes | Bus Jam, Solve, Arrange |
| 🎨 Neobrutalist UI | Bold colors, thick borders, sharp shadows |
| 📊 Score Tracking | Points with time bonuses |
| 🏆 Leaderboard | PHP + localStorage with filtering & medals |
| ⏱️ Timer | Per-level timing with time bonus scoring |
| 📈 Difficulty Levels | Easy → Medium → Hard (auto-progression) |
| 💡 Hint System | Step-by-step BODMAS breakdowns |
| 🎯 Visual Feedback | Animations — shake, pop, bounce, confetti |
| 👤 Player Names | Saved to localStorage |
| 📱 Responsive | Works on mobile and desktop |

---

## 🧠 How BODMAS Works

| Letter | Operation | Priority |
|--------|-----------|----------|
| **B** | Brackets `( )` | 1st (highest) |
| **O** | Orders (Powers) | 2nd |
| **D** | Division `÷` | 3rd |
| **M** | Multiplication `×` | 3rd |
| **A** | Addition `+` | 4th |
| **S** | Subtraction `−` | 4th |

> Division & Multiplication have **equal priority** (left to right).  
> Addition & Subtraction have **equal priority** (left to right).

---

## 🔧 Expression Generator

The game engine automatically generates expressions based on difficulty:

- **Easy**: 2 operations — `a + b × c`, `a ÷ b + c`
- **Medium**: 3 operations with brackets — `(a + b) × c`, `a × b + c ÷ d`
- **Hard**: 4-5 operations with nested brackets — `(a + b) × (c - d)`

Division always produces **whole numbers** for clean gameplay.

---

## 🎯 Scoring System

| Component | Points |
|-----------|--------|
| Correct answer (Easy) | +10 |
| Correct answer (Medium) | +20 |
| Correct answer (Hard) | +30 |
| Time bonus | +1 per second under 30s |
| Hint penalty | −5 per hint used |
| Wrong answer | −3 to −5 |

---

## 📄 API Endpoints (PHP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `api.php?action=get_scores` | Get all scores |
| `GET` | `api.php?action=get_scores&mode=busjam` | Filter by mode |
| `POST` | `api.php` `{action: "save_score", ...}` | Save a score |
| `POST` | `api.php` `{action: "reset_scores"}` | Reset leaderboard |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for learning BODMAS the fun way!
</p>
