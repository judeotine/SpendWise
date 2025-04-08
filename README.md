```
# 💰 SpendWise - Personal Budget Tracker

A **cross-platform personal finance app** built with React, Capacitor, and Firebase to help users track expenses, manage budgets, and visualize spending habits.

## 📱 SpendWise Mockups

### Key Screens Preview

<div align="center">
  <table>
    <!-- Row 1 -->
    <tr>
      <td align="center"><img src="/public/mockups/1.png" width="200"/><br><b>Login Screen</b></td>
      <td align="center"><img src="/public/mockups/3.png" width="200"/><br><b>Dashboard</b></td>
      <td align="center"><img src="/public/mockups/4.png" width="200"/><br><b>Expense Tracking</b></td>
    </tr>
    <!-- Row 2 -->
    <tr>
      <td align="center"><img src="/public/mockups/5.png" width="200"/><br><b>Budget Overview</b></td>
      <td align="center"><img src="/public/mockups/6.png" width="200"/><br><b>Reports</b></td>
      <td align="center"><img src="/public/mockups/7.png" width="200"/><br><b>Categories</b></td>
    </tr>
    <!-- Row 3 (single centered image) -->
    <tr>
      <td colspan="3" align="center"><img src="/public/mockups/8.png" width="200"/><br><b>Settings</b></td>
    </tr>
  </table>
</div>

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
