const { ccclass, property } = cc._decorator;
import { TileType } from "./tiletype";
import TileBoard from "./tile-board";

@ccclass
export default class Tile extends cc.Component {
    @property({ type: cc.Enum(TileType) })
    tileType: TileType = TileType.tile;

    @property(cc.Texture2D)
    texture: cc.Texture2D = null;
    score = 0;
    @property
    durationActionRemove = 0.4;

    @property
    durationActionFadeIn = 0.4;

    affected: boolean = false;

    @property
    durationActionFadeOut = 0.4;

    @property
    durationMoveTo = 0.4;

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

    setPositionActionRemove(position = null, showIn = false) {
        position = position || this.node.position;
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
                    this.node.destroy();
                    resolve(this.node);
                })
                .start();
        });
    }

    noComboAnimation() {
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
    setSprite() {
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            this.texture
        );
    }
    action(board: TileBoard) {}

    affect(board: TileBoard) {
        if (!this.affected) {
            this.affected = true;
        }
    }
}
