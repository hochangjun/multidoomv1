// Sound effects using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = false;
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
            this.createSounds();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    createSounds() {
        // Gunshot sound
        this.sounds.shoot = this.createGunshot();
        // Hit sound
        this.sounds.hit = this.createHit();
        // Death sound
        this.sounds.death = this.createDeath();
    }

    createGunshot() {
        return () => {
            if (!this.enabled) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.type = 'sawtooth';
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createHit() {
        return () => {
            if (!this.enabled) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.type = 'square';
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createDeath() {
        return () => {
            if (!this.enabled) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.8);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            oscillator.type = 'sawtooth';
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.8);
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    enable() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

const soundManager = new SoundManager();

// Constants for the game
const C = Multisynq.Constants;
C.PLAYER_SPEED = 3;
C.PLAYER_SIZE = 8;
C.BULLET_SPEED = 12;
C.BULLET_SIZE = 2;
C.BULLET_LIFETIME = 60; // frames
C.MAX_ACTIVE_PLAYERS = 8; // Increased from 4 to 8
C.RESPAWN_TIME = 300; // 5 seconds at 60fps
C.MAP_WIDTH = 800;
C.MAP_HEIGHT = 600;
C.WALL_THICKNESS = 20;
C.MONSTER_SPEED = 1.5;
C.MONSTER_SIZE = 15;
C.MONSTER_HEALTH = 300;
C.MONSTER_DAMAGE = 75;
C.SMALL_MONSTER_SPEED = 2;
C.SMALL_MONSTER_SIZE = 10;
C.SMALL_MONSTER_HEALTH = 150;
C.SMALL_MONSTER_DAMAGE = 35; // Adjusted damage
C.KNOCKBACK_FORCE = 8;
C.INVINCIBILITY_FRAMES = 90; // 1.5 seconds at 60fps
C.POWERUP_DURATION = 600; // 10 seconds at 60fps
C.POWERUP_SPAWN_CHANCE = 0.7; // 70% chance for imp to drop powerup
C.POWERUP_LIFETIME = 1800; // 30 seconds before disappearing
C.MAX_CHAT_HISTORY = 50;

// Static wall layout - no need to sync these since they never change
C.WALLS = [
    // Outer walls
    {x: 0, y: 0, w: 800, h: 20}, // top (using MAP_WIDTH/HEIGHT values directly)
    {x: 0, y: 580, w: 800, h: 20}, // bottom 
    {x: 0, y: 0, w: 20, h: 600}, // left
    {x: 780, y: 0, w: 20, h: 600}, // right
    
    // Central cross structure
    {x: 350, y: 200, w: 100, h: 20}, // horizontal center
    {x: 380, y: 150, w: 20, h: 100}, // vertical center
    
    // Corner bunkers
    {x: 100, y: 100, w: 80, h: 20}, // top-left bunker
    {x: 100, y: 100, w: 20, h: 80},
    {x: 620, y: 100, w: 80, h: 20}, // top-right bunker
    {x: 680, y: 100, w: 20, h: 80},
    {x: 100, y: 480, w: 80, h: 20}, // bottom-left bunker
    {x: 100, y: 480, w: 20, h: 80},
    {x: 620, y: 480, w: 80, h: 20}, // bottom-right bunker
    {x: 680, y: 480, w: 20, h: 80},
    
    // Side corridors
    {x: 250, y: 350, w: 20, h: 100}, // left corridor
    {x: 530, y: 350, w: 20, h: 100}, // right corridor
];

// Separate model chunks to avoid 10k message limit
class GameEntities extends Multisynq.Model {
    init() {
        this.bullets = new Set();
        this.monsters = new Set();
        this.powerups = new Set();
    }
    
    get game() { return this.wellKnownModel("modelRoot"); }
    
    spawnMonster() {
        // Spawn large monster in center area
        Monster.create({
            x: C.MAP_WIDTH / 2,
            y: C.MAP_HEIGHT / 2,
            isLarge: true
        });
    }
}
GameEntities.register("GameEntities");

class GameStatic extends Multisynq.Model {
    init() {
        // No walls set needed - walls are now in Constants
    }
    
    get game() { return this.wellKnownModel("modelRoot"); }
}
GameStatic.register("GameStatic");

// Game root model - split into chunks to avoid 10k message limit
class Game extends Multisynq.Model {
    init(_, persisted) {
        this.players = new Map(); // active players
        this.queue = []; // waiting players
        this.scores = persisted?.scores ?? {};
        // Ensure playerNames is a Map, even if loaded from persisted data
        this.playerNames = persisted?.playerNames ? new Map(Object.entries(persisted.playerNames)) : new Map();
        this.chatHistory = persisted?.chatHistory ?? [];
        
        // Create separate model chunks to avoid 10k limit
        this.gameEntities = GameEntities.create({}); // bullets, monsters, powerups
        this.gameStatic = GameStatic.create({}); // walls and static data
        
        this.subscribe(this.sessionId, "view-join", this.viewJoined);
        this.subscribe(this.sessionId, "view-exit", this.viewExited);
        
        // Chat subscriptions
        this.subscribe("chat", "post", this.handleNewChatMessage);
        
        // Walls are now static constants, no need to create them
        this.gameEntities.spawnMonster();
        this.mainLoop();
    }



    spawnMonster() {
        // Spawn large monster in center area
        Monster.create({
            x: C.MAP_WIDTH / 2,
            y: C.MAP_HEIGHT / 2,
            isLarge: true
        });
    }

    viewJoined(viewId) {
        if (this.players.size < C.MAX_ACTIVE_PLAYERS) {
            this.addActivePlayer(viewId);
        } else {
            this.queue.push(viewId);
        }
        // Ensure player name is applied or set if joining for the first time
        const player = this.players.get(viewId);
        if (player && this.playerNames.has(viewId)) {
            player.setName(this.playerNames.get(viewId));
        }
    }

    viewExited(viewId) {
        if (this.players.has(viewId)) {
            this.players.get(viewId).destroy();
            this.players.delete(viewId);
            this.processQueue();
        } else {
            const queueIndex = this.queue.indexOf(viewId);
            if (queueIndex !== -1) {
                this.queue.splice(queueIndex, 1);
            }
        }
    }

    addActivePlayer(viewId) {
        const spawnPoint = this.getRandomSpawnPoint();
        const player = Player.create({ 
            viewId, 
            x: spawnPoint.x, 
            y: spawnPoint.y,
            name: this.playerNames.get(viewId) || '' // Pass stored name or empty
        });
        this.players.set(viewId, player);
    }

    processQueue() {
        if (this.queue.length > 0 && this.players.size < C.MAX_ACTIVE_PLAYERS) {
            const nextViewId = this.queue.shift();
            this.addActivePlayer(nextViewId);
        }
    }

    getRandomSpawnPoint() {
        // Generate random spawn points away from walls and monsters
        let attempts = 0;
        while (attempts < 50) {
            const x = 50 + Math.random() * (C.MAP_WIDTH - 100);
            const y = 50 + Math.random() * (C.MAP_HEIGHT - 100);
            
            // Check if spawn point is safe (not in walls or too close to monsters)
            if (this.isSpawnPointSafe(x, y)) {
                return {x, y};
            }
            attempts++;
        }
        
        // Fallback to corner spawns if random fails
        const corners = [
            {x: 60, y: 60},
            {x: C.MAP_WIDTH - 60, y: 60},
            {x: 60, y: C.MAP_HEIGHT - 60},
            {x: C.MAP_WIDTH - 60, y: C.MAP_HEIGHT - 60},
            {x: C.MAP_WIDTH / 2, y: 60},
            {x: C.MAP_WIDTH / 2, y: C.MAP_HEIGHT - 60},
            {x: 60, y: C.MAP_HEIGHT / 2},
            {x: C.MAP_WIDTH - 60, y: C.MAP_HEIGHT / 2}
        ];
        return corners[Math.floor(Math.random() * corners.length)];
    }

    isSpawnPointSafe(x, y, radius = C.PLAYER_SIZE) {
        // Check bounds
        if (x - radius < 0 || x + radius > C.MAP_WIDTH || 
            y - radius < 0 || y + radius > C.MAP_HEIGHT) {
            return false;
        }
        
        // Check walls (now using static constants)
        for (const wall of C.WALLS) {
            if (x - radius < wall.x + wall.w &&
                x + radius > wall.x &&
                y - radius < wall.y + wall.h &&
                y + radius > wall.y) {
                return false;
            }
        }
        
        // Check distance from monsters (only for player spawns)
        if (radius === C.PLAYER_SIZE) {
            for (const monster of this.gameEntities.monsters) {
                if (monster.dead) continue;
                const dx = x - monster.x;
                const dy = y - monster.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) return false; // Stay away from monsters
            }
        }
        
        return true;
    }

    playerKilled(killedPlayer, killerPlayer) {
        if (killerPlayer) {
            killerPlayer.score++;
            // Use stored name for high scores if available
            const killerName = this.playerNames.get(killerPlayer.viewId) || killerPlayer.name;
            if (killerName) {
                this.scores[killerName] = Math.max(
                    this.scores[killerName] || 0, 
                    killerPlayer.score
                );
                this.persistSession({ scores: this.scores, playerNames: this.playerNames });
            }
        }
        
        // Remove killed player and add to queue
        this.players.delete(killedPlayer.viewId);
        this.queue.push(killedPlayer.viewId);
        killedPlayer.destroy();
        
        // Process queue after respawn delay
        this.future(C.RESPAWN_TIME).processQueue();
    }

    monsterKilled(monster) {
        if (monster.isLarge) {
            // Spawn 2 smaller monsters in safe locations
            const angle1 = Math.random() * Math.PI * 2;
            const angle2 = angle1 + Math.PI + (Math.random() - 0.5) * Math.PI;
            
            // Try to find safe spawn points
            for (let i = 0; i < 2; i++) {
                const angle = i === 0 ? angle1 : angle2;
                let spawnX = monster.x;
                let spawnY = monster.y;
                let attempts = 0;
                
                while (attempts < 10) {
                    const distance = 30 + attempts * 10; // Increase distance with attempts
                    const testX = monster.x + Math.cos(angle) * distance;
                    const testY = monster.y + Math.sin(angle) * distance;
                    
                    if (this.isSpawnPointSafe(testX, testY, C.SMALL_MONSTER_SIZE)) {
                        spawnX = testX;
                        spawnY = testY;
                        break;
                    }
                    attempts++;
                }
                
                Monster.create({
                    x: spawnX,
                    y: spawnY,
                    isLarge: false
                });
            }
        } else {
            // Small monster (imp) has chance to drop powerup
            if (Math.random() < C.POWERUP_SPAWN_CHANCE) {
                this.spawnPowerup(monster.x, monster.y);
            }
        }
        
        // Check if all monsters are dead
        const aliveMonsters = Array.from(this.gameEntities.monsters).filter(m => !m.dead);
        if (aliveMonsters.length === 0) {
            // Respawn large monster after delay
            this.gameEntities.future(15000).spawnMonster(); // Corrected future call
        }
    }

    spawnPowerup(x, y) {
        const types = ['speed', 'shield', 'damage']; // Removed rapidfire
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Find a safe spawn point near the original location
        let spawnX = x;
        let spawnY = y;
        let attempts = 0;
        
        while (attempts < 20) {
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            const testX = x + offsetX;
            const testY = y + offsetY;
            
            if (this.isSpawnPointSafe(testX, testY, 15)) { // 15px radius for powerup
                spawnX = testX;
                spawnY = testY;
                break;
            }
            attempts++;
        }
        
        Powerup.create({
            x: spawnX,
            y: spawnY,
            type: type
        });
    }

    mainLoop() {
        for (const player of this.players.values()) {
            player.update();
        }
        for (const bullet of this.gameEntities.bullets) {
            bullet.update();
        }
        for (const monster of this.gameEntities.monsters) {
            if (!monster.dead) {
                monster.update();
            }
        }
        for (const powerup of this.gameEntities.powerups) {
            powerup.update();
        }
        this.checkCollisions();
        this.future(16).mainLoop(); // Back to 60fps for all devices
    }

    checkCollisions() {
        // Bullet vs Player collisions
        for (const bullet of this.gameEntities.bullets) {
            if (bullet.destroyed) continue;
            
            for (const player of this.players.values()) {
                if (player.viewId === bullet.shooterId || player.dead) continue;
                
                const dx = bullet.x - player.x;
                const dy = bullet.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < C.PLAYER_SIZE + bullet.size) {
                    const shooter = this.players.get(bullet.shooterId);
                    player.takeDamage(bullet.damage || 20);
                    bullet.destroy();
                    
                    if (player.dead) {
                        this.playerKilled(player, shooter);
                    }
                    break;
                }
            }
        }
        
        // Bullet vs Monster collisions
        for (const monster of this.gameEntities.monsters) {
            if (monster.dead) continue;
            
            for (const bullet of this.gameEntities.bullets) {
                if (bullet.destroyed) continue;
                
                const dx = bullet.x - monster.x;
                const dy = bullet.y - monster.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < monster.size + bullet.size) {
                    monster.takeDamage(bullet.damage || 25); // Monster takes less damage per bullet
                    bullet.destroy();
                    
                    if (monster.dead) {
                        // Award points to all active players
                        const points = monster.isLarge ? 10 : 5;
                        for (const player of this.players.values()) {
                            player.score += points;
                        }
                        this.monsterKilled(monster);
                    }
                    break;
                }
            }
        }
        
        // Monster vs Player collisions
        for (const monster of this.gameEntities.monsters) {
            if (monster.dead) continue;
            
            for (const player of this.players.values()) {
                if (player.dead || player.invincible > 0) continue;
                
                const dx = monster.x - player.x;
                const dy = monster.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < monster.size + C.PLAYER_SIZE) {
                    // Apply knockback
                    const knockbackAngle = Math.atan2(player.y - monster.y, player.x - monster.x);
                    player.knockback(knockbackAngle, C.KNOCKBACK_FORCE);
                    
                    player.takeDamage(monster.damage);
                    
                    if (player.dead) {
                        this.playerKilled(player, null); // No killer for monster kills
                    }
                    break;
                }
            }
        }
        
        // Player vs Powerup collisions
        for (const powerup of this.gameEntities.powerups) {
            if (powerup.destroyed) continue;
            
            for (const player of this.players.values()) {
                if (player.dead) continue;
                
                const dx = powerup.x - player.x;
                const dy = powerup.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < C.PLAYER_SIZE + 10) { // Powerup pickup radius
                    player.applyPowerup(powerup.type);
                    powerup.destroy();
                    break;
                }
            }
        }
        
        // Bullet vs Wall collisions (now using static constants)
        for (const bullet of this.gameEntities.bullets) {
            if (bullet.destroyed) continue;
            
            for (const wall of C.WALLS) {
                if (this.bulletWallCollision(bullet, wall)) {
                    bullet.destroy();
                    break;
                }
            }
        }
    }

    bulletWallCollision(bullet, wall) {
        return bullet.x >= wall.x && 
               bullet.x <= wall.x + wall.w &&
               bullet.y >= wall.y && 
               bullet.y <= wall.y + wall.h;
    }

    handleNewChatMessage({ viewId, text }) {
        const player = this.players.get(viewId);
        const playerName = (player && player.name) ? player.name : `Marine ${Array.from(this.players.keys()).indexOf(viewId) + 1}`;
        
        // Basic HTML escaping
        const escapedText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        const message = {
            viewId,
            name: playerName,
            text: escapedText,
            timestamp: this.now()
        };
        
        this.chatHistory.push(message);
        if (this.chatHistory.length > C.MAX_CHAT_HISTORY) {
            this.chatHistory.shift();
        }
        
        this.publish(this.sessionId, "chat-updated", this.chatHistory);
        this.persistSession({ scores: this.scores, playerNames: this.playerNames, chatHistory: this.chatHistory });
    }
}
Game.register("Game");

