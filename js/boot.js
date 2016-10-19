var boot = function(game){
    console.log("%cStarting Boot Sequence For Boats", "color:white; background:red");
};

boot.prototype = {
    preload: function(){
        this.game.load.image("loading","img/loading.png");
    },
    create: function(){
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.state.start("Preload");
    }
}