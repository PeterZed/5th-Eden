var cellMethods = {    
    /*
    Sets each condition to have a value [0,100], out to two decimal places. E.g., 100.00.
    */
    conditionsInitialization: function(cell) {
        var conds = cell.conditions;
        
        for (var i = 0; i < conds.length; i++) {
            conds[i].level = Math.floor(Math.random() * 10001) / 100;
            conds[i].flux = Math.floor(Math.random() * 1001) / 100;
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
            conds[i].level = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            
            distribution = gaussian(conds[i].flux, conds[i].surge);
            conds[i].flux = Math.floor(distribution.ppf(Math.random()) * 100) / 100;
            
            edenMethods.checkLimits(conds[i]);
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