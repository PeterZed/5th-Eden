document.open();

var divineMethods = {    
    information: {
        /*
        Cycles through an object's properties, writing the key and value to the document.
        The first for-loop works if the value is a map, and the second for-loop runs if
        the value is an object.
        
        Could do with a lot of reworking, but it functions at least. At this time, I don't think
        it's relevant to the sim's actual functioning, so I don't much feel like optimizing it.
        */
        detailProperties: function(input) {
            var output;
    
            if (input instanceof Object) {document.write("{");}
            
            for (var key in input) {
                output = key + ": ";
                
                if (input[key] instanceof Array) {
                    document.write(output + "[");
            
                    output = divineMethods.information.detailArray(input[key]);
                } else if (input[key] instanceof Map) {
                    document.write(output + "{");
                    
                    output = divineMethods.information.detailMap(input[key]);
                } else if (input[key] instanceof Object) {
                    document.write(output);
                    
                    divineMethods.information.detailProperties(input[key]);
                    output = "";
                } else {
                    document.write(output + input[key]);
                    output = "";
                }
                
                document.write(output);
                document.write("<p></p>");
            }
    
            if (input instanceof Object) {document.write("}");}
        },
        
        detailArray: function(array) {
            if (array[0] instanceof Array) {
                return "IGNORE]";
            }
    
            array.forEach(divineMethods.information.detailProperties);
            return "]";
        },

        detailMap: function(map) {
            var mapOutput = "";
    
            map.forEach(function(value, key) {
                mapOutput += key + ", ";
            });
    
            mapOutput = mapOutput.slice(0, mapOutput.length - 2);
            document.write("<p>" + mapOutput + "</p>")
    
            return "}";
        },

        detailObject: function(object) {
            for (var key in object) {
                if (!(object[key] instanceof Object)) {
                    document.write("<p>" + key + ": " + object[key] + "</p>");
                } else {                
                    document.write(key + ": ");
                    divineMethods.information.detailProperties(object[key]);
                }
            }
            return "}";
        },
        
        /*
        document.writeln() for eden and every entity and cell and lists their properties,
        as well as the afterworld's properties and entities.
        */
        detailAll: function() {
            document.writeln("<h1><u>The 5th Eden</u></h1>");
            
            divineMethods.information.detailEden();
            divineMethods.information.detailCells();
            divineMethods.information.detailEntities();
            divineMethods.information.detailAfterworld();
            divineMethods.information.detailAfterworldEntities();
        },
    
        /*
        Details the 5th Eden's information - its size, all of the stats related to its entities, etc.
        */
        detailEden: function() {            
            document.writeln("<h2>The World</h2>");
            divineMethods.information.detailProperties(eden);
        },
        
        /*
        Presents every detail about the cell and its properties.
        */
        detailCell: function(cell) {          
            document.writeln("<h4><u>Cell #" + cell.id + "</u></h4>");
            divineMethods.information.detailProperties(cell);
        },
        
        /*
        For each cell, presents every detail about it and its properties.
        */
        detailCells: function() {
            document.writeln("<h3>The Garden</h3>");
            
            edenMethods.gardenIteration(divineMethods.information.detailCell);
        },
        
        /*
        For a living entity, presents every detail about it and its properties.
        */
        detailEntity: function(entity) {
            document.writeln("<h4><u>ID #" + entity.id + "</u></h4>");
            divineMethods.information.detailProperties(entity);
        },
        
        /*
        For each living entity, presents every detail about it and its properties.
        */
        detailEntities: function() {
            document.writeln("<h3>The Living</h3>");
            
            eden.entities.living.forEach(divineMethods.information.detailEntity);
        },
        
        /*
        Details the afterworld's information - all stats related to it and its entities, etc.
        */
        detailAfterworld: function() {
            document.writeln("<h2>The Afterworld</h2>");
            divineMethods.information.detailProperties(afterworld);
        },
        
        /*
        For each dead entity, presents every detail about it and its properties.
        */
        detailAfterworldEntities: function() {
            document.writeln("<h3>The Dead</h3>");
            
            afterworld.denizens.forEach(divineMethods.information.detailEntity);
        }
    }
};

