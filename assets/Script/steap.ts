const { ccclass, property } = cc._decorator;

@ccclass
export default class Steap extends cc.Component {
    @property({
        type: cc.Integer,
    })
    steapEnd = 0;

    @property({
        type: cc.Integer,
    })
    steap = 30;

    // onLoad () {}

    start() {}

    // update (dt) {}
}
