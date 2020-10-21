import * as random from "./random";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStatus extends cc.Component {
    @property(cc.Node)
    wining: cc.Node = null;

    @property(cc.Node)
    lose: cc.Node = null;

    @property(cc.Node)
    alert: cc.Node = null;

    endGame() {
        this.alert.active = true;

        let randAction = random.randomRangeInt(0, 2);
        if (randAction) {
            let savePos = new cc.Vec3(this.alert.position);
            this.alert.position = new cc.Vec3(savePos.x, savePos.y + 1000);
            cc.tween(this.alert).to(1.5, { position: savePos }).start();
        } else {
            this.alert.scale = 0;
            cc.tween(this.alert).to(1, { scale: 1 }).start();
        }
    }

    restartGame() {
        cc.game.restart();
    }
    // onLoad () {}

    /*  start() {} */

    // update (dt) {}
}
