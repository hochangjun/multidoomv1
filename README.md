# MultiDoom v1 🔥

A real-time multiplayer 2D Doom-style arena shooter built with Multisynq framework. Battle demons, collect powerups, and compete with up to 8 players simultaneously!

## 🎮 Game Features

### Core Gameplay
- **8-Player Multiplayer**: Up to 8 active players with automatic queue system
- **Real-time Combat**: Smooth WASD movement with mouse aiming
- **Strategic Map**: Doom-inspired level design with walls and bunkers
- **Monster AI**: Large Demons that split into smaller Imps when killed
- **Powerup System**: 4 different powerups dropped by defeated Imps

### Powerups 💥
- **⚡ Speed Boost**: 50% faster movement for 10 seconds
- **🛡️ Shield**: Complete invincibility with visual barrier for 10 seconds
- **💥 Damage Boost**: 2x damage + 2.5x bigger bullets for 10 seconds

### Combat System
- **Player Health**: 100 HP, 50 damage per hit (2 hits to kill)
- **Monster Mechanics**: 
  - Large Demons: 300 HP, 75 damage (1-hit kill)
  - Small Imps: 150 HP, 37 damage (3 hits to kill)
- **Knockback Physics**: Players get pushed away when hit by monsters
- **Invincibility Frames**: 1.5 seconds of immunity after taking damage

### Technical Features
- **Mobile Responsive**: Touch controls with on-screen joystick
- **Sound Effects**: Procedural audio using Web Audio API
- **Enhanced Visual Effects**: 
  - 2.5x bigger bullets for damage boost
  - Pulsing shield barriers with invincibility
  - Flashing powerup indicators when expiring
  - Larger, more visible powerup pickups
- **Bandwidth Optimized**: Efficient data structures for 10KB message limit
- **Queue System**: FCFS (First Come, First Served) player management

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hochangjun/multidoomv1.git
   cd multidoomv1
   ```

2. **Open the game**:
   - Simply open `multiblaster.html` in any modern web browser
   - Or deploy to any static hosting service (Vercel, Netlify, GitHub Pages)

3. **Play**:
   - Enter your name in the bottom-left input
   - Use WASD to move, mouse to aim, click/spacebar to shoot
   - Mobile: Use touch controls with on-screen joystick

## 🎯 Controls

### Desktop
- **WASD** or **Arrow Keys**: Movement
- **Mouse**: Aim direction
- **Left Click** or **Spacebar**: Shoot
- **Enter Name**: Bottom-left input field

### Mobile
- **Touch Joystick**: Movement (appears on touch)
- **Touch Release**: Shoot
- **Tap Screen**: Alternative shooting

## 🏗️ Architecture

Built with the **Multisynq** multiplayer framework:
- **Client-side synchronized VMs**: No server-side code needed
- **Deterministic simulation**: Same game state across all clients
- **Real-time synchronization**: Sub-100ms latency
- **Automatic state persistence**: Join/leave seamlessly

### Key Components
- `Game`: Root model managing all game state
- `Player`: Individual player entities with powerup effects
- `Monster`: AI-controlled enemies with splitting mechanics
- `Powerup`: Collectible items with timed effects
- `Bullet`: Projectiles with enhanced damage variants
- `GameView`: Rendering and input handling

## 🔧 Configuration

Key constants in `multiblaster.html`:
```javascript
C.MAX_ACTIVE_PLAYERS = 8;        // Maximum simultaneous players
C.POWERUP_SPAWN_CHANCE = 0.7;    // 70% chance for imp powerup drop
C.POWERUP_DURATION = 600;        // 10 seconds at 60fps
C.RESPAWN_TIME = 300;            // 5 seconds respawn delay
```

## 🌐 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy as static site
4. Game supports unlimited concurrent sessions

### Other Platforms
- **Netlify**: Drag & drop `multiblaster.html`
- **GitHub Pages**: Enable in repository settings
- **Any Static Host**: Upload single HTML file

## 🎨 Customization Ideas

### Immediate Improvements
- **More Powerups**: Invisibility, multi-shot, homing bullets
- **Map Variants**: Multiple level layouts
- **Player Customization**: Different colors, skins
- **Sound Enhancement**: More audio effects, music

### Advanced Features
- **Pseudo 2.5D Graphics**: Doom-style raycasting renderer
- **Crypto Integration**: Wagering system with testnet tokens
- **Tournament Mode**: Bracket-style competitions
- **Spectator Mode**: Watch games in progress

## 📊 Performance

- **Bandwidth**: ~2-5KB/s per player (well under 10KB limit)
- **Latency**: <100ms with good internet connection
- **Scalability**: Tested with 8 concurrent players
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

## 🐛 Known Issues

- Occasional sync delays with poor network conditions
- Mobile touch controls may need calibration on some devices
- Powerup symbols may not display on older browsers

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Credits

- **Multisynq Framework**: Real-time multiplayer synchronization
- **Doom**: Inspiration for game design and aesthetics
- **Freedoom Project**: Open-source Doom-compatible assets and inspiration
- **Web Audio API**: Procedural sound generation
- **Canvas 2D**: Graphics rendering

---

**Ready to dominate the arena? Deploy and start fragging! 🔫** 