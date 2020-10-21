const { ccclass, property } = cc._decorator;
import * as mathRandom from "../Script/random";
import * as utility from "../Script/utility";
import startGame from "../Script/startGame";

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
    durationMoveTo = 0.4;

    board: startGame = null;

    _setParent(parent) {
        parent.addChild(this.node);
    }

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

        /*  let scale = cc.sequence(
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
    setColor(color) {
        this.color = color;
    }
    setScore(value) {
        this.score = value;
    }
    setSprite(texture) {
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            texture
        );
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
        this.node.on(cc.Node.EventType.TOUCH_END, this.tapTile.bind(this));
    }

    start() {}

    onDestroy() {
        this.node.parent.getComponent("score").set(this);
    }
    // update (dt) {}
}
