```
# 💰 SpendWise - Personal Budget Tracker

![SpendWise Screenshot](https://via.placeholder.com/800x400?text=SpendWise+App+Preview)  
*(Replace with actual screenshot link)*

A **cross-platform personal finance app** built with React, Capacitor, and Firebase to help users track expenses, manage budgets, and visualize spending habits.

**Live Demo**: [spendwise](https://spend-wise-blue.vercel.app/) 
**Android APK**: [Download link coming soon](#) 

---

## 🚀 Features
- 📊 **Expense Tracking**: Log daily transactions with categories
- 🎯 **Budget Management**: Set monthly limits per category
- 📈 **Data Visualization**: Interactive charts (Powered by Chart.js)
- 🔐 **Secure Auth**: Supabase Authentication (Google/Email)
- 📱 **Cross-Platform**: Android/iOS/Web via Capacitor
- 🔄 **Offline Sync**: Local-first architecture with Firebase backup

---

## 🛠️ Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend  | React, TypeScript, Vite |
| UI Library | Material-UI, TailwindCSS |
| Backend   | Firebase (Auth, Firestore) |
| Mobile    | Capacitor (Android/iOS) |
| Charts    | Chart.js |
| Testing   | Jest, React Testing Library |

---

## 🏗️ Setup & Installation

### Prerequisites
- Node.js ≥18
- Android Studio (for mobile builds)
- Firebase CLI (if modifying backend)

### Local Development
1. Clone the repo:
   ```bash
   git clone https://github.com/judeotine/SpendWise.git
   cd SpendWise
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

### Android Build
1. Sync with Capacitor:
   ```bash
   npm run build
   npx cap sync android
   ```
2. Open in Android Studio:
   ```bash
   npx cap open android
   ```
3. Build signed APK:  
   *Refer to [BUILDING.md](docs/BUILDING.md) for signing instructions*

---

## 📜 License
MIT © [Ocen Jude Otine](https://github.com/judeotine)

---

## 📬 Contact
For feature requests/bugs, [open an issue](https://github.com/judeotine/SpendWise/issues).  
For direct contact: judextine28@gmail.com
```

---
