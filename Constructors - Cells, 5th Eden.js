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
        {condition: "light", level: null, flux: null, surge: 1},
        {condition: "radiation", level: null, flux: null, surge: 1},
        {condition: "temperature", level: null, flux: null, surge: 1},
        {condition: "pressure", level: null, flux: null, surge: 1},
        {condition: "airComposition", level: null, flux: null, surge: 1},
        {condition: "chemicalEnvironment", level: null, flux: null, surge: 1},
        {condition: "aridity", level: null, flux: null, surge: 1},
        {condition: "acidity", level: null, flux: null, surge: 1},
        {condition: "salinity", level: null, flux: null, surge: 1},
        {condition: "nutrients", level: null, flux: null, surge: 1},
        {condition: "waste", level: null, flux: null, surge: 1}
    ];
}
