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

        //this.leftRope = this.game.add.Tail(0, 0, 'boattrail', null, 32);
        this.leftRope = new Tail(this.game, 0, 0, 'boattrail', null, 64, 0.5);
        this.rightRope = new Tail(this.game, 0, 0, 'boattrail', null, 64, 0.5);
        //this.add.existing(this.leftRope);

        this.boat1 = new Sprite3D(this.game, 'boats', 16, 0, true, null, null, null, new Phaser.Point(0.1, 0.5));
        this.gun1Anchor = this.boat1.addAnchor(11, new Phaser.Point(13, 16));
        this.gun2Anchor = this.boat1.addAnchor(12, new Phaser.Point(51, 16));
        this.leftBackAnchor = this.boat1.addAnchor(0, new Phaser.Point(10, 12));
        this.rightBackAnchor = this.boat1.addAnchor(0, new Phaser.Point(10, 20));

        this.weapon1 = new Weapon.Bullets(this.game, 'boatbullet1');
        this.boatgun1 = new Turret3D(this.game, 'boatgun', 1, 0,
            this.weapon1, 0, new Phaser.Point(16, 8),
            null, new Phaser.Point(0, 0.5));
        this.boat1.add3DComponent(this.boatgun1, 11, this.gun1Anchor);

        this.weapon2 = new Weapon.Bullets(this.game, 'boatbullet1');
        this.boatgun2 = new Turret3D(this.game, 'boatgun', 1, 0,
            this.weapon2, 0, new Phaser.Point(16, 8),
            null, new Phaser.Point(0, 0.5));
        this.boat1.add3DComponent(this.boatgun2, 12, this.gun2Anchor);



        //this.game.physics.arcade.enable(this.boatGroup);
        this.keys = this.game.input.keyboard.createCursorKeys();
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.SPACEBAR,
            Phaser.Keyboard.W,
            Phaser.Keyboard.A,
            Phaser.Keyboard.S,
            Phaser.Keyboard.D
        ]);

        this.speed = 4;
        this.angleSpeed = 10;

        var style = {font: "16px Arial", fill: "#ffffff", align: "left"};
        this.text1 = this.game.add.text(this.game.world.centerX, 0, "number of bullets: ", style);

        //this.game.state.start("GameOver",true,false,score);
    },
    update: function () {
        var deltaTime = (this.game.time.elapsedMS * this.game.time.fps) / 1000;

        this.leftRope.follow(this.leftBackAnchor, deltaTime, -Math.PI / 4);

        this.rightRope.follow(this.rightBackAnchor, deltaTime, Math.PI / 4);

        var angle = this.boat1.physicsBody.rotation * (Math.PI / 180);

        this.boat1.physicsBody.angularVelocity *= .90 * deltaTime;
        //this.boatGroupBase.body.acceleration.x *= .60 * deltaTime;
        //this.boatGroupBase.body.acceleration.y *= .60 * deltaTime;

        if (this.keys.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            //  Move to the left
            this.boat1.physicsBody.angularVelocity -= this.angleSpeed * deltaTime;
        }
        if (this.keys.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            //  Move to the right
            this.boat1.physicsBody.angularVelocity += this.angleSpeed * deltaTime;
        }
        if (this.keys.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            //  Move to the right
            this.boat1.physicsBody.velocity.x += this.speed * Math.cos(angle) * deltaTime;
            this.boat1.physicsBody.velocity.y += this.speed * Math.sin(angle) * deltaTime;
        }
        if (this.keys.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            //  Move to the right
            this.boat1.physicsBody.velocity.x -= this.speed * Math.cos(angle) * deltaTime;
            this.boat1.physicsBody.velocity.y -= this.speed * Math.sin(angle) * deltaTime;
        }

        this.boat1.updateBody();
        this.boat1.updateAnchors();
        this.boatgun1.updateAnchors();
        this.boatgun1.updateBody();
        this.boatgun2.updateAnchors();
        this.boatgun2.updateBody();
        this.boatgun1.physicsBase.rotation = this.game.physics.arcade.angleToPointer(this.boatgun1.physicsBase.position);
        this.boatgun2.physicsBase.rotation = this.game.physics.arcade.angleToPointer(this.boatgun2.physicsBase.position);

        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.boatgun1.fire(this.game.input.mousePointer);
            this.boatgun2.fire(this.game.input.mousePointer);
        }
        var totalBullets = this.weapon1.countLiving() + this.weapon2.countLiving();
        this.text1.text = "number of bullets: " + totalBullets;

    }
};