class GameObject extends Multisynq.Model {
    get game() { return this.wellKnownModel("modelRoot"); }
    
    init(options) {
        super.init(options);
        this.x = 0;
        this.y = 0;
        this.destroyed = false;
    }
}

// Wall class removed - walls are now static constants in C.WALLS

class Monster extends GameObject {
    init(options) {
        super.init(options);
        const {x, y, isLarge} = options;
        this.x = x;
        this.y = y;
        this.isLarge = isLarge;
        
        if (isLarge) {
            this.health = C.MONSTER_HEALTH;
            this.maxHealth = C.MONSTER_HEALTH;
            this.speed = C.MONSTER_SPEED;
            this.size = C.MONSTER_SIZE;
            this.damage = C.MONSTER_DAMAGE;
        } else {
            this.health = C.SMALL_MONSTER_HEALTH;
            this.maxHealth = C.SMALL_MONSTER_HEALTH;
            this.speed = C.SMALL_MONSTER_SPEED;
            this.size = C.SMALL_MONSTER_SIZE;
            this.damage = C.SMALL_MONSTER_DAMAGE;
        }
        
        this.dead = false;
        this.target = null;
        this.lastDamageTime = 0;
        this.game.gameEntities.monsters.add(this);
    }

    update() {
        if (this.dead) return;
        
        // Find closest player to chase
        let closestPlayer = null;
        let closestDist = Infinity;
        
        for (const player of this.game.players.values()) {
            if (player.dead) continue;
            
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist) {
                closestDist = dist;
                closestPlayer = player;
            }
        }
        
