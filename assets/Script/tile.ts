const { ccclass, property } = cc._decorator;
import * as mathRandom from "../Script/random";
import * as utility from "../Script/utility";
import startGame from "../Script/startGame";

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
export default class tile extends cc.Component {
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
    durationMoveTo = 0.3;

    @property([ccTile])
    textureList: ccTile[] = [];

    board: startGame = null;

    _setParent(parent) {
        parent.addChild(this.node);
    }

    _setPosition(position) {
        this.node.setPosition(position);
    }
    _setPositionAction(time, position, showIn = false) {
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
        this.node.runAction(
            cc.moveTo(this.durationMoveTo, position).easing(cc.easeBackInOut())
        );
        let scale = cc.sequence(
            cc.scaleTo(0.4, 0.3, 0.3),
            cc.callFunc(() => {
                this.node.destroy();
            })
        );
        this.node.runAction(scale);
    }

    setSprite() {
        /* let rand = mathRandom.randomRangeInt(0, this.textureList.length); */
        let rand = mathRandom.weightedRand2({
            0: 0.4,
            1: 0.3,
            2: 0.2,
            3: 0.2,
            4: 0.2,
        });
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            this.textureList[rand].texture
        );
        this.node.name = this.textureList[rand].color;
        this.color = this.textureList[rand].color;
        this.score = this.textureList[rand].score;
    }

    tapTile() {
        if (!this.board) {
            this.board = utility
                .findDeep(cc.director.getScene(), "board")
                .getComponent("startGame");
        }

        if (!this.board._clickBlock()) {
            this.board.clickTile(this.node);
        }
    }

    onLoad() {
        this.setSprite();

        this.node.on(cc.Node.EventType.TOUCH_END, this.tapTile.bind(this));
    }

    start() {}

    // update (dt) {}
}
