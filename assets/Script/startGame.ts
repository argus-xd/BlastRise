const { ccclass, property } = cc._decorator;

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
export default class NewClass extends cc.Component {
    @property(cc.Vec2)
    sizeBoard: cc.Vec2 = new cc.Vec2(5, 5);

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    @property([ccTile])
    textureList: ccTile[] = [];

    newTail(parent, position) {
        const ball = cc.instantiate(this.tilePrefab);
        let rand = mathRandom.randomRangeInt(0, this.textureList.length);
        ball.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            this.textureList[rand].texture
        );
        ball.name = ball.name + " " + this.textureList[rand].color;
        ball.getComponent("tile").color = this.textureList[rand].color;
        ball.getComponent("tile").score = this.textureList[rand].score;

        parent.addChild(ball);
        ball.setPosition(position);
        return ball;
    }

    createBoard() {
        let sizeTile = this.tilePrefab.data.getContentSize();

        let mapTile = [];
        for (let n = 0; n < this.sizeBoard.x; n++) {
            mapTile.push([]);
            for (let m = 0; m < this.sizeBoard.y; m++) {
                let pos = new cc.Vec2(sizeTile.height * m, sizeTile.width * -n);
                let tail = this.newTail(this.node, pos);

                mapTile[n].push(tail);
            }
        }

        console.log(mapTile);
    }

    onLoad() {
        this.createBoard();
    }

    start() {}

    update(dt) {}
}
