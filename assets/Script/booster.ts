const { ccclass, property } = cc._decorator;
import TileBoard from "./tile-board";

@ccclass
export default class Buster extends cc.Component {
    @property(cc.Label)
    labelCount: cc.Label = null;

    @property(cc.Integer)
    count = 4;

    isActivated: Boolean = false;

    interactWithTiles: Boolean = false;

    @property(cc.Color)
    hoverColor: cc.Color = cc.Color.WHITE;

    countRight() {
        this.count++;
        this.labelCount.string = this.count.toString();
    }

    countLeft() {
        this.count--;
        this.labelCount.string = this.count.toString();
    }

    @property(cc.Node)
    board: cc.Node = null;
    tileBoard: TileBoard;

    onLoad() {
        this.tileBoard = this.board.getComponent("tile-board");

        this.labelCount.string = this.count.toString();
        this.node.on(
            "mouseenter",
            () => {
                this.node.color = this.hoverColor;
                document.body.style.cursor = "pointer";
            },
            this
        );
        this.node.on(
            "mouseleave",
            () => {
                this.node.color = cc.Color.WHITE;
                document.body.style.cursor = "auto";
            },
            this
        );
        this.node.on("mousedown", () => this.boosterClickEvent(), this);
    }

    boosterClickEvent() {
        if (this.count > 0) {
            this.tileBoard.booster = this;
            this.isActivated = !this.isActivated;
        }
    }

    action(...arg) {
        console.log("buster");
    }

    tileClickAction(tile: cc.Node): cc.Node {
        return tile;
    }
}
