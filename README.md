# MULTIDOOM 🔥

A real-time multiplayer browser game that runs WITHOUT servers! Built with [Multisynq](https://multisynq.io/)'s revolutionary P2P synchronization technology.

## 🎮 Features

- **Real-time Multiplayer Combat** - Battle monsters with other players in real-time
- **Cross-Platform** - Works on desktop and mobile devices
- **Touch Controls** - Dual joystick system for mobile gameplay
- **Spatial Audio** - Immersive sound effects using Web Audio API
- **Power-ups & Weapons** - Collect upgrades during gameplay
- **Live Chat** - Communicate with other players
- **No Server Required** - Uses P2P technology for seamless multiplayer

## 🚀 Quick Start

### Prerequisites
- Node.js (for build process)
- A Multisynq API key from [multisynq.io/coder](https://multisynq.io/coder)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/multidoom.git
cd multidoom
```

2. Copy the environment file and add your credentials:
```bash
cp env.example .env
```

3. Edit `.env` and add your Multisynq credentials:
```
MULTISYNQ_API_KEY=your-actual-api-key
MULTISYNQ_SESSION_NAME=your-session-name
MULTISYNQ_SESSION_PASSWORD=your-session-password
```

4. Build and run:
```bash
npm run build
npm run dev
```

5. Open your browser to `http://localhost:8000`

## 🎯 Controls

### Desktop
- **WASD** - Move player
- **Mouse** - Aim
- **Click/Space** - Shoot
- **Enter** - Chat

### Mobile
- **Left Joystick** - Move
- **Right Joystick** - Aim & Shoot
- **Touch anywhere** - Additional shooting

## 🏗️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript, HTML5 Canvas
- **Multiplayer**: Multisynq P2P synchronization
- **Audio**: Web Audio API
- **Mobile**: Touch-optimized controls

### Key Files
- `game.js` - Main game logic and Multisynq models
- `styles.css` - UI and mobile control styling
- `index.html` - Game HTML structure
- `build.js` - Build script for environment variable injection

### Performance Optimizations
- Touch events throttled to 20fps for smooth performance
- Efficient collision detection
- Optimized rendering loop

## 🌐 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `MULTISYNQ_API_KEY`
   - `MULTISYNQ_SESSION_NAME`
   - `MULTISYNQ_SESSION_PASSWORD`
4. Deploy!

### Other Platforms

The build process creates a `dist/` folder with all files ready for static hosting on any platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Multisynq](https://multisynq.io/) - revolutionary multiplayer web framework
- Inspired by classic arena shooters
- Special thanks to the Multisynq team for their amazing technology

## 🐛 Issues & Support

Found a bug? Have a feature request? Please open an issue on GitHub!

---

Made with ❤️ for the multiplayer web gaming community 