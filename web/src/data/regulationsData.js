// 지역별 금어기 / 금지체장 데이터
const regulationsData = {
  seoul: {
    name: '서울',
    nameEn: 'Seoul',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '배스', size: '제한 없음' },
    ],
  },
  busan: {
    name: '부산',
    nameEn: 'Busan',
    prohibited: [
      { name: '참돔', period: '5.1 ~ 5.31' },
      { name: '감성돔', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '참돔', size: 24 },
      { name: '감성돔', size: 25 },
      { name: '광어', size: 35 },
    ],
  },
  daegu: {
    name: '대구',
    nameEn: 'Daegu',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '메기', size: 30 },
    ],
  },
  incheon: {
    name: '인천',
    nameEn: 'Incheon',
    prohibited: [
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
      { name: '참조기', period: '7.1 ~ 7.15' },
    ],
    minSize: [
      { name: '꽃게', size: '갑폭 7' },
      { name: '광어', size: 35 },
    ],
  },
  gwangju: {
    name: '광주',
    nameEn: 'Gwangju',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '메기', size: 30 },
    ],
  },
  daejeon: {
    name: '대전',
    nameEn: 'Daejeon',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '메기', size: 30 },
    ],
  },
  ulsan: {
    name: '울산',
    nameEn: 'Ulsan',
    prohibited: [
      { name: '명태', period: '1월 ~ 3월' },
      { name: '대게', period: '6.1 ~ 11.30' },
    ],
    minSize: [
      { name: '광어', size: 35 },
      { name: '조피볼락', size: 23 },
    ],
  },
  sejong: {
    name: '세종',
    nameEn: 'Sejong',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '메기', size: 30 },
    ],
  },
  gyeonggi: {
    name: '경기',
    nameEn: 'Gyeonggi',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '광어', size: 35 },
    ],
  },
  gangwon: {
    name: '강원',
    nameEn: 'Gangwon',
    prohibited: [
      { name: '명태', period: '1월 ~ 3월' },
      { name: '대게', period: '6.1 ~ 11.30' },
      { name: '열목어', period: '연중' },
    ],
    minSize: [
      { name: '광어', size: 35 },
      { name: '조피볼락', size: 23 },
      { name: '참돔', size: 24 },
    ],
  },
  chungbuk: {
    name: '충북',
    nameEn: 'Chungbuk',
    prohibited: [
      { name: '쏘가리', period: '5.1 ~ 6.30' },
      { name: '메기', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '쏘가리', size: 24 },
      { name: '메기', size: 30 },
    ],
  },
  chungnam: {
    name: '충남',
    nameEn: 'Chungnam',
    prohibited: [
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
      { name: '쏘가리', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '꽃게', size: '갑폭 7' },
      { name: '광어', size: 35 },
    ],
  },
  jeonbuk: {
    name: '전북',
    nameEn: 'Jeonbuk',
    prohibited: [
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
      { name: '쏘가리', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '꽃게', size: '갑폭 7' },
      { name: '쏘가리', size: 24 },
    ],
  },
  jeonnam: {
    name: '전남',
    nameEn: 'Jeonnam',
    prohibited: [
      { name: '참돔', period: '5.1 ~ 5.31' },
      { name: '감성돔', period: '5.1 ~ 6.30' },
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
    ],
    minSize: [
      { name: '참돔', size: 24 },
      { name: '감성돔', size: 25 },
      { name: '광어', size: 35 },
    ],
  },
  gyeongbuk: {
    name: '경북',
    nameEn: 'Gyeongbuk',
    prohibited: [
      { name: '명태', period: '1월 ~ 3월' },
      { name: '대게', period: '6.1 ~ 11.30' },
    ],
    minSize: [
      { name: '광어', size: 35 },
      { name: '조피볼락', size: 23 },
    ],
  },
  gyeongnam: {
    name: '경남',
    nameEn: 'Gyeongnam',
    prohibited: [
      { name: '참돔', period: '5.1 ~ 5.31' },
      { name: '감성돔', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '참돔', size: 24 },
      { name: '감성돔', size: 25 },
      { name: '광어', size: 35 },
    ],
  },
  jeju: {
    name: '제주',
    nameEn: 'Jeju',
    prohibited: [
      { name: '자바리', period: '5.1 ~ 7.31' },
      { name: '다금바리', period: '연중' },
    ],
    minSize: [
      { name: '자바리', size: 40 },
      { name: '광어', size: 35 },
    ],
  },
  eastSea: {
    name: '동해권',
    nameEn: 'East Sea',
    prohibited: [
      { name: '명태', period: '1월 ~ 3월' },
      { name: '대게', period: '6.1 ~ 11.30' },
      { name: '붉은대게', period: '7.1 ~ 11.30' },
    ],
    minSize: [
      { name: '광어', size: 35 },
      { name: '조피볼락', size: 23 },
      { name: '참돔', size: 24 },
    ],
  },
  westSea: {
    name: '서해권',
    nameEn: 'West Sea',
    prohibited: [
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
      { name: '참조기', period: '7.1 ~ 7.15' },
      { name: '민어', period: '7.16 ~ 8.15' },
    ],
    minSize: [
      { name: '꽃게', size: '갑폭 7' },
      { name: '광어', size: 35 },
      { name: '참조기', size: 20 },
    ],
  },
  southSea: {
    name: '남해권',
    nameEn: 'South Sea',
    prohibited: [
      { name: '참돔', period: '5.1 ~ 5.31' },
      { name: '감성돔', period: '5.1 ~ 6.30' },
      { name: '볼락', period: '4.1 ~ 5.31' },
    ],
    minSize: [
      { name: '참돔', size: 24 },
      { name: '감성돔', size: 25 },
      { name: '광어', size: 35 },
    ],
  },
}

export default regulationsData
