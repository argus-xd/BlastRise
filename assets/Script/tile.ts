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

    @property([ccTile])
    textureList: ccTile[] = [];

    board: startGame = null;

    _setParent(parent) {
        parent.addChild(this.node);
    }

    _setPosition(position) {
        this.node.setPosition(position);
    }

    onLoad() {
        let rand = mathRandom.randomRangeInt(0, this.textureList.length);
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(
            this.textureList[rand].texture
        );
        this.node.name = this.textureList[rand].color;
        this.color = this.textureList[rand].color;
        this.score = this.textureList[rand].score;

        this.board = utility
            .findDeep(cc.director.getScene(), "board")
            .getComponent("startGame");

        this.node.on("mousedown", (event) => {
            if (event._button === 0) {
                /*   console.log(this.node); */
                this.board.findTile(this.node);
            }
        });
    }

    start() {}

    // update (dt) {}
}
