
export class GameInfo {
  stage: number;
  itemLeft: string;
  itemRight: string;
  imageLeft: string;
  imageRight: string;
  totalStage: number;

  constructor(stage: number, itemLeft: string, itemRight: string, imageLeft: string, imageRight: string, totalStage: number){
    this.stage = stage;
    this.itemLeft = itemLeft;
    this.itemRight = itemRight;
    this.imageLeft = imageLeft;
    this.imageRight = imageRight;
    this.totalStage = totalStage;
  }
}
