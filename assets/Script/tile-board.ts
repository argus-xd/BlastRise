const { ccclass, property } = cc._decorator;

import tile from "./tile";
import score from "./score";
import bar from "./progress-bar";
import gamestatus from "./game-status";
import * as mathRandom from "./random";
import { EndGameType } from "./endgametype";
import { TileType } from "./tiletype";

@ccclass
export default class StartGame extends cc.Component {
    @property(cc.Vec2)
    boardSize: cc.Vec2 = new cc.Vec2(5, 5);

    clickBlock: Boolean = false;

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    totalMoves = 0;

    @property({
        type: cc.Integer,
    })
    maxMoves = 30;

    @property({
        type: cc.Integer,
    })
    scoreToWin = 1000;

    mapTile = [];
    bar: bar = null;
    score: score = null;
    gamestatus: gamestatus = null;

    onLoad() {
        this.bar = this.node.getComponent("progress-bar");
        this.score = this.node.getComponent("score");
        this.gamestatus = this.node.getComponent("game-status");
        this.score.setMovesLeft((this.maxMoves - this.totalMoves).toString());
        this.createBoard();

        this.node.on("score", (scoreCount: number) => {
            this.score.addScore(scoreCount);
        });
    }

    clickEventAction(state: Boolean = null) {
        if (state != null) this.clickBlock = state;
        return this.clickBlock;
    }

    checkProgress() {
        if (
            this.totalMoves == this.maxMoves &&
            this.score.currentScore < this.scoreToWin
        ) {
            this.gamestatus.showWindowEndGame(EndGameType.lose);
            this.clickEventAction(true);
        }

        if (this.score.currentScore >= this.scoreToWin) {
            this.gamestatus.showWindowEndGame(EndGameType.wining);
            this.clickEventAction(true);
        }
    }

    createBoard() {
        let tileSize = this.tilePrefab.data.getContentSize();
        for (let n = 0; n < this.boardSize.x; n++) {
            this.mapTile.push([]);
            for (let m = 0; m < this.boardSize.y; m++) {
                let pos = new cc.Vec2(tileSize.height * m, tileSize.width * -n);
                let tile = this.newTile(pos);
                this.node.addChild(tile);

                this.mapTile[n].push(tile);
            }
        }
    }

    newTile(position) {
        const tile = cc.instantiate(this.tilePrefab);
        tile.setPosition(position);
        return tile;
    }

    async genTileInEmpty() {
        let sizeTile = this.tilePrefab.data.getContentSize();
        let promisesArr = [];

        for (let n = 0; n < this.boardSize.x; n++) {
            for (let m = 0; m < this.boardSize.y; m++) {
                let checkTile: cc.Node = this.mapTile[n][m];
                if (!checkTile.active) {
                    let pos = new cc.Vec2(
                        sizeTile.height * m,
                        sizeTile.width * 3
                    );
                    let posMove = new cc.Vec2(
                        sizeTile.height * m,
                        sizeTile.width * -n
                    );
                    let tile = this.newTile(pos);
                    let prop: tile = tile.getComponent("tile");
                    let promise = prop.setPositionAction(posMove);
                    promisesArr.push(promise);

                    this.node.addChild(tile);

                    this.mapTile[n][m] = tile;
                }
            }
        }

        await Promise.all(promisesArr);
    }

    nearbyTilesWithEqualColor(tile: cc.Node) {
        const pos = this.getTilePosition(tile);
        const foundTiles = [];

        const nearbyTilesPositions = [
            [pos[0], pos[1] + 1],
            [pos[0], pos[1] - 1],
            [pos[0] + 1, pos[1]],
            [pos[0] - 1, pos[1]],
        ];

        nearbyTilesPositions.forEach(([x, y]) => {
            const tileExists = this.checkTileInBoard(tile, [x, y]);

            if (tileExists) {
                const tileForCheck: cc.Node = this.mapTile[x][y];

                if (this.compareColors(tile, tileForCheck)) {
                    foundTiles.push(tileForCheck);
                }
            }
        });

        return foundTiles;
    }

