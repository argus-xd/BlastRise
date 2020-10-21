import tile from "../Script/tile";
const { ccclass, property } = cc._decorator;

@ccclass
export default class score extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    movesLabel: cc.Label = null;

    /*  @property({
        type: cc.Integer,
    })
    scoreFinish = 1000; */

    currentScore = 0;

    onLoad() {
        this.scoreLabel.string = this.currentScore.toString();
    }

    setMovesLeft(moves: string) {
        this.movesLabel.string = moves;
    }
    addScore(score: number) {
        this.currentScore += score;
        var obj = { a: this.currentScore };
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
