    var PGE = PGE || {}; // Namespace - Platform Game Engine
    var game;
    var map;
    var ball;
    var car = {};
    var jumping = false;
    var kicking = false;
    var resting = false;
    var started = false;
    var gameover = false;
    var text1;
    var progress_empty;
    var progress_full;

    var CG_Terrain;
    var CG_Ball;
    var CG_Runner;
    var bg;
    var gameConfig;
    var dist;
    var editing = false;
    
    var positionX = 0;

function setGameOver(isGameOver){
    
    if(isGameOver){
        gameover = true;
        $('#gameOver').css('visibility', 'visible');
        
    } else {
        gameover = false;
        $('#gameOver').css('visibility', 'hidden');
    }
}

    window.onload = function() {
    
        PGE.width = 1920;
        PGE.height = 1080;
    
        game = new Phaser.Game(PGE.width, PGE.height, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

        function preload () {

            // load progress bar art
            game.load.image('progressbar_empty', 'assets/ui/progress_empty.png');
            game.load.image('progressbar', 'assets/ui/progress.png');
        
            game.stage.backgroundColor = '#50b1d4';
            
        }

        function create () {
            
            // create temporary progress bar sprites
            progress_empty = game.add.sprite((PGE.width-600)/2,(PGE.height-40)/2, 'progressbar_empty');
            progress_full = game.add.sprite((PGE.width-600)/2,(PGE.height-40)/2, 'progressbar');
            game.load.setPreloadSprite(progress_full);
        
             // load status
            text1 = game.add.text(280, (PGE.height-40)/2, '', { fill: '#FFFFFF'});
            game.load.onFileComplete.add(fileComplete, this);
            game.load.onLoadComplete.add(loadComplete, this);
            
            // queue assets for loading
            game.load.tilemap('map', 'assets/raul/48x27.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('bg', 'assets/background1.jpg');
            game.load.image('1', 'assets/raul/1/1.png');
            game.load.image('2', 'assets/raul/2/2.png');
            game.load.image('3', 'assets/raul/3/3.png');
            game.load.image('4', 'assets/raul/4/4.png');
            game.load.image('5', 'assets/raul/5/5.png');
            game.load.image('6', 'assets/raul/6/6.png');
            game.load.image('fan', 'assets/raul/fan.png');            
            game.load.image('ball', 'assets/raul/ball.png');
            
            game.load.physics('1', 'assets/raul/1/1.json');
            game.load.physics('2a', 'assets/raul/2/2a.json');
            game.load.physics('2b', 'assets/raul/2/2b.json');

            game.load.physics('3a', 'assets/raul/3/3a.json');
            game.load.physics('3b', 'assets/raul/3/3b.json');
            game.load.physics('3c', 'assets/raul/3/3c.json');
            
            game.load.physics('4a', 'assets/raul/4/4a.json');
            game.load.physics('4b', 'assets/raul/4/4b.json');
            game.load.physics('4c', 'assets/raul/4/4c.json');
            game.load.physics('4d', 'assets/raul/4/4d.json');
            game.load.physics('4e', 'assets/raul/4/4e.json');            
            
            game.load.atlasJSONHash('run', 'assets/sprites/running.png', 'assets/sprites/running.json');
            game.load.atlasJSONHash('jump', 'assets/sprites/jumping.png', 'assets/sprites/jumping.json');
            game.load.atlasJSONHash('kick', 'assets/sprites/kicking.png', 'assets/sprites/kicking.json');
            
            game.load.text('gameConfig', 'assets/gameConfig.json');
            
            
            // start loading
            game.load.start();
        
        }

//  This callback is sent the following parameters:
function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {

    text1.setText("Loaded: " + progress + "% - " + totalLoaded + " / " + totalFiles);

}

function loadComplete() {

    game.world.remove(text1);
    game.world.remove(progress_empty);
    start();
    
    $('#picker').click(function(e) {
        game.pickerClicked(e);
    });

}
    
// after all assets loaded...
function start() {
            var a = game.cache.getText('gameConfig');
            gameConfig = JSON.parse(a);
            // add background image
            bg = game.add.image(0, 0, 'bg');

            // creation of large world bounds
            game.world.bounds = new Phaser.Rectangle(-PGE.width, -PGE.height, PGE.width*3, PGE.height*3);  
                    
            //  Enable p2 physics with gravity
            game.physics.startSystem(Phaser.Physics.P2JS);
            game.physics.p2.gravity.y = gameConfig.gravity;
            
            game.physics.p2.friction = gameConfig.friction;
            game.physics.p2.restitution = gameConfig.restitution;
            
            map = game.add.tilemap('map');
            map.addTilesetImage('1');
            map.addTilesetImage('2');
            map.addTilesetImage('3');
            map.addTilesetImage('4');
            map.addTilesetImage('5');
            map.addTilesetImage('6');
            map.addTilesetImage('fan');      

            game.grasslayer = map.createLayer('grass');
            game.platformlayer = map.createLayer('platform');
            game.fanlayer = map.createLayer('fan');
   
            
            // Create separate collision groups for terrain, runner and ball to allow independent collisions (terrain-ball and terrain-runner)
            CG_Terrain = game.physics.p2.createCollisionGroup();
            CG_Ball = game.physics.p2.createCollisionGroup();
            CG_Runner = game.physics.p2.createCollisionGroup();
            
            // create ball sprite
            ball = game.add.sprite(1000, 500, 'ball');
            
            // enable physics on non platform sprites
            if (gameConfig.debug) {
                game.physics.p2.enable([ball]);
            } else {
                game.physics.p2.enable([ball]);
            }
            
     
            // add circle body to ball
            ball.body.clearShapes();
            ball.body.addCircle(ball.width*0.5);
            ball.body.setCollisionGroup(CG_Ball);
            ball.body.collides(CG_Terrain);
            
            
            PGE.convertTilemap2(map,'platform',CG_Terrain,[CG_Ball,CG_Runner]);
            
            game.camera.bounds = null; // disables camera bounds constraints
            game.camera.x = 0;
            
            game.physics.p2.onBeginContact.add(function (a1, a2) {
                var backWheelResting = (a1.id == car.wheel_back.body.id && a2.velocity[0] == 0 && a2.velocity[1] == 0)
                                    || (a2.id == car.wheel_back.body.id && a1.velocity[0] == 0 && a1.velocity[1] == 0);
                if(backWheelResting){
                    resting = true;
                }
                
                var frontWheelResting = (a1.id == car.wheel_front.body.id && a2.velocity[0] == 0 && a2.velocity[1] == 0)
                                    || (a2.id == car.wheel_front.body.id && a1.velocity[0] == 0 && a1.velocity[1] == 0);
                if(frontWheelResting){
                    resting = true;
                }
            });
            
    game.physics.p2.frameRate
            
            // "car" for runner
             
            car.carBody = game.add.sprite(50, 350+200); //CARBODY
            car.carBody.scale.set(0.8);
            car.carBody.loadTexture('run', 0);
            car.carBody.animations.add('run');
            car.carBody.animations.play('run', 30, true);
            
            car.wheel_front = game.add.sprite(50+30, 380+200); //FRONT WHEEL
            car.wheel_back = game.add.sprite(50-30, 380+200); //BACK WHEEL 

            game.physics.p2.enable([car.wheel_front, car.wheel_back,car.carBody]); //ENABLE PHYSICS FOR THESE OBJECTS
            
            //DEFINE CAR BODY
            car.carBody.body.setRectangle(30,90);            
            car.carBody.body.mass = 1.0;
            car.carBody.body.setCollisionGroup(CG_Runner);

            //DEFINE FRONT WHEEL
            car.wheel_front.body.setCircle(35);
        
            car.wheel_front.body.mass = 1.0;
            car.wheel_front.body.restitution = 0;
            car.wheel_front.body.setCollisionGroup(CG_Runner);
            car.wheel_front.body.collides(CG_Terrain);

            //DEFINE BACK WHEEL
            car.wheel_back.body.setCircle(35);
      
            car.wheel_back.body.mass = 1.0;
            car.wheel_back.body.restitution = 0;
            car.wheel_back.body.setCollisionGroup(CG_Runner);
            car.wheel_back.body.collides(CG_Terrain);
        
           
            //ADD CONSTRAINTS
            //PrismaticConstraint(world, bodyA, bodyB, lockRotation, anchorA, anchorB, axis, maxForce)
            var constraint = game.physics.p2.createPrismaticConstraint(car.carBody,car.wheel_front, false,[30,0],[0,0],[0,1]);
            var constraint_1 = game.physics.p2.createPrismaticConstraint(car.carBody,car.wheel_back, false,[-30,0],[0,0],[0,1]);
            constraint.lowerLimitEnabled=constraint.upperLimitEnabled = true;
            constraint.upperLimit = -3;
            constraint.lowerLimit = -4;
            constraint_1.lowerLimitEnabled=constraint_1.upperLimitEnabled = true;
            constraint_1.upperLimit = -3;
            constraint_1.lowerLimit = -4;
           
            
            // visual controls
            var gui = new dat.GUI();
            var physicsFolder = gui.addFolder('Physics');
            var gravityController = physicsFolder.add(gameConfig, 'gravity', 0, 5000);
            
            gravityController.onChange(function(value) {
              // Fires on every change, drag, keypress, etc.
              game.physics.p2.gravity.y=value;
            });
            
            var frictionController = physicsFolder.add(gameConfig, 'friction',0, 100);
            frictionController.onChange(function(value) {
              game.physics.p2.friction=value;
            });
            var restitutionController = physicsFolder.add(gameConfig, 'restitution',0, 3);
            restitutionController.onChange(function(value) {
              game.physics.p2.restitution=value;
            });
            gameConfig.fanpower = -gameConfig.fan.ball_vy_change;
            var fanController = physicsFolder.add(gameConfig, 'fanpower',0, 2000);
            fanController.onChange(function(value) {
              gameConfig.fan.ball_vy_change=-value;
            });
                       
            gui.add(gameConfig, 'runspeed',1,15);
            
            gui.add(gameConfig, 'debug');
            
            gui.add(gameConfig, 'drawbodies').onChange(function(value) {
                ball.body.debug = value;
                car.carBody.body.debug = value;
                car.wheel_front.body.debug = value;
                car.wheel_back.body.debug = value;
            });
            
            gui.add(game, 'paused');
                                   
            gui.add(game, 'restart');
            
            started = true;
        }
    
        
        function update() {
            
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            
                if (!jumping && resting){
                    jumping = true;
                    resting = false;
                    car.carBody.loadTexture('jump', 0);
                    var anim = car.carBody.animations.add('jump');                   
                    anim.onComplete.add(jumpCompleted, this);
                    car.carBody.animations.play('jump', gameConfig.jump.frameRate);
                    car.carBody.body.velocity.y += gameConfig.jump.runner_vy_change;
                    car.wheel_back.body.velocity.y += gameConfig.jump.runner_vy_change;
                    car.wheel_front.body.velocity.y += gameConfig.jump.runner_vy_change;
                }
                        
            }
            
            if (started && !gameover && !editing){
            
                var dx = (ball.x-ball.width*0.5) - (car.wheel_front.x+car.wheel_front.width*0.5); // note positions are central points, rather than left edge due to use of physics bodies
                var dy1 = (ball.y-ball.height * 0.5) - (car.wheel_front.y + car.wheel_front.height * 0.5); 
                var dy2 = (ball.y-ball.height * 0.5) - (car.wheel_back.y + car.wheel_back.height * 0.5); 
                
                // This can be optimized. For example, we can work with distance^2 instead of the actual distance... 
                var dist1 = Math.sqrt(dx * dx + dy1 * dy1);
                var dist2 = Math.sqrt(dx * dx + dy2 * dy2);
                dist = Math.min(dist1, dist2);
                var canReachBall = dist < gameConfig.kick.ball_runner_maxDistance;
                var canAutokick = dx <= gameConfig.autokick.distance;
                
                // autokick (tap) the ball at close range
                if (canAutokick && !jumping && canReachBall) {
                    ball.body.velocity.x += gameConfig.autokick.ball_vx_change;
                    ball.body.velocity.y += gameConfig.autokick.ball_vy_change;
                } 
                            
                // manual keyboard driven kick
                if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    if (!jumping){
                        if(!kicking){
                            kicking = true;
                            car.carBody.loadTexture('kick', 0);
                            var anim = car.carBody.animations.add('kick');       
                            anim.onComplete.add(kickCompleted, this);
                            car.carBody.animations.play('kick', gameConfig.kick.frameRate);
                        }
                        if(canReachBall){
                            ball.body.velocity.x += gameConfig.kick.ball_vx_change;
                            ball.body.velocity.y += gameConfig.kick.ball_vy_change;
                        }
                    }               
                }
                
                positionX+=gameConfig.runspeed;
                
                car.carBody.body.x = positionX;
                car.wheel_front.body.x = positionX + 30;
                car.wheel_back.body.x = positionX - 30;
                game.camera.x = car.wheel_front.body.x  - 100;

                if (game.camera.x < 0) game.camera.x = 0;
                
                if (car.carBody.body.angle > 30) car.carBody.body.angle = 30;
                if (car.carBody.body.angle < -30) car.carBody.body.angle = -30;
                
                /*
                // fan effect on ball
                pb.forEachTile(function(tile){
                
                    if (tile.id === 100){
                        
                        var ts = tile.sprite;
                        if (ball.x-ball.width*0.5 >= ts.x-ts.width*0.5) {
                            if (ball.x+ball.width*0.5 <= ts.x+ts.width*0.5) {
                                ball.body.velocity.y += gameConfig.fan.ball_vy_change;
                            }
                        }
                        
                    }
                
                });
                */
                
                
                // parallax                
                bg.x = game.camera.x/2;
                
                
                // runner or ball falls offscreen => gameover
                if (car.carBody.y - car.carBody.height*0.5 > PGE.height){
                    setGameOver(true);
                }
                if (ball.y - ball.height*0.5 > PGE.height){
                    setGameOver(true);
                }
               
                if (ball.body.x - ball.width*0.5 - car.wheel_front.body.x+car.wheel_front.width*0.5 < -255) {
                    setGameOver(true);
                }
                

            }
            
            
        }
        
        function jumpCompleted(){
        
            jumping=false;
            kicking=false;
            
            car.carBody.loadTexture('run', 0);
            var anim = car.carBody.animations.add('run');
            car.carBody.animations.play('run', 30,true);
        
        }
    
        function kickCompleted(){
        
            jumping=false;
            kicking=false;
            
            car.carBody.loadTexture('run', 0);
            var anim = car.carBody.animations.add('run');
            car.carBody.animations.play('run', 30,true);
        
        }
        
        function render() {
            
            if (started) { 
            
                if (gameConfig.debug){
                    
                    game.debug.text('ball',32,280);
                    game.debug.spriteCoords(ball, 32, 300);
                    
                    game.debug.text('carbody',32,480);
                    game.debug.spriteCoords(car.carBody, 32, 500);
                    
                    game.debug.text('dist:'+parseInt(dist),32,550);
                    
                }
                
            }

        }
        
        game.restart = function() {
        
            car.carBody.body.reset(100,350);
            car.carBody.angle = 0;
            car.wheel_front.body.reset(100+30,350+30);
            car.wheel_back.body.reset(100-30,350+30);
            ball.body.reset(500,50);
            ball.body.angle = 0;
            positionX = 100;
            jumping=false;
            kicking=false;
            game.update();
            setGameOver(false);
        
        };
                     

    };