        // Move towards closest player
        if (closestPlayer) {
            const dx = closestPlayer.x - this.x;
            const dy = closestPlayer.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                const moveX = (dx / dist) * this.speed;
                const moveY = (dy / dist) * this.speed;
                
                // Check wall collisions before moving
                if (!this.wouldCollideWithWalls(this.x + moveX, this.y)) {
                    this.x += moveX;
                }
                if (!this.wouldCollideWithWalls(this.x, this.y + moveY)) {
                    this.y += moveY;
                }
            }
        }
        
        // Check collision with other monsters (prevent overlapping)
        for (const otherMonster of this.game.gameEntities.monsters) {
            if (otherMonster === this || otherMonster.dead) continue;
            
            const dx = otherMonster.x - this.x;
            const dy = otherMonster.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.size + otherMonster.size + 5; // Small buffer
            
            if (dist < minDist && dist > 0) {
                // Push monsters apart
                const pushForce = (minDist - dist) / 2;
                const pushAngle = Math.atan2(dy, dx);
                
                this.x -= Math.cos(pushAngle) * pushForce;
                this.y -= Math.sin(pushAngle) * pushForce;
            }
        }
        
        // Keep in bounds
        this.x = Math.max(this.size, Math.min(C.MAP_WIDTH - this.size, this.x));
        this.y = Math.max(this.size, Math.min(C.MAP_HEIGHT - this.size, this.y));
    }

    wouldCollideWithWalls(x, y) {
        for (const wall of C.WALLS) {
            if (x - this.size < wall.x + wall.w &&
                x + this.size > wall.x &&
                y - this.size < wall.y + wall.h &&
                y + this.size > wall.y) {
                return true;
            }
        }
        return false;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.lastDamageTime = this.now();
        this.game.publish(this.game.sessionId, "sound", {type: "hit", viewId: "monster"});
        
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
            this.game.publish(this.game.sessionId, "sound", {type: "death", viewId: "monster"});
        }
    }

    destroy() {
        this.game.gameEntities.monsters.delete(this);
        super.destroy();
    }
}
Monster.register("Monster");

