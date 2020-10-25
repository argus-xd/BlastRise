const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    @property(cc.Node)
    btnStart: cc.Node = null;

    @property(cc.Integer)
    maxLevel: Number = 0;

    startGame() {
        cc.director.loadScene("board_level_1");
    }

    onLoad() {
        cc.sys.localStorage.clear();
        cc.director.preloadScene("board_level_1");
        cc.sys.localStorage.setItem("maxLevel", this.maxLevel);

        let key = "board_level_";
        cc.sys.localStorage.setItem(key, 2);

        this.btnStart.on(cc.Node.EventType.TOUCH_END, this.startGame);
    }
}
