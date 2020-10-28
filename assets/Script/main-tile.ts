import Tile from "./tile";
import * as mathRandom from "./random";
import TileBoard from "./tile-board";

const { ccclass, property } = cc._decorator;
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
export default class DefaultTile extends Tile {
    @property(ccTile)
    textureList: ccTile[] = [];
    @property
    score = 0;
    @property
    color: string = "";

    weightedRandomTextureIndex() {
        return mathRandom.weightedRand2(
            Array.from(
                { length: this.textureList.length },
                () => 1 / this.textureList.length
            )
        );
    }

    setSprite() {
        const textureIndex = this.weightedRandomTextureIndex();
        const tileProperties = this.textureList[textureIndex];

        this.node.name = tileProperties.color;
        this.color = tileProperties.color;
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            tileProperties.texture
        );
        this.score = tileProperties.score;
    }

    action(board: TileBoard) {
        board
            .comboTiles(this.node)
            .forEach((tile) => tile.getComponent("tile").affect());
    }

    onLoad() {
        this.setSprite();
    }
}