var eden = {
    name: "5th Eden",
    x: 3, // Default for now. 256 might be too big. Hope to have user prompt eventually. Maybe 64?
    y: 3, // Default for now. 256 might be too big. Hope to have user prompt eventually. Maybe 64?
    turn: 1,
    
    garden: [],
    cellCount: 0,
    
    entities: {
        primogenitor: {name: "Caritas", id: "00000000"},
        essenceCount: 32, // All entities that have existed, whether alive or in the afterworld.
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

function Cell(xCoord, yCoord) {
    this.id = eden.cellCount;
    this.x = xCoord;
    this.y = yCoord;
    this.entities = new Map();
    
    /*
    Lists references to this cell and its eight adjacent neighbors. Used when displaying the
    minimap in the sidebar for the currently selected cell or entity.
    */
    this.localCells = [];
    
    /*
    ENVIRONMENTAL CONDITIONS: The range of values is [0,100], inclusive, out to two decimal places.
    E.g., 98.76.
    
    For this.conditions, the properties will likely be altered, perhaps some even removed in order
    to simplify them. Maybe keep it to just 8. Maybe 8 + 2 for nutrients and waste. Maybe get rid
    of the nutrients condition and keep it at waste as the sole factor for a cell being populated
    for too long. By what mechanism do nutrients or waste decrease? Some story-driven reason? No
    decision yet, just leaving it uncomplicated for now. Every variable functions the same, though
    in the future they may be more like their real physical analogues. For example, instead of
    randomly distributing acidity from 0-100, maybe do a normal distribution centered at 50, and
    most entities thrive at that level. Likewise, salinity levels are more likely to be lower than
    higher in real life, and the capacity for an entity to survive in a salty environment decreases
    rapidly as salinity rises.
    
    Perhaps remove this.conditions.pressure because it is not a factor that occurs much in real
    world biology, except with extreme depth. Likewise, airComposition is a factor
    that is considered more on a global level over very long periods of time. Maybe it is
    implementable though?
    
    For now the conditions are identical: Their values can be anywhere 0-100, the difference
    between the condition's level and the entity's attribute level have the same effect on the
    entity's survival chances regardless of which condition it is, etc. However, later on they may
    flux at significantly different levels. For instance, light would probably have a relatively
    small range in which it varies cyclically. Just some things to consider.
    
    The higher the nutrients level, the greater the health gain that tick? Maybe "nutrition" 
    corresponds to nutrients instead of "health", and "health" is used for something else? Though
    probably nutrients influence health gain/loss either way.
    */
    this.conditions = [
        {condition: "light", level: null, flux: null, surge: null, 
            jerk: null, hyperjerk: 0.01},
        {condition: "radiation", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "temperature", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "pressure", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "airComposition", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "chemicalEnvironment", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "aridity", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "acidity", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "salinity", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "nutrients", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {condition: "waste", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
    ];
}

function Entity(xCoord, yCoord) {
    this.id = "00000000"; // Primogenitor's ID.
    this.name = "";
    this.ancestry = []; // The entity's ancestors, in order. Contains their ID numbers only.
    this.lineage = []; // All its direct descendants, from oldest to youngest.
    
    this.x = xCoord;
    this.y = yCoord;
    this.localCells = eden.garden[this.y][this.x].localCells;
    this.locality = eden.name;
    
    this.state = "Alive";
    this.turnOfGenesis = eden.turn;
    this.genesisLocality = "Cell #" + eden.garden[this.y][this.x].id + ", " +
        "Coordinates (" + this.x + ", " + this.y + ")"; // Because 'location' is a reserved keyword
    this.age = 0; // Number of ticks survived thus far.
    this.victories = 0; // Number of other entities this entity has slain in battle.
    
    this.turnOfDeath; // Still alive.
    this.deathLocality;
    this.slayer; // Not necessarily slain in battle. Gives slayer's ID if it is slain.
    
    /*
    It's just pickiness, but I dislike the naming for the attributes. It makes it simple to tell
    which goes with which cell condition, but it feels like the entity's nature is more dependent
    on the cell rather than independent of it with corresponding conditions. The three exceptions
    are radiationTolerance, health, and wasteTolerance - those clearly correspond, but refer to the
    entity's nature itself rather than the cell's. For example, lightOptimal connotes that the
    reference is to the cell's condition rather than the entity's attribute corresponding to that
    condition.
    
    I used an array of objects instead of an object with each key's value an object because when
    calculating survivalOdds I needed each attribute to always be in the same location so I could
    compare it to its corresponding condition (the conditions also being in an array with the same
    order).
    
    The flux is analogous velocity - sort of - as the rate of change of the attribute level.
    In actuality, when inheriting an attribute, it is the variance for the distribution around
    the mean level from which a sample is drawn.
    Similarly, surge is like acceleration: It is the second derivative of the level with
    respect to one reproductive cycle - except really it's variance and not a continuous change.
    Note: In physics, 'surge' is another name for 'jerk'. I co-opted the term name because it's
    shorter than 'acceleration'.
    And jerk is similar to the third derivative of position with respect to time.
    These values control how much variation there is in a given attribute between parent and child
    in a lineage.
      
    It helps to conceptualize these as static amounts by which each respective attribute changes in
    a lineage rather than a mean around which a distribution of potential values fall
    between parent and child.
    flux is the difference in level between parent and child of a lineage.
    surge is the difference between a parent's difference in level between it and its children,
    and its children's difference in level between them and their own children. That is,
    a parent's surge influences the difference of level between its children and its
    grandchildren.
    jerk is the difference between a parent's difference of the difference in its level between
    it and its children, and its children's difference of the difference in their level between
    them and their own chidlren. That is, a parent's jerk influences the difference of level
    between its grandchildren and its great-grandchildren: It requires three generations to affect
    the magnitude of the difference between a lineage's parent and its child.
    hyperjerk is way too much of a mouthful. So, simply put, it requires four generations to
    affect the magnitude of the difference between a lineage's parent and its child.
    
    The hyperjerk affects the jerk of its child, which affects the surge of its
    grandchildren, which affects the flux of its great-grandchidlren, which is indicative of the
    magnitude of difference between the great-grandchildren's level and their own children's
    level for that attribute.
    
    The reason I chose this to occur is because I read that, in a certain sense, the jerk equation
    of a system is the minimal setting for solutions of systems showing chaotic behavior. I rather
    am enamored with the idea of chaos ruling this simulation along with probability. Each has a
    hand in making the future of the simulation unpredictable - I hope. I don't know the maths well
    enough to definitely make this assertion, to be honest. But with hyperjerk in effect, things
    will certainly be deterministic yet complicated as hell to predict.
    */
    this.attributes = [
        {attribute: "lightOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "radiationTolerance", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "temperatureOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "pressureOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "airCompositionOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "chemicalEnvironmentOptimal", level: null, flux: null, surge: null, 
            jerk: null, hyperjerk: 0.01},
        {attribute: "aridityOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "acidityOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "salinityOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "nutrientsOptimal", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01},
        {attribute: "wasteTolerance", level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01}
    ];
    
    /*
    Attributes are representative of an entity's physical characteristics: Properties that affect
    their survival odds.
    Traits are representative of an entity's personality characteristics: Properties that affect
    their behavioral patterns - which also indirectly affect their survival odds by what actions
    they take. Right now the only one I have is riskThreshold, which is used whenthe entity
    decides to reproduce or not.
    
    I divided this because more traits may come in the future, and because it makes it easier to
    iterate through the attributes and corresponding cell conditions without riskThreshold in that
    list.
    */
    this.traits = {
        riskThreshold: {level: null, flux: null, surge: null,
            jerk: null, hyperjerk: 0.01}
    };
    
    /*
    The survivalOdds[1][1] represents odds of survival on the present cell. The other indices
    represent the survival odds on the local cells.
    */
    this.survivalOdds = [[0, 0, 0],
                         [0, 0, 0],
                         [0, 0, 0]];
                         
    /*
    The battleOdds[1][1] represents the odds of winning in battle on the present cell. The other
    indices represent the battle odds on the local cells.
    */
    this.battleOdds = [[1, 1, 1],
                       [1, 1, 1],
                       [1, 1, 1]];
    
    /*
    Simply the odds of it both winning the projected battle on a cell and surviving on that
    cell this turn. Just P(A&B), so it's calculated by multiplying the survivalOdds on that cell
    by the battleOdds on that cell.
    */
    this.overallOdds = [[0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0]];
    
    this.bestMovementChoices = [{bestOdds: 0}];
}

var edenMethods = {
    /*
    Starts everything needed for a game - creates the garden, populates it, runs the first turn,
    and then document.write() for every entity and cell.
    */
    initializeEden: function() {
        var start = new Date();
        this.formGarden();
        var end = new Date();
        var time = (end - start) / 1000;
        console.log(time + " seconds to form a 64x64 Garden.");
        // this.populate(1);
        divineMethods.information.detailAll();
        
        start = new Date();
        this.tick(1);
        end = new Date();
        time = (end - start) / 1000;
        console.log(time + " seconds to update 64 cells and do other stuff.");
        divineMethods.information.detailAll();
    },

    /*
    Creates a new Cell instance at each index in the multidimensional array.
    Then, runs the function to determine their neighboring cells.
    */
    formGarden: function() {
        for (var j = 0; j < eden.y; j++) {
            eden.garden[j] = [];
            for (var i = 0; i < eden.x; i++) {
                eden.cellCount++;
                eden.garden[j][i] = new Cell(i, j);
                cellMethods.conditionsInitialization(eden.garden[j][i]);
            }
        }
        this.gardenIteration(cellMethods.localCellsDetermination);
    },
    
    /*
    Iterates through each cell in the garden and runs some function on it.
    */
    gardenIteration: function(func) {
        for (var j = 0; j < eden.y; j++) {
            for (var i = 0; i < eden.x; i++) {
                func(eden.garden[j][i]);
            }
        }
    },

    /*
    Some x and y coordinates are sent in as arguments.
    Corrects the x and y coordinates as necessary if they fall outside the scope of the garden.
    Then returns the reference to the proper cell, essentially making the boundary for the garden
    wraparound at each edge.
    */
    wraparoundBoundary: function(xWrapped, yWrapped) {
        var xCorrect = xWrapped;
        var yCorrect = yWrapped;
        
        xCorrect >= 0 && xCorrect < eden.x ? null :
            (xCorrect < 0 ? xCorrect += eden.x : xCorrect -= eden.x);
        yCorrect >= 0 && yCorrect < eden.y ? null :
            (yCorrect < 0 ? yCorrect += eden.y : yCorrect -= eden.y);
        return eden.garden[yCorrect][xCorrect];
    },
    
    /*
    Spawns a new entity, initializes its id, name. Then, updates the relevant eden.entities
    properties, and adds the entity to the appropriate cell.
    
    Used by every entity production method to create a new entity - whether that's by making a new
    progenitor, divinely creating a new progenitor, or an entity reproducing.
    */
    spawnEntity: function(xCoord, yCoord) {
        var targetCell = eden.garden[yCoord][xCoord];
        var entity = new Entity(xCoord, yCoord);
        
        eden.entities.essenceCount++;
        entityMethods.idAssignment(entity);
        entityMethods.generateName(entity);
        
        targetCell.entities.set(entity.id, entity);
        eden.entities.living.set(entity.id, entity);
        eden.entities.aliveCount++;
        
        return entity;
    },
    
    /*
    Spawns the progenitor for a lineage. Initializes its attributes and traits.
    */
    spawnProgenitor: function(xCoord, yCoord) {
        var progenitor = this.spawnEntity(xCoord, yCoord);
        
        entityMethods.attributesInitialization(progenitor);
        entityMethods.traitsInitialization(progenitor);
    },
    
    /*
    POPULATE distributes "num" number of progenitors randomly across the garden. The new entity is
    spawned in a randomly determined cell.
    */
    populate: function(num) {
        for (var i = 0; i < num; i++) {
            var xCoord = Math.floor(Math.random() * eden.x);
            var yCoord = Math.floor(Math.random() * eden.y);
            
            this.spawnProgenitor(xCoord, yCoord);
        }
    },
    
    /*
    SPONTANEOUS ENTITY EMERGENCE is run each turn. If the chaos value is below the threshold 0.88%,
    an entity spawns in a random cell in the garden, as if entropy came together at random to form
    it, like the 2nd Eden. If an entity emerged this turn, the code is run again - a second might
    spawn in the same turn, or many more, though the odds are decidedly low.
    
    Values need to be tweaked - the expected number spawned over 100 turns is just 1, which might
    be too rare, especially if that value is expected to go down further with population or turn
    number. I'll have to see how easy it is to go through turns - a typical map might quickly reach
    a few thousand turns, who knows. So consider this a placeholder value.
    
    If the probability is high, spontaneous entity emergences will be rare, but frequent enough
    that many might be observed on a play-through. Perhaps the chances will go down as the 
    population increases, as if the presence of real entities disrupts the capacity for one to
    erupt from the æther? Perhaps the chances go down as the turn number increases, as if Eden
    becomes more stable over time? Should not increase as turn increases, because this will disrupt
    older worlds, which might annoy players - plus there's no reasonable analogue for it. And if it
    went up as the population goes up, it would disrupt the equilibrium that forms - that might be
    desirable, but it'd also disrupt the simulation - maybe make it a
    possibility, but I think the first two options are the better picks currently.
    
    With the probability high, it isn't as special of an event, and so I'd rather leave it up to
    the player's own perception to notice its occurrence. I like the idea of that, making it a
    pleasant surprise. If the probability is low, though, it's very easy for a player to miss its
    occurrence, in which case maybe Caritas would call attention to it when it
    happens. On the other hand, it's not too bad either - kind of interesting actually - to have a
    mechanic that is rare to be noticed, makes it more special. Maybe give an
    option to alter the chance of spontaneous emergence.
    */
    spontaneousEntityEmergence: function() {
        var disorderThreshold = 0.0088;
        var chaos = Math.random();
        
        if (chaos <= disorderThreshold) {
            var xCoord = Math.floor(Math.random() * eden.x);
            var yCoord = Math.floor(Math.random() * eden.y);
            
            this.spawnProgenitor(xCoord, yCoord);
            this.spontaneousEntityEmergence();
        }
    },
    
    /*
    By making the calculationPhase separate from the movementPhase, it makes it so each entity's
    evaluations are based on the same state for the whole garden. If it iterated through each
    entity evaluating and then moving, the entities whose turns were executed later would have
    their actions influenced by what the earlier entities did, rather than every entity effectively
    moving simultaneously.
    */
    tick: function(num) {
        for (var i = 0; i < num; i++) {
            this.calculationPhase();
            this.movementPhase();
            this.battlePhase();
            this.survivalPhase();
            eden.turn++;
            // this.conditionsFluctuationPhase();
            this.calculationPhase();
            this.reproductionPhase();
            this.spontaneousEntityEmergence();
        }
    },
    
    calculationPhase: function() {
        eden.entities.living.forEach(entityMethods.survivalOddsCalculation);
        eden.entities.living.forEach(entityMethods.battleOddsCalculation);
        eden.entities.living.forEach(entityMethods.overallOddsCalculation);
    },
    
    movementPhase: function() {
        eden.entities.living.forEach(entityMethods.move);
    },
    
    battlePhase: function() {
        edenMethods.gardenIteration(cellMethods.battle);
    },
    
    survivalPhase: function() {
        eden.entities.living.forEach(entityMethods.survival);
    },
    
    reproductionPhase: function() {
        eden.entities.living.forEach(entityMethods.reproductionDecision);
    },
    
    conditionsFluctuationPhase: function() {
        edenMethods.gardenIteration(cellMethods.conditionsFluctuation);
    }
};

var cellMethods = {    
    /*
    Sets each condition to have a value [0,100], out to two decimal places. E.g., 100.00.
    */
    conditionsInitialization: function(cell) {
        var conds = cell.conditions;
        
        for (var i = 0; i < conds.length; i++) {
            conds[i].level = Math.floor(Math.random() * 10001) / 100;
            conds[i].flux = Math.floor(Math.random() * 1001) / 100;
            conds[i].surge = Math.floor(Math.random() * 101) / 100;
            conds[i].jerk = Math.floor(Math.random() * 11) / 100;
        }
    },
    
    /*
    Establishes which cells surround the cell. Will be used when displaying the
    minimap in the sidebar for the active cell/entity.
    */
    localCellsDetermination: function(cell) {
        for (var j = 0; j < 3; j++) {
            cell.localCells[j] = [];
            for (var i = 0; i < 3; i++) {
                var xMod = cell.x - 1 + i;
                var yMod = cell.y - 1 + j;
                var targetCell = edenMethods.wraparoundBoundary(xMod, yMod);
                
                cell.localCells[j][i] = targetCell;
            }
        }
    },
    
    /*
    Right now, this code is far from good practice. There's a lot of repetition in checking if the
    level, flux, surge, and jerk are within the domain [0,100]. I could write a reusable method,
    but this is only temporary - in the future, I think that the conditions and attributes won't
    all have the domain [0,100] for their values. For example, acidity might be [0,14]. So for now
    we have the lazy route until I develop the conditions and attributes further.
    
    Makes each tick take too long. Perhaps Tommy's method for creating change over time- whatever
    sort of function he called it- will be much less processing intensive, and that'll resolve it.
    Otherwise, I could set a counter that counts down each tick until it's 0, at which point it
    invokes this function and resets itself. The countdown then resumes on the next turn.
    
    I need to fix the fluctuations. As it is, flux, surge, and jerk can all have a maximum of 100.
    I'm pretty sure this means they'll tend toward 100 and fluctuate wildly, leading to wildly
    changing, erratic, unpredictable cell conditions. Which simply won't do. So, for now,
    conditionsFluctuation phase is commented out.
    */
    conditionsFluctuation: function(cell) {
        var conds = cell.conditions;
        var distribution;
        
        for (var i = 0; i < conds.length; i++) {
            distribution = gaussian(conds[i].level, conds[i].flux);  
            conds[i].level = (Math.floor(distribution.ppf(Math.random()) * 100) / 100);
            conds[i].level >= 0 && conds[i].level <= 100 ? null :
                (conds[i].level < 0 ? conds[i].level = 0 : conds[i].level = 100);
            
            distribution = gaussian(conds[i].flux, conds[i].surge);
            conds[i].flux = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            conds[i].flux >= 0 && conds[i].flux <= 100 ? null :
                (conds[i].flux < 0 ? conds[i].flux = 0 : conds[i].flux = 100);
            
            distribution = gaussian(conds[i].surge, conds[i].jerk);
            conds[i].surge = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            conds[i].surge >= 0 && conds[i].surge <= 100? null :
                (conds[i].surge < 0 ? conds[i].surge = 0 : conds[i].surge = 100);
            
            distribution = gaussian(conds[i].jerk, conds[i].hyperjerk);
            conds[i].jerk = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            conds[i].jerk >= 0 && conds[i].jerk <= 100? null :
                (conds[i].jerk < 0 ? conds[i].jerk = 0 : conds[i].jerk = 100);
        }
    },
    
    /*
    Checks size of the cell map object to see if the cell is uninhabited.
    */
    noCompetition: function(cell) {
        return (cell.entities.size === 0 || cell.entities.size === 1)
    },
    
    /*
    Generates a list of all the keys in cell.entities for a given cell. Returns this list for
    use in this.battle();
    */
    getCombatants: function(cell) {
        var combatants = [];
        
        cell.entities.forEach(function(combatant) {
            combatants.push(combatant);
        });
        return combatants;
    },
    
    /*
    Iterates through array of the current inhabitants, referring to this cell's
    entities' battle odds for this cell. Adds each to the probabilities variable,
    thereby establishing the upperbound for that entity's range for the battle probability roll.
    
    If the cell is uninhabited, cancels the function with 'return', causing this.battle() to be run
    for the next cell in the battlePhase.
    
    Rolls the outcome of the fight on this cell between the inhabiting entities, skirmish. Its
    range is 0 to 1, inclusive, to two decimal places.
    
    Creates array for list of defeated, slicing based on victor's index in the entitiesList.
    */
    battle: function(cell) {
        var combatants = cellMethods.getCombatants(cell);
        var probabilities = 0;
        var skirmish = Math.random();
        var victor;
        var defeated;
        
        if (cellMethods.noCompetition(cell)) {return;}
        
        for (var i = 0; i < combatants.length; i++) {
            var odds = combatants[i].battleOdds[1][1];
            
            probabilities += odds;
            if (skirmish <= probabilities) {
                victor = combatants[i];
                defeated = combatants.slice(0, i).concat(combatants.slice(i + 1));
                break;
            }
        }
        cellMethods.battleOutcome(victor, defeated);
    },
    
    battleOutcome: function(victor, defeated) {
        for (var i = 0; i < defeated.length; i++) {
            var loser = defeated[i];
            
            entityMethods.death(loser, "Slain");
            loser.slayer = victor.id;
            victor.victories++;
        }
    }
};

var entityMethods = {
    /*
    Sets id. Replaces a final number zeroes of primogenitor's ID string equal to the number of digits
    that are to make up the final digits of the new ID.
    */
    idAssignment: function(entity) {
        var idMod = String(eden.entities.lostSouls + eden.entities.essenceCount);
        entity.id = entity.id.slice(0, entity.id.length - idMod.length) + idMod;
    },
    
    /*
    Assigns random 16-character name to entity. Special characters and symbols have a 0.125
    probability of being assigned at each position in the name.
    */
    generateName: function(entity) {
        var normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var special = "ÇüéâäàåãçêëèïîìæÆôöòõûùüÿý¢£¥ƒáíóúñÑaßpSsµtFTOd8fe€ŠŒšŽœžŸÀÁÂÃÄÅÈÉÊËÌÍÎÏ" +
                       "ÐÒÓÔÕÖÙÚÛÜÝÞþðØø" + "`~!@#$%^&*()_+-=[]\\{}|;':\",./<>?";
        var insertSpecial;
        var randomNormal;
        var randomSpecial;
        var nameGen = "";
        
        for (var i = 0; i < 16; i++) {
            insertSpecial = Math.random();
            if (insertSpecial <= 0.125) {
                randomSpecial = Math.floor(Math.random() * special.length);
                nameGen += special[randomSpecial];
            } else {
                randomNormal = Math.floor(Math.random() * normal.length);
                nameGen += normal[randomNormal];
            }
        }
        entity.name = nameGen;
    },
    
    /*
    Takes player input to assign a name to the entity.
    */
    setName: function(entity, newName) {
        entity.name = String(newName);
    },
    
    /*
    Sets each attribute's properties.
    level max initial = 100.00
    flux max initial = 10.00
    surge max initial = 1.00
    jerk max initial = 0.10
    hyperjerk max and initial = 0.01
    */
    attributesInitialization: function(entity) {
        var attrs = entity.attributes;
        
        for (var i = 0; i < attrs.length; i++) {
            attrs[i].level = Math.floor(Math.random() * 10001) / 100;
            attrs[i].flux = Math.floor(Math.random() * 1001) / 100;
            attrs[i].surge = Math.floor(Math.random() * 101) / 100;
            attrs[i].jerk = Math.floor(Math.random() * 11) / 100;
        }
    },
    
    /*
    Sets each trait's properties.
    level max initial = 100.00
    flux max initial = 10.00
    surge max initial = 1.00
    jerk max initial = 0.10
    hyperjerk max and initial = 0.01
    */
    traitsInitialization: function(entity) {
        var traits = entity.traits;
        
        for (var trait in traits) {
            traits[trait].level = Math.floor(Math.random() * 10001) / 100;
            traits[trait].flux = Math.floor(Math.random() * 1001) / 100;
            traits[trait].surge = Math.floor(Math.random() * 101) / 100;
            traits[trait].jerk = Math.floor(Math.random() * 11) / 100;
        }
    },
    
    /*
    Iterates through a multidimensional array.
    For odds calculations, it's the entity's localCells array (i.e., its own and the eight
    adjacent cells) it iterates through and performs the instructed odds calculation on.
    */
    multiIteration: function(entity, func, iLimit, jLimit) {
        for (var j = 0; j < jLimit; j++) {
            for (var i = 0; i < iLimit; i++) {
                func(entity, i, j);
            }
        }
    },
    
    survivalOddsCalculation: function(entity) {
        entityMethods.multiIteration(entity, entityMethods.survivalOddsFormula, 3, 3);
    },
    
    battleOddsCalculation: function(entity) {
        entityMethods.multiIteration(entity, entityMethods.battleOddsFormula, 3, 3);
    },
    
    overallOddsCalculation: function(entity) {
        entityMethods.multiIteration(entity, entityMethods.overallOddsFormula, 3, 3);
    },
    
    /*
    Maximum difference between each paired attribute and condition is 100.
    Right now the survival odds calculation is simple. I hope to improve on it so in the future
    it's based on more than just the sum of the differences between the conditions' levels and the
    corresponding attributes'. Need to consider how to do it.
    */
    survivalOddsFormula: function(entity, localX, localY) {
        var attrs = entity.attributes;
        var conds = entity.localCells[localY][localX].conditions;
        var sumDiffs = 0;
        var survivalOdds;
        
        for (var i = 0; i < attrs.length; i++) {
            sumDiffs += Math.abs(attrs[i].level - conds[i].level);
        }
        survivalOdds = 1 - sumDiffs / ( 100 * attrs.length);
        entity.survivalOdds[localY][localX] = survivalOdds;
    },
    
    /*
    First checks to see if the cell is uninhabited. If true, it sets this entity's battle odds
    to 1 for that cell.
    
    The local variable "battleStrengthTotal" is the sum of all entities' survival odds that inhabit
    that cell and each's number of victories. That is, it represents the overall battle strength in
    that, of which the entity may or may not be a subset (if it inhabits the cell presently).
    battleStrength is initially excluded when iterating through the "entities" to calculate the
    battleStrengthTotal value to ensure it gets added as a potential inhabitant for other cells,
    but not added twice for the cell it presently inhabits. Because any entity involved in this
    calculation that is not the present entity actually inhabits the target cell, for referencing
    its own survival odds combatant.survivalOdds[1][1] is used to denote the current cell.
    
    Factoring in an entity's victories heavily weights the calculation of battle odds toward
    battle experience. This is to the point that the other factor - whether that's survival odds
    or the entity's health - becomes increasingly irrelevant. So once an entity wins a few battles,
    it could very quickly become statistically unbeatable. Say, after 10 victories. Let's see what
    happens first before trying to tweak it.
    
    battleOdds[localX] represents the target cell in the local 2D array holding the entity's
    battle odds.
    */
    battleOddsFormula: function(entity, localX, localY) {
        var targetCell = entity.localCells[localY][localX];
        var opponents = cellMethods.getCombatants(targetCell);
        var battleStrengthTotal = 0;
        var battleStrength = entity.survivalOdds[localY][localX] + entity.victories;
        var battleOdds = entity.battleOdds[localY];
        
        if (cellMethods.noCompetition(targetCell)) {
            battleOdds[localX] = 1;
            return;
        }
        for (var i = 0; i < opponents.length; i++) {
            if (opponents[i] !== entity) {
                battleStrengthTotal += opponents[i].survivalOdds[1][1] + opponents[i].victories;
            }
            battleStrengthTotal += battleStrength;
        }
        battleOdds[localX] = battleStrength / battleStrengthTotal;
    },
    
    /*
    The probability of the entity both surviving and winning the battle for this turn.
    Overall odds are kept in an array separate from the arrays for survivalOdds and battleOdds
    because I want to preserve them: the player will have access to the overall probability of
    survival for a cell as well as the two probabilities that go into calculating it.
    */
    overallOddsFormula: function(entity, localX, localY) {
        var overallOdds = entity.survivalOdds[localY][localX] * entity.battleOdds[localY][localX];
        entity.overallOdds[localY][localX] = overallOdds;
    },

    /*
    Evaluates the nine local cells' odds. If a cell's odds are better than the current best
    odds, sets the entity.bestMovementChoices to empty. Then, assigns to bestMovementChoices
    the favored cell, the reference of which is found from the localCells array.
    */
    evaluateMovementChoices: function(entity, localX, localY) {
        var bestOdds = entity.bestMovementChoices[0].bestOdds;
        var choice = entity.localCells[localY][localX];
        var choiceOdds = entity.overallOdds[localY][localX];
        
        if (choiceOdds > bestOdds) {
            entity.bestMovementChoices = [{bestOdds: choiceOdds}];
            entity.bestMovementChoices.push(choice);
        } else if (choiceOdds === bestOdds) {
            entity.bestMovementChoices.push(choice);
        }
    },
    
    /*
    First, calculates the bestMovementChoices. Then, selects a choice at random from it.
    It's exceedingly rare that two cells will have the exact same odds, so most likely
    bestMovementChoices will only ever have one element.
    
    In calculating the choice, bestChoices.length - 1 is used to account for the 0th index, which
    holds the current bestOdds. Likewise, adding 1 at the end of the choice calculation accounts
    for the bestOdds index.
    
    If the choice is not the homeCell, the entity moves. Deletes the entity's reference from
    the cell.entities of the cell it was on. Then changes entity.x and entity.y, and adds its
    reference to its new home cell's cell.entities.
    
    Movement effectively occurs simultaneously for every entity because the survival odds- from
    which the movement evaluations are derived- are calculated prior to the movement phase.
    */
    move: function(entity) {
        var homeCell = eden.garden[entity.y][entity.x];
        var bestChoices;
        var choice;
        var targetCell;
        
        entityMethods.multiIteration(entity, entityMethods.evaluateMovementChoices, 3, 3);
        bestChoices = entity.bestMovementChoices;
        choice = Math.floor(Math.random() * (bestChoices.length - 1)) + 1;
        targetCell = bestChoices[choice];
        
        targetCell === homeCell ? null : (
            homeCell.entities.delete(entity.id),
            entity.x = targetCell.x,
            entity.y = targetCell.y,
            targetCell.entities.set(entity.id, entity)
        );
    },
    
    /*
    The "struggle" is the probability roll to see if the entity lives or dies, using the
    deathOdds as the probability of it dying. If struggle > deathOdds, the entity beats the odds
    and lives another turn and grows older. Otherwise, it perishes and this.death(entity) is
    invoked.
    */
    survival: function(entity) {
        var struggle = Math.random();
        var deathOdds = 1 - entity.survivalOdds[1][1];
        
        struggle > deathOdds ? entity.age++ : entityMethods.death(entity, "Perished");
    },
    
    /*
    Entity dies. Updates the entity's relevant death info, removes it from the cell it inhabited,
    updates the relevant information in Eden pertaining to entities, and adds this entity's
    reference to the appropriate places in the afterworld's records.
    */
    death: function(entity, cause) {
        var homeCell = eden.garden[entity.y][entity.x];
        
        entity.state = cause;
        entity.turnOfDeath = eden.turn;
        entity.deathLocality = "Cell #" + eden.garden[entity.y][entity.x].id + ", " +
            "Coordinates (" + entity.x + ", " + entity.y + ")";
        
        homeCell.entities.delete(entity.id);
        eden.entities.living.delete(entity.id);
        eden.entities.aliveCount--;
        eden.entities.deathCount++;
            
        entity.locality = afterworld.name;
        afterworld.bookOfLife.get(cause).set(entity.id, entity);
        afterworld.denizens.set(entity.id, entity);
        afterworld.denizensCount++;
    },
    
    /*
    Entity evaluates reproducing this turn. If the deathOdds on this cell lie exceed the
    riskThreshold, reproduction will be deemed too risky.
    
    Each entity's riskThreshold fluctuates a little from its parent's.
    At the moment, given enough time, a balance would be struck between this willingness to risk
    death and the impact on the parent's survivalOdds that exists simply due to whatever is the
    probability of them engaging in battle. Owing to the natural proximity right after birth, the
    parent and child have about 1/9 odds of ending up on the same cell after movement next turn.
    So, if I'm right, the entity's riskThreshold will be fairly high as the impact from the
    chances of battling is relatively low. Its equilibrium point will not tend all the way
    toward 1, however.
    
    Later, reproduction will be much riskier - when I've implemented health as a mechanic,
    reproduction will cost a significant amount of health, thus having a much more tangible impact
    on the parent's survivalOdds, regardless of where it and its child end up. So on cells where
    its odds are already poor, the odds will surpass the riskThreshold and thus the entity
    will not reproduce that turn.
    
    The matter will be further complicated in the future. I hope to implement a mechanic for
    evaluating degree of similarity between the natural attributes of two entities (i.e., the
    value of their attributes at the time of their genesis). Entities will have a
    similarityThreshold beyond which they will avoid combat with an entity.
    
    Another mechanic that will complicate the equilibrium establishment between impact on
    survivalOdds and the level of risk the entity will accept for reproduction is the introduction
    of decision-making to every behavior. As it is, for movement and reproduction, the entity's
    choice is entirely dependent on whichever option has the best odds for the individual's
    survival. With this mechanic, I might later set it up so every choice is made at random, with
    the probabilities of each option weighted based on their relative survivalOdds compared to
    every option's survivalOdds. I don't know, however, if this idea makes too much sense,
    introducing suboptimal decision-making behavior into the entities. I'll go with whichever
    yields the more interesting results. At the moment, I think that might be the suboptimal
    decision-making. The entities will not be wholly predictable. The absence of complete
    predictability is a survival mechanic in the real world, I suppose. I wonder what I could do
    to make it a beneficial trait in this world too - probably the implementation of carnivorism
    as a viable strategy will suffice. I'd like there to be more reasons, but I don't yet know
    what else I could do.
    */
    reproductionDecision: function(entity) {
        var deathOdds = (1 - entity.survivalOdds[1][1]) * 100;
        var riskThreshold = entity.traits.riskThreshold.level;
        
        if (deathOdds <= riskThreshold) {
            entityMethods.reproduce(entity);
        }
    },
    
    /*
    entity.ancestry.slice() passes a shallow copy. But, since .ancestry is an array of just
    primitive data types (the entity ID numbers), this is acceptable. And, faster than
    using deep clone from jQuery.
    */
    reproduce: function(entity) {
        var xCoord = entity.x + Math.floor(Math.random() * 3) - 1;
        var yCoord = entity.y + Math.floor(Math.random() * 3) - 1;
        var birthCell = edenMethods.wraparoundBoundary(xCoord, yCoord);
        var child = edenMethods.spawnEntity(birthCell.x, birthCell.y);
        
        entity.lineage.push(child.id);
        child.ancestry = entity.ancestry.slice();
        child.ancestry.push(entity.id);
        entityMethods.inheritAttributes(child, entity.attributes);
        entityMethods.inheritTraits(child, entity.traits);
    },
    
    /*
    The distribution calculations come from Gaussian Distribution, which I downloaded.
    
    Right now, this code is far from good practice. There's a lot of repetition in checking if the
    level, flux, surge, and jerk are within the domain [0,100]. I could write a reusable method,
    but this is only temporary - in the future, I think that the conditions and attributes won't
    all have the domain [0,100] for their values. For example, acidity might be [0,14]. So for now
    we have the lazy route until I develop the conditions and attributes further.
    
    parentAttributes.slice wouldn't work over jQuery.extend because .slice is only a shallow copy.
    That is, since attributes is an array of objects .slice copies the references of the
    original objects. It works fine for primitive data types, however, because they are immutable
    and so both can point to the same primitives all they want without affecting each other.
    
    If I'm correct, this should work fine  and garbage collection will clear var dummy after the
    function is complete, thus leaving child.attributes as the only thing holding the reference
    to the dummy attributes array. Then the next time the function is run it'll just create a new
    dummy array reference.
    */
    inheritAttributes: function(child, parentAttributes) {
        var attrs = parentAttributes;
        var dummy = [{attribute: "lightOptimal"}, {{attribute: "radiationTolerance"},
        {attribute: "temperatureOptimal"}, {{attribute: "pressureOptimal"},
        {attribute: "airCompositionOptimal"}, {attribute: "chemicalEnvironmentOptimal"},
        {attribute: "aridityOptimal"}, {attribute: "acidityOptimal"},
        {attribute: "salinityOptimal"}, {attribute: "nutrientsOptimal"},
        {attribute: "wasteTolerance"}];
        var distribution;
        
        for (var i = 0; i < attrs.length; i++) {
            
            distribution = gaussian(attrs[i].level, attrs[i].flux);  
            dummy[i].level = (Math.floor(distribution.ppf(Math.random()) * 100) / 100);
            dummy[i].level >= 0 && dummy[i].level <= 100 ? null :
                (dummy[i].level < 0 ? dummy[i].level = 0 : dummy[i].level = 100);
            
            distribution = gaussian(attrs[i].flux, attrs[i].surge);
            dummy[i].flux = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            dummy[i].flux >= 0 && dummy[i].flux <= 100 ? null :
                (dummy[i].flux < 0 ? dummy[i].flux = 0 : dummy[i].flux = 100);
            
            distribution = gaussian(attrs[i].surge, attrs[i].jerk);
            dummy[i].surge = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            dummy[i].surge >= 0 && dummy[i].surge <= 100 ? null :
                (dummy[i].surge < 0 ? dummy[i].surge = 0 : dummy[i].surge = 100);
            
            distribution = gaussian(attrs[i].jerk, attrs[i].hyperjerk);
            dummy[i].jerk = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            dummy[i].jerk >= 0 && dummy[i].jerk <= 100 ? null :
                (dummy[i].jerk < 0 ? dummy[i].jerk = 0 : dummy[i].jerk = 100);
                
            dummy[i].hyperjerk = 0.01;
        }
        child.attributes = dummy;
    },
    
    /*
    The distribution calculations come from Gaussian Distribution, which I downloaded.
    
    Same as the comment for this.inheritAttributes, the repetition is temporary.
    
    jQuery is slow, however. If I find performance sucks, I can create a dummy set of traits
    in the function. var dummy = [{}] repeating {} for however many traits I end up with choosing.
    Except each dummy trait would need its trait: "whatever" property written out. The level, flux,
    surge, jerk, and hyperjerk properties wouldn't need to be defined and set to null, they'd be
    added automatically when the function tries to change them.
    Then in the for-loop, run it the same as it is now, replacing traits[i].etc with dummy[i].etc
    and at the end of the function set child.traits = dummy, thereby assigning the reference
    that was held for the dummy to the child's traits. If I'm correct, this should work fine
    and garbage collection will clear var dummy after the function is complete, thus leaving
    child.traits as the only thing holding the reference to the dummy traits array.
    Only if jQuery is super slow though.
    */
    inheritTraits: function(child, parentTraits) {
        var traits = parentTraits;
        var dummy = {traits: {riskThreshold: {}}};
        var distribution;
        
        for (var trait in traits) {
            distribution = gaussian(traits[trait].level, traits[trait].flux);  
            dummy[trait].level = (Math.floor(distribution.ppf(Math.random()) * 100) / 100);
            dummy[trait].level >= 0 && dummy[trait].level <= 100 ? null :
                (dummy[trait].level < 0 ? dummy[trait].level = 0 : dummy[trait].level = 100);
            
            distribution = gaussian(traits[trait].flux, traits[trait].surge);
            dummy[trait].flux = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            dummy[trait].flux >= 0 && dummy[trait].flux <= 100 ? null :
                (dummy[trait].flux < 0 ? dummy[trait].flux = 0 : dummy[trait].flux = 100);
            
            distribution = gaussian(traits[trait].surge, traits[trait].jerk);
            dummy[trait].surge = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            dummy[trait].surge >= 0 && dummy[trait].surge <= 100 ? null :
                (dummy[trait].surge < 0 ? dummy[trait].surge = 0 : dummy[trait].surge = 100);
            
            distribution = gaussian(traits[trait].jerk, traits[trait].hyperjerk);
            dummy[trait].jerk = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            dummy[trait].jerk >= 0 && dummy[trait].jerk <= 100? null :
                (dummy[trait].jerk < 0 ? dummy[trait].jerk = 0 : dummy[trait].jerk = 100);
                
            dummy[trait].hyperjerk = 0.01;
        }
        child.traits = dummy;
    }
};

/*
Gaussian distribution code: https://github.com/errcw/gaussian
var distribution = gaussian(mean, variance);
var sample = distribution.ppf(Math.random());
*/
(function(exports) {

  // Complementary error function
  // From Numerical Recipes in C 2e p221
  var erfc = function(x) {
    var z = Math.abs(x);
    var t = 1 / (1 + z / 2);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 +
            t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
            t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
            t * (-0.82215223 + t * 0.17087277)))))))))
    return x >= 0 ? r : 2 - r;
  };

  // Inverse complementary error function
  // From Numerical Recipes 3e p265
  var ierfc = function(x) {
    if (x >= 2) { return -100; }
    if (x <= 0) { return 100; }

    var xx = (x < 1) ? x : 2 - x;
    var t = Math.sqrt(-2 * Math.log(xx / 2));

    var r = -0.70711 * ((2.30753 + t * 0.27061) /
            (1 + t * (0.99229 + t * 0.04481)) - t);

    for (var j = 0; j < 2; j++) {
      var err = erfc(r) - xx;
      r += err / (1.12837916709551257 * Math.exp(-(r * r)) - r * err);
    }

    return (x < 1) ? r : -r;
  };

  // Models the normal distribution
  var Gaussian = function(mean, variance) {
    if (variance < 0) {
      throw new Error('Variance must be >= 0 (but was ' + variance + ')');
    }
    this.mean = mean;
    this.variance = variance;
    this.standardDeviation = Math.sqrt(variance);
  }

  // Probability density function
  Gaussian.prototype.pdf = function(x) {
    var m = this.standardDeviation * Math.sqrt(2 * Math.PI);
    var e = Math.exp(-Math.pow(x - this.mean, 2) / (2 * this.variance));
    return e / m;
  };

  // Cumulative density function
  Gaussian.prototype.cdf = function(x) {
    return 0.5 * erfc(-(x - this.mean) / (this.standardDeviation * Math.sqrt(2)));
  };

  // Percent point function
  Gaussian.prototype.ppf = function(x) {
    return this.mean - this.standardDeviation * Math.sqrt(2) * ierfc(2 * x);
  };

  // Product distribution of this and d (scale for constant)
  Gaussian.prototype.mul = function(d) {
    if (typeof(d) === "number") {
      return this.scale(d);
    }
    var precision = 1 / this.variance;
    var dprecision = 1 / d.variance;
    return fromPrecisionMean(
        precision + dprecision, 
        precision * this.mean + dprecision * d.mean);
  };

  // Quotient distribution of this and d (scale for constant)
  Gaussian.prototype.div = function(d) {
    if (typeof(d) === "number") {
      return this.scale(1 / d);
    }
    var precision = 1 / this.variance;
    var dprecision = 1 / d.variance;
    return fromPrecisionMean(
        precision - dprecision, 
        precision * this.mean - dprecision * d.mean);
  };

  // Addition of this and d
  Gaussian.prototype.add = function(d) {
    return gaussian(this.mean + d.mean, this.variance + d.variance);
  };

  // Subtraction of this and d
  Gaussian.prototype.sub = function(d) {
    return gaussian(this.mean - d.mean, this.variance + d.variance);
  };

  // Scale this by constant c
  Gaussian.prototype.scale = function(c) {
    return gaussian(this.mean * c, this.variance * c * c);
  };

  var gaussian = function(mean, variance) {
    return new Gaussian(mean, variance);
  };

  var fromPrecisionMean = function(precision, precisionmean) {
    return gaussian(precisionmean / precision, 1 / precision);
  };

  exports(gaussian);
})
(typeof(exports) !== "undefined"
    ? function(e) { module.exports = e; }
    : function(e) { this["gaussian"] = e; });
    

