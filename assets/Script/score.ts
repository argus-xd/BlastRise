const { ccclass, property } = cc._decorator;

@ccclass
export default class Score extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    movesLabel: cc.Label = null;

    currentScore = 0;

    onLoad() {}

    setMovesLeft(moves: string) {
        this.movesLabel.string = moves;
    }
    setScoreLabel(score, maxScore) {
        this.scoreLabel.string = `${score} из ${maxScore}`;
    }

    addScoreWithAnimation(score, maxScore) {
        this.currentScore += score;
        const obj = { a: this.currentScore };
        cc.tween(obj)
            .to(
                0.25,
                { a: this.currentScore },
                {
                    progress: (s, e, c, t) => {
                        let num = Math.round(e * t);
                        this.setScoreLabel(num, maxScore);
                    },
                }
            )
            .start();
    }
}
