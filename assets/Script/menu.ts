const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    @property(cc.Node)
    btnStart: cc.Node = null;

    startGame() {
        cc.director.loadScene("board_level_1");
    }

    onLoad() {
        cc.sys.localStorage.clear();
        cc.director.preloadScene("board_level_1");
        this.btnStart.on(cc.Node.EventType.TOUCH_END, this.startGame);
    }

    /*  start () {

    } */

    // update (dt) {}
}
