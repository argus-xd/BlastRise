const { ccclass, property } = cc._decorator;

import * as mathRandom from "../Script/random"; 
import tile from "../Script/tile"; 
@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Vec2)
    sizeBoard: cc.Vec2 = new cc.Vec2(5, 5);

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;
 

    newTile(parent, position) {
        const ball = cc.instantiate(this.tilePrefab); 
        const balltile: tile = ball.getComponent('tile');
        balltile._setParent(parent)
        balltile._setPosition(position)
        return ball;
    }

    createBoard() {
        let sizeTile = this.tilePrefab.data.getContentSize();

        let mapTile = [];
        for (let n = 0; n < this.sizeBoard.x; n++) {
            mapTile.push([]);
            for (let m = 0; m < this.sizeBoard.y; m++) {
                let pos = new cc.Vec2(sizeTile.height * m, sizeTile.width * -n);
                let tile = this.newTile(this.node, pos);

                mapTile[n].push(tile);
            }
        }

        console.log(mapTile);
    }

    onLoad() {
        
        this.createBoard();
    }

    start() { }

    update(dt) { }
}
