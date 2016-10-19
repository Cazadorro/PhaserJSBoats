//  Our core Bullet class
//  This is a simple Sprite object that we set a few properties on
//  It is fired by all of the Weapon classes

// Bullet - subclass of Phaser.Sprite
var Bullet = function (game, key) {
    // this is how we do inheritance in javascript, calls the sprite constructor
    Phaser.Sprite.call(this, game, 0, 0, key);

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(0.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.tracking = false;
    this.scaleSpeed = 0;

};

// subclass extends superclass, bullet is subclass of super class Phaser.sprite
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

// adding a member function
Bullet.prototype.fire = function (x, y, angle, speed, gx, gy) {

    gx = gx || 0;
    gy = gy || 0;

    this.reset(x, y);
    this.scale.set(1);

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

    this.angle = angle;

    this.body.gravity.set(gx, gy);

};

Bullet.prototype.update = function () {

    if (this.tracking) {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.scaleSpeed > 0) {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }

};

var Weapon = {};

////////////////////////////////////////////////////
//  A single bullet is fired in front of the ship //
////////////////////////////////////////////////////

Weapon.SingleBullet = function (game) {
    // inherits from group, now of type group object
    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 100;
    this.fireRate = 300;

    for (var i = 0; i < 64; i++) {
        this.add(new Bullet(game, 'boatbullet1'), true);
    }

    return this;

};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

Weapon.SingleBullet.prototype.fire = function (source, destination) {

    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x;
    var y = source.y;
    var xy = new Phaser.Point(x, y);
    var angle = xy.angle(destination, true); //this.game.physics.arcade.angleToXY(source, destination.x, destination.y);
    var bullet_to_fire = this.getFirstExists(false);
    if (bullet_to_fire) {
        bullet_to_fire.fire(x, y, angle, this.bulletSpeed, 0, 0);
    }

    this.nextFire = this.game.time.time + this.fireRate;

};

var boatsGame = function (game) {
    spriteNumber = null;
    number = 0;
    workingButtons = true;
    higher = true;
    score = 0;
};

var exponentialLimit = function (limit, x, offset) {
    if (offset === undefined) {
        offset = 0.0001
    }

    var xSq = x * x;
    return ((limit * (xSq)) + offset) / (xSq + x + 1);
};

boatsGame.prototype = {
    create: function () {

        // Change background color
        this.game.stage.backgroundColor = '#294090';
        this.game.time.advancedTiming = true;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        var count = 0;
        var offset = 0;
        var length = (64 - offset) / 4;
        this.points = [];
        var limit = 64;
        console.log("what?");
        for (var i = 16 - 1; i > 0; i--) {

            this.points.push(new Phaser.Point(exponentialLimit(64, i), 0));
        }
        // for (var i = 0; i < 16; i++) {
        //
        //     this.points.push(new Phaser.Point(exponentialLimit(64, i), 0));
        // }
        //this.points[0].x = 64;
        this.rope = this.game.add.rope(0, 0, 'boattrail', null, this.points);

        this.boatGroup = this.game.add.group();
        this.boatGroup.x = 0;
        this.boatGroup.y = 0;

        this.boatGroup.physicsBodyType = Phaser.Physics.ARCADE;
        //this.boatGroup.enableBody = true;
        //this.boatGroup.body.allowRotation = true;

        //this.boatBase = this.game.add.sprite(100, 100, 'boats', 0);
        //this.boatBase.anchor.set(0.5, 0.5);
        //this.game.physics.arcade.enable(this.boatBase);
        //console.log(this.boatBase.body);
        //this.boatBase.body.allowRotation = true;
        //this.boatBase.body.collideWorldBounds = false;
        //this.boatBase.smoothed = false;
        //this.childs = [];
        this.baseBoatList = [];
        for (var i = 0; i < 16; i++) {
            var temp1 = this.boatGroup.create(0, -i, 'boats', i);
            temp1.anchor.set(0.5, 0.5);
            this.baseBoatList.push(temp1);
            //var temp2 = this.boatBase.addChild(this.game.add.sprite(0, -i, 'boats', i));
            //temp2.anchor.set(0.5, 0.5);
            //this.childs.push(temp2);
        }
        this.boatgun1 = this.boatGroup.create(0, -11, "boatgun");
        this.boatgun1.anchor.set(0.0, 0.5);
        this.boatgun1.truPos = new Phaser.Point(this.boatgun1.x, this.boatgun1.y);
        this.boatgun1.moveDown();
        this.boatgun1.moveDown();
        this.boatgun1.moveDown();
        this.boatgun1.moveDown();
        this.boatgun1.moveDown();


        this.boatGroupBase = this.boatGroup.getChildAt(0);
        this.game.physics.arcade.enable(this.boatGroupBase);
        this.boatGroupBase.body.allowRotation = true;
        this.boatGroupBase.body.collideWorldBounds = true;
        this.boatGroupBase.smoothed = false;
        this.boatGroupBase.body.maxAngular = 100;
        this.boatGroupBase.body.maxVelocity.set(100, 100);
        this.boatGroupBase.body.drag.set(80, 80);


        // this.emitter = this.game.add.emitter(200, 200, 50);
        // this.emitter.makeParticles('boats', 0);
        // //this.emitter.lifespan = 500;
        //
        // //this.boatGroupBase.addChild(this.emitter);
        // this.emitter.maxParticleSpeed.set(0, 0);
        // this.emitter.minParticleSpeed.set(0, 0);
        // this.emitter.minParticleScale = 0;
        // this.emitter.maxRotation = 0;
        // this.emitter.minRotation = 0;
        // this.emitter.gravity = 0;
        // this.emitter.start(false, 2000, 50);

        //start(explode, lifespan, frequency, quantity, forceQuantity)

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
        this.angleAccel = 4;
        this.speedAccel = 4;
        this.tailSpeed = 3;

        this.weapon = new Weapon.SingleBullet(this.game);
        this.weapon.visible = true;

        var style = {font: "16px Arial", fill: "#ffffff", align: "left"};

        this.text1 = this.game.add.text(0, 0, "number of bullets: ", style);


        //this.game.state.start("GameOver",true,false,score);
    },
    update: function () {
        var deltaTime = (this.game.time.elapsedMS * this.game.time.fps) / 1000;

        var boatBackPosition = this.boatGroupBase.position.clone();
        boatBackPosition.x += 16;

        //console.log(this.boatGroupBase.body.facing);
        boatBackPosition.rotate(this.boatGroupBase.position.x, this.boatGroupBase.position.y, this.boatGroupBase.body.rotation + 180, true);

        var prev_point = boatBackPosition.clone();
        //this.points[6] = this.points[7];
        // this.points[0].x = this.boatGroupBase.x;
        // this.points[0].y = this.boatGroupBase.y;
        for (var i = this.points.length - 1; i >= 0; i--) {
            //var temp_point = this.points[i].clone();
            //this.points[i].copyFrom(prev_point);
            //prev_point = temp_point.clone();
            var temp_point = this.points[i].clone();
            var temp_n = (this.points.length - i);
            Phaser.Point.interpolate(this.points[i], prev_point, deltaTime * (exponentialLimit(0.15, temp_n)), this.points[i]);
            prev_point = temp_point.clone();

        }
        this.points[this.points.length - 1] = boatBackPosition.clone();

        // if (boatBackPosition.distance(this.points[this.points.length - 1]) > 0) {
        //
        // }

        var angle = this.boatGroupBase.body.rotation * (Math.PI / 180);

        this.boatGroupBase.body.angularVelocity *= .90 * deltaTime;
        //this.boatGroupBase.body.acceleration.x *= .60 * deltaTime;
        //this.boatGroupBase.body.acceleration.y *= .60 * deltaTime;

        if (this.keys.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            //  Move to the left
            this.boatGroupBase.body.angularVelocity -= this.angleSpeed * deltaTime;
        }
        if (this.keys.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            //  Move to the right
            this.boatGroupBase.body.angularVelocity += this.angleSpeed * deltaTime;
        }
        if (this.keys.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            //  Move to the right
            this.boatGroupBase.body.velocity.x += this.speed * Math.cos(angle) * deltaTime;
            this.boatGroupBase.body.velocity.y += this.speed * Math.sin(angle) * deltaTime;
        }
        if (this.keys.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            //  Move to the right
            this.boatGroupBase.body.velocity.x -= this.speed * Math.cos(angle) * deltaTime;
            this.boatGroupBase.body.velocity.y -= this.speed * Math.sin(angle) * deltaTime;
        }


        for (var i = 1; i < 16; i++) {
            var temp = this.baseBoatList[i];
            temp.rotation = this.boatGroupBase.rotation;
            temp.position.x += this.boatGroupBase.body.deltaX();
            temp.position.y += this.boatGroupBase.body.deltaY();
        }

        //this.boatgun1.rotation = this.boatGroupBase.rotation;
        this.boatgun1.truPos.x += this.boatGroupBase.body.deltaX();
        this.boatgun1.truPos.y += this.boatGroupBase.body.deltaY();
        var gun1pos = this.boatgun1.truPos.clone();
        gun1pos.x += 20;

        //console.log(this.boatGroupBase.body.facing);
        gun1pos.rotate(this.boatgun1.truPos.x, this.boatgun1.truPos.y, this.boatGroupBase.body.rotation + 180, true);
        this.boatgun1.position.x = gun1pos.x;
        this.boatgun1.position.y = gun1pos.y;
        this.boatgun1.rotation = this.game.physics.arcade.angleToPointer(this.boatgun1);
        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {

            this.weapon.fire(this.boatgun1.position, this.game.input.mousePointer)
        }
        this.text1.text = "number of bullets: " + this.weapon.countLiving();

    }
};