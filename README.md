Platform Game Engine
========

*** Tile creation process ***

Raul has specified tile size  as 40 x 40px.

His art sheet can be seen here:
https://raw.githubusercontent.com/acheo/runnerp2/tiled/sheet.png

(I have added numbers to the pieces)

For each piece Raul has written number of tiles width in red and height in blue.

- Step 1. Use an image editor such as GIMP to cut out a piece from the sheet such that it is exactly a multiple of 40px, width and height.
Save this as a png in \assets\raul\<number> (I have done this for pieces 1 to 6 already.)

- Step 2. Split the png into 40px tiles. i.e I have been using the splitter tool on http://imagesplitter.net/ and entering the relevant number of rows and columns.
Save these images into your <number> folder. It is helpful to rename then to <piecenumber>_<index>.png at this point, where index is zero based and increments in reading order.

- Step 3. Trace the boundaries of the tiles by loading them into PhysicsEditor https://www.codeandweb.com/physicseditor (10 at a time since we are using the trial, saving each .pes a <number>a,c,c,d etc for each block of 10).
Trace and export each set of 10 to json using the Lime + Corona (JSON) option.

- Step 4. Add lines to load the json in game.js
e.g

            game.load.physics('3a', 'assets/raul/3/3a.json');
            game.load.physics('3b', 'assets/raul/3/3b.json');
            game.load.physics('3c', 'assets/raul/3/3c.json');

- Step 5. Add lines to function PGE.convertTilemap2 in game.js
e.g

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

- Step 6. Testing. Edit \assets\raul\48x27.json in tiled http://www.mapeditor.org/. You will need to load the unsliced piece image into tiled as a tilesheet.               