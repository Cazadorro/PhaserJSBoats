//  Our core Bullet class
//  This is a simple Sprite object that we set a few properties on
//  It is fired by all of the Weapon classes


/**
 * Update the x and y of the projectile linearly
 * change the direction of the projectile to match tracking
 * @param projectile {Projectile} projectile to update
 */
function trackUpdate(projectile) {
    projectile.rotation = Math.atan2(projectile.body.velocity.y, projectile.body.velocity.x);
    if (projectile.scaleSpeed > 0) {
        projectile.scale.x += projectile.scaleSpeed;
        projectile.scale.y += projectile.scaleSpeed;
    }
}

/**
 * Update the x and y of the projectile linearly
 * @param projectile {Projectile} projectile to update
 */
function simpleUpdate(projectile) {
    if (projectile.scaleSpeed > 0) {
        projectile.scale.x += projectile.scaleSpeed;
        projectile.scale.y += projectile.scaleSpeed;
    }
}

// Projectile - subclass of Phaser.Sprite
/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * @class Projectile
 * @extends Phaser.Sprite
 * @constructor
 * @param game {Phaser.Game} game object for this sprite
 * @param key {string} key for the texture for this object
 * @param updateFunction {function} function used when updating the projectile
 */
var Projectile = function (game, key, updateFunction) {
    // this is how we do inheritance in javascript, calls the sprite constructor
    Phaser.Sprite.call(this, game, 0, 0, key);

    // inherits texture from sprite, setting scale mode
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);

    // these are values found within Phaser.Sprite, which we access here
    this.checkWorldBounds = true; // check if outside bounds
    this.outOfBoundsKill = true; // kill if out of bounds
    this.exists = false; // set exist to false initially

    /**
     * whether or not the projectile tracks
     *
     * @property tracking
     * @type boolean
     */
    this.tracking = false; // set tracking to false, a new variable

    /**
     * speed at which the projectile scales
     *
     * @property scaleSpeed
     * @type number
     */
    this.scaleSpeed = 0;  // speed?

    /**
     * function called at update
     *
     * @property updateFunction
     * @type function
     * @default simpleUpdate
     */
    this.updateFunction = updateFunction || simpleUpdate;

};

// subclass extends superclass, bullet is subclass of super class Phaser.sprite
Projectile.prototype = Object.create(Phaser.Sprite.prototype);
Projectile.prototype.constructor = Projectile;

// adding a member function
/**
 * Fires projectile
 *
 * @method fire
 * @param startPoint (Phaser.Point} starting point of the projectile
 * @param angle {number} angle in degrees of the projectile
 * @param speed {number}
 * @param gravityX {number} gravity in x direction
 * @param gravityY {number} gravity in y direction
 */
Projectile.prototype.fire = function (startPoint, angle, speed, gravityX, gravityY) {

    gravityX = gravityX || 0;
    gravityY = gravityY || 0;

    //resetting scale and position
    this.reset(startPoint.x, startPoint.y);
    this.scale.set(1);

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

    this.angle = angle;


    this.body.gravity.set(gravityX, gravityY);

};

/**
 * Updates attributes of projectile, automatically called.
 * @method update
 */
Projectile.prototype.update = function () {
    this.updateFunction(this);
};

// creating New Object();
var Weapon = {};

/**
 *
 * @class Weapon.Bullets
 * @extends Phaser.Group
 * @constructor
 * @param game {Phaser.Game} game object
 * @param projectileSpeed {number} speed of projectiles
 * @param fireInterval {number} interval before you can fire again
 * @param maxProjectiles {number} max number of Projectile objects that can be maintained
 * @returns {Weapon.Bullets}
 */
Weapon.Bullets = function (game, projectileSpeed, fireInterval, maxProjectiles, key) {
    // inherits from group, now of type group object
    Phaser.Group.call(this, game, game.world, 'Bullets', false, true, Phaser.Physics.ARCADE);

    key = key || 'boatbullet1';
    // speed of bullet
    /**
     * speed of projectile
     * @property projectileSpeed
     * @type {number}
     */
    this.projectileSpeed = projectileSpeed || 100;
    // frequency at which to fire bullet
    /**
     * interval between shots
     * @property fireInterval
     * @type {number}
     */
    this.fireInterval = fireInterval || 100;

    maxProjectiles = maxProjectiles || 100;

    // time after which you can fire another bullet
    /**
     * next point in time to reach before firing
     * @property nextFireTime
     * @type {number}
     */
    this.nextFireTime = 0;


    //creating projectile objects
    for (var i = 0; i < maxProjectiles; i++) {
        //  will not dispatch the onAddedToGroup event.
        this.add(new Projectile(game, key), true);
    }
    return this;
};

Weapon.Bullets.prototype = Object.create(Phaser.Group.prototype);
Weapon.Bullets.prototype.constructor = Weapon.Bullets;

/**
 * fires projectiles in straight line towards a target
 *
 * @method fire
 * @param source {Phaser.Point} starting point of bullet, needs .x and .y properties
 * @param target {Phaser.Point} target of bullet, needs .x and .y properties
 */
Weapon.Bullets.prototype.fire = function (source, target) {

    // deciding whether or not to fire
    if (this.game.time.time < this.nextFireTime) {
        return;
    }

    //checking if there even exists bullets we can still use to fire
    var bulletFiring = this.getFirstExists(false);
    if (bulletFiring) {
        var angle = source.angle(target, true);
        bulletFiring.fire(source, angle, this.projectileSpeed, 0, 0);
    }
    // setting the next point where we can fire by the fire interval
    this.nextFireTime = this.game.time.time + this.fireInterval;

};
