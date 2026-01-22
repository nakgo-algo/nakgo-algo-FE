// 낚시 금지/제한 구역 mock 데이터
// type: 'prohibited' (금지) | 'restricted' (제한)

export const fishingZones = [
  // 서울 한강 여의도 (금지) - 더 큰 영역
  {
    id: 1,
    name: '한강 여의도 수중보 구역',
    type: 'prohibited',
    coordinates: [
      { lat: 37.535, lng: 126.91 },
      { lat: 37.535, lng: 126.95 },
      { lat: 37.515, lng: 126.95 },
      { lat: 37.515, lng: 126.91 },
    ]
  },
  // 부산 해운대 (제한) - 더 큰 영역
  {
    id: 2,
    name: '해운대 해수욕장 주변',
    type: 'restricted',
    coordinates: [
      { lat: 35.17, lng: 129.15 },
      { lat: 35.17, lng: 129.19 },
      { lat: 35.15, lng: 129.19 },
      { lat: 35.15, lng: 129.15 },
    ]
  },
  // 인천 연안부두 (금지) - 더 큰 영역
  {
    id: 3,
    name: '인천 연안부두',
    type: 'prohibited',
    coordinates: [
      { lat: 37.47, lng: 126.58 },
      { lat: 37.47, lng: 126.63 },
      { lat: 37.44, lng: 126.63 },
      { lat: 37.44, lng: 126.58 },
    ]
  },
  // 제주 성산포 (제한) - 더 큰 영역
  {
    id: 4,
    name: '성산포 항구',
    type: 'restricted',
    coordinates: [
      { lat: 33.48, lng: 126.92 },
      { lat: 33.48, lng: 126.97 },
      { lat: 33.44, lng: 126.97 },
      { lat: 33.44, lng: 126.92 },
    ]
  },
  // 강릉 주문진 (금지) - 더 큰 영역
  {
    id: 5,
    name: '주문진 방파제',
    type: 'prohibited',
    coordinates: [
      { lat: 37.91, lng: 128.81 },
      { lat: 37.91, lng: 128.86 },
      { lat: 37.88, lng: 128.86 },
      { lat: 37.88, lng: 128.81 },
    ]
  },
  // 목포 (제한) - 더 큰 영역
  {
    id: 6,
    name: '목포 삼학도 주변',
    type: 'restricted',
    coordinates: [
      { lat: 34.80, lng: 126.36 },
      { lat: 34.80, lng: 126.41 },
      { lat: 34.77, lng: 126.41 },
      { lat: 34.77, lng: 126.36 },
    ]
  },
  // 여수 (금지) - 더 큰 영역
  {
    id: 7,
    name: '여수 엑스포 해양공원',
    type: 'prohibited',
    coordinates: [
      { lat: 34.76, lng: 127.73 },
      { lat: 34.76, lng: 127.78 },
      { lat: 34.73, lng: 127.78 },
      { lat: 34.73, lng: 127.73 },
    ]
  },
  // 울산 (제한) - 더 큰 영역
  {
    id: 8,
    name: '울산 대왕암 공원',
    type: 'restricted',
    coordinates: [
      { lat: 35.51, lng: 129.42 },
      { lat: 35.51, lng: 129.47 },
      { lat: 35.48, lng: 129.47 },
      { lat: 35.48, lng: 129.42 },
    ]
  },
]

// 구역 타입별 스타일 설정
export const zoneStyles = {
  prohibited: {
    fillColor: '#FF0000',      // 빨강 (금지)
    fillOpacity: 0.5,
    strokeColor: '#CC0000',
    strokeWeight: 3,
    strokeOpacity: 1,
    // 선택됐을 때 스타일
    selectedFillOpacity: 0.7,
    selectedStrokeWeight: 4,
    selectedStrokeOpacity: 1,
  },
  restricted: {
    fillColor: '#FF8C00',      // 주황 (제한)
    fillOpacity: 0.5,
    strokeColor: '#E67E00',
    strokeWeight: 3,
    strokeOpacity: 1,
    // 선택됐을 때 스타일
    selectedFillOpacity: 0.7,
    selectedStrokeWeight: 4,
    selectedStrokeOpacity: 1,
  }
}
