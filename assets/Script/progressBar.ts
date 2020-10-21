const { ccclass, property } = cc._decorator;
import score from "../Script/score";

@ccclass
export default class progressBar extends cc.Component {
    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;

    @property(score)
    score: score = null;

    onLoad() {
        this.score = this.node.getComponent("score");
        this.updateBarStatic();
    }
    updateBarStatic() {
        let total = this.score.score / this.score.scoreFinish;
        this.bar.progress = total;
    }
    updateBar() {
        let total = this.score.score / this.score.scoreFinish;
        cc.tween(this.bar).to(1, { progress: total }).start();
    }

    start() {}

    /*  update(dt) {} */
}
