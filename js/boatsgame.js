var boatsGame = function (game) {
};

boatsGame.prototype = {
    create: function () {

        // Change background color
        this.game.stage.backgroundColor = '#294090';
        // getting fps and elapsed time information
        this.game.time.advancedTiming = true;
        // arcade
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.boat1 = new BasicBoat(this.game, 10, 10);

        //this.game.physics.arcade.enable(this.boatGroup);
        this.keys = this.game.input.keyboard.createCursorKeys();
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.SPACEBAR,
            Phaser.Keyboard.W,
            Phaser.Keyboard.A,
            Phaser.Keyboard.S,
            Phaser.Keyboard.D
        ]);

        var style = {font: "16px Arial", fill: "#ffffff", align: "left"};
        this.text1 = this.game.add.text(this.game.world.centerX, 0, "number of bullets: ", style);

        //this.game.state.start("GameOver",true,false,score);
    },
    update: function () {
        var deltaTime = (this.game.time.elapsedMS * this.game.time.fps) / 1000;

        if (this.keys.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            //  Move to the left
            this.boat1.turnLeft(deltaTime);
        }
        if (this.keys.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            //  Move to the right
            this.boat1.turnRight(deltaTime);
        }
        if (this.keys.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            //  Move to the right
            this.boat1.moveForward(deltaTime);
        }
        if (this.keys.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            //  Move to the right
            this.boat1.moveBackward(deltaTime);
        }
        this.boat1.updateState(deltaTime);
        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.boat1.fire(this.game.input.mousePointer);
        }
        var totalBullets = 0;//this.weapon1.countLiving() + this.weapon2.countLiving();
        this.text1.text = "number of bullets: " + totalBullets;

    }
};