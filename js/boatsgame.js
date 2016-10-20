var exponentialLimit = function (limit, x, offset) {
    if (offset === undefined) {
        offset = 0.0001
    }

    var xSq = x * x;
    return ((limit * (xSq)) + offset) / (xSq + x + 1);
};

var Tail = function (game, x, y, key, frame, joints, scale) {
    scale = scale || 1;
    this.scaleInv = (1 / scale);
    var width = game.cache.getImage(key).width;
    var height = game.cache.getImage(key).height;

    this.points = new Array(joints);
    var length = joints - 1;
    for (var i = length; i >= 0; i--) {
        this.points[length - i] = (new Phaser.Point(exponentialLimit(width, i) * this.scaleInv, 0));
    }
    console.log(this.points[this.points.length - 1]);
    Phaser.Rope.call(this, game, x, y, key, frame, this.points);
    this.scale.set(scale);

    //= 0.5 * this.height;
    game.add.existing(this);
    return this;
};

// subclass extends superclass, bullet is subclass of super class Phaser.sprite
Tail.prototype = Object.create(Phaser.Rope.prototype);
Tail.prototype.constructor = Tail;
//Tail.prototype.update = function () {} update works, but no need for this object

Tail.prototype.follow = function (headPoint, deltaTime) {

    var head = new Phaser.Point(headPoint.x * this.scaleInv, headPoint.y * this.scaleInv)
    var prev_point = head.clone();
    for (var i = this.points.length - 1; i >= 0; i--) {
        var temp_point = this.points[i].clone();
        var temp_n = (this.points.length - i);
        //
        Phaser.Point.interpolate(this.points[i], prev_point, deltaTime * (exponentialLimit(1, temp_n)), this.points[i]);
        prev_point = temp_point.clone();
    }
    this.points[this.points.length - 1] = head.clone();


};


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

        this.weapon = new Weapon.Bullets(this.game);
        this.weapon.visible = true;

        var style = {font: "16px Arial", fill: "#ffffff", align: "left"};

        this.text1 = this.game.add.text(0, 0, "number of bullets: ", style);


        //this.game.state.start("GameOver",true,false,score);
    },
    update: function () {
        var deltaTime = (this.game.time.elapsedMS * this.game.time.fps) / 1000;

        var boatBackLeft = this.boatGroupBase.position.clone();
        boatBackLeft.x += 16;
        boatBackLeft.y += 4;

        var boatBackRight = this.boatGroupBase.position.clone();
        boatBackRight.x += 16;
        boatBackRight.y -= 4;

        //console.log(this.boatGroupBase.body.facing);
        boatBackLeft.rotate(this.boatGroupBase.position.x, this.boatGroupBase.position.y, this.boatGroupBase.body.rotation + 180, true);

        boatBackRight.rotate(this.boatGroupBase.position.x, this.boatGroupBase.position.y, this.boatGroupBase.body.rotation + 180, true);

        this.leftRope.follow(boatBackLeft, deltaTime);
        this.rightRope.follow(boatBackRight, deltaTime);

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