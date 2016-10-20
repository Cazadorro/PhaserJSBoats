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
    this._points = new Array(joints);
    var length = joints - 1;
    for (var i = length; i >= 0; i--) {
        this.points[length - i] = (new Phaser.Point(exponentialLimit(width, i) * this.scaleInv, 0));
        this._points[length - i] = this.points[length - i].clone();
    }
    console.log(this.points[this.points.length - 1]);
    Phaser.Rope.call(this, game, x, y, key, frame, this.points);
    this.scale.set(scale);

    game.add.existing(this);
    return this;
};

// subclass extends superclass, bullet is subclass of super class Phaser.sprite
Tail.prototype = Object.create(Phaser.Rope.prototype);
Tail.prototype.constructor = Tail;
//Tail.prototype.update = function () {} update works, but no need for this object

Tail.prototype.follow = function (headPoint, deltaTime, rotation) {

    var head = new Phaser.Point(headPoint.x * this.scaleInv, headPoint.y * this.scaleInv)
    var prev_point = head.clone();
    var max_index = this._points.length - 1;
    var temp_point = new Phaser.Point(0, 0);
    for (var i = max_index; i >= 0; i--) {
        temp_point.copyFrom(this._points[i]);
        var temp_n = (this._points.length - i);
        if (this._points[i].distance(head) < 3) {
            this._points[i].copyFrom(head);
        }
        else {
            Phaser.Point.interpolate(this._points[i], prev_point, deltaTime * (exponentialLimit(1, temp_n)), this._points[i]);
        }
        prev_point.copyFrom(temp_point);
    }
    this._points[max_index] = head.clone();
    for (var i = max_index; i >= 0; i--) {
        this.points[i].copyFrom(this._points[i]);
        this.points[i].rotate(head.x, head.y, rotation);
    }
};


var Boat = function (game, bodyKey, bodyFrames, physicsLayer, maxVelocity, maxAngular, drag) {
    Phaser.Group.call(this, game, game.world);
    physicsLayer = physicsLayer || 0;
    maxVelocity = maxVelocity || new Phaser.Point(100, 100);
    maxAngular = maxAngular || 100;
    drag = drag || new Phaser.Point(100, 100);
    this.bodyList = [];
    for (var i = 0; i < bodyFrames; i++) {
        var temp = this.create(0, -i, bodyKey, i);
        temp.anchor.set(0.5, 0.5);
        this.bodyList.push(temp);
    }
    this.physicsBase = this.bodyList.splice(physicsLayer, 1)[0];
    this.physicsBase.anchor.set(0.5, 0.5);

    //this.anchorFrames = [];
    this.baseAnchors = [];
    this.relativeAnchors = [];
    this.worldAnchors = [];
    this.components = [];

    this.layerOffsets = new Array(bodyFrames);
    for (var i = 0; i < bodyFrames; i++) {
        this.layerOffsets[i] = 0;
    }

    this.game.physics.arcade.enable(this.physicsBase);
    this.physicsBase.body.collideWorldBounds = true;
    this.physicsBase.body.maxAngular = maxAngular;
    this.physicsBase.body.maxVelocity.copyFrom(maxVelocity);
    this.physicsBase.body.drag.copyFrom(drag);
    this.physicsBody = this.physicsBase.body;


};

Boat.prototype = Object.create(Phaser.Group.prototype);
Boat.prototype.constructor = Boat;

Boat.prototype.addAnchor = function (bodyFrame, relativePoint) {
    var temp = relativePoint.clone();
    temp.x -= this.physicsBase.anchor.x * this.physicsBase.width;
    temp.y -= (this.physicsBase.anchor.y * this.physicsBase.height);
    this.baseAnchors.push(temp.clone());
    this.relativeAnchors.push(new Phaser.Point(this.physicsBase.x, this.physicsBase.y - bodyFrame));
    this.worldAnchors.push(this.relativeAnchors[this.relativeAnchors.length - 1].clone());
    var worldPos = this.worldAnchors[this.worldAnchors.length - 1];
    var relativPos = this.relativeAnchors[this.relativeAnchors.length - 1];
    var basePos = this.baseAnchors[this.baseAnchors.length - 1];

    Phaser.Point.add(worldPos, basePos, worldPos);
    worldPos.rotate(relativPos.x, relativPos.y, this.physicsBase.body.rotation, true);
    return worldPos;
};

Boat.prototype.updateAnchors = function () {
    for (var i = 0; i < this.relativeAnchors.length; i++) {

        this.relativeAnchors[i].x += this.physicsBase.body.deltaX();
        this.relativeAnchors[i].y += this.physicsBase.body.deltaY();
        this.worldAnchors[i].copyFrom(this.relativeAnchors[i]);
        var worldPos = this.worldAnchors[i];
        Phaser.Point.add(worldPos, this.baseAnchors[i], worldPos);
        worldPos.rotate(this.relativeAnchors[i].x, this.relativeAnchors[i].y, this.physicsBase.body.rotation, true);
    }
};

Boat.prototype.updateBody = function () {
    for (var i = 0; i < this.bodyList.length; i++) {
        this.bodyList[i].rotation = this.physicsBase.rotation;
        this.bodyList[i].position.x += this.physicsBase.body.deltaX();
        this.bodyList[i].position.y += this.physicsBase.body.deltaY();
    }
};

Boat.prototype.addComponent = function (key, frameLayer, anchorPoint, frame) {

    anchorPoint = anchorPoint || new Phaser.Point(0, 0);
    for (var i = frameLayer + 1; i < this.bodyList.length; i++) {
        this.layerOffsets[i] += 1;
    }
    var offsetIndex = this.layerOffsets[frameLayer] + frameLayer;
    var component = this.create(anchorPoint.x, anchorPoint.y, key, frame, true, offsetIndex);
    component.position = anchorPoint;
    this.components.push(component);
    return component;
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

        this.boat1 = new Boat(this.game, 'boats', 16, 0);
        this.gun1Anchor = this.boat1.addAnchor(11, new Phaser.Point(13, 16));
        this.leftBackAnchor = this.boat1.addAnchor(0, new Phaser.Point(10, 12));
        this.rightBackAnchor = this.boat1.addAnchor(0, new Phaser.Point(10, 20));
        this.boatgun1 = this.boat1.addComponent('boatgun', 11, this.gun1Anchor);
        this.boatgun1.anchor.set(0.0, 0.5);

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
        this.boatgun1.rotation = this.game.physics.arcade.angleToPointer(this.boatgun1);

        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {

            this.weapon.fire(this.boatgun1.position, this.game.input.mousePointer)
        }
        this.text1.text = "number of bullets: " + this.weapon.countLiving();

    }
};