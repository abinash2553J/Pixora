# Pixora ✨

> A minimal, high-resolution website screenshot studio and visual archiver with custom backdrop and gradient frames.

Pixora allows users to instantly capture public web pages, preview them within a clean window mockup, customize solid colors or gradient backdrops, and export high-resolution PNG images.

---

## 🌟 Key Features

- **Instant High-Res Web Capture**: Enter any naked domain or standard URL (`stripe.com`, `https://apple.com`) to generate pixel-perfect viewport snapshots.
- **Customizable Frame Backdrops**:
  - **Full 16.7M Solid Color Spectrum**: Native color picker + curated minimalist presets.
  - **Curated Gradients**: *Midnight*, *Cosmic*, *Emerald*, *Amber Dawn*, *Graphite*, *Silver Mist*.
  - **Dual-Color Gradient Builder**: Select start/end colors and angle (135°, 90°, 180°, 45°) with live compilation.
  - **Freeform Custom CSS**: Direct input support for `radial-gradient`, `linear-gradient`, `rgba`, or hex.
- **Interactive Multi-Step Loader**: Smooth telemetry progress bar and status feedback during cloud rasterization.
- **Exhibition Mockup Frame**: macOS-style window header bar with traffic light indicators and responsive canvas.
- **Direct PNG Downloader**: High-resolution PNG export with CORS-safe blob handling and automated filename generation.
- **Minimalist & Clean UI/UX**: Built with modern typography, subtle hairlines, and dark theme aesthetics.

---

## 🛠️ Tech Stack

- **Markup**: Semantic HTML5 with accessibility attributes and metadata.
- **Styling**: Vanilla CSS3 with CSS custom properties (design tokens), flexbox, grid, and smooth micro-animations.
- **Scripting**: Vanilla JavaScript (ES6+) with asynchronous API fetch streams, canvas fallbacks, and DOM orchestration.
- **Fonts**: *Plus Jakarta Sans* & *Space Grotesk* via Google Fonts.

---

## 📁 Project Structure

```
Pixora/
├── index.html        # Main application layout (3 sections: homepage, loader, result)
├── style.css         # Minimalist design system, responsive styling, and animations
├── script.js         # Capture pipeline, gradient customizer, and download engine
└── README.md         # Project documentation
```

---

## ⚙️ Core DOM Architecture & IDs

Pixora relies on a 3-section state system with standardized IDs:

| Element ID | Description |
| :--- | :--- |
| `section1` | **Homepage / Input Section**: URL input, preset suggestions, and backdrop color/gradient controls. |
| `section2` | **Loader Section**: Interactive spinner, progress bar, and status indicator. |
| `section3` | **Result & Exhibition Section**: Screenshot preview frame and action buttons. |
| `websiteAdress` | Input field for entering the target website URL. |
| `bgColor` | Input field for frame background (hex, rgb, or CSS gradients). |
| `resultImg` | `<img>` tag that renders the captured screenshot. |
| `Download` | Button to download the generated screenshot as a PNG file. |

---

## 🚀 Getting Started

No build step or Node.js environment is required.

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/yourusername/Pixora.git
   ```

2. **Open Locally**:
   - Double-click `index.html` to open it directly in any modern browser (Chrome, Edge, Firefox, Safari, Brave).
   - Alternatively, use a local server like VS Code **Live Server** or `npx serve .`

---

## 🌐 Rendering Pipeline & Fallbacks

1. **Primary Stream**: High-resolution headless browser rasterization via cloud renderers.
2. **Secondary Fallback**: Secondary backup renderer for complex or dynamic single-page applications.
3. **Local Canvas Fallback**: Integrated 2D HTML5 Canvas generator that ensures a preview is always rendered even when offline or behind strict network firewalls.

---

## 📄 License

MIT License. Free for personal and commercial use.
