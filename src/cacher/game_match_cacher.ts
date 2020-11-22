import { GameSelect } from '../model/game_select';


export class GameMatchCacher {
  data = new Map<string, Map<string, GameSelect>>();

  save(roomId: string, clientId: string, gameSelect: GameSelect) {
    if (!this.data.has(roomId)) {
      this.data.set(roomId, new Map<string, GameSelect>());
    }
    const last_data = this.data.get(roomId);
    if (last_data !== undefined) {
      last_data.set(clientId, gameSelect);
      this.data.set(roomId, last_data);
    }
  }

  can_get_result(roomId: string, stage: number): boolean {
    const gameSelects = this.data.get(roomId);
    if (gameSelects === undefined) {
      return false;
    } else {
      if (gameSelects.size < 2) {
        return false;
      }
      for (const value of gameSelects.values()) {
        if (value.stage !== stage) {
          return false;
        }
      }
    }
    return true;
  }

  is_matched(roomId: string): boolean {
    const gameSelects = this.data.get(roomId);
    if (gameSelects === undefined) {
      return false;
    }
    if (gameSelects.size < 2) {
      return false;
    }
    const games = new Array<GameSelect>();
    for (const value of gameSelects.values()) {
      games.push(value);
    }

    const first_choice = games[0];
    const second_choice = games[1];
    this.data.delete(roomId);
    return first_choice.isLeft === second_choice.isLeft;
  }

}