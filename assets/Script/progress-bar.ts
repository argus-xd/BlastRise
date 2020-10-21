const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressBar extends cc.Component {
    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;

    onLoad() {
        this.updateBarStatic();
    }
    updateBarStatic() {
        this.bar.progress = 0;
    }
    setProgressByScore(maxScore, currenScore) {
        const percent = currenScore / maxScore;
        cc.tween(this.bar).to(1, { progress: percent }).start();
    }

    start() {}

    /*  update(dt) {} */
}
