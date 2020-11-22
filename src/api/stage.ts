import { getRepository } from 'typeorm';
import { StageEntity } from '../entity';
import { GameInfo } from '../model';

export const fetchStageCount = async () => {
  const stageRepository = getRepository(StageEntity);
  const totalStage = await stageRepository.count();
  return totalStage;
}

export const fetchStage = async (id: number) => {

  const stageRepository = getRepository(StageEntity);
  const stageEntity = await stageRepository.findOne({ where: { id: id } });
  const totalStage = await stageRepository.count();
  if (stageEntity === undefined) {
    return undefined;
  }

  let stageId: String;
  if (stageEntity.id < 10) {
    stageId = `0${stageEntity.id}`;
  } else {
    stageId = `${stageEntity.id}`;
  }

  const gameInfo = new GameInfo(
    stageEntity.id,
    stageEntity.leftEn,
    stageEntity.rightEn,
    `https://github.com/coeater/coeater-signalserver/blob/master/src/images/${stageId}L.jpg?raw=true`,
    `https://github.com/coeater/coeater-signalserver/blob/master/src/images/${stageId}R.jpg?raw=true`,
    totalStage,
  );
  return gameInfo;
};

