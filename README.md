# Anna University Down Detector

A real-time status checker for the **Anna University COE Results Website** ([coe.annauniv.edu](https://coe.annauniv.edu/home)).

## Features

- **Live Status Check** — Pings the Anna University server on demand
- **Connection Visualizer** — Animated request/response path (Device -> AU Servers)
- **Mobile Friendly** — Responsive layout with vertical connection diagram on mobile
- **Glassmorphism UI** — Modern dark design with smooth animations
- **Quick Result Link** — Direct link to the Anna University Results page

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [allorigins.win](https://allorigins.win/) — CORS proxy for HTTP status checks

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## How It Works

When you click **Check Status**, the app sends a request through the `allorigins.win` CORS proxy to `https://coe.annauniv.edu/home` and checks the HTTP response code.

- **HTTP 200–399** — Website is reachable
- **Any other code or error** — Website is down

## Project Structure

```
client/
├── src/
│   ├── App.jsx       # Main component (status logic + UI)
│   ├── App.css       # Styles & animations
│   └── main.jsx      # Entry point
├── index.html        # Entry HTML
└── README.md
```

---

Made for Anna University students to quickly check if the COE results portal is accessible.
