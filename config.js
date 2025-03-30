export const gameConfig = {
    // Game settings
    playerStartingHealth: 100,
    playerMaxHealth: 100,
    playerStartingAttack: 10,
    enemyDefaultHealth: 30,
    enemyDefaultAttack: 5,
    
    // Game messages
    welcomeMessage: `
    ╔════════════════════════════════════════════════╗
    ║             CONSOLE DUNGEON CRAWLER            ║
    ╚════════════════════════════════════════════════╝
    
    Welcome, brave adventurer! You find yourself at the entrance 
    of a mysterious dungeon. Your mission is to explore the 
    rooms, defeat enemies, collect items, and find the exit.
    
    Type 'help' to see available commands.`,
    
    helpText: `
    Available commands:
    - look: Examine your surroundings
    - go [direction]: Move in a direction (north, south, east, west)
    - take [item]: Pick up an item
    - inventory: Check your inventory
    - status: Check your health and stats
    - attack: Attack an enemy in the room
    - use [item]: Use an item from your inventory
    - map: Display the dungeon map (if you have found the map)
    - help: Show this help text
    - clear: Clear the console
    `,
    
    // Dungeon layout configuration
    dungeonSize: {width: 5, height: 5},
    
    // Items configuration
    items: {
        "health potion": { description: "A red potion that restores health", effect: "heal", value: 30 },
        "rusty sword": { description: "A worn but still effective sword", effect: "weapon", value: 5 },
        "shield": { description: "A sturdy shield", effect: "defense", value: 10 },
        "map": { description: "A worn parchment showing the dungeon layout", effect: "special" },
        "key": { description: "A brass key that might unlock something", effect: "special" }
    },
    
    // Enemy types
    enemyTypes: [
        { name: "goblin", description: "A small green creature with sharp teeth", health: 20, attack: 5 },
        { name: "skeleton", description: "A reanimated skeleton with a rusty sword", health: 30, attack: 8 },
        { name: "slime", description: "A gelatinous blob that slowly moves toward you", health: 15, attack: 3 },
        { name: "orc", description: "A burly orc with a heavy club", health: 40, attack: 10 }
    ]
};

