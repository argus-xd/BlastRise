const { ccclass, property } = cc._decorator;
import Booster from "./booster";
import Tile from "./tile";
import TileBoard from "./tile-board";
import { TileType } from "./tiletype";

@ccclass
export default class BoosterBomb extends Booster {
    @property(cc.Integer)
    radius: number = 1;

    onLoad() {
        super.onLoad();
        this.interactWithTiles = true;
    }

    tileClickAction(tile: cc.Node): cc.Node {
        const tileProp: Tile = tile.getComponent("tile");
        const tileType = tileProp.tileType;

        if (tileType == TileType.bomb) return tile;

        const [x, y] = this.tileBoard.getTilePosition(tile);
        const tileBomb = this.tileBoard.newTile(
            tile.position,
            this.tileBoard.bombPrefab
        );

        this.tileBoard.tileBoard[x][y].destroy();
        this.tileBoard.tileBoard[x][y] = tileBomb;
        this.tileBoard.node.addChild(tileBomb);

        this.countLeft();
        this.isActivated = false;

        return tileBomb;
    }
}
