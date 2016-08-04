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