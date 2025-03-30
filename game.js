import { gameConfig } from './config.js';

class DungeonGame {
    constructor() {
        this.config = gameConfig;
        this.player = {
            health: this.config.playerStartingHealth,
            maxHealth: this.config.playerMaxHealth,
            attack: this.config.playerStartingAttack,
            inventory: [],
            currentRoom: { x: 0, y: 0 }
        };
        
        this.dungeon = this.generateDungeon();
        this.console = document.getElementById('console-output');
        this.input = document.getElementById('console-input');
        this.gameOver = false;
        
        this.input.addEventListener('keydown', this.handleInput.bind(this));
        this.printMessage(this.config.welcomeMessage);
        this.describeRoom(this.getCurrentRoom());
    }
    
    handleInput(event) {
        if (event.key === 'Enter') {
            const command = this.input.value.trim().toLowerCase();
            this.printMessage(`<span class="game-command">> ${command}</span>`, false);
            this.input.value = '';
            
            if (this.gameOver) {
                this.printMessage('<span class="error-message">Game over. Refresh the page to start a new game.</span>');
                return;
            }
            
            this.processCommand(command);
        }
    }
    
    processCommand(command) {
        const args = command.split(' ');
        const action = args[0];
        
        switch (action) {
            case 'help':
                this.printMessage(this.config.helpText);
                break;
                
            case 'look':
                this.describeRoom(this.getCurrentRoom());
                break;
                
            case 'go':
                this.movePlayer(args[1]);
                break;
                
            case 'take':
                this.takeItem(args.slice(1).join(' '));
                break;
                
            case 'inventory':
                this.showInventory();
                break;
                
            case 'status':
                this.showStatus();
                break;
                
            case 'attack':
                this.attackEnemy();
                break;
                
            case 'use':
                this.useItem(args.slice(1).join(' '));
                break;
                
            case 'map':
                this.showMap();
                break;
                
            case 'clear':
                this.clearConsole();
                break;
                
            case '':
                // Do nothing for empty command
                break;
                
            default:
                this.printMessage('<span class="error-message">Unknown command. Type "help" for a list of commands.</span>');
        }
    }
    
