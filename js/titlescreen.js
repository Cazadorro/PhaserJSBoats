var titleScreen = function (game) {
};

titleScreen.prototype = {
    create: function () {
        this.game.stage.backgroundColor = '#171439';
        var gameTitle = this.game.add.sprite(this.game.world.centerX, 160, "gametitle");
        gameTitle.anchor.setTo(0.5, 0.5);
        var playButton = this.game.add.button(this.game.world.centerX, 320, "play", this.playTheGame, this);
        playButton.anchor.setTo(0.5, 0.5);
    },
    playTheGame: function () {
        this.game.state.start("MainGame");
    }
};