PGE.convertTilemap2 = function (map, layer, cg, collideslist) {

        layer = map.getLayer(layer);

        var width = 0;
        var sx = 0;
        var sy = 0;

        for (var y = 0, h = map.layers[layer].height; y < h; y++)
        {
            width = 0;

            for (var x = 0, w = map.layers[layer].width; x < w; x++)
            {
                var tile = map.layers[layer].data[y][x];

                if (tile && tile.index > -1)
                {                  
                        var body = game.physics.p2.createBody(tile.x * tile.width, tile.y * tile.height, 0, false);

                        if (tile.index == 5) {
                            // object 2
                            PGE.loadPolygon2(body,'2a', '2_0');
                        } 
                        
                        if (tile.index == 6) {
                            PGE.loadPolygon2(body,'2a', '2_1');
                        }                 

                        if (tile.index == 7) {
                            PGE.loadPolygon2(body,'2a', '2_2');
                        }      

                        if (tile.index == 8) {
                            PGE.loadPolygon2(body,'2a', '2_3');
                        }

                        if (tile.index == 9) {
                            PGE.loadPolygon2(body,'2a', '2_4');
                        }

                        if (tile.index == 10) {
                            PGE.loadPolygon2(body,'2a', '2_5');
                        }

                        if (tile.index == 11) {
                            PGE.loadPolygon2(body,'2b', '2_6');
                        }                    

                        if (tile.index == 12) {
                            PGE.loadPolygon2(body,'2b', '2_7');
                        }

                        if (tile.index == 13) {
                            PGE.loadPolygon2(body,'2b', '2_8');
                        }        

                        if (tile.index == 14) {
                            PGE.loadPolygon2(body,'2b', '2_9');
                        }   

                        if (tile.index == 15) {
                            PGE.loadPolygon2(body,'2b', '2_10');
                        }   

                        if (tile.index == 16) {
                            PGE.loadPolygon2(body,'2b', '2_11');
                        }

                        if (tile.index == 17) {
                            PGE.loadPolygon2(body,'3a', '3_0');
                        }     

                        if (tile.index == 18) {
                            PGE.loadPolygon2(body,'3a', '3_1');
                        }

                        if (tile.index == 19) {
                            PGE.loadPolygon2(body,'3a', '3_2');
                        }   

                        if (tile.index == 20) {
                            PGE.loadPolygon2(body,'3a', '3_3');
                        }   

                        if (tile.index == 21) {
                            PGE.loadPolygon2(body,'3a', '3_4');
                        }   

                        if (tile.index == 22) {
                            PGE.loadPolygon2(body,'3a', '3_5');
                        }   

                        if (tile.index == 23) {
                            PGE.loadPolygon2(body,'3a', '3_6');
                        }   

                        if (tile.index == 23) {
                            PGE.loadPolygon2(body,'3a', '3_7');
                        }

                        if (tile.index == 24) {
                            PGE.loadPolygon2(body,'3b', '3_8');
                        }

                        if (tile.index == 25) {
                            PGE.loadPolygon2(body,'3b', '3_9');
                        }         

                        if (tile.index == 26) {
                            PGE.loadPolygon2(body,'3b', '3_10');
                        }

                        if (tile.index == 27) {
                            PGE.loadPolygon2(body,'3b', '3_11');
                        }    

                        if (tile.index == 28) {
                            PGE.loadPolygon2(body,'3b', '3_12');
                        }                 

                        if (tile.index == 29) {
                            PGE.loadPolygon2(body,'3b', '3_13');
                        }                                  
       
                        if (tile.index == 30) {
                            PGE.loadPolygon2(body,'3b', '3_14');
                        }        

                        if (tile.index == 31) {
                            PGE.loadPolygon2(body,'3b', '3_15');
                        }

                        if (tile.index == 32) {
                            PGE.loadPolygon2(body,'3c', '3_16');
                        }  

                        if (tile.index == 33) {
                            PGE.loadPolygon2(body,'3c', '3_17');
                        }

                        if (tile.index == 34) {
                            PGE.loadPolygon2(body,'3c', '3_18');
                        }

                        if (tile.index == 35) {
                            PGE.loadPolygon2(body,'3c', '3_19');
                        }           

                        if (tile.index == 36) {
                            PGE.loadPolygon2(body,'3c', '3_20');
                        }                      

                        if (tile.index == 37) {
                            PGE.loadPolygon2(body,'3c', '3_21');
                        }       

                        if (tile.index == 38) {
                            PGE.loadPolygon2(body,'3c', '3_22');
                        }       

                        if (tile.index == 39) {
                            PGE.loadPolygon2(body,'3c', '3_23');
                        }

                        if (tile.index == 40) {
                            PGE.loadPolygon2(body,'4a', '4_0');
                        }

                        if (tile.index == 41) {
                            PGE.loadPolygon2(body,'4a', '4_1');
                        }

                        if (tile.index == 41) {
                            PGE.loadPolygon2(body,'4a', '4_2');
                        }

                        if (tile.index == 42) {
                            PGE.loadPolygon2(body,'4a', '4_3');
                        }

                        if (tile.index == 43) {
                            PGE.loadPolygon2(body,'4a', '4_4');
                        }

                        if (tile.index == 44) {
                            PGE.loadPolygon2(body,'4a', '4_5');
                        }

                        if (tile.index == 45) {
                            PGE.loadPolygon2(body,'4a', '4_6');
                        }

                        if (tile.index == 46) {
                            PGE.loadPolygon2(body,'4a', '4_7');
                        }
                        
                        if (tile.index == 47) {
                            PGE.loadPolygon2(body,'4b', '4_8');
                        }

                        if (tile.index == 48) {
                            PGE.loadPolygon2(body,'4b', '4_9');
                        }

                        if (tile.index == 49) {
                            PGE.loadPolygon2(body,'4b', '4_10');
                        }

                        if (tile.index == 50) {
                            PGE.loadPolygon2(body,'4b', '4_11');
                        }

                        if (tile.index == 51) {
                            PGE.loadPolygon2(body,'4b', '4_12');
                        }

                        if (tile.index == 52) {
                            PGE.loadPolygon2(body,'4b', '4_13');
                        }

                        if (tile.index == 53) {
                            PGE.loadPolygon2(body,'4b', '4_14');
                        }

                        if (tile.index == 54) {
                            PGE.loadPolygon2(body,'4b', '4_15');
                        }

                        if (tile.index == 55) {
                            PGE.loadPolygon2(body,'4c', '4_16');
                        }

                        if (tile.index == 56) {
                            PGE.loadPolygon2(body,'4c', '4_17');
                        }

                        if (tile.index == 57) {
                            PGE.loadPolygon2(body,'4c', '4_18');
                        }

                        if (tile.index == 58) {
                            PGE.loadPolygon2(body,'4c', '4_19');
                        }

                        if (tile.index == 59) {
                            PGE.loadPolygon2(body,'4c', '4_20');
                        }

                        if (tile.index == 60) {
                            PGE.loadPolygon2(body,'4c', '4_21');
                        }

                        if (tile.index == 61) {
                            PGE.loadPolygon2(body,'4c', '4_22');
                        }

                        if (tile.index == 62) {
                            PGE.loadPolygon2(body,'4c', '4_23');
                        }

                        if (tile.index == 63) {
                            PGE.loadPolygon2(body,'4d', '4_24');
                        }

                        if (tile.index == 64) {
                            PGE.loadPolygon2(body,'4d', '4_25');
                        }

                        if (tile.index == 65) {
                            PGE.loadPolygon2(body,'4d', '4_26');
                        }

                        if (tile.index == 66) {
                            PGE.loadPolygon2(body,'4d', '4_27');
                        }

                        if (tile.index == 67) {
                            PGE.loadPolygon2(body,'4d', '4_28');
                        }

                        if (tile.index == 68) {
                            PGE.loadPolygon2(body,'4d', '4_29');
                        }

                        if (tile.index == 69) {
                            PGE.loadPolygon2(body,'4d', '4_30');
                        }

                        if (tile.index == 70) {
                            PGE.loadPolygon2(body,'4d', '4_31');
                        }

                        if (tile.index == 71) {
                            PGE.loadPolygon2(body,'4e', '4_32');
                        }

                        if (tile.index == 72) {
                            PGE.loadPolygon2(body,'4e', '4_33');
                        }

                        if (tile.index == 73) {
                            PGE.loadPolygon2(body,'4e', '4_34');
                        }

                        if (tile.index == 74) {
                            PGE.loadPolygon2(body,'4e', '4_35');
                        }

                        if (tile.index == 75) {
                            PGE.loadPolygon2(body,'4e', '4_36');
                        }

                        if (tile.index == 76) {
                            PGE.loadPolygon2(body,'4e', '4_37');
                        }

                        if (tile.index == 77) {
                            PGE.loadPolygon2(body,'4e', '4_38');
                        }

                        if (tile.index == 78) {
                            PGE.loadPolygon2(body,'4e', '4_39');
                        }                          
                        
                       if (tile.index < 5 || tile.index >= 79) {
                           body.addRectangle(tile.width, tile.height, tile.width / 2, tile.height / 2, 0);
                       }
                        
                        body.debug = true;
                        
                        body.static=true;
                        body.setCollisionGroup(cg);
                        body.collides(collideslist);
                        
                        game.physics.p2.addBody(body);

                        map.layers[layer].bodies.push(body);
                    
                }
            }
        }

        return map.layers[layer].bodies;

    }
    
    
PGE.loadPolygon2 = function (body, key, object) {

        var data = game.cache.getPhysicsData(key, object);

        //  We've multiple Convex shapes, they should be CCW automatically
        var cm = p2.vec2.create();

        for (var i = 0; i < data.length; i++)
        {
            var vertices = [];

            for (var s = 0; s < data[i].shape.length; s += 2)
            {
                vertices.push([ body.world.pxmi(data[i].shape[s]), body.world.pxmi(data[i].shape[s + 1]) ]);
            }

            var c = new p2.Convex(vertices);

            // Move all vertices so its center of mass is in the local center of the convex
            for (var j = 0; j !== c.vertices.length; j++)
            {
                var v = c.vertices[j];
                p2.vec2.sub(v, v, c.centerOfMass);
            }

            p2.vec2.scale(cm, c.centerOfMass, 1);

            c.updateTriangles();
            c.updateCenterOfMass();
            c.updateBoundingRadius();

            body.data.addShape(c, cm);
        }

        body.data.aabbNeedsUpdate = true;
        body.shapeChanged();

        return true;

    }    
