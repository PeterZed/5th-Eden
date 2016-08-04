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
        {attribute: "lightOptimal", level: null, flux: null, surge: 1},
        {attribute: "radiationTolerance", level: null, flux: null, surge: 1},
        {attribute: "temperatureOptimal", level: null, flux: null, surge: 1},
        {attribute: "pressureOptimal", level: null, flux: null, surge: 1},
        {attribute: "airCompositionOptimal", level: null, flux: null, surge: 1},
        {attribute: "chemicalEnvironmentOptimal", level: null, flux: null, surge: 1},
        {attribute: "aridityOptimal", level: null, flux: null, surge: 1},
        {attribute: "acidityOptimal", level: null, flux: null, surge: 1},
        {attribute: "salinityOptimal", level: null, flux: null, surge: 1},
        {attribute: "nutrientsOptimal", level: null, flux: null, surge: 1},
        {attribute: "wasteTolerance", level: null, flux: null, surge: 1}
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
        riskThreshold: {level: null, flux: null, surge: 1}
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