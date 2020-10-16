const { ccclass, property } = cc._decorator;

@ccclass
export default class tile extends cc.Component {
    @property
    color: string = "";

    @property
    score = 0;

    onLoad() {
        this.node.on("mousedown", function (event) {
            if (event._button === 0) {
                console.log(this.node);
            }
        });
    }

    start() {}

    // update (dt) {}
}
