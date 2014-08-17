var PGE = PGE || {}; // Namespace - Platform Game Engine

PGE.PlatformBuilder = function (game) {

    this._game = game;
    this.tiles = [];
    this.nextTileX = 0;
    
};

PGE.PlatformBuilder.prototype = {

    // add a single tile
    addTile: function(imgName,gapSize){
            
        var newTile = {
        
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
                var imgName = 'tile'+tileId;
                this.addTile(imgName,null);
            }
        
        }
    
    },
    
    clear: function(){
    
        this.tiles = [];
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
    
    }

};