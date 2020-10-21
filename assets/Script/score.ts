// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Score extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property({
        type: cc.Integer,
    })
    scoreFinish = 1000;

    @property({
        type: cc.Integer,
    })
    score = 0;

    // onLoad () {}

    start() {}

    // update (dt) {}
}
