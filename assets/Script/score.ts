const { ccclass, property } = cc._decorator;
import tile from "./tile";

@ccclass
export default class Score extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    movesLabel: cc.Label = null;

    currentScore = 0;

    onLoad() {
        this.scoreLabel.string = this.currentScore.toString();
    }

    setMovesLeft(moves: string) {
        this.movesLabel.string = moves;
    }
    addScore(score: number) {
        this.currentScore += score;
    }

    smoothAnimation() {
        const obj = { a: this.currentScore };
        cc.tween(obj)
            .to(
                0.25,
                { a: this.currentScore },
                {
                    progress: (s, e, c, t) => {
                        let num = Math.round(e * t);
                        this.scoreLabel.string = String(num);
                    },
                }
            )
            .start();
    }

    start() {}

    // update (dt) {}
}
