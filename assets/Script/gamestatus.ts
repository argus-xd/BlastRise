import * as random from "../Script/random";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gamestatus extends cc.Component {
    @property(cc.Node)
    wining: cc.Node = null;

    @property(cc.Node)
    lose: cc.Node = null;

    // onLoad () {}

    start() {
        this.endGame();
    }

    endGame() {
        this.node.active = true;

        let randAction = random.randomRangeInt(0, 2);
        if (randAction) {
            let savePos = new cc.Vec3(this.node.position);
            this.node.position = new cc.Vec3(savePos.x, savePos.y + 1000);
            cc.tween(this.node).to(1.5, { position: savePos }).start();
        } else {
            this.node.scale = 0;
            cc.tween(this.node).to(1, { scale: 1 }).start();
        }
    }

    restartGame() {
        cc.director.loadScene("main");
    }

    // update (dt) {}
}
