var preload = function (game) {
};

preload.prototype = {
    preload: function () {
        var loadingBar = this.add.sprite(160, 240, "loading");
        loadingBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(loadingBar);
        this.game.load.image("gametitle", "img/gametitle.png");
        this.game.load.image("play", "img/play.png");
        this.game.load.image("gameover", "img/gameover.png");

        this.game.load.spritesheet("boats", "img/boatsheet.png", 64, 32);
        this.game.load.image("boattrail", "img/boat_trail_avg.png");
        this.game.load.image("boatgun", "img/boat_gun.png");
        this.game.load.image("boatbullet1", "img/boat_bullet1.png");
    },
    create: function () {
        this.game.state.start("TitleScreen");
    }
};