var PGE = PGE || {}; // Namespace - Platform Game Engine

PGE.PlatformBuilder = function (game) {

    this._game = game;
    this.tiles = [];
    this.nextTileX = 0;
    
};

PGE.PlatformBuilder.prototype = {

    // add a single tile
    addTile: function(id,gapSize){
        
        var imgName = 'tile' + id;
        if (id === 100) imgName = 'fan';
        
        var newTile = {
        
            id: id,
            imgName: imgName,
            sprite: this._game.add.sprite(0,0,imgName)
        
        }
        newTile.sprite.scale.set(0.5);
        
        newTile.sprite.x = this.nextTileX+newTile.sprite.width*0.5; 
        newTile.sprite.y = 600 - newTile.sprite.height*0.5;
        
        this.nextTileX+=newTile.sprite.width;
        
        if (gapSize != null){
            newTile.sprite.x += gapSize;
            this.nextTileX+= gapSize;
        }
        
        this.tiles.push(newTile);
    
    },
    
    // add many tiles by id number array
    addTiles: function(id_array){
    
        for (var i=0;i<id_array.length;i++){
        
            var tileId = id_array[i];
            
            if (tileId == 0) {
                // empty tile ? (72px gap)
                this.nextTileX+= 72;
            } else {
                // regular tile
                this.addTile(tileId,null);
            }
        
        }
    
    },
    
    clear: function(){
        while(this.lastTile() != undefined){
            this.deleteLastTile();
        }
        this.nextTileX = 0;
        
    
    },
    
    enablePhysics: function(){
    
        var tileSprites = [];
        for (var t=0;t<this.tiles.length;t++){
            var tile = this.tiles[t];
            tileSprites.push(tile.sprite);
        }
        
        this._game.physics.p2.enable(tileSprites);
        
    },
    
    setDrawBodies: function(enabled){
    
        for (var t=0;t<this.tiles.length;t++){
            this.tiles[t].sprite.body.debug = enabled;
        }
    
    },
    
    loadPolygons: function(cg,collideslist){
    
        for (var t=0;t<this.tiles.length;t++){
            var tile = this.tiles[t];
            // load polys apart from tile1 = rectangle
            if (tile.imgName != 'tile1') {
                tile.sprite.body.clearShapes();
                tile.sprite.body.loadPolygon('tilepolygons', tile.imgName,0.5);
            }
            tile.sprite.body.static=true;
            tile.sprite.body.setCollisionGroup(cg);
            tile.sprite.body.collides(collideslist);
        }
    
    },
    
    forEachTile: function(callback){
        for (var t=0;t<this.tiles.length;t++){
            callback(this.tiles[t]);
        }
    },
    
    lastTile: function(){
        
        return this.tiles[this.tiles.length-1];
        
    },
    
    deleteLastTile: function(){
    
        this.nextTileX -= this.lastTile().sprite.width;
        this.lastTile().sprite.kill();
        this.tiles.pop();
    
    },
    
    getTileIdArray: function() {
        var toReturn = [];
        for (var t=0;t<this.tiles.length;t++){
            var tile = this.tiles[t];
            toReturn.push(tile.id);
        }
        return toReturn;
    },
    
    printTiles : function() {

        console.log(this.getTileIdArray());
        
    },
    
    save: function() {
    
        var savedata = {};
        
        savedata.terrain = this.getTileIdArray();
    
            // generate hash
            var hash = CryptoJS.SHA1(JSON.stringify(savedata));
            var hashstr = hash.toString(CryptoJS.enc.Hex);
            console.log(hashstr);
            
            // write to file
            
            $.ajax({
              type: "POST",
              url: "./api/save.php",
              data: {
                hash: hashstr,
                savedata: JSON.stringify(savedata)
              },
              success: function(data){
                
                console.log(data);
                
                // redirect
                
                window.location = 'http://taskproj.com/runnerp2/?hash='+hash;
                
              },
              dataType: 'json'
            });
            
            
    
    },
    
    load: function(hash) {
    
        var self = this;
    
            $.ajax({
              type: "GET",
              url: './api/'+hash+'.json',
              success: function(data){
                
                console.log(data);
                self.clear();
                self.addTiles(data.terrain);
                self.enablePhysics();
                self.loadPolygons(CG_Terrain,[CG_Ball,CG_Runner]);
                
              },
              dataType: 'json'
            });
    
    }
};