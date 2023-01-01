export default ()=>{

	const IMAGEMODE = true ;
	
	/*
	// シーン状態enum……どうしよう？
	GAME_STATE_OPENING = 0;
	GAME_STATE_PUSHSTART = 1;
	GAME_STATE_KOMA_NOT_SELECTED = 100;
	GAME_STATE_KOMA_SELECTED = 101;
	GAME_STATE_GAMEOVER = 109;
	*/
	
	const SIDE_UNDEFINED = 0;//手番：未初期化
	const SIDE_A = -1 ; //下（プレイヤーのデフォルト）
	const SIDE_B =  1 ; //上

    // todo: enum化
	const TURN_FIRST = 0; //先手
	const TURN_SECOND = 1; //後手

	const MODE_HUMAN = 0; //人間がプレイ（UI表示）
	const MODE_AI = 1; //コンピューターがプレイ

	const NULL = 0 ;
	const LION = 1;
	const KIRIN = 2;
	const ZOU = 3;
	const HIYOKO = 4;
	const NIWATORI = 5;

	//方向のビット表現
	const MOVE_NONE = 0 ;
	const MOVE_UPPER = 1 ;
	const MOVE_UPPER_LEFT = 2 ;
	const MOVE_LEFT = 4 ;
	const MOVE_LOWER_LEFT = 8 ;
	const MOVE_LOWER = 16 ;
	const MOVE_LOWER_RIGHT = 32 ;
	const MOVE_RIGHT = 64 ;
	const MOVE_UPPER_RIGHT = 128 ;

    // コマの移動可能方向の定義
    const HIYOKO_MOVABLE=(MOVE_UPPER);
    const KIRIN_MOVABLE=(MOVE_UPPER|MOVE_LEFT|MOVE_LOWER|MOVE_RIGHT);
    const ZOU_MOVABLE=(MOVE_UPPER_LEFT|MOVE_LOWER_LEFT|MOVE_LOWER_RIGHT|MOVE_UPPER_RIGHT);
    const LION_MOVABLE=KIRIN_MOVABLE | ZOU_MOVABLE ;
    const NIWATORI_MOVABLE=KIRIN_MOVABLE | MOVE_UPPER_LEFT | MOVE_UPPER_RIGHT ;

    // 駒タイプ番号を放り込めば参照できるように整形（上いらなくて、こっちだけでよくね？）
    // 移植TODO: TypeScriptだとどう表現すると楽かな
    // const movables={};
    // function init(){
    //     movables[NULL]=0 ;
    //     movables[KIRIN]=KIRIN_MOVABLE ;
    //     movables[ZOU]=ZOU_MOVABLE ;
    //     movables[HIYOKO]=HIYOKO_MOVABLE ;
    //     movables[LION]=LION_MOVABLE ;
    //     movables[NIWATORI]=NIWATORI_MOVABLE ;
    // }
}