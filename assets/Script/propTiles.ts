const { ccclass, property } = cc._decorator;
import tile from "../Script/tile";
import * as mathRandom from "../Script/random";

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
export default class propTiles extends cc.Component {
    @property(ccTile)
    public textureList: ccTile[] = [];

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    newTile(position, posAction = null, parent = false) {
        const tile = cc.instantiate(this.tilePrefab);
        const prop: tile = tile.getComponent("tile");
        if (parent) {
            prop._setParent(parent);
        } else {
            prop._setParent(this.node);
        }
        prop._setPosition(position);
        if (posAction) {
            prop._setPositionAction(posAction);
        }
        this.setSprite(prop);

        return tile;
    }

    setSprite(prop: tile) {
        let rand = mathRandom.weightedRand2({
            0: 0.2,
            1: 0.2,
            2: 0.2,
            3: 0.2,
            4: 0.2,
        });
        let sprite = this.textureList[rand].texture;
        prop.node.name = this.textureList[rand].color;
        prop.color = this.textureList[rand].color;
        prop.setSprite(sprite);
    }

    // onLoad () {}

    start() {}

    // update (dt) {}
}
