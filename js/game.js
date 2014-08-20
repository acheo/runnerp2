    var game;
    var ball;
    var runner;
    var jumping = false;
    var kicking = false;
    var started = false;
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
    
    var lastRunnerX = 0;

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
    
            //  runner sprite is using a texture atlas for all of its animation data
            runner = game.add.sprite(50, 350, 'runner');    
            runner.scale.set(0.8);
            runner.loadTexture('run', 0);
            runner.animations.add('run');
            runner.animations.play('run', 30, true);
                        
            // enable physics on non platform sprites
            if (gameConfig.debug) {
                game.physics.p2.enable([ball]);
                game.physics.p2.enable([runner], true);
            } else {
                game.physics.p2.enable([ball,runner]);
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
            
            runner.body.setCollisionGroup(CG_Runner);
            runner.body.collides(CG_Terrain);
            
            runner.body.data.gravityScale = 2;
            
            game.camera.bounds = null; // disables camera bounds constraints
            game.camera.x = 0;
            
            runner.resting = false;
            
            game.physics.p2.onBeginContact.add(function (a1, a2) {
                //Runner (id == 5) colliding with a platform (velocity == 0):
                if(a1.id == runner.body.id && a2.velocity[0] == 0 && a2.velocity[1] == 0){
                    runner.resting = true;
                }
            });

            // visual controls
            var gui = new dat.GUI();
            var gravityController = gui.add(gameConfig, 'gravity', 0, 5000);
            
            gravityController.onChange(function(value) {
              // Fires on every change, drag, keypress, etc.
              game.physics.p2.gravity.y=value;
            });
            
            var frictionController = gui.add(gameConfig, 'friction',0, 100);
            frictionController.onChange(function(value) {
              game.physics.p2.friction=value;
            });
            var restitutionController = gui.add(gameConfig, 'restitution',0, 3);
            restitutionController.onChange(function(value) {
              game.physics.p2.restitution=value;
            });
            
            gui.add(gameConfig, 'debug');
            
            started = true;
        
        }
        
        function update() {

            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            
                if (!jumping && !kicking && runner.resting){
                    jumping = true;
                    runner.resting = false;
                    runner.loadTexture('jump', 0);
                    var anim = runner.animations.add('jump');                   
                    anim.onComplete.add(jumpCompleted, this);
                    runner.animations.play('jump', gameConfig.jump.frameRate);
                    runner.body.velocity.y += gameConfig.jump.runner_vx_change;
                }
                        
            }
            
            if (started){
            
                dist = (ball.x-ball.width*0.5) - (runner.x+runner.width*0.5); // note positions are central points, rather than left edge due to use of physics bodies
                var canReachBall = Math.abs(dist) < gameConfig.kick.ball_runner_maxDistance;
                
                // autokick (tap) the ball at close range
                if (dist <= gameConfig.autokick.distance && !kicking && !jumping && canReachBall) {
                    ball.body.velocity.x += gameConfig.autokick.ball_vx_change;
                    ball.body.velocity.y += gameConfig.autokick.ball_vy_change;
                }
                
                // manual keyboard driven kick
                if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    
                    if (!kicking && !jumping && canReachBall){

                            kicking = true;               
                            runner.loadTexture('kick', 0);
                            var anim = runner.animations.add('kick');       
                            anim.onComplete.add(kickCompleted, this);
                            runner.animations.play('kick', gameConfig.kick.frameRate);
                        
                            ball.body.velocity.x += gameConfig.kick.ball_vx_change;
                            ball.body.velocity.y += gameConfig.kick.ball_vy_change;
                        
                    }               
                }

                runner.body.x = lastRunnerX + 10;               
                lastRunnerX = runner.body.x;                
                game.camera.x = runner.body.x - 100;
                
                if (game.camera.x < 0) game.camera.x = 0;
                
                if (runner.body.angle > 30) runner.body.angle = 30;
                if (runner.body.angle < -30) runner.body.angle = -30;
                
                if (ball.body.x - ball.width*0.5 < runner.body.x+runner.width*0.5) ball.body.x = ball.width*0.5 + runner.body.x+runner.width*0.5;
                
                // parallax                
                bg.x = game.camera.x/2;
                
            }
            
            
        
        }
        
        function jumpCompleted(){
        
            jumping=false;
            kicking=false;
            
            runner.loadTexture('run', 0);
            var anim = runner.animations.add('run');
            runner.animations.play('run', 30,true);
        
        }
    
        function kickCompleted(){
        
            jumping=false;
            kicking=false;
            
            runner.loadTexture('run', 0);
            var anim = runner.animations.add('run');
            runner.animations.play('run', 30,true);
        
        }
        
        function render() {
            
            if (started) { 
            
                if (gameConfig.debug){
                    
                    game.debug.text('ball',32,280);
                    game.debug.spriteCoords(ball, 32, 300);
                    
                    game.debug.text('runner',32,480);
                    game.debug.spriteCoords(runner, 32, 500);
                    
                    game.debug.text('dist:'+parseInt(dist),32,550);
                    
                }
                
            }

        }
    };