    comboTiles(clickedTile: cc.Node) {
        const comboTiles = [];
        const nearbyTiles = this.nearbyTilesWithEqualColor(clickedTile);

        if (nearbyTiles.length == 0) {
            return [];
        }

        comboTiles.push(clickedTile);

        while (nearbyTiles.length > 0) {
            let nextTile = nearbyTiles.shift();
            let xTiles = this.nearbyTilesWithEqualColor(nextTile);

            xTiles.forEach((xTile) => {
                const inCombo = comboTiles.some(
                    (tile) => tile._id == xTile._id
                );
                const inStack = nearbyTiles.some(
                    (tile) => tile._id == xTile._id
                );

                if (!inCombo && !inStack) {
                    nearbyTiles.push(xTile);
                }
            });

            comboTiles.push(nextTile);
        }

        return comboTiles;
    }

    async clickTile(clickedTile: cc.Node) {
        const comboTiles = this.comboTiles(clickedTile);

        if (!comboTiles.length) {
            clickedTile.getComponent("tile").noComboAnimation();
            return;
        }

        this.clickEventAction(true);

        const tilesAnimationPromsises = [];
        comboTiles.forEach((tile: cc.Node) => {
            let tileComp: tile = tile.getComponent("tile");
            let promise = tileComp.setPositionActionRemove(
                clickedTile.position
            );
            tilesAnimationPromsises.push(promise);
        });
        await Promise.all(tilesAnimationPromsises);
        this.score.smoothAnimation();

        this.totalMoves++;
        const moveLeft = this.maxMoves - this.totalMoves;
        this.score.setMovesLeft(moveLeft.toString());
        this.bar.setProgressByScore(this.scoreToWin, this.score.currentScore);

        const gravityTiles = this.gravityTiles();
        const genTileInEmpty = this.genTileInEmpty();
        let arrPropimesAwait = [gravityTiles, genTileInEmpty];
        await Promise.all(arrPropimesAwait);

        this.clickEventAction(false);
        this.checkProgress();
    }

    async gravityTiles() {
        let promisesArr = [];
        for (let n = 0; n <= this.boardSize.y - 1; n++) {
            let posToGrav = null;

            for (let m = this.boardSize.x - 1; m >= 0; m--) {
                let tile: cc.Node = this.mapTile[m][n];

                if (!tile.active && !posToGrav) {
                    posToGrav = m;
                    continue;
                }
                if (tile.active && posToGrav) {
                    let move: cc.Node = this.mapTile[m][n];
                    let newpos = new cc.Vec2(
                        move.height * n,
                        move.width * (-1 * posToGrav)
                    );
                    let tileMove: tile = move.getComponent("tile");
                    let propmis = tileMove.setPositionAction(newpos);
                    promisesArr.push(propmis);

                    this.mapTile[posToGrav--][n] = this.mapTile[m][n];
                    this.mapTile[m][n] = cc.Node;
                }
            }
        }

        await Promise.all(promisesArr);
    }

    checkTileInBoard(tile, pos) {
        let x = pos[0];
        let y = pos[1];
        if (this.mapTile[x] == null) {
            return false;
        }
        if (this.mapTile[x][y] == null) {
            return false;
        }
        return tile;
    }

    compareColors(selectTile: cc.Node, matchTile: cc.Node) {
        const firstTileColor: string = selectTile.getComponent("tile").color;
        const secondTileColor: string = matchTile.getComponent("tile").color;
        return firstTileColor == secondTileColor;
    }

    getTilePosition(findTile: cc.Node) {
        for (let n = 0; n < this.boardSize.x; n++) {
            for (let m = 0; m < this.boardSize.y; m++) {
                if (this.mapTile[n][m] == findTile) {
                    return [n, m];
                }
            }
        }
    }

    /*  start() {}

    update(dt) {} */
}
