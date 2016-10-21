

var BasicBoat = function (game, moveSpeed, angleSpeed, trailKey, bodyKey, gunKey, bulletKey, bodyLayers, bodyAnchor) {
    this.game = game;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    trailKey = trailKey || 'boattrail';
    bodyKey = bodyKey || 'boats';
    gunKey = gunKey || 'boatgun';
    bulletKey = bulletKey || 'boatbullet1';
    bodyLayers = bodyLayers || 16;
    bodyAnchor = bodyAnchor || new Phaser.Point(0.1, 0.5);

    this.leftRope = new Tail(this.game, 0, 0, trailKey, null, 64, 0.5);
    this.rightRope = new Tail(this.game, 0, 0, trailKey, null, 64, 0.5);

    this.boat1 = new Sprite3D(this.game, bodyKey, bodyLayers, 0, true, null, null, null, bodyAnchor);
    this.gun1Anchor = this.boat1.addAnchor(11, new Phaser.Point(13, 16));
    this.gun2Anchor = this.boat1.addAnchor(12, new Phaser.Point(51, 16));
    this.leftBackAnchor = this.boat1.addAnchor(0, new Phaser.Point(10, 12));
    this.rightBackAnchor = this.boat1.addAnchor(0, new Phaser.Point(10, 20));

    this.weapon1 = new Weapon.Bullets(this.game, bulletKey);
    this.boatgun1 = new Turret3D(this.game, gunKey, 1, 0,
        this.weapon1, 0, new Phaser.Point(16, 8),
        null, new Phaser.Point(0, 0.5));
    this.boat1.add3DComponent(this.boatgun1, 11, this.gun1Anchor);

    this.weapon2 = new Weapon.Bullets(this.game, bulletKey);
    this.boatgun2 = new Turret3D(this.game, gunKey, 1, 0,
        this.weapon2, 0, new Phaser.Point(16, 8),
        null, new Phaser.Point(0, 0.5));
    this.boat1.add3DComponent(this.boatgun2, 12, this.gun2Anchor);

    this.moveSpeed = moveSpeed;
    this.angleSpeed = angleSpeed;
    this.physicsBody = this.boat1.physicsBody;
    this.physicsBase = this.boat1.physicsBase;
};

BasicBoat.prototype = Object.create(BasicBoat);
BasicBoat.prototype.constructor = BasicBoat;

BasicBoat.prototype.fire = function(target){
    this.boatgun1.fire(target);
    this.boatgun2.fire(target);
};

BasicBoat.prototype.updateState = function(deltaTime){
    this.leftRope.follow(this.leftBackAnchor, deltaTime, -Math.PI / 4);
    this.rightRope.follow(this.rightBackAnchor, deltaTime, Math.PI / 4);
    this.boat1.physicsBody.angularVelocity *= .90 * deltaTime;

    this.boat1.updateBody();
    this.boat1.updateAnchors();
    this.boatgun1.updateAnchors();
    this.boatgun1.updateBody();
    this.boatgun2.updateAnchors();
    this.boatgun2.updateBody();
    this.boatgun1.physicsBase.rotation = this.game.physics.arcade.angleToPointer(this.boatgun1.physicsBase.position);
    this.boatgun2.physicsBase.rotation = this.game.physics.arcade.angleToPointer(this.boatgun2.physicsBase.position);
};

BasicBoat.prototype.moveForward = function(deltaTime){
    var angle = this.boat1.physicsBase.rotation;
    this.boat1.physicsBody.velocity.x += this.moveSpeed * Math.cos(angle) * deltaTime;
    this.boat1.physicsBody.velocity.y += this.moveSpeed * Math.sin(angle) * deltaTime;
};

BasicBoat.prototype.moveBackward = function(deltaTime){
    var angle = this.boat1.physicsBase.rotation;
    this.boat1.physicsBody.velocity.x -= this.moveSpeed * Math.cos(angle) * deltaTime;
    this.boat1.physicsBody.velocity.y -= this.moveSpeed * Math.sin(angle) * deltaTime;
};

BasicBoat.prototype.turnLeft = function(deltaTime){
    this.boat1.physicsBody.angularVelocity -= this.angleSpeed * deltaTime;
};

BasicBoat.prototype.turnRight = function(deltaTime){
    this.boat1.physicsBody.angularVelocity += this.angleSpeed * deltaTime;
};