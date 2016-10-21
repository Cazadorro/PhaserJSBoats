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
        if (this._points[i].distance(head) < 1) {
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


var Sprite3D = function (game, bodyKey, bodyFrames, physicsLayer, enablePhysics, maxVelocity, maxAngular, drag, anchor) {
    Phaser.Group.call(this, game, game.world);
    physicsLayer = physicsLayer || 0;
    if (enablePhysics === undefined) {
        enablePhysics = true;
    }
    maxVelocity = maxVelocity || new Phaser.Point(100, 100);
    maxAngular = maxAngular || 100;
    drag = drag || new Phaser.Point(100, 100);
    anchor = anchor || new Phaser.Point(0.5, 0.5);
    this.bodyList = [];
    for (var i = 0; i < bodyFrames; i++) {
        var temp = this.create(0, -i, bodyKey, i);
        temp.anchor.copyFrom(anchor);
        this.bodyList.push(temp);
    }
    this.physicsBase = this.bodyList.splice(physicsLayer, 1)[0];
    this.physicsBase.anchor.copyFrom(anchor);

    this.baseAnchors = [];
    this.relativeAnchors = [];
    this.worldAnchors = [];
    this.anchorFrames = [];
    this.components = [];

    this.layerOffsets = new Array(bodyFrames);
    for (var i = 0; i < bodyFrames; i++) {
        this.layerOffsets[i] = 0;
    }

    if (enablePhysics) {
        this.game.physics.arcade.enable(this.physicsBase);
        this.physicsBase.body.collideWorldBounds = true;
        this.physicsBase.body.maxAngular = maxAngular;
        this.physicsBase.body.maxVelocity.copyFrom(maxVelocity);
        this.physicsBase.body.drag.copyFrom(drag);
    }
    this.physicsBody = this.physicsBase.body || this.physicsBase;
};

Sprite3D.prototype = Object.create(Phaser.Group.prototype);
Sprite3D.prototype.constructor = Sprite3D;

Sprite3D.prototype.addAnchor = function (bodyFrame, relativePoint) {
    var temp = relativePoint.clone();
    temp.x -= this.physicsBase.anchor.x * this.physicsBase.width;
    temp.y -= (this.physicsBase.anchor.y * this.physicsBase.height);
    this.baseAnchors.push(temp.clone());
    this.anchorFrames.push(bodyFrame);
    this.relativeAnchors.push(new Phaser.Point(this.physicsBase.x, this.physicsBase.y - bodyFrame));
    this.worldAnchors.push(this.relativeAnchors[this.relativeAnchors.length - 1].clone());
    var worldPos = this.worldAnchors[this.worldAnchors.length - 1];
    var relativPos = this.relativeAnchors[this.relativeAnchors.length - 1];
    var basePos = this.baseAnchors[this.baseAnchors.length - 1];

    Phaser.Point.add(worldPos, basePos, worldPos);
    worldPos.rotate(relativPos.x, relativPos.y, this.physicsBase.rotation);
    return worldPos;
};

Sprite3D.prototype.updateAnchors = function () {
    var deltaX, deltaY;
    if (this.physicsBase.body) {
        deltaX = this.physicsBody.deltaX();
        deltaY = this.physicsBody.deltaY();
    }
    else {
        deltaX = this.physicsBody.deltaX;
        deltaY = this.physicsBody.deltaY;
    }
    for (var i = 0; i < this.relativeAnchors.length; i++) {

        this.relativeAnchors[i].x += deltaX;
        this.relativeAnchors[i].y += deltaY;
        this.worldAnchors[i].copyFrom(this.relativeAnchors[i]);
        var worldPos = this.worldAnchors[i];
        Phaser.Point.add(worldPos, this.baseAnchors[i], worldPos);
        worldPos.rotate(this.relativeAnchors[i].x, this.relativeAnchors[i].y, this.physicsBase.rotation);
    }
};

Sprite3D.prototype.updateBody = function () {
    var deltaX, deltaY;
    if (this.physicsBase.body) {
        deltaX = this.physicsBody.deltaX();
        deltaY = this.physicsBody.deltaY();
    }
    else {
        deltaX = this.physicsBody.deltaX;
        deltaY = this.physicsBody.deltaY;
    }
    for (var i = 0; i < this.bodyList.length; i++) {
        this.bodyList[i].rotation = this.physicsBase.rotation;
        this.bodyList[i].position.x += deltaX;
        this.bodyList[i].position.y += deltaY;
    }
};


Sprite3D.prototype.addComponent = function (key, frameLayer, anchorPoint, frame) {

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

Sprite3D.prototype.reCalibrateAnchors = function (newBasePosition) {
    newBasePosition = newBasePosition || this.physicsBase;
    for (var i = 0; i < this.baseAnchors.length; i++) {
        this.relativeAnchors[i].x = newBasePosition.x;
        this.relativeAnchors[i].y = newBasePosition.y - this.anchorFrames[i];
        this.worldAnchors[i].copyFrom(this.relativeAnchors[i]);
        var worldPos = this.worldAnchors[i];
        var relativPos = this.relativeAnchors[i];
        var basePos = this.baseAnchors[i];
        Phaser.Point.add(worldPos, basePos, worldPos);
        worldPos.rotate(relativPos.x, relativPos.y, this.physicsBase.rotation, true);
    }
};


Sprite3D.prototype.add3DComponent = function (sprite3D, frameLayer, anchorPoint) {

    anchorPoint = anchorPoint || new Phaser.Point(0, 0);
    for (var i = frameLayer + 1; i < this.bodyList.length; i++) {
        this.layerOffsets[i] += 1;
    }
    var offsetIndex = this.layerOffsets[frameLayer] + frameLayer;
    var component = this.add(sprite3D, true, offsetIndex);
    component.physicsBase.position = anchorPoint;
    this.components.push(component);
    component.reCalibrateAnchors();
    return component;
};

var Turret3D = function (game, bodyKey, bodyFrames, physicsLayer, weapon, anchorFrame, outputAnchor, maxAngular, anchor) {
    Sprite3D.call(this, game, bodyKey, bodyFrames, physicsLayer, false, null, null, null, anchor);
    this.barrel = this.addAnchor(anchorFrame, outputAnchor);
    this.weapon = weapon;
};

Turret3D.prototype = Object.create(Sprite3D.prototype);
Turret3D.prototype.constructor = Turret3D;

Turret3D.prototype.fire = function (targetPoint) {
    this.weapon.fire(this.barrel, targetPoint);
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