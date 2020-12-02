import { getRepository } from 'typeorm';
import { StageEntity } from '../entity';
import { GameInfo } from '../model';


const divider = 6;

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

export const fetchStageCount = async () => {
  const stageRepository = getRepository(StageEntity);
  const totalStage = await stageRepository.count();
  return totalStage / divider;
}

export const fetchStage = async (id: number) => {
  const dbID = (id - 1) * divider + getRandomInt(0, divider) + 1;
  const stageRepository = getRepository(StageEntity);
  const stageEntity = await stageRepository.findOne({ where: { id: dbID } });
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
    id,
    stageEntity.leftEn,
    stageEntity.rightEn,
    `https://github.com/coeater/coeater-signalserver/blob/master/src/images/${stageId}L.jpg?raw=true`,
    `https://github.com/coeater/coeater-signalserver/blob/master/src/images/${stageId}R.jpg?raw=true`,
    totalStage,
  );
  return gameInfo;
};

