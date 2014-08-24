    var game;
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
    var pb; // platformbuilder
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
    
        game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
        
        pb = new PGE.PlatformBuilder(game);
        

        
        function preload () {

            // load progress bar art
            game.load.image('progressbar_empty', 'assets/ui/progress_empty.png');
            game.load.image('progressbar', 'assets/ui/progress.png');
        
            game.stage.backgroundColor = '#50b1d4';
            
        }

        function create () {
            
            // create temporary progress bar sprites
            progress_empty = game.add.sprite((800-600)/2,(600-40)/2, 'progressbar_empty');
            progress_full = game.add.sprite((800-600)/2,(600-40)/2, 'progressbar');
            game.load.setPreloadSprite(progress_full);
        
             // load status
            text1 = game.add.text(280, (600-40)/2, '', { fill: '#FFFFFF'});
            game.load.onFileComplete.add(fileComplete, this);
            game.load.onLoadComplete.add(loadComplete, this);
            
            // queue assets for loading
            game.load.image('bg', 'assets/background1.jpg');
            game.load.image('tile1', 'assets/sprites/terrain/tile1.png');
            game.load.image('tile2', 'assets/sprites/terrain/tile2.png');
            game.load.image('tile3', 'assets/sprites/terrain/tile3.png');
            game.load.image('tile4', 'assets/sprites/terrain/tile4.png');
            game.load.image('tile5', 'assets/sprites/terrain/tile5.png');
            game.load.image('tile6', 'assets/sprites/terrain/tile6.png');
            game.load.image('tile7', 'assets/sprites/terrain/tile7.png');
            
            game.load.image('ball', 'assets/sprites/soccer.png');
            game.load.physics('tilepolygons', 'assets/sprites/terrain/tiles.json');
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
            bg.scale.set(0.6);

            // creation of large world bounds
            game.world.bounds = new Phaser.Rectangle(-800, -600, 800*3, 600*3);  
                    
            //  Enable p2 physics with gravity
            game.physics.startSystem(Phaser.Physics.P2JS);
            game.physics.p2.gravity.y = gameConfig.gravity;
            
            game.physics.p2.friction = gameConfig.friction;
            game.physics.p2.restitution = gameConfig.restitution;
            
            // create terrain from tile id sequence in game config
            pb.addTiles(gameConfig.terrain);
            
            // Create separate collision groups for terrain, runner and ball to allow independent collisions (terrain-ball and terrain-runner)
            CG_Terrain = game.physics.p2.createCollisionGroup();
            CG_Ball = game.physics.p2.createCollisionGroup();
            CG_Runner = game.physics.p2.createCollisionGroup();
            
            // create ball sprite
            ball = game.add.sprite(500, 50, 'ball');
            ball.scale.set(0.1);
            
            // enable physics on non platform sprites
            if (gameConfig.debug) {
                game.physics.p2.enable([ball]);
            } else {
                game.physics.p2.enable([ball]);
            }
            
            // enable physics on platform sprites
            pb.enablePhysics();
            
            // load collision polygons for platform sprites
            pb.loadPolygons(CG_Terrain,[CG_Ball,CG_Runner]);
        
            // add circle body to ball
            ball.body.clearShapes();
            ball.body.addCircle(ball.width*0.5);
            ball.body.setCollisionGroup(CG_Ball);
            ball.body.collides(CG_Terrain);
            
            game.camera.bounds = null; // disables camera bounds constraints
            game.camera.x = 0;
            
            game.physics.p2.onBeginContact.add(function (a1, a2) {
                //Runner collides with a platform (velocity == 0):
                if(a1.id == car.wheel_back.body.id && a2.velocity[0] == 0 && a2.velocity[1] == 0){
                    resting = true;
                }
                if(a1.id == car.wheel_front.body.id && a2.velocity[0] == 0 && a2.velocity[1] == 0){
                    resting = true;
                }
            });
            
            
            // "car" for runner
             
            car.carBody = game.add.sprite(50, 350); //CARBODY
            car.carBody.scale.set(0.8);
            car.carBody.loadTexture('run', 0);
            car.carBody.animations.add('run');
            car.carBody.animations.play('run', 30, true);
            
            car.wheel_front = game.add.sprite(50+30, 380); //FRONT WHEEL
            car.wheel_back = game.add.sprite(50-30, 380); //BACK WHEEL 

            game.physics.p2.enable([car.wheel_front, car.wheel_back,car.carBody]); //ENABLE PHYSICS FOR THESE OBJECTS
            
            //DEFINE CAR BODY
            car.carBody.body.setRectangle(30,30);
            
            car.carBody.body.mass = 0.1;
            car.carBody.body.setCollisionGroup(CG_Runner);
            //car.carBody.body.collides(CG_Terrain);
            //car.carBody.anchor.y = 0.6;

            //DEFINE FRONT WHEEL
            car.wheel_front.body.setCircle(25);
        
            car.wheel_front.body.mass = 1;
            car.wheel_front.body.restitution = 0;
            car.wheel_front.body.setCollisionGroup(CG_Runner);
            car.wheel_front.body.collides(CG_Terrain);

            //DEFINE BACK WHEEL
            car.wheel_back.body.setCircle(25);
      
            car.wheel_back.body.mass = 1;
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
                       
            gui.add(gameConfig, 'runspeed',1,15);
            
            gui.add(gameConfig, 'debug');
            
            gui.add(gameConfig, 'drawbodies').onChange(function(value) {
                ball.body.debug = value;
                car.carBody.body.debug = value;
                car.wheel_front.body.debug = value;
                car.wheel_back.body.debug = value;
                pb.setDrawBodies(value);
            });
            
            gui.add(game, 'paused');
            
            gui.add(game, 'editmode');
            
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
                
                ///This can be optimized. For example, we can work with distance^2 instead of the actual distance... 
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
                
                
                
                // parallax                
                bg.x = game.camera.x/2;
                
                
                // runner or ball falls offscreen => gameover
                if (car.carBody.y - car.carBody.height*0.5 > 600){
                    setGameOver(true);
                }
                if (ball.y - ball.height*0.5 > 600){
                    setGameOver(true);
                }
               
                if (ball.body.x - ball.width*0.5 - car.wheel_front.body.x+car.wheel_front.width*0.5 < -15) {
                    setGameOver(true);
                }
                

            }
            
            if (editing) {
                game.camera.x = pb.lastTile().sprite.x-300;
            
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
        
        // activate map edit mode
        game.editmode = function() {
            
            editing = !editing;
            
            if (editing) {
            
                $('#picker').css('display','block');
            
            
            } else {
            
                $('#picker').css('display','none');
            
            }
            
        };
        
        game.pickerClicked = function(e){
        
            var mouseX = e.offsetX;
            var mouseY = e.offsetY;
            
            var col = Math.floor(mouseX / (200/4));
            var row = Math.floor(mouseY / (150/3));
            
            var tileIndex = row * 4 + col;
        
            //alert(tileIndex);
            if (tileIndex >= 0 && tileIndex <= 7){
                pb.addTiles([tileIndex]);
                game.physics.p2.enable([pb.lastTile().sprite]);
                pb.loadPolygons(CG_Terrain,[CG_Ball,CG_Runner]);
            }
            
            if (tileIndex == 8){
                pb.deleteLastTile();
            }
        
        };
        
    };

