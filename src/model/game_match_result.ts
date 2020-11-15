import { GameInfo } from './game_info';

export class GameMatchResult {
  isMatched: boolean;
  nextInfo: GameInfo;
  constructor(isMatched: boolean, nextInfo: GameInfo) {
    this.isMatched = isMatched;
    this.nextInfo = nextInfo;
  }
}