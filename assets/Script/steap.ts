const { ccclass, property } = cc._decorator;
import tile from "../Script/tile";

@ccclass
export default class Steap extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property({
        type: cc.Integer,
    })
    steapEnd = 0;

    @property({
        type: cc.Integer,
    })
    steap = 30;

    setScore(tile) {}

    // onLoad () {}

    start() {}

    // update (dt) {}
}
