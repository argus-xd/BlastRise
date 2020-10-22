const { ccclass, property } = cc._decorator;
import * as mathRandom from "./random";
import startGame from "./tile-board";

@ccclass("ccTile")
class ccTile {
    @property(cc.String)
    color: string = "";

    @property(cc.Integer)
    score = 10;

    @property(cc.Texture2D)
    texture: cc.Texture2D = null;
}
@ccclass
export default class Tile extends cc.Component {
    @property
    color: string = "";

    @property
    score = 0;

    @property
    durationActionRemove = 0.4;

    @property
    durationActionFadeIn = 0.4;

    @property
    durationActionFadeOut = 0.4;

    @property
    durationMoveTo = 0.4;

    board: startGame = null;

    @property(ccTile)
    public textureList: ccTile[] = [];

    _setPosition(position) {
        this.node.setPosition(position);
    }
    _setPositionAction(position, time: Number = null, showIn = false) {
        if (time == null) time = this.durationMoveTo;
        if (showIn) {
            this.node.opacity = 99;
            this.node.runAction(cc.fadeIn(this.durationActionFadeIn));
        }
        this.node.runAction(
            cc
                .moveTo(this.durationActionRemove, position)
                .easing(cc.easeBackInOut())
        );
    }
    _setPositionActionRemove(position, showIn = false) {
        if (showIn) {
            this.node.opacity = 99;
            this.node.runAction(cc.fadeIn(this.durationActionFadeIn));
        }

        cc.tween(this.node)
            .to(this.durationMoveTo, { position: position, scale: 0.1 })
            .start();

        /* let scale = cc.sequence(
            cc.scaleTo(0.4, 0.3, 0.3),
            cc.callFunc(() => {
                this.node.destroy();
            })
        );
        this.node.runAction(scale); */

        setTimeout(() => {
            this.node.destroy();
        }, 444);
    }

    setSprite() {
        const rand = mathRandom.weightedRand2({
            0: 0.2,
            1: 0.2,
            2: 0.2,
            3: 0.2,
            4: 0.2,
        });
        const tileProperties = this.textureList[rand];
        this.node.name = tileProperties.color;
        this.color = tileProperties.color;
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            tileProperties.texture
        );
        this.score = tileProperties.score;
    }

    tapTile() {
        if (!this.board) {
            this.board = this.node.parent.getComponent("tile-board");
        }

        if (!this.board.clickEventAction()) {
            this.board.clickTile(this.node);
        }
    }

    onLoad() {
        this.setSprite();
        this.node.on(cc.Node.EventType.TOUCH_END, this.tapTile.bind(this));
    }

    start() {}

    onDestroy() {}
    // update (dt) {}
}
