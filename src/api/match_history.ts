import { getConnection, getRepository } from 'typeorm';
import { MatchHistoryEntity } from '../entity';

export const insertMatchHistory = async (roomName: string, is_matched: boolean) => {
  const matchHistoryRepository = getRepository(MatchHistoryEntity);
  const history = new MatchHistoryEntity();
  history.is_matched = is_matched;
  history.roomName = roomName;
  await matchHistoryRepository.insert(history);
}

export const deleteMatchHistory = async (roomName: string) => {
  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(MatchHistoryEntity)
    .where("roomName = :roomName", { roomName: roomName })
    .execute();
}

export const findSimilarity = async (roomName: string) => {
  const matchHistoryRepository = getRepository(MatchHistoryEntity);
  const histories = await matchHistoryRepository.find({ where: { roomName: roomName } });
  const totalHistoryCount = histories.length;
  let matchedHistoryCount = 0;
  for (const history of histories) {
    if (history.is_matched) {
      matchedHistoryCount = matchedHistoryCount + 1;
    }
  }

  return Math.round( 100 * matchedHistoryCount / totalHistoryCount);
}