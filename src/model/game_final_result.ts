export class GameFinalResult {
  isMatched: boolean;
  similarity: number;
  constructor(isMatched: boolean, similarity: number) {
    this.isMatched = isMatched;
    this.similarity = similarity;
  }
}