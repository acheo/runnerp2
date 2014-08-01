	var game;
	var tile2ins;
	var ball;
	var runner;
	var jumping = false;
	var kicking = false;

    window.onload = function() {
	
		game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });
		
        function preload () {

			//game.load.tilemap('map', 'assets/tilemaps/maps/ninja-tilemap.json', null, Phaser.Tilemap.TILED_JSON);
			//game.load.image('ball', 'assets/sprites/shinyball.png');
			//game.load.image('sky', 'assets/skies/sky2.png');
			
			game.load.image('bg', 'assets/background1.jpg');
			
			game.load.image('tile1', 'assets/sprites/terrain/tile1.png');
			game.load.image('tile2', 'assets/sprites/terrain/tile2.png');
			
			game.load.image('ball', 'assets/sprites/soccer.png');
			
			game.load.physics('tilepolygons', 'assets/sprites/terrain/tiles.json');
			
			game.load.atlasJSONHash('run', 'assets/sprites/running.png', 'assets/sprites/running.json');
			game.load.atlasJSONHash('jump', 'assets/sprites/jumping.png', 'assets/sprites/jumping.json');
			game.load.atlasJSONHash('kick', 'assets/sprites/kicking.png', 'assets/sprites/kicking.json');
			
        }

        function create () {
		
		var bg = game.add.image(0, 0, 'bg');
		bg.scale.set(0.6);

		// creation of large world bounds
                    game.world.bounds = new Phaser.Rectangle(-800, -600, 800*3, 600*3);  
					
			//	Enable p2 physics
			game.physics.startSystem(Phaser.Physics.P2JS);
			
			game.physics.p2.gravity.y = 2000;
			
			tile2ins = game.add.sprite(400, 600-432*0.5*0.5, 'tile2');
			tile2ins.scale.set(0.5);
			//tile2ins.scale.y=0.5;
		
		
			tile1ins = game.add.sprite(0+144*0.5*0.5, 600-144*0.5*0.5, 'tile1');
			tile1ins.scale.set(0.5);
			
			tile1b = game.add.sprite(0+144*0.5*0.5+144*0.5, 600-144*0.5*0.5, 'tile1');
			tile1b.scale.set(0.5);
			
			ball = game.add.sprite(500, 50, 'ball');
			ball.scale.set(0.1);
			//ball.scale.y = 0.1;
	//	Enable the physics body on this sprite and turn on the visual debugger
	
	
	   //  This sprite is using a texture atlas for all of its animation data
			runner = game.add.sprite(50, 350, 'runner');
			
			runner.scale.set(0.8);
			
			runner.loadTexture('run', 0);

			runner.animations.add('run');

			runner.animations.play('run', 30, true);
	
	
			game.physics.p2.enable([tile2ins,ball,tile1ins,tile1b,runner], true);

			//	Clear the shapes and load the 'tile2' polygon from the physics JSON file in the cache
			tile2ins.body.clearShapes();
			tile2ins.body.loadPolygon('tilepolygons', 'tile2',0.5);
			tile2ins.body.static=true;
			
			tile1ins.body.static=true;
			
			tile1b.body.static=true;
			
			ball.body.clearShapes();
			//ball.body.collideWorldBounds = false;
			ball.body.addCircle(ball.width*0.5);
			
			
			
		 
					


        }
		
		function update() {

			if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			
				if (!jumping && !kicking){
					jumping = true;
				
					runner.loadTexture('jump', 0);

					var anim = runner.animations.add('jump');
					
					anim.onComplete.add(jumpCompleted, this);

					runner.animations.play('jump', 30);
					
					runner.body.velocity.y -= 1000;
				}
			
			
			}
			
			
			if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			
				if (!kicking && !jumping){
					kicking = true;
				
					runner.loadTexture('kick', 0);

					var anim = runner.animations.add('kick');
					
					anim.onComplete.add(kickCompleted, this);

					runner.animations.play('kick', 30);
					
					//runner.body.velocity.y -= 1000;
					
					// todo: runner to ball range check...
					
					ball.body.velocity.x += 1000;
				}
			
			
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

		

    };