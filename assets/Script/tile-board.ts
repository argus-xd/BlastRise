const { ccclass, property } = cc._decorator;

import tile from "./tile";
import score from "./score";
import ProgressBar from "./progress-bar";
import gamestatus from "./game-status";
import { EndGameType } from "./endgametype";
import { TileType } from "./tiletype";
import Booster from "./booster";

@ccclass
export default class TileBoard extends cc.Component {
    @property(cc.Vec2)
    boardSize: cc.Vec2 = new cc.Vec2(5, 5);

    clickEventsDisabledBuster: Boolean = false;
    clickEventsDisabled: Boolean = false;

    clickBlock: Boolean = false;

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bombPrefab: cc.Prefab = null;

    @property(cc.Vec2)
    tileOffset: cc.Vec2 = new cc.Vec2(0, 0);

    totalMoves = 0;

    @property({
        type: cc.Integer,
    })
    maxMoves = 30;

    @property({
        type: cc.Integer,
    })
    scoreToWin = 1000;
    tileSize: cc.Vec2;
    tileBoard = [];
    progressBar: ProgressBar;
    score: score;
    gamestatus: gamestatus;
    booster: Booster;

    onLoad() {
        this.progressBar = this.node.getComponent("progress-bar");
        this.score = this.node.getComponent("score");
        this.gamestatus = this.node.getComponent("game-status");
        this.score.setMovesLeft((this.maxMoves - this.totalMoves).toString());
        this.score.setScoreLabel(this.score.currentScore, this.scoreToWin);

        this.tileSize = new cc.Vec2(
            this.tilePrefab.data.getContentSize().width,
            this.tilePrefab.data.getContentSize().height
        );
        if (this.tileOffset.len() > 0) {
            this.tileSize = this.tileSize.add(this.tileOffset);
        }

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

    async fillBoardWithTiles() {
        for (let row = 0; row < this.boardSize.x; row++) {
            this.tileBoard.push([]);
            for (let col = 0; col < this.boardSize.y; col++) {
                this.tileBoard[row].push((new cc.Node().active = false));
            }
        }
        this.disableClickEvents();
        await this.fillEmptyCellsWithTiles();
        this.enableClickEvents();
    }
    randTile() {
        if (Math.random() < 0.2 && this.totalMoves > 0) {
            return this.bombPrefab;
        }
        return this.tilePrefab;
    }

    newTile(position: cc.Vec2 | cc.Vec3, prefab: cc.Prefab = null) {
        const tile: cc.Node = cc.instantiate(prefab || this.tilePrefab);
        tile.setPosition(position);

        tile.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.clickEventsDisabled) {
                this.clickTileAction(tile);
            }
        });

        return tile;
    }

    fillEmptyCellsWithTiles() {
        const newTilesAnimationPromises = [];

        for (let n = 0; n < this.boardSize.x; n++) {
            for (let m = 0; m < this.boardSize.y; m++) {
                const tileIsActive: cc.Node = this.tileBoard[n][m].active;

                if (!tileIsActive) {
                    const posShow = this.tileSize.scale(new cc.Vec2(m, 3));
                    const tile = this.newTile(posShow);
                    const prop: tile = tile.getComponent("tile");
                    const pos = this.tileSize.scale(new cc.Vec2(m, -n));
                    const promise = prop.setPositionAction(pos);
                    newTilesAnimationPromises.push(promise);

                    this.node.addChild(tile);
                    tile.zIndex = -n;
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
            const tileExists = this.checkTileInBoard([x, y]);

            if (tileExists) {
                const tileForCheck: cc.Node = this.tileBoard[x][y];

                if (this.compareColors(tile, tileForCheck)) {
                    foundTiles.push(tileForCheck);
                }
            }
        });

        return foundTiles;
    }

    tilesInRadius(tile: cc.Node, radius = 1) {
        const pos = this.getTilePosition(tile);
        const foundTiles = [];

        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                const tileFound = this.checkTileInBoard([
                    pos[0] + x,
                    pos[1] + y,
                ]);
                if (tileFound) foundTiles.push(tileFound);
            }
        }
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

    affectedMapTiles() {
        return this.tileBoard.reduce((allAffectedTiles, row) => {
            const affectedTilesInRow = row.filter((tile) => {
                return tile.getComponent("tile").affected;
            });
            return [...allAffectedTiles, ...affectedTilesInRow];
        }, []);
    }

    async clickTileAction(actionTile: cc.Node) {
        this.disableClickEvents();

        if (
            this.booster &&
            this.booster.isActivated &&
            this.booster.interactWithTiles
        ) {
            actionTile = this.booster.tileClickAction(actionTile);
        }

        const tile: tile = actionTile.getComponent("tile");
        tile.action(this);

        const affectedMapTiles = this.affectedMapTiles().map((tile) =>
            tile.getComponent("tile")
        );

        if (!affectedMapTiles.length) {
            this.enableClickEvents();
            tile.noComboAnimation();
            return;
        }

        this.movesLeft();

        const tilesScoreSum = affectedMapTiles.reduce(
            (totalScore, tile) => totalScore + tile.score,
            0
        );

        if (tile.tileType == TileType.tile && tilesScoreSum > 30) {
            const [x, y] = this.getTilePosition(actionTile);

            const tileBomb = this.newTile(actionTile.position, this.bombPrefab);

            this.node.addChild(tileBomb);
            this.tileBoard[x][y] = tileBomb;
        }

        this.score.addScoreWithAnimation(tilesScoreSum, this.scoreToWin);
        this.progressBar.setProgressByScore(
            this.scoreToWin,
            this.score.currentScore
        );

        await Promise.all(
            affectedMapTiles.map((tile) =>
                tile.setPositionActionRemove(actionTile.position)
            )
        );

        await Promise.all([
            ...this.gravityTiles(),
            ...this.fillEmptyCellsWithTiles(),
        ]);

        this.enableClickEvents();
        this.checkEndGameConditions();
    }

    movesLeft() {
        this.totalMoves++;
        const moveLeft = this.maxMoves - this.totalMoves;
        this.score.setMovesLeft(moveLeft.toString());
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
                    const newpos = this.tileSize.scale(
                        new cc.Vec2(n, -posToGrav)
                    );
                    const tileMove: tile = move.getComponent("tile");
                    const propmise = tileMove.setPositionAction(newpos);

                    gravityPromises.push(propmise);

                    this.tileBoard[posToGrav--][n] = this.tileBoard[m][n];
                    this.tileBoard[m][n] = cc.Node;
                    tile.zIndex = -posToGrav;
                }
            }
        }
        return gravityPromises;
    }

    checkTileInBoard(pos) {
        let x = pos[0];
        let y = pos[1];
        if (this.tileBoard[x] == null) {
            return false;
        }
        if (this.tileBoard[x][y] == null) {
            return false;
        }
        return this.tileBoard[x][y];
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