    generateDungeon() {
        const { width, height } = this.config.dungeonSize;
        const dungeon = [];
        
        // Initialize empty dungeon
        for (let y = 0; y < height; y++) {
            dungeon[y] = [];
            for (let x = 0; x < width; x++) {
                dungeon[y][x] = {
                    description: this.generateRoomDescription(),
                    items: [],
                    enemy: null,
                    visited: false,
                    exits: {
                        north: y > 0,
                        south: y < height - 1,
                        east: x < width - 1,
                        west: x > 0
                    }
                };
            }
        }
        
        // Place exit
        const exitX = width - 1;
        const exitY = height - 1;
        dungeon[exitY][exitX].isExit = true;
        dungeon[exitY][exitX].description = "A room with a bright light shining from above. You can see a way out!";
        
        // Place items and enemies
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Skip the starting room and exit room
                if ((x === 0 && y === 0) || (x === exitX && y === exitY)) {
                    continue;
                }
                
                // 40% chance to place an item
                if (Math.random() < 0.4) {
                    const itemKeys = Object.keys(this.config.items);
                    const randomItem = itemKeys[Math.floor(Math.random() * itemKeys.length)];
                    dungeon[y][x].items.push({
                        name: randomItem,
                        ...this.config.items[randomItem]
                    });
                }
                
                // 30% chance to place an enemy, but not in rooms with the key or map
                if (Math.random() < 0.3) {
                    const enemyTypes = this.config.enemyTypes;
                    const randomEnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                    dungeon[y][x].enemy = {
                        ...randomEnemyType,
                        currentHealth: randomEnemyType.health
                    };
                }
            }
        }
        
        // Place special items (map and key)
        let placedMap = false;
        let placedKey = false;
        
        while (!placedMap || !placedKey) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            
            // Skip starting and exit rooms
            if ((x === 0 && y === 0) || (x === exitX && y === exitY)) {
                continue;
            }
            
            if (!placedMap && !dungeon[y][x].items.some(item => item.name === "map")) {
                dungeon[y][x].items.push({
                    name: "map",
                    ...this.config.items.map
                });
                placedMap = true;
            }
            
            if (!placedKey && !placedMap && !dungeon[y][x].items.some(item => item.name === "key")) {
                dungeon[y][x].items.push({
                    name: "key",
                    ...this.config.items.key
                });
                placedKey = true;
            }
        }
        
        // Mark starting room as visited
        dungeon[0][0].visited = true;
        
        return dungeon;
    }
    
    generateRoomDescription() {
        const roomTypes = [
            "A dark room with cobwebs in the corners.",
            "A damp chamber with water dripping from the ceiling.",
            "A musty room with broken furniture scattered around.",
            "A dimly lit room with ancient runes carved into the walls.",
            "A cold stone room with flickering torches on the walls.",
            "A spacious chamber with pillars supporting the ceiling.",
            "A small room with a cracked stone floor.",
            "A room filled with the smell of decay.",
            "An eerie room with strange symbols etched into the floor.",
            "A room with walls covered in mysterious paintings."
        ];
        
        return roomTypes[Math.floor(Math.random() * roomTypes.length)];
    }
    
    getCurrentRoom() {
        const { x, y } = this.player.currentRoom;
        return this.dungeon[y][x];
    }
    
    describeRoom(room) {
        let description = `<span class="game-response">${room.description}</span>`;
        
        // Describe exits
        const exits = [];
        Object.entries(room.exits).forEach(([direction, exists]) => {
            if (exists) exits.push(direction);
        });
        
        description += `\n<span class="game-response">Exits: ${exits.join(', ')}</span>`;
        
        // Describe items
        if (room.items.length > 0) {
            description += '\n<span class="game-response">You see:</span>';
            room.items.forEach(item => {
                description += `\n<span class="item-found"> - ${item.name}: ${item.description}</span>`;
            });
        }
        
        // Describe enemy
        if (room.enemy) {
            description += `\n<span class="enemy-text">There is a ${room.enemy.name} here! ${room.enemy.description}</span>`;
        }
        
        if (room.isExit) {
            if (this.player.inventory.some(item => item.name === "key")) {
                description += `\n<span class="success-message">This is the exit! You can escape using your key!</span>`;
            } else {
                description += `\n<span class="game-response">This appears to be the exit, but it's locked. You need a key.</span>`;
            }
        }
        
        this.printMessage(description);
    }
    
    movePlayer(direction) {
        if (!direction) {
            this.printMessage('<span class="error-message">Go where? Specify a direction (north, south, east, west).</span>');
            return;
        }
        
        const currentRoom = this.getCurrentRoom();
        
        if (!['north', 'south', 'east', 'west'].includes(direction)) {
            this.printMessage('<span class="error-message">Invalid direction. Use north, south, east, or west.</span>');
            return;
        }
        
        if (!currentRoom.exits[direction]) {
            this.printMessage('<span class="error-message">You can\'t go that way.</span>');
            return;
        }
        
        if (currentRoom.enemy) {
            this.printMessage('<span class="error-message">You can\'t leave while there\'s an enemy in the room!</span>');
            return;
        }
        
        const { x, y } = this.player.currentRoom;
        
        switch (direction) {
            case 'north': this.player.currentRoom.y -= 1; break;
            case 'south': this.player.currentRoom.y += 1; break;
            case 'east': this.player.currentRoom.x += 1; break;
            case 'west': this.player.currentRoom.x -= 1; break;
        }
        
        const newRoom = this.getCurrentRoom();
        newRoom.visited = true;
        
        this.printMessage(`<span class="game-response">You move ${direction}.</span>`);
        this.describeRoom(newRoom);
        
        // Check if player reached the exit with a key
        if (newRoom.isExit && this.player.inventory.some(item => item.name === "key")) {
            this.victory();
        }
    }
    
    takeItem(itemName) {
        if (!itemName) {
            this.printMessage('<span class="error-message">Take what? Specify an item.</span>');
            return;
        }
        
        const room = this.getCurrentRoom();
        const itemIndex = room.items.findIndex(item => 
            item.name.toLowerCase() === itemName.toLowerCase());
        
        if (itemIndex === -1) {
            this.printMessage(`<span class="error-message">There is no ${itemName} here.</span>`);
            return;
        }
        
        const item = room.items[itemIndex];
        this.player.inventory.push(item);
        room.items.splice(itemIndex, 1);
        
        this.printMessage(`<span class="success-message">You took the ${item.name}.</span>`);
    }
    
    showInventory() {
        if (this.player.inventory.length === 0) {
            this.printMessage('<span class="game-response">Your inventory is empty.</span>');
            return;
        }
        
        let inventoryText = '<span class="game-response">Inventory:</span>';
        this.player.inventory.forEach(item => {
            inventoryText += `\n<span class="item-found"> - ${item.name}: ${item.description}</span>`;
        });
        
        this.printMessage(inventoryText);
    }
    
    showStatus() {
        const healthPercent = Math.floor((this.player.health / this.player.maxHealth) * 100);
        let healthBar = '[';
        const barLength = 20;
        const filledLength = Math.floor((healthPercent / 100) * barLength);
        
        for (let i = 0; i < barLength; i++) {
            healthBar += i < filledLength ? '█' : '░';
        }
        
        healthBar += ']';
        
        const statusText = `
<span class="health-info">Health: ${this.player.health}/${this.player.maxHealth} ${healthBar}</span>
<span class="game-response">Attack power: ${this.player.attack}</span>`;
        
        this.printMessage(statusText);
    }
    
    attackEnemy() {
        const room = this.getCurrentRoom();
        
        if (!room.enemy) {
            this.printMessage('<span class="error-message">There is no enemy to attack!</span>');
            return;
        }
        
        // Player attacks enemy
        const damage = this.player.attack;
        room.enemy.currentHealth -= damage;
        
        this.printMessage(`<span class="game-response">You attack the ${room.enemy.name} for ${damage} damage!</span>`);
        
        // Check if enemy is defeated
        if (room.enemy.currentHealth <= 0) {
            this.printMessage(`<span class="success-message">You defeated the ${room.enemy.name}!</span>`);
            room.enemy = null;
            return;
        }
        
        // Enemy attacks player
        const enemyDamage = room.enemy.attack;
        this.player.health -= enemyDamage;
        
        this.printMessage(`<span class="enemy-text">The ${room.enemy.name} attacks you for ${enemyDamage} damage!</span>`);
        
        // Check player health
        if (this.player.health <= 0) {
            this.gameOver = true;
            this.printMessage(`<span class="error-message">You have been defeated! GAME OVER</span>`);
        }
    }
    
    useItem(itemName) {
        if (!itemName) {
            this.printMessage('<span class="error-message">Use what? Specify an item from your inventory.</span>');
            return;
        }
        
        const itemIndex = this.player.inventory.findIndex(item => 
            item.name.toLowerCase() === itemName.toLowerCase());
        
        if (itemIndex === -1) {
            this.printMessage(`<span class="error-message">You don't have a ${itemName} in your inventory.</span>`);
            return;
        }
        
        const item = this.player.inventory[itemIndex];
        
        switch (item.effect) {
            case 'heal':
                const healAmount = Math.min(item.value, this.player.maxHealth - this.player.health);
                this.player.health += healAmount;
                this.printMessage(`<span class="success-message">You used the ${item.name} and recovered ${healAmount} health!</span>`);
                this.player.inventory.splice(itemIndex, 1);
                break;
                
            case 'weapon':
                this.player.attack += item.value;
                this.printMessage(`<span class="success-message">You equipped the ${item.name}, increasing your attack by ${item.value}!</span>`);
                this.player.inventory.splice(itemIndex, 1);
                break;
                
            case 'special':
                if (item.name === 'map') {
                    this.showMap();
                } else if (item.name === 'key' && this.getCurrentRoom().isExit) {
                    this.victory();
                } else {
                    this.printMessage(`<span class="game-response">You examine the ${item.name}, but can't use it here.</span>`);
                }
                break;
                
            default:
                this.printMessage(`<span class="game-response">You can't use the ${item.name} right now.</span>`);
        }
    }
    
    showMap() {
        if (!this.player.inventory.some(item => item.name === 'map')) {
            this.printMessage('<span class="error-message">You don\'t have a map!</span>');
            return;
        }
        
        const { width, height } = this.config.dungeonSize;
        let mapDisplay = '<span class="map-display">Dungeon Map:\n';
        
        for (let y = 0; y < height; y++) {
            // Top border of rooms
            for (let x = 0; x < width; x++) {
                mapDisplay += '+---';
            }
            mapDisplay += '+\n';
            
            // Room contents
            for (let x = 0; x < width; x++) {
                const room = this.dungeon[y][x];
                const currentRoom = this.player.currentRoom.x === x && this.player.currentRoom.y === y;
                
                mapDisplay += '|';
                
                if (currentRoom) {
                    mapDisplay += ' @ '; // Player position
                } else if (room.visited) {
                    if (room.isExit) {
                        mapDisplay += ' E '; // Exit
                    } else if (room.enemy) {
                        mapDisplay += ' ! '; // Enemy
                    } else {
                        mapDisplay += '   '; // Empty visited room
                    }
                } else {
                    mapDisplay += ' ? '; // Unexplored room
                }
            }
            mapDisplay += '|\n';
        }
        
        // Bottom border
        for (let x = 0; x < width; x++) {
            mapDisplay += '+---';
        }
        mapDisplay += '+\n';
        
        mapDisplay += 'Legend: @ = You, ? = Unexplored, ! = Enemy, E = Exit</span>';
        
        this.printMessage(mapDisplay);
    }
    
    victory() {
        this.gameOver = true;
        this.printMessage(`
<span class="success-message">
╔════════════════════════════════════════════════╗
║                  VICTORY!                       ║
╚════════════════════════════════════════════════╝

You've successfully escaped the dungeon! Congratulations!

Refresh the page to play again.
</span>`);
    }
    
    clearConsole() {
        this.console.innerHTML = '';
    }
    
    printMessage(message, addNewLine = true) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = addNewLine ? message : message;
        this.console.appendChild(messageElement);
        this.console.scrollTop = this.console.scrollHeight;
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DungeonGame();
});

