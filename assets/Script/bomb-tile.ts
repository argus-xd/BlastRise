import Tile from "./tile";
import TileBoard from "./tile-board";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BombTile extends Tile {
    @property(cc.Integer)
    radius: number = 1;

    action(board: TileBoard) {
        board
            .tilesInRadius(this.node, this.radius)
            .forEach((tile) => tile.getComponent("tile").affect(board));
    }

    affect(board: TileBoard) {
        if (!this.affected) {
            this.affected = true;
            return this.action(board);
        }
    }
}