class Powerup extends GameObject {
    init(options) {
        super.init(options);
        const {x, y, type} = options;
        this.x = x;
        this.y = y;
        this.type = type; // 'speed', 'rapidfire', 'shield', 'damage'
        this.lifetime = C.POWERUP_LIFETIME;
        this.bobOffset = Math.random() * Math.PI * 2; // For floating animation
        this.game.gameEntities.powerups.add(this);
    }

    update() {
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.destroyed = true;
        this.game.gameEntities.powerups.delete(this);
        super.destroy();
    }
}
Powerup.register("Powerup");

class Player extends GameObject {
    init(options) { // Accept full options object
        super.init(options); // Pass full options object to GameObject.init
        const {viewId, x, y, name} = options; // Destructure after super call
        this.viewId = viewId;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.health = 100;
        this.score = 0;
        this.name = name || ''; // Initialize name from options or default
        this.dead = false;
        this.lastShot = 0;
        this.invincible = 0; // Invincibility frames
        this.knockbackVx = 0;
        this.knockbackVy = 0;
        
        // Powerup effects
        this.speedBoost = 0;
        this.shield = 0;
        this.damageBoost = 0;
        
        // Input state
        this.keys = {up: false, down: false, left: false, right: false};
        
        this.subscribe(viewId, "move", this.handleMove);
        this.subscribe(viewId, "aim", this.handleAim);
        this.subscribe(viewId, "shoot", this.handleShoot);
        this.subscribe(viewId, "set-name", this.setName);
        this.subscribe(viewId, "sound", this.handleSound);
    }

    handleMove({up, down, left, right}) {
        this.keys = {up, down, left, right};
    }

    handleAim({angle}) {
        this.angle = angle;
    }

    handleShoot() {
        if (this.dead || this.now() - this.lastShot < 200) return; // 200ms cooldown
        
        this.lastShot = this.now();
        const bulletX = this.x + Math.cos(this.angle) * C.PLAYER_SIZE;
        const bulletY = this.y + Math.sin(this.angle) * C.PLAYER_SIZE;
        
        const bulletDamage = this.damageBoost > 0 ? 40 : 20; // 5 hits to kill (20x5=100), damage boost = 2.5 hits to kill
        const bulletSize = this.damageBoost > 0 ? C.BULLET_SIZE * 5 : C.BULLET_SIZE; // Much bigger bullets
        
        Bullet.create({
            x: bulletX,
            y: bulletY,
            vx: Math.cos(this.angle) * C.BULLET_SPEED,
            vy: Math.sin(this.angle) * C.BULLET_SPEED,
            shooterId: this.viewId,
            damage: bulletDamage,
            size: bulletSize
        });
        
        // Broadcast sound to all players
        this.publish(this.game.sessionId, "sound", {type: "shoot", viewId: this.viewId});
    }

    handleSound({type, viewId}) {
        // This will be handled by the view
    }

    setName(name) {
        if (!name || name.length === 0 || name === this.name) return;
        this.name = name;
        this.game.playerNames.set(this.viewId, name); // Update centralized name store
        this.game.persistSession({ scores: this.game.scores, playerNames: this.game.playerNames }); // Persist changes
    }

    applyPowerup(type) {
        switch(type) {
            case 'speed':
                this.speedBoost = C.POWERUP_DURATION;
                break;
            case 'shield':
                this.shield = C.POWERUP_DURATION;
                this.invincible = C.POWERUP_DURATION; // Shield provides invincibility
                break;
            case 'damage':
                this.damageBoost = C.POWERUP_DURATION;
                break;
        }
        
        // Play powerup sound
        this.publish(this.game.sessionId, "sound", {type: "hit", viewId: this.viewId}); // Reuse hit sound for powerup
    }

    knockback(angle, force) {
        this.knockbackVx = Math.cos(angle) * force;
        this.knockbackVy = Math.sin(angle) * force;
        // Don't set invincibility here - let takeDamage handle it
    }

    update() {
        if (this.dead) return;
        
        // Reduce invincibility frames
        if (this.invincible > 0) {
            this.invincible--;
        }
        
        // Update powerup timers
        if (this.speedBoost > 0) this.speedBoost--;
        if (this.shield > 0) this.shield--; // Shield just counts down, no auto-invincibility
        if (this.damageBoost > 0) this.damageBoost--;
        
        // Apply movement
        this.vx = 0;
        this.vy = 0;
        
        const currentSpeed = this.speedBoost > 0 ? C.PLAYER_SPEED * 1.5 : C.PLAYER_SPEED;
        
        if (this.keys.up) this.vy -= currentSpeed;
        if (this.keys.down) this.vy += currentSpeed;
        if (this.keys.left) this.vx -= currentSpeed;
        if (this.keys.right) this.vx += currentSpeed;
        
        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            const factor = 0.707; // 1/sqrt(2)
            this.vx *= factor;
            this.vy *= factor;
        }
        
        // Apply knockback
        this.vx += this.knockbackVx;
        this.vy += this.knockbackVy;
        
        // Reduce knockback over time
        this.knockbackVx *= 0.85;
        this.knockbackVy *= 0.85;
        
        // Check wall collisions before moving
        const newX = this.x + this.vx;
        const newY = this.y + this.vy;
        
        if (!this.wouldCollideWithWalls(newX, this.y)) {
            this.x = newX;
        }
        if (!this.wouldCollideWithWalls(this.x, newY)) {
            this.y = newY;
        }
        
        // Keep in bounds
        this.x = Math.max(C.PLAYER_SIZE, Math.min(C.MAP_WIDTH - C.PLAYER_SIZE, this.x));
        this.y = Math.max(C.PLAYER_SIZE, Math.min(C.MAP_HEIGHT - C.PLAYER_SIZE, this.y));
    }

    wouldCollideWithWalls(x, y) {
        for (const wall of C.WALLS) {
            if (x - C.PLAYER_SIZE < wall.x + wall.w &&
                x + C.PLAYER_SIZE > wall.x &&
                y - C.PLAYER_SIZE < wall.y + wall.h &&
                y + C.PLAYER_SIZE > wall.y) {
                return true;
            }
        }
        return false;
    }

    takeDamage(amount = 20) { // Reduced from 50 to 20 (5 hits to kill)
        // Shield deflects one hit and activates invincibility
        if (this.shield > 0) {
            this.shield = 0; // Shield is consumed after one hit
            this.invincible = C.INVINCIBILITY_FRAMES; // Still get invincibility frames
            this.publish(this.game.sessionId, "sound", {type: "hit", viewId: this.viewId});
            return; // No damage taken but shield is gone
        }
        
        // Regular invincibility frames prevent damage
        if (this.invincible > 0) {
            return; // No damage during invincibility
        }
        
        this.health -= amount;
        this.invincible = C.INVINCIBILITY_FRAMES; // Set invincibility after taking damage
        this.publish(this.game.sessionId, "sound", {type: "hit", viewId: this.viewId});
        
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
            this.publish(this.game.sessionId, "sound", {type: "death", viewId: this.viewId});
        }
    }

    destroy() {
        this.game.players.delete(this.viewId);
        super.destroy();
    }
}
Player.register("Player");

