const { ccclass, property } = cc._decorator;
import * as mathRandom from "./random";
import startGame from "./tile-board";
import { TileType } from "./tiletype";

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
    @property({ type: cc.Enum(TileType) })
    tileType: TileType = TileType.tile;

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

    setPositionAction(position, time: Number = null, showIn = false) {
        return new Promise((resolve) => {
            if (time == null) time = this.durationMoveTo;
            if (showIn) {
                this.node.opacity = 99;
                this.node.runAction(cc.fadeIn(this.durationActionFadeIn));
            }

            this.node.runAction(
                cc.sequence(
                    cc
                        .moveTo(this.durationActionRemove, position)
                        .easing(cc.easeBackInOut()),
                    cc.callFunc(() => {
                        resolve();
                    })
                )
            );
        });
    }
    setPositionActionRemove(position, showIn = false) {
        return new Promise((resolve) => {
            if (showIn) {
                this.node.opacity = 99;
                this.node.runAction(cc.fadeIn(this.durationActionFadeIn));
            }

            cc.tween(this.node)
                .to(
                    this.durationMoveTo,
                    { position: position, scale: 0 },
                    { easing: "backIn" }
                )
                .call(() => {
                    this.node.parent.emit("score", this.score);
                    this.node.destroy();
                    resolve();
                })
                .start();
        });
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

    missCombo() {
        let rotate = cc
            .tween()
            .to(0.08, { rotation: 30 })
            .to(0.08, { rotation: -30 });

        cc.tween(this.node)
            .then(rotate)
            .repeat(2)
            .to(0.08, { rotation: 0 })
            .start();
    }
    onLoad() {
        if (this.tileType == TileType.tile) {
            this.setSprite();
        }
        this.node.on(cc.Node.EventType.TOUCH_END, this.tapTile.bind(this));
    }

    start() {}

    onDestroy() {}
    // update (dt) {}
}
