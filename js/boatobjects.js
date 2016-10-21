/**
 * ((limit * x^2) + offset)/(x^2 + x + 1)
 * creates an asymptote at limit
 * @param limit {number} asymptote
 * @param x {number} x value in function
 * @param offset {number} offset of numerator
 * @returns {number} the reusulting y
 */
var exponentialLimit = function (limit, x, offset) {
    if (offset === undefined) {
        offset = 0.0001
    }
    var xSq = x * x;
    return ((limit * (xSq)) + offset) / (xSq + x + 1);
};

/**
 * tail made of rope, where each partition of the tail follows the other
 * @class Tail
 * @extends Phaser.Rope
 * @param game {Phaser.Game} game object
 * @param x {number} x position
 * @param y {number} y position
 * @param key {string} image key
 * @param frame {number} frame used
 * @param joints {number} number of total joints
 * @param scale {number} vertical and horizontal scaling of the object
 * @returns {Tail}
 * @constructor
 */
var Tail = function (game, x, y, key, frame, joints, scale) {
    scale = scale || 1;
    // inverse the scale in order to get positioning in world cordinates
    this.scaleInv = (1 / scale);
    var width = game.cache.getImage(key).width;
    var height = game.cache.getImage(key).height;

    // need to maintian two sets of points, an internal set of points that follow linearly
    // and another set of points to represent transformations applied to those points (ie rotation)
    this.points = new Array(joints);
    this._points = new Array(joints);
    var length = joints - 1;
    for (var i = length; i >= 0; i--) {
        this.points[length - i] = (new Phaser.Point(exponentialLimit(width, i) * this.scaleInv, 0));
        this._points[length - i] = this.points[length - i].clone();
    }
    Phaser.Rope.call(this, game, x, y, key, frame, this.points);
    this.scale.set(scale);

    //now the tail actually show up by default
    game.add.existing(this);
    return this;
};

// subclass extends superclass, bullet is subclass of super class Phaser.sprite
Tail.prototype = Object.create(Phaser.Rope.prototype);
Tail.prototype.constructor = Tail;
//Tail.prototype.update = function () {} update works, but no need for this object

/**
 * follows the given point based on deltaTime and rotation away from that point as a pivot
 * @method follow
 * @param headPoint {Phaser.Point} point to follow
 * @param deltaTime {number} delta time for fps
 * @param rotation {number} rotation in radians
 */
Tail.prototype.follow = function (headPoint, deltaTime, rotation) {

    var head = new Phaser.Point(headPoint.x * this.scaleInv, headPoint.y * this.scaleInv)
    var prev_point = head.clone();
    var max_index = this._points.length - 1;
    var temp_point = new Phaser.Point(0, 0);
    for (var i = max_index; i >= 0; i--) {
        temp_point.copyFrom(this._points[i]);
        var temp_n = (this._points.length - i);
        // if we are close enough, we just set the position to head to avoid visual artifacts
        if (this._points[i].distance(head) < 1) {
            this._points[i].copyFrom(head);
        }
        else {
            // otherwise we interpolate the position to the next point
            Phaser.Point.interpolate(this._points[i], prev_point, deltaTime * (exponentialLimit(1, temp_n)), this._points[i]);
        }
        prev_point.copyFrom(temp_point);
    }
    // then we copy all the internal point positions to apply rotation transformations.
    this._points[max_index] = head.clone();
    for (var i = max_index; i >= 0; i--) {
        this.points[i].copyFrom(this._points[i]);
        this.points[i].rotate(head.x, head.y, rotation);
    }
};

/**
 * Group object that emulates 3D via moving sprites in y direction based on position
 * @class Sprite3D
 * @extends Phaser.Group
 * @param game {Phaser.Game} game object used
 * @param bodyKey {string} image key for object
 * @param bodyFrames {number} number of frames in body
 * @param physicsLayer {number} layer within bodyFrames that corrisponds to the layer used for physics
 * @param enablePhysics {boolean} whether or not to enable physics on this object
 * @param maxVelocity {number} max speed of the object
 * @param maxAngular {number} max angular velocity of the object
 * @param drag {number} drag on object
 * @param anchor {Phaser.Point} pivot of object
 * @constructor
 */
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
    // create the reference list to the parts of the group that represent the body
    this.bodyList = [];
    for (var i = 0; i < bodyFrames; i++) {
        var temp = this.create(0, -i, bodyKey, i);
        temp.anchor.copyFrom(anchor);
        this.bodyList.push(temp);
    }
    // extract the physics layer out to make an easy reference to it
    this.physicsBase = this.bodyList.splice(physicsLayer, 1)[0];
    //this.physicsBase.anchor.copyFrom(anchor);


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

/**
 * Adds a new anchor point, point in which other objects can reference and get the location of at all times
 * @method addAnchor
 * @param bodyFrame {number} frame in which anchor exists
 * @param relativePoint {Phaser.Point} position relative to sprite sheet pixels (ie 0,0 is top left of sprite)
 * @returns {Phaser.Point} point that updates with real position relative to world
 */
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

/**
 * updates the anchors with current physics body position
 * @method updateAnchors
 *
 */
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

/**
 * updates the body with current physics body position
 * @method updateBody
 */
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


/**
 * adds a new sprite component to the Sprite3D group
 * @method addSprite
 * @param key {number} image key
 * @param frameLayer {number} layer where sprite will reside
 * @param anchorPoint {Phaser.Point} point to anchor new object to
 * @param frame {number} frame of sprite used
 * @returns {Phaser.Sprite}
 */
Sprite3D.prototype.addSprite = function (key, frameLayer, anchorPoint, frame) {

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

/**
 * recalibrates anchors based on new position, or internal physicsBase position
 * @method reCalibrateAnchors
 * @param newBasePosition {Phaser.Point} position to recalibrate to
 */
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

/**
 * adds new Sprite3D object to the Sprite3D group
 * @param sprite3D {Sprite3D} new sprite 3D object
 * @param frameLayer {number} layer to add object to
 * @param anchorPoint {Phaser.Point} anchor to align object to
 * @returns {Sprite3D} component added
 */
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

/**
 * represents a turret object that can shoot projectiles
 * @class Turret3D
 * @extends Sprite3D
 * @param game {Phaser.Game} game object used
 * @param bodyKey {string} image key for object
 * @param bodyFrames {number} number of frames in body
 * @param physicsLayer {number} layer within bodyFrames that corrisponds to the layer used for physics
 * @param weapon {Weapon} weapon object used to shoot
 * @param anchorFrame {number} frame to anchor on
 * @param outputAnchor {Phaser.Point} point to shoot from
 * @param maxAngular {number} max angular velocity
 * @param anchor {Phaser.Point} pivot of object
 * @constructor
 */
var Turret3D = function (game, bodyKey, bodyFrames, physicsLayer, weapon, anchorFrame, outputAnchor, maxAngular, anchor) {
    Sprite3D.call(this, game, bodyKey, bodyFrames, physicsLayer, false, null, null, null, anchor);
    this.barrel = this.addAnchor(anchorFrame, outputAnchor);
    this.weapon = weapon;
};

Turret3D.prototype = Object.create(Sprite3D.prototype);
Turret3D.prototype.constructor = Turret3D;

/**
 * calls internal weapon fire method to shoot at target point
 * @method fire
 * @param targetPoint {Phaser.Point} point to shoot at
 */
Turret3D.prototype.fire = function (targetPoint) {
    this.weapon.fire(this.barrel, targetPoint);
};
