var eden = {
    name: "6th Eden",
    x: 8, // Default for now. 256 might be too big. Hope to have user prompt eventually.
    y: 8, // Default for now. 256 might be too big. Hope to have user prompt eventually.
    turn: 1,
    
    /*
    Dynamism represents the average of how often Eden's regions of cells fluctuate.
    The level is the average in turn numbers between each fluctuation phase.
    The dynamism changes after every fluctuation. So, when the level is high, the world is
    slow to change and the rate of change is slow to change. But, when the level is low, the
    world is quick to change, as is the rate of change. Thus, it is the only dynamic
    qualities in the sim whose level affects its own rate of change.
    */
    dynamism: {level: null, flux: null, surge: 1};
    garden: [],
    cellCount: 0,
    
    entities: {
        primogenitor: {name: "Caritas", id: "00000000"},
        essenceCount: 32; // All entities that have existed, whether alive or in the afterworld.
        lostSouls: 255,
        
        /*
        Contains references to all entities, using their id numbers as the map keys.
        Maps are easier to iterate through than objects, so using one seemed more appropriate.
        */
        living: new Map(),
        aliveCount: 0,
        deathCount: 0 // Total of all deaths regardless of cause.
    }
};