var afterworld = {
    name: "Afterworld",  // Should I give it a real name? Like hell or the abyss or something?
    lostSouls: "Unknown, but not forgotten. They numbered some 100 from the 4th Eden's" +
        " progenitors as well as a few lost from when I was testing the Eden codes.",
    denizensCount: "XXX"
};

/*
Entities will be organized by manner of death (entity.state), their id number serving as the key
to their object. Essentially, details their ultimate fate. For example, one slain in combat would
have their state "Slain" and have a property "slayer" that refers to what entity killed them.

Why is it called the Book of Life if all the entities here are dead? Because in Christianity and
Judaism, the Book of Life contains the names of all those destined for Heaven and saved from doom.
In the Talmud, the Book of the Dead is a counterpart that lists the wicked. So, when the afterworld
is partitioned in a later Eden iteration, a separate domain in the afterworld will be created for
those judged evil to be sent to.
*/
afterworld.bookOfLife = new Map();
afterworld.bookOfLife.set("Ascended", new Map());
afterworld.bookOfLife.set("Slain", new Map());
afterworld.bookOfLife.set("Perished", new Map());
afterworld.bookOfLife.set("Self-terminated", new Map());
afterworld.bookOfLife.set("Slaughtered", new Map());
afterworld.bookOfLife.set("Massacred", new Map());
afterworld.bookOfLife.set("Eradicated", new Map());
afterworld.bookOfLife.set("Annihilated", new Map());

/*
Lists the id numbers of all those in the afterworld. Because they refer to the same object, for the
sake of non-repetitiveness, I've set the "denizens" keys to refer to the appropriate place in the
bookOfLife. Will need to be kept up to date manually.
*/
afterworld.denizens = new Map();



edenMethods.initializeEden();
document.close();