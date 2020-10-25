import * as random from "./random";
import { EndGameType } from "./endgametype";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStatus extends cc.Component {
    @property()
    fadaInDuration: number = 0.5;

    @property(cc.Node)
    insideFrame: cc.Node = null;

    @property(cc.Node)
    wining: cc.Node = null;

    @property(cc.Node)
    lose: cc.Node = null;

    @property(cc.Node)
    endGameFrame: cc.Node = null;

    @property(cc.Node)
    btnWining: cc.Node = null;

    @property(cc.Node)
    BtnLose: cc.Node = null;

    showWindowEndGame(status: number) {
        this.endGameFrame.active = true;

        switch (status) {
            case EndGameType.wining:
                this.wining.active = true;
                break;

            case EndGameType.lose:
                this.lose.active = true;
                break;

            default:
                break;
        }

        let randAction = random.randomRangeInt(0, 2);
        if (randAction) {
            let savePos = new cc.Vec3(this.insideFrame.position);
            this.insideFrame.position = new cc.Vec3(
                savePos.x,
                savePos.y + 1000
            );
            cc.tween(this.insideFrame)
                .to(this.fadaInDuration, { position: savePos })
                .start();
        } else {
            this.insideFrame.scale = 0;
            cc.tween(this.insideFrame)
                .to(this.fadaInDuration, { scale: 1 })
                .start();
        }
        return true;
    }

    nextLevel() {
        let key = "board_level";
        let level = cc.sys.localStorage.getItem(key);
        cc.director.loadScene(`board_level_${level}`, () => {
            cc.sys.localStorage.setItem(key, level++);
        });
    }
    restartGame() {
        cc.game.restart();
    }
    onLoad() {
        this.wining.active = false;
        this.lose.active = false;

        this.btnWining.on(cc.Node.EventType.TOUCH_END, this.nextLevel);
        this.BtnLose.on(cc.Node.EventType.TOUCH_END, this.restartGame);
    }
}