class Bullet extends GameObject {
    init(options) {
        super.init(options);
        const {x, y, vx, vy, shooterId, damage, size} = options;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.shooterId = shooterId;
        this.damage = damage || 20;
        this.size = size || C.BULLET_SIZE;
        this.lifetime = C.BULLET_LIFETIME;
        this.game.gameEntities.bullets.add(this);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;
        
        // Remove if out of bounds or lifetime expired
        if (this.lifetime <= 0 || 
            this.x < 0 || this.x > C.MAP_WIDTH ||
            this.y < 0 || this.y > C.MAP_HEIGHT) {
            this.destroy();
        }
    }

    destroy() {
        this.destroyed = true;
        this.game.gameEntities.bullets.delete(this);
        super.destroy();
    }
}
Bullet.register("Bullet");

/////////// View Code ///////////

class GameView extends Multisynq.View {
    constructor(model) {
        super(model);
        this.model = model;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.mouseX = 0;
        this.mouseY = 0;
        this.keys = {up: false, down: false, left: false, right: false};
        
        // Mobile detection for performance optimizations
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.chatMessagesEl = document.getElementById('chat-messages');
        this.chatInputEl = document.getElementById('chat-input');
        this.chatSendButton = document.getElementById('chat-send');

        this.setupControls();
        this.smoothing = new WeakMap();
        
        // Load monster image
        this.monsterImage = new Image();
        this.monsterImage.src = 'johnwrichkid.jpg';
        this.monsterImageLoaded = false;
        this.monsterImage.onload = () => {
            this.monsterImageLoaded = true;
        };
        
        // Subscribe to sound events
        this.subscribe(this.model.sessionId, "sound", this.handleSound);
        // Subscribe to chat updates
        this.subscribe(this.model.sessionId, "chat-updated", this.renderChatMessages);
        
        // Enable audio on first user interaction
        document.addEventListener('click', () => soundManager.enable(), {once: true});
        document.addEventListener('keydown', () => soundManager.enable(), {once: true});
    }

    handleSound({type, viewId}) {
        soundManager.play(type);
    }

