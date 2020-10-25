const { ccclass, property } = cc._decorator;

import tile from "./tile";
import score from "./score";
import ProgressBar from "./progress-bar";
import gamestatus from "./game-status";
import * as mathRandom from "./random";
import { EndGameType } from "./endgametype";
import { TileType } from "./tiletype";

@ccclass
export default class TileBoard extends cc.Component {
    @property(cc.Vec2)
    boardSize: cc.Vec2 = new cc.Vec2(5, 5);

    clickEventsDisabled: Boolean = false;

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

    tileBoard = [];
    progressBar: ProgressBar;
    score: score;
    gamestatus: gamestatus;

    onLoad() {
        this.progressBar = this.node.getComponent("progress-bar");
        this.score = this.node.getComponent("score");
        this.gamestatus = this.node.getComponent("game-status");
        this.score.setMovesLeft((this.maxMoves - this.totalMoves).toString());
        this.score.setScoreLabel(this.score.currentScore, this.scoreToWin);
        this.fillBoardWithTiles();
    }

    disableClickEvents() {
        this.clickEventsDisabled = true;
    }

    enableClickEvents() {
        this.clickEventsDisabled = false;
    }

    checkEndGameConditions() {
        const maxMovesReached = this.totalMoves >= this.maxMoves;
        const maxScoreReached = this.score.currentScore >= this.scoreToWin;

        if (maxMovesReached || maxScoreReached) {
            const endGameType = maxScoreReached
                ? EndGameType.wining
                : EndGameType.lose;
            this.gamestatus.showEndGameWindow(endGameType);
            this.disableClickEvents();
        }
    }

    fillBoardWithTiles() {
        const tileSize = this.tilePrefab.data.getContentSize();

        for (let row = 0; row < this.boardSize.x; row++) {
            this.tileBoard.push([]);
            for (let col = 0; col < this.boardSize.y; col++) {
                let pos = new cc.Vec2(
                    tileSize.height * col,
                    tileSize.width * -row
                );
                let tile = this.newTile(pos);

                this.node.addChild(tile);
                this.tileBoard[row].push(tile);
            }
        }
    }

    newTile(position: cc.Vec2) {
        const tile: cc.Node = cc.instantiate(this.tilePrefab);
        tile.setPosition(position);

        tile.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.clickEventsDisabled) {
                this.clickTileAction(tile);
            }
        });

        return tile;
    }

    fillEmptyCellsWithTiles() {
        const tileSize = this.tilePrefab.data.getContentSize();
        const newTilesAnimationPromises = [];

        for (let n = 0; n < this.boardSize.x; n++) {
            for (let m = 0; m < this.boardSize.y; m++) {
                const tileIsActive: cc.Node = this.tileBoard[n][m].active;

                if (!tileIsActive) {
                    const pos = new cc.Vec2(
                        tileSize.height * m,
                        tileSize.width * 3
                    );
                    const posMove = new cc.Vec2(
                        tileSize.height * m,
                        tileSize.width * -n
                    );

                    const tile = this.newTile(pos);
                    const prop: tile = tile.getComponent("tile");
                    const promise = prop.setPositionAction(posMove);

                    newTilesAnimationPromises.push(promise);

                    this.node.addChild(tile);
                    this.tileBoard[n][m] = tile;
                }
            }
        }

        return newTilesAnimationPromises;
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
                const tileForCheck: cc.Node = this.tileBoard[x][y];

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
            let nerabyToNextTile = this.nearbyTilesWithEqualColor(nextTile);

            nerabyToNextTile.forEach((nearbyTile) => {
                const inCombo = comboTiles.some(
                    (tile) => tile._id == nearbyTile._id
                );
                const inStack = nearbyTiles.some(
                    (tile) => tile._id == nearbyTile._id
                );

                if (!inCombo && !inStack) {
                    nearbyTiles.push(nearbyTile);
                }
            });

            comboTiles.push(nextTile);
        }

        return comboTiles;
    }

    async clickTileAction(clickedTile: cc.Node) {
        const comboTiles = this.comboTiles(clickedTile);

        if (!comboTiles.length) {
            clickedTile.getComponent("tile").noComboAnimation();
            return;
        }

        this.disableClickEvents();

        let tilesScoreSum = 0;
        const tilesAnimationPromsises = [];

        comboTiles.forEach((tile: cc.Node) => {
            const tileComp: tile = tile.getComponent("tile");
            const promise = tile
                .getComponent("tile")
                .setPositionActionRemove(clickedTile.position);
            tilesAnimationPromsises.push(promise);
            tilesScoreSum += tileComp.score;
        });

        this.score.addScoreWithAnimation(tilesScoreSum, this.scoreToWin);

        this.totalMoves++;
        const moveLeft = this.maxMoves - this.totalMoves;
        this.score.setMovesLeft(moveLeft.toString());
        this.progressBar.setProgressByScore(
            this.scoreToWin,
            this.score.currentScore
        );

        await Promise.all(tilesAnimationPromsises);
        await Promise.all([
            ...this.gravityTiles(),
            ...this.fillEmptyCellsWithTiles(),
        ]);

        this.enableClickEvents();
        this.checkEndGameConditions();
    }

    gravityTiles() {
        const gravityPromises = [];

        for (let n = 0; n <= this.boardSize.y - 1; n++) {
            let posToGrav = null;

            for (let m = this.boardSize.x - 1; m >= 0; m--) {
                const tile: cc.Node = this.tileBoard[m][n];

                if (!tile.active && !posToGrav) {
                    posToGrav = m;
                    continue;
                }

                if (tile.active && posToGrav) {
                    const move: cc.Node = this.tileBoard[m][n];
                    const newpos = new cc.Vec2(
                        move.height * n,
                        move.width * (-1 * posToGrav)
                    );

                    const tileMove: tile = move.getComponent("tile");
                    const propmise = tileMove.setPositionAction(newpos);

                    gravityPromises.push(propmise);

                    this.tileBoard[posToGrav--][n] = this.tileBoard[m][n];
                    this.tileBoard[m][n] = cc.Node;
                }
            }
        }

        return gravityPromises;
    }

    checkTileInBoard(tile, pos) {
        let x = pos[0];
        let y = pos[1];
        if (this.tileBoard[x] == null) {
            return false;
        }
        if (this.tileBoard[x][y] == null) {
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
                if (this.tileBoard[n][m] == findTile) {
                    return [n, m];
                }
            }
        }
    }
}
