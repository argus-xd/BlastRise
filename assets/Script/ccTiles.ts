const { ccclass, property } = cc._decorator;

@ccclass
export class ccTiles extends cc.Component {
    @property(cc.String)
    color: string = "";

    @property(cc.Integer)
    score = 10;

    @property(cc.Texture2D)
    texture: cc.Texture2D = null;
}
