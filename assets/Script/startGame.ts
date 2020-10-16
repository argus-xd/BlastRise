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

    checkTile(tile: cc.Node) {
        let pos = this.findTile(tile);

        this.checkInRow(tile, pos);
    }

    checkTileInBoard(tile, pos) {
        let x = pos[0];
        let y = pos[1];
        if (this.mapTile[x] == null) {
            return false;
        }
        if (this.mapTile[x][y] == null) {
            return false;
        }
        return tile;
    }

    checkInRow(tile: cc.Node, pos) {
        let x = pos[0];
        let y = pos[1] + 1;
        const findTileColor: string = tile.getComponent("tile").color;

        let inBoard = this.checkTileInBoard(tile, [x, y]);
        if (inBoard) {
            const nextTile: cc.Node = this.mapTile[x][y];
            const nextTileColor: tile = nextTile.getComponent("tile").color;
            console.log(nextTileColor);
        } else {
            console.log("not found");
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
