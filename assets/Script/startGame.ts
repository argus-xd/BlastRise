const { ccclass, property } = cc._decorator;

import * as mathRandom from "../Script/random";
import tile from "../Script/tile";
@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Vec2)
    sizeBoard: cc.Vec2 = new cc.Vec2(5, 5);

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    mapTile = [];

    newTile(parent, position) {
        const tile = cc.instantiate(this.tilePrefab);
        const tileProps: tile = tile.getComponent("tile");
        tileProps._setParent(parent);
        tileProps._setPosition(position);
        return tile;
    }

    createBoard() {
        let sizeTile = this.tilePrefab.data.getContentSize();

        for (let n = 0; n < this.sizeBoard.x; n++) {
            this.mapTile.push([]);
            for (let m = 0; m < this.sizeBoard.y; m++) {
                let pos = new cc.Vec2(sizeTile.height * m, sizeTile.width * -n);
                let tile = this.newTile(this.node, pos);

                this.mapTile[n].push(tile);
            }
        }
    }

    findTile(findTile: cc.Node) {
        for (let n = 0; n < this.sizeBoard.x; n++) {
            for (let m = 0; m < this.sizeBoard.y; m++) {
                if (this.mapTile[n][m] == findTile) {
                    return [n, m];
                }
            }
        }
    }

    onLoad() {
        this.createBoard();
    }

    start() {}

    update(dt) {}
}
