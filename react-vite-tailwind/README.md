# ArtistHub - Artist Management Platform

एक complete React application जो artists को manage करने के लिए बनाया गया है, जिसमें modern UI और smooth navigation है।

## 🚀 Project Overview

**ArtistHub** एक artist booking और management platform है जहाँ users:
- Different categories के artists को browse कर सकते हैं
- Artists को book कर सकते हैं
- Artist profiles देख सकते हैं
- Search और filter कर सकते हैं

## 🛠️ Technologies Used

- **React 19.2.0** - Frontend Framework
- **Vite 7.3.1** - Build Tool & Dev Server
- **Tailwind CSS 3.4.1** - Styling Framework
- **JavaScript (ES6+)** - Programming Language
- **PostCSS** - CSS Processing
- **Autoprefixer** - CSS Compatibility

## 📁 Project Structure

```
react-vite-tailwind/
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── Navbar.jsx      # Navigation bar with search
│   │   ├── HeroSlider.jsx  # Auto-rotating hero section
│   │   ├── CategoryCircles.jsx # Category selection
│   │   ├── TrendingArtists.jsx # Trending section
│   │   ├── CategorySection.jsx # Category-wise artists
│   │   └── Footer.jsx     # Footer component
│   ├── pages/              # Main Pages
│   │   ├── HomePage.jsx     # Home page with all sections
│   │   ├── CategoryPage.jsx # Category detail page
│   │   └── ArtistPage.jsx # Artist detail page
│   ├── contexts/           # React Context
│   │   └── RouterContext.jsx # Custom routing system
│   ├── data/              # Mock Data
│   │   └── mockData.js    # Categories, artists, config
│   └── App.jsx           # Main App component
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── package.json         # Dependencies & scripts
```

## 🎨 Key Features

### 1. **Navigation System**
- Sticky navbar with scroll effects
- Category dropdown menu
- Mobile responsive menu

### 2. **Hero Section**
- Auto-rotating slides (3 slides)
- Call-to-action buttons
- Artist preview cards

### 3. **Category System**
- 8 artist categories
- Circular category icons with gradients
- Horizontal scrolling

### 4. **Artist Cards**
- Price display
- Verified badges
- Trending indicators

## 🚀 How to Run This Project

### Installation Steps

1. **Dependencies install करें:**
```bash
npm install
```

2. **Development server start करें:**
```bash
npm run dev
```

3. **Browser में खोलें:**
```
http://localhost:5173
```

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Build preview
npm run preview

# Code linting
npm run lint
```

## 🎯 How This Project Works

### 1. **Routing System**
- Custom React Context (`RouterContext`) का use किया गया है
- State-based navigation (`currentPath`, `params`)
- Smooth page transitions

### 2. **Data Management**
- Mock data `mockData.js` में stored है
- Categories, artists, और configuration data
- Real-time filtering और searching

### 3. **Component Architecture**
- **Components**: Reusable UI elements
- **Pages**: Complete page layouts
- **Context**: Global state management

### 4. **Styling System**
- **Tailwind CSS**: Utility-first styling
- **Custom Colors**: Brand color palette
- **Animations**: CSS keyframes और transitions

## 🔧 Customization Guide

### 1. **Brand Colors Change**
`tailwind.config.js` में:
```javascript
colors: {
  brand: {
    500: '#ee7711', // Main brand color
    // ... other shades
  }
}
```

### 2. **Add New Categories**
`mockData.js` में:
```javascript
export const categories = [
  { 
    id: 9, 
    name: 'New Category', 
    icon: '🎭', 
    color: 'from-green-500 to-teal-600', 
    count: 100 
  }
];
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🎨 Custom CSS Classes

### Utility Classes
- `.hide-scrollbar` - Scrollbar hide करने के लिए
- `.card-hover` - Card hover effects
- `.gradient-text` - Gradient text effect
- `.animate-fadeIn` - Fade in animation

### Brand Colors
- `brand-500` - Main orange color (#ee7711)
- `brand-400` - Light orange (#f19332)
- `brand-600` - Dark orange (#df5d07)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Build files `dist/` folder में generate होंगे।

---

**Version:** 1.0.0  
**Last Updated:** 2024

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
