

(function() {
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, "game");
    game.state.add("Boot",boot);
    game.state.add("Preload",preload);
    game.state.add("TitleScreen",titleScreen);
    game.state.add("MainGame",boatsGame);
    game.state.add("GameOver",gameOver);
    game.state.start("Boot");
})();