
export class GameInfo {
  stage: number;
  previousResult!: string;
  itemLeft: string;
  itemRight: string;
  imageLeft: string;
  imageRight: string;

  constructor(stage: number, itemLeft: string, itemRight: string, imageLeft: string, imageRight: string){
    this.stage = stage;
    this.itemLeft = itemLeft;
    this.itemRight = itemRight;
    this.imageLeft = imageLeft;
    this.imageRight = imageRight;
  }
}
