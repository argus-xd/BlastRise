const { ccclass, property } = cc._decorator;

import tile from "./tile";
import score from "./score";
import bar from "./progress-bar";
import gamestatus from "./game-status";
import { EndGameType } from "./endgametype";

@ccclass
export default class StartGame extends cc.Component {
    @property(cc.Vec2)
    boardSize: cc.Vec2 = new cc.Vec2(5, 5);

    @property(cc.Boolean)
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
    }

    clickEventAction(state: Boolean = null) {
        if (state != null) this.clickBlock = state;
        return this.clickBlock;
    }

    eventEndGame() {
        if (
            this.totalMoves == this.maxMoves &&
            this.score.currentScore < this.scoreToWin
        ) {
            this.gamestatus.endGame(EndGameType.lose);
            this.clickEventAction(true);
        }

        if (this.score.currentScore >= this.scoreToWin) {
            this.gamestatus.endGame(EndGameType.wining);
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

    newTile(position, posAction = null) {
        const tile = cc.instantiate(this.tilePrefab);
        const prop: tile = tile.getComponent("tile");

        prop._setPosition(position);
        if (posAction) {
            prop._setPositionAction(posAction);
        }

        return tile;
    }

    genTileInEmpty() {
        let sizeTile = this.tilePrefab.data.getContentSize();

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
                    let tile = this.newTile(pos, posMove);
                    this.node.addChild(tile);

                    this.mapTile[n][m] = tile;
                }
            }
        }
    }

    xMarkTiles(tile: cc.Node) {
        const pos = this.findTile(tile);
        let tilesInRow = [];
        const xy = [
            [pos[0], pos[1] + 1],
            [pos[0], pos[1] - 1],
            [pos[0] + 1, pos[1]],
            [pos[0] - 1, pos[1]],
        ];
        xy.forEach((pos) => {
            let inBoard = this.checkTileInBoard(tile, [pos[0], pos[1]]);
            if (inBoard) {
                const nextTile: cc.Node = this.mapTile[pos[0]][pos[1]];
                if (this.chechColor(tile, nextTile)) {
                    tilesInRow.push(nextTile);
                }
            }
        });
        return tilesInRow;
    }
    async comboTile(tile: cc.Node) {
        let stackTile = this.xMarkTiles(tile);
        if (stackTile.length == 0) return false;
        let stackRemove = [];
        stackRemove.push(tile);

        while (stackTile.length > 0) {
            let nextTile = stackTile.shift();
            let xTiles = this.xMarkTiles(nextTile);
            xTiles.forEach((xTile) => {
                let inRem = false;
                let inStack = false;
                stackRemove.forEach((elRem) => {
                    if (elRem._id == xTile._id) inRem = true;
                });

                stackTile.forEach((elRem) => {
                    if (elRem._id == xTile._id) inStack = true;
                });

                if (!inRem && !inStack) {
                    stackTile.push(xTile);
                }
            });
            stackRemove.push(nextTile);
        }

        let arrPromise = [];
        stackRemove.forEach((e: cc.Node) => {
            arrPromise.push(this.stackRemove(e, tile));
        });

        return await new Promise((resolve) => {
            this.awaitAllPromise(arrPromise).then(() => {
                resolve();
            });
        });
    }
    stackRemove(e: cc.Node, tile) {
        return new Promise((Resolve) => {
            let tileComp: tile = e.getComponent("tile");
            this.score.addScore(tileComp.score);
            tileComp._setPositionActionRemove(tile.position).then((e) => {
                Resolve();
            });
        });
    }

    async awaitAllPromise(arrPromise) {
        return new Promise((resolve) => {
            (async () => {
                await Promise.all(arrPromise);
                resolve(true);
            })();
        });
    }

    async clickTile(tile: cc.Node) {
        this.clickEventAction(true);
        let combo = await this.comboTile(tile).then((e: boolean) => {
            return e;
        });

        this.clickEventAction(combo);
        if (combo) {
            this.totalMoves++;
            const moveLeft = this.maxMoves - this.totalMoves;
            this.score.setMovesLeft(moveLeft.toString());
            this.bar.setProgressByScore(
                this.scoreToWin,
                this.score.currentScore
            );

            this.gravityTiles().then((e) => {});
            this.genTileInEmpty();

            setTimeout(() => {
                this.clickEventAction(false);
                this.eventEndGame();
            }, 700);
        }
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
                    let propmis = tileMove._setPositionAction(newpos);
                    promisesArr.push(propmis);

                    this.mapTile[posToGrav--][n] = this.mapTile[m][n];
                    this.mapTile[m][n] = cc.Node;
                }
            }
        }
        return await new Promise((resolve) => {
            this.awaitAllPromise(promisesArr).then(() => {
                resolve();
            });
        });
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

    chechColor(selectTile: cc.Node, matchTile: cc.Node) {
        const firstTileColor: string = selectTile.getComponent("tile").color;
        const secondTileColor: string = matchTile.getComponent("tile").color;
        return firstTileColor == secondTileColor;
    }

    findTile(findTile: cc.Node) {
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
