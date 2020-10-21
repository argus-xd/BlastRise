import tile from "../Script/tile";
import { ccTiles } from "./ccTiles";
const { ccclass, property } = cc._decorator;

@ccclass
export default class score extends cc.Component {
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

    onLoad() {
        this.label.string = this.score.toString();
    }

    set(tile: tile) {
        /*    this.score += tile.score; */
        /* this.label.string = this.score.toString(); */

        /*   cc.tween(this.label).to(1, { string: this.score }).start(); */
        let lbl = this.label;
        let next = (this.score += tile.score);
        let prev = tile.score;

        var obj = { a: this.score };
        cc.tween(obj)
            .to(
                0.25,
                { a: next },
                {
                    progress: (s, e, c, t) => {
                        let num = Math.round(e * t);
                        lbl.string = String(num);
                    },
                }
            )
            .start();
    }

    start() {}

    // update (dt) {}
}