    setupControls() {
        // Event throttling for 60fps max
        this.lastMouseUpdate = 0;
        this.lastTouchUpdate = 0;
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyChange(e.code, true);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyChange(e.code, false);
        });
        
        // Mouse controls with proper offset calculation - throttled to 60fps
        this.canvas.addEventListener('mousemove', (e) => {
            const now = performance.now();
            if (now - this.lastMouseUpdate < 16.67) return; // 60fps = 16.67ms
            this.lastMouseUpdate = now;
            
            this.updateMousePosition(e);
            this.updateAim();
        });
        
        this.canvas.addEventListener('click', () => {
            this.publish(this.viewId, "shoot");
        });
        
        // Touch controls
        this.setupTouchControls();
        
        // Name input
        const initials = document.getElementById('initials');
        initials.addEventListener('change', () => {
            this.publish(this.viewId, "set-name", initials.value);
            // Persist name for chat
            localStorage.setItem('doom_arena_player_name', initials.value);
        });
        
        initials.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                initials.blur();
            }
        });

        // Load persisted name for initials field
        const persistedName = localStorage.getItem('doom_arena_player_name');
        if (persistedName) {
            initials.value = persistedName;
            this.publish(this.viewId, "set-name", persistedName);
        }
        
        // Chat input
        this.chatSendButton.addEventListener('click', () => this.sendChatMessage());
        this.chatInputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        // Initial render of chat if history exists from model
        this.renderChatMessages(this.model.chatHistory || []);
    }

    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
    }

    handleKeyChange(code, pressed) {
        let changed = false;
        
        switch(code) {
            case 'KeyW':
            case 'ArrowUp':
                if (this.keys.up !== pressed) {
                    this.keys.up = pressed;
                    changed = true;
                }
                break;
            case 'KeyS':
            case 'ArrowDown':
                if (this.keys.down !== pressed) {
                    this.keys.down = pressed;
                    changed = true;
                }
                break;
            case 'KeyA':
            case 'ArrowLeft':
                if (this.keys.left !== pressed) {
                    this.keys.left = pressed;
                    changed = true;
                }
                break;
            case 'KeyD':
            case 'ArrowRight':
                if (this.keys.right !== pressed) {
                    this.keys.right = pressed;
                    changed = true;
                }
                break;
            case 'Space':
                if (pressed) {
                    this.publish(this.viewId, "shoot");
                }
                break;
        }
        
        if (changed) {
            this.publish(this.viewId, "move", this.keys);
        }
    }

    updateAim() {
        const player = this.model.players.get(this.viewId);
        if (!player) return;
        
        const dx = this.mouseX - player.x;
        const dy = this.mouseY - player.y;
        const angle = Math.atan2(dy, dx);
        
        this.publish(this.viewId, "aim", {angle});
    }

    setupTouchControls() {
        const moveJoystick = document.getElementById("move-joystick");
        const moveKnob = document.getElementById("move-knob");
        const aimJoystick = document.getElementById("aim-joystick");
        const aimKnob = document.getElementById("aim-knob");
        
        let moveTouchId = null;
        let aimTouchId = null;
        let isShooting = false;
        let shootInterval = null;
        
        // Helper function to check if touch is inside joystick
        const isTouchInJoystick = (touch, joystick) => {
            const rect = joystick.getBoundingClientRect();
            return touch.clientX >= rect.left && 
                   touch.clientX <= rect.right && 
                   touch.clientY >= rect.top && 
                   touch.clientY <= rect.bottom;
        };
        
        // Global touch start handler
        document.addEventListener('touchstart', (e) => {
            let preventedDefault = false;
            
            for (let touch of e.touches) {
                // Check if touch started on movement joystick
                if (moveTouchId === null && isTouchInJoystick(touch, moveJoystick)) {
                    if (!preventedDefault) {
                        e.preventDefault();
                        preventedDefault = true;
                    }
                    moveTouchId = touch.identifier;
                    console.log('Move joystick started:', moveTouchId);
                }
                
                // Check if touch started on aim joystick
                if (aimTouchId === null && isTouchInJoystick(touch, aimJoystick)) {
                    if (!preventedDefault) {
                        e.preventDefault();
                        preventedDefault = true;
                    }
                    aimTouchId = touch.identifier;
                    isShooting = true;
                    console.log('Aim joystick started:', aimTouchId);
                    
                    // Start continuous shooting
                    if (shootInterval) clearInterval(shootInterval);
                    shootInterval = setInterval(() => {
                        if (isShooting) {
                            this.publish(this.viewId, "shoot");
                        }
                    }, 200); // Shoot every 200ms
                }
            }
        }, { passive: false });
        
        // Global touch move handler - throttled to 10fps for better mobile performance
        document.addEventListener('touchmove', (e) => {
            const now = performance.now();
            if (now - this.lastTouchUpdate < 100) return; // 10fps = 100ms
            this.lastTouchUpdate = now;
            
            let shouldPreventDefault = false;
            for (let touch of e.touches) {
                // Only prevent default if we're handling joystick touches
                if (touch.identifier === moveTouchId || touch.identifier === aimTouchId) {
                    shouldPreventDefault = true;
                    break;
                }
            }
            
            if (shouldPreventDefault) {
                e.preventDefault();
            }
            
            for (let touch of e.touches) {
                // Handle movement joystick
                if (touch.identifier === moveTouchId) {
                    const rect = moveJoystick.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const dx = touch.clientX - centerX;
                    const dy = touch.clientY - centerY;
                    
                    const maxDistance = 40; // Increased for better control
                    const clampedDx = Math.max(-maxDistance, Math.min(maxDistance, dx));
                    const clampedDy = Math.max(-maxDistance, Math.min(maxDistance, dy));
                    
                    moveKnob.style.left = `${20 + clampedDx}px`;
                    moveKnob.style.top = `${20 + clampedDy}px`;
                    
                    // Update movement with better thresholds
                    const threshold = 15;
                    const newKeys = {
                        up: clampedDy < -threshold,
                        down: clampedDy > threshold,
                        left: clampedDx < -threshold,
                        right: clampedDx > threshold
                    };
                    
                    if (JSON.stringify(newKeys) !== JSON.stringify(this.keys)) {
                        this.keys = newKeys;
                        this.publish(this.viewId, "move", this.keys);
                    }
                }
                
                // Handle aim joystick
                if (touch.identifier === aimTouchId) {
                    const rect = aimJoystick.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const dx = touch.clientX - centerX;
                    const dy = touch.clientY - centerY;
                    
                    const maxDistance = 40; // Increased for better control
                    const clampedDx = Math.max(-maxDistance, Math.min(maxDistance, dx));
                    const clampedDy = Math.max(-maxDistance, Math.min(maxDistance, dy));
                    
                    aimKnob.style.left = `${20 + clampedDx}px`;
                    aimKnob.style.top = `${20 + clampedDy}px`;
                    
                    // Update aim direction with better threshold
                    if (Math.abs(clampedDx) > 8 || Math.abs(clampedDy) > 8) {
                        const angle = Math.atan2(clampedDy, clampedDx);
                        this.publish(this.viewId, "aim", {angle});
                    }
                }
            }
        }, { passive: false });
        
        // Global touch end handler
        document.addEventListener('touchend', (e) => {
            for (let touch of e.changedTouches) {
                // Handle movement joystick end
                if (touch.identifier === moveTouchId) {
                    moveTouchId = null;
                    moveKnob.style.left = "20px";
                    moveKnob.style.top = "20px";
                    
                    // Stop movement
                    this.keys = {up: false, down: false, left: false, right: false};
                    this.publish(this.viewId, "move", this.keys);
                    console.log('Move joystick ended');
                }
                
                // Handle aim joystick end
                if (touch.identifier === aimTouchId) {
                    aimTouchId = null;
                    aimKnob.style.left = "20px";
                    aimKnob.style.top = "20px";
                    
                    // Stop shooting
                    isShooting = false;
                    if (shootInterval) {
                        clearInterval(shootInterval);
                        shootInterval = null;
                    }
                    console.log('Aim joystick ended');
                }
            }
        }, { passive: false });
        
        // Handle touch cancel (when user drags outside)
        document.addEventListener('touchcancel', (e) => {
            for (let touch of e.changedTouches) {
                if (touch.identifier === moveTouchId) {
                    moveTouchId = null;
                    moveKnob.style.left = "20px";
                    moveKnob.style.top = "20px";
                    this.keys = {up: false, down: false, left: false, right: false};
                    this.publish(this.viewId, "move", this.keys);
                }
                
                if (touch.identifier === aimTouchId) {
                    aimTouchId = null;
                    aimKnob.style.left = "20px";
                    aimKnob.style.top = "20px";
                    isShooting = false;
                    if (shootInterval) {
                        clearInterval(shootInterval);
                        shootInterval = null;
                    }
                }
            }
        }, { passive: false });
    }

    // Original multiblaster smoothing approach for smooth rendering
    smoothPos(obj) {
        if (!this.smoothing.has(obj)) {
            this.smoothing.set(obj, { x: obj.x, y: obj.y, a: obj.a, lastLogTime: 0, frameCount: 0, lastFrameTime: 0 });
        }
        const smoothed = this.smoothing.get(obj);
        const dx = obj.x - smoothed.x;
        const dy = obj.y - smoothed.y;
        if (Math.abs(dx) < 50) smoothed.x += dx * 0.3; else smoothed.x = obj.x;
        if (Math.abs(dy) < 50) smoothed.y += dy * 0.3; else smoothed.y = obj.y;
        return smoothed;
    }

    // Same for angle
    smoothPosAndAngle(obj) {
        const smoothed = this.smoothPos(obj);
        const da = obj.a - smoothed.a;
        if (Math.abs(da) < 1) smoothed.a += da * 0.3; else smoothed.a = obj.a;
        return smoothed;
    }

    update() {
        const now = performance.now();
        if (!this.lastFrameTime) this.lastFrameTime = now;
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        if (!this.logThrottle) this.logThrottle = 0;
        this.logThrottle++;

        if (this.logThrottle % 120 === 0) { // Log every ~2 seconds (120 frames at 60fps)
            const fps = deltaTime > 0 ? (1000 / deltaTime).toFixed(1) : "inf";
            console.log(`FPS: ${fps}`);
            console.log(`Players: ${this.model.players.size}, Monsters: ${this.model.gameEntities.monsters.size}, Bullets: ${this.model.gameEntities.bullets.size}, Powerups: ${this.model.gameEntities.powerups.size}`);
        }

        this.render();
        this.updateUI();
    }

    render() {
        // Performance optimization: reduce shadow blur on mobile
        this.shadowMultiplier = this.isMobile ? 0.5 : 1;
        
        this.ctx.clearRect(0, 0, C.MAP_WIDTH, C.MAP_HEIGHT);
        
        // Draw walls with Doom-style shading (now using static constants)
        this.ctx.fillStyle = "#444";
        for (const wall of C.WALLS) {
            this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            // Add highlight edge
            this.ctx.fillStyle = "#666";
            this.ctx.fillRect(wall.x, wall.y, wall.w, 2);
            this.ctx.fillRect(wall.x, wall.y, 2, wall.h);
            this.ctx.fillStyle = "#444";
        }
        
        // Draw powerups
        for (const powerup of this.model.gameEntities.powerups) {
            this.drawPowerup(powerup);
        }
        
        // Draw monsters with smoothed positions
        for (const monster of this.model.gameEntities.monsters) {
            if (!monster.dead) {
                this.drawMonster(monster);
            }
        }
        
        // Draw players with smoothed positions
        for (const player of this.model.players.values()) {
            this.drawPlayer(player);
        }
        
        // Draw bullets with smoothed positions  
        for (const bullet of this.model.gameEntities.bullets) {
            this.drawBullet(bullet);
        }
    }

    drawPowerup(powerup) {
        const time = this.now() / 100; // For animation
        const bobY = Math.sin(time + powerup.bobOffset) * 3; // Floating animation
        
        // Use smoothed positions
        const {x, y} = this.smoothPos(powerup);
        
        const colors = {
            speed: '#00ffff',    // Cyan
            shield: '#00ff00',   // Green
            damage: '#ff6600'    // Orange
        };
        
        const symbols = {
            speed: '⚡',
            shield: '🛡️',
            damage: '💥'
        };
        
        const color = colors[powerup.type] || '#ffffff';
        
        // Flash when about to expire (last 5 seconds)
        const timeLeft = powerup.lifetime;
        const shouldFlash = timeLeft < 300 && Math.floor(timeLeft / 10) % 2 === 0; // Flash every 10 frames
        
        if (!shouldFlash) {
            // Glow effect (reduced on mobile)
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 20 * this.shadowMultiplier;
            
            // Powerup circle
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y + bobY, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner circle
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y + bobY, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            
            // Symbol
            this.ctx.fillStyle = color;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(symbols[powerup.type] || '?', x, y + bobY + 6);
        }
    }

    drawMonster(monster) {
        const glowColor = monster.isLarge ? "#ff0066" : "#ff6600";
        const label = monster.isLarge ? "DEMON" : "IMP";
        
        // Use smoothed positions
        const {x, y} = this.smoothPos(monster);
        
        // Draw the @johnwrichkid.jpg image if loaded, otherwise fallback to circles
        if (this.monsterImageLoaded) {
            // Calculate image size based on monster size
            const imageSize = monster.size * 4; // Make image diameter = monster size * 2
            const imageX = x - imageSize / 2;
            const imageY = y - imageSize / 2;
            
            // Add glow effect around the image
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = (monster.isLarge ? 20 : 15) * this.shadowMultiplier;
            
            // Draw the image
            this.ctx.drawImage(this.monsterImage, imageX, imageY, imageSize, imageSize);
            
            this.ctx.shadowBlur = 0;
        } else {
            // Fallback to original circle rendering if image not loaded
            const bodyColor = monster.isLarge ? "#cc0044" : "#cc4400";
            const coreColor = monster.isLarge ? "#ff0066" : "#ff6600";
            
            // Monster body with menacing glow
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = (monster.isLarge ? 20 : 15) * this.shadowMultiplier;
            this.ctx.fillStyle = bodyColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, monster.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner core
            this.ctx.shadowBlur = (monster.isLarge ? 10 : 8) * this.shadowMultiplier;
            this.ctx.fillStyle = coreColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, monster.size * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
        
        // Health bar
        const barWidth = monster.isLarge ? 40 : 30;
        const barHeight = monster.isLarge ? 8 : 6;
        const barX = x - barWidth / 2;
        const barY = y - monster.size - 15;
        
        // Background
        this.ctx.fillStyle = "#330000";
        this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        // Health bar
        const healthPercent = monster.health / monster.maxHealth;
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillRect(barX, barY, healthPercent * barWidth, barHeight);
        
        // Monster label
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 3;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `bold ${monster.isLarge ? 10 : 8}px Orbitron, monospace`;
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, x, y + monster.size + 25);
        this.ctx.shadowBlur = 0;
    }

    drawBullet(bullet) {
        // Enhanced bullets for damage boost
        const isDamageBoost = bullet.damage > 20;
        const glowColor = isDamageBoost ? "#ff6600" : "#ffff00";
        const coreColor = isDamageBoost ? "#ff3300" : "#ffffff";
        
        // Use smoothed positions
        const {x, y} = this.smoothPos(bullet);
        
        // Glow effect
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = isDamageBoost ? 20 : 10;
        this.ctx.fillStyle = glowColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, bullet.size + (isDamageBoost ? 3 : 1), 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core bullet
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = coreColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, bullet.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPlayer(player) {
        const isMe = player.viewId === this.viewId;
        
        // Use smoothed positions for all players
        const {x, y, a} = this.smoothPosAndAngle(player);
        
        // Invincibility blinking when hit (but not for shield)
        if (player.invincible > 0 && player.shield === 0 && Math.floor(player.invincible / 5) % 2 === 0) {
            return; // Skip drawing every 5 frames for flashing effect when actually hit
        }
        
        // Shield visual effect - draw first so it's behind player
        if (!player.dead && player.shield > 0) {
            const shieldRadius = C.PLAYER_SIZE + 8;
            const shieldAlpha = 0.3 + 0.2 * Math.sin(this.now() / 100); // Pulsing effect
            
            this.ctx.shadowColor = "#00ff00";
            this.ctx.shadowBlur = 15;
            this.ctx.strokeStyle = `rgba(0, 255, 0, ${shieldAlpha})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(x, y, shieldRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Inner shield glow
            this.ctx.fillStyle = `rgba(0, 255, 0, ${shieldAlpha * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, shieldRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
        
        // Player body with glow and powerup effects
        if (!player.dead) {
            let glowColor = isMe ? "#00ff00" : "#ff0000";
            
            // Powerup glow effects
            if (player.speedBoost > 0) glowColor = "#00ffff";
            else if (player.shield > 0) glowColor = "#00ff00";
            else if (player.damageBoost > 0) glowColor = "#ff6600";
            
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = 15;
        } else {
            this.ctx.shadowColor = "#666";
            this.ctx.shadowBlur = 5;
        }
        
        this.ctx.fillStyle = player.dead ? "#666" : (isMe ? "#00ff00" : "#ff3333");
        this.ctx.beginPath();
        this.ctx.arc(x, y, C.PLAYER_SIZE, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        if (!player.dead) {
            // Direction indicator with glow
            this.ctx.shadowColor = "#ffffff";
            this.ctx.shadowBlur = 5;
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(
                x + Math.cos(a) * C.PLAYER_SIZE * 1.5,
                y + Math.sin(a) * C.PLAYER_SIZE * 1.5
            );
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
        
        // Health bar with Doom styling
        if (!player.dead) {
            const barWidth = 24;
            const barHeight = 6;
            const barX = x - barWidth / 2;
            const barY = y - C.PLAYER_SIZE - 12;
            
            // Background
            this.ctx.fillStyle = "#330000";
            this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            
            // Health bar
            const healthPercent = player.health / 100;
            const healthColor = healthPercent > 0.6 ? "#00ff00" : 
                               healthPercent > 0.3 ? "#ffff00" : "#ff0000";
            
            this.ctx.fillStyle = healthColor;
            this.ctx.fillRect(barX, barY, healthPercent * barWidth, barHeight);
        }
        
        // Name and score with glow
        this.ctx.shadowColor = isMe ? "#00ff00" : "#ff3333";
        this.ctx.shadowBlur = 3;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 12px Orbitron, monospace";
        this.ctx.textAlign = "center";
        const name = player.name || `Marine ${Array.from(this.model.players.keys()).indexOf(player.viewId) + 1}`;
        this.ctx.fillText(`${name} [${player.score}]`, x, y + C.PLAYER_SIZE + 20);
        this.ctx.shadowBlur = 0;
        
        // Powerup indicators with flashing when about to expire
        if (isMe && !player.dead) {
            let powerupText = '';
            const flashThreshold = 120; // Flash in last 2 seconds
            
            if (player.speedBoost > 0) {
                const shouldFlash = player.speedBoost < flashThreshold && Math.floor(player.speedBoost / 10) % 2 === 0;
                if (!shouldFlash) powerupText += '⚡ ';
            }
            if (player.shield > 0) {
                const shouldFlash = player.shield < flashThreshold && Math.floor(player.shield / 10) % 2 === 0;
                if (!shouldFlash) powerupText += '🛡️ ';
            }
            if (player.damageBoost > 0) {
                const shouldFlash = player.damageBoost < flashThreshold && Math.floor(player.damageBoost / 10) % 2 === 0;
                if (!shouldFlash) powerupText += '💥 ';
            }
            
            if (powerupText) {
                this.ctx.shadowColor = "#ffffff";
                this.ctx.shadowBlur = 3;
                this.ctx.fillStyle = "#ffffff";
                this.ctx.font = "bold 14px Arial";
                this.ctx.fillText(powerupText, x, y + C.PLAYER_SIZE + 35);
                this.ctx.shadowBlur = 0;
            }
        }
    }

    updateUI() {
        const status = document.getElementById('status');
        const queue = document.getElementById('queue');
        
        const isActive = this.model.players.has(this.viewId);
        const queuePosition = this.model.queue.indexOf(this.viewId);
        
        if (isActive) {
            const player = this.model.players.get(this.viewId);
            if (player.dead) {
                status.innerHTML = '<span class="status-dead">MARINE DOWN - RESPAWNING...</span>';
            } else {
                status.textContent = `HEALTH: ${player.health} | FRAGS: ${player.score}`;
            }
        } else if (queuePosition !== -1) {
            status.textContent = `WAITING FOR DEPLOYMENT - POSITION: ${queuePosition + 1}`;
        } else {
            status.textContent = "CONNECTING TO MARS BASE...";
        }
        
        const aliveMonsters = Array.from(this.model.gameEntities.monsters).filter(m => !m.dead);
        const totalPlayers = this.model.players.size + this.model.queue.length;
        queue.textContent = `MARINES: ${this.model.players.size}/${C.MAX_ACTIVE_PLAYERS} | QUEUE: ${this.model.queue.length} | TOTAL: ${totalPlayers} | DEMONS: ${aliveMonsters.length}`;
    }

    sendChatMessage() {
        const text = this.chatInputEl.value.trim();
        if (text) {
            this.publish("chat", "post", { viewId: this.viewId, text });
            this.chatInputEl.value = '';
        }
    }

    renderChatMessages(chatHistory) {
        if (!this.chatMessagesEl) return;
        this.chatMessagesEl.innerHTML = ''; // Clear existing messages
        
        (chatHistory || []).forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('chat-message');
            
            const senderSpan = document.createElement('span');
            senderSpan.classList.add('sender');
            senderSpan.textContent = `${msg.name}: `;
            
            const textSpan = document.createElement('span');
            textSpan.classList.add('text');
            textSpan.innerHTML = msg.text; // Text is already escaped by model
            
            msgDiv.appendChild(senderSpan);
            msgDiv.appendChild(textSpan);
            
            this.chatMessagesEl.appendChild(msgDiv);
        });
        
        this.chatMessagesEl.scrollTop = this.chatMessagesEl.scrollHeight;
    }

    detach() {
        super.detach();
        // Clean up event listeners if needed
    }
}

// Initialize the game - Remove QR code widget
// Multisynq.App.makeWidgetDock(); // Commented out to remove QR code

// Configuration - these should be set via build-time environment variables
const CONFIG = {
    apiKey: 'REPLACE_WITH_API_KEY',
    appId: 'REPLACE_WITH_APP_ID',
    sessionName: 'REPLACE_WITH_SESSION_NAME', 
    sessionPassword: 'REPLACE_WITH_SESSION_PASSWORD'
};

Multisynq.Session.join({
    apiKey: CONFIG.apiKey,
    appId: CONFIG.appId,
    name: CONFIG.sessionName,
    password: CONFIG.sessionPassword,
    model: Game,
    view: GameView,
}); 
