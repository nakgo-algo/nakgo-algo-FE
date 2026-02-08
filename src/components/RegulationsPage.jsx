import { useState, useMemo, useRef, useEffect } from 'react'
import regulationsData from '../data/regulationsData.js'

// 지역 목록 (지도 + 바다권역)
const allRegions = Object.entries(regulationsData).map(([id, d]) => ({
  id,
  name: d.name,
}))

// 실제 대한민국 시도 SVG path — southkorea-maps GeoJSON 기반
const provinces = [
  {
    id: 'gyeonggi', name: '경기',
    path: 'M54,74.8c7.2-2.1,1.1-6.4,1.1-6.4l-0.2-0.1c0,0-0.8,0.1-5-1.4c-4.2-1.5-7,0-7,0c-7.4,2.4-9.1-2.7-9.5-2.5c-0.4,0.2-1.9-0.1-1.9-0.1c-0.3-0.1-1-0.3-4.4-1.7c-3.4-1.3-4.6-0.3-5.2,0c-0.7,0.3-7.2,5.8-7.9,6.4c-1.2,1.2-0.7,3.7-1,6.1c-0.3,2.4-0.3,5.7,2.2,4c2.5-1.7,4.6,1,3.2,4c-1.3,3,0.8,6.9,4.6,7.3c3.7,0.3,3.9,4.9,2.7,5.7c-1.2,0.8-2.7,1.3,1.2,4.9l3.5,3.7c0,0,5.4,2,6.8-1.5c1.4-3.5,2.8-5.4,4.3-5.1s2.7,2.6,2.6,4.3c-0.1,1.7,2.6,1.9,4,0.8c1.4-1.1,4-3.9,5.5-2.1c1.4,1.7,1.7,4.3,3.4,4.8c1.7,0.5,9.1,1.4,7.7-2.5c-1.4-4-1.8-6.4-2.1-7.2c-0.8-1.8-2.4-1.4-3-1.1l-0.3,0.4c-0.9,1.3-0.8,1.1-1.1,1.4s-1.5,1.1-2.7,0.4c-1.3-0.7-3.6-0.1-4.1-5.7c-0.1-1.3,0.4-3.3,0.4-3.3s0-0.1-1.5-0.4c-1.3-0.2-1.6-1.6-2-4.6c-0.4-2.9,0.5-2.8-0.5-2.9c-1-0.1-0.4-1.1-0.1-2.2c0.3-1-0.6-1.9-0.9-3.3c-0.3-1.4,1.6-2.4,2.3-1.1c0.6,1.3,2.2,2,3.2,1.8C52.7,75.5,53.5,74.9,54,74.8z',
    tx: 38, ty: 82,
  },
  {
    id: 'seoul', name: '서울',
    path: 'M36.5,45.3c0,0,4.6,0.6,5.5,1.3c0.9,0.7,3.3,0.3,3.7-1c0.4-1.3,2-0.5,2.8-1.3s0.8-1.9,0.4-2.9c-0.3-1-0.8-0.7-0.8-2.1c-0.1-1.3-1.3-3.1-2.6-4c-1.3-0.8-3,0-3.5,0.7c-0.6,0.7-5.6,5.2-5.6,5.2S37.3,42.6,36.5,45.3z',
    tx: 40, ty: 42,
  },
  {
    id: 'incheon', name: '인천',
    path: 'M31.1,51.1c0.3-3.5-1.3-5.5-3.8-5.7c-2.5-0.2-2.2,5.2-6.6,0c-4.4-5.2-0.8-4.9-1.5-6.2c-0.7-1.3-3.7-0.7-4.6-1.3c-0.8-0.7-2-1.5-0.7-3c1.4-1.5,1.7-2.5,3-3.9c1.4-1.3,2.4,0.6,4-0.7c0.6-0.5,1-3,2.7-2.2s2.6,2.4,3.2,3.2c0,0,0.7,1.4,3,0.9l0,0c0,0-4,3.2-1.8,4.8c0,0,0.8-0.3,0.8,3.1c0,0-0.3,0.8,1.9,0.2c2.3-0.6,4.4-0.6,5.1,0.5c0.7,1.1,2.5,3.9-2.2,7.6L31.2,51L31.1,51.1z',
    tx: 20, ty: 45,
  },
  {
    id: 'gangwon', name: '강원',
    path: 'M119.7,56.3c0,0-2.8,4.9-5.1,4.8c-2.3-0.1-5.2-1.2-5.7-1.2c-0.5,0-1.4,0.3-1.8,1.2c-0.4,0.9-2.3,0.7-3.5,0c-1.5-0.9-1.8,0.2-3.7,0.3c-4.1,0.3-5.6,1.2-5.6,1.2c-0.7-3.7-3.5-3.4-3.5-3.4c-5.8-1.4-4.5-0.6-6.4-3.7c-1.9-3.1-3.7-1.4-3.7-1.4s-3.2,3.9-4,0.8c-0.8-3.1-1.9-0.5-1.9-0.5c-1.5,4.9-7.1,3.2-7.1,3.2l0-0.3c0,0,0.4-5.1,0.8-6.6c0.4-1.5,0.1-3.9-0.3-4.8c-0.3-0.8,0.1-1.5,0.1-1.5c2.8-6.1-1.8-4.4-3.4-4.8c-0.9-0.2-3.4-0.8-3.7-2c-0.3-1.3-1.1-3.8-1.1-5.8s1-2.7,1-3.7c0-1,1.4-4.4-7.1-8.9c-8.5-4.4-6.1-7.4-6.1-7.4c2.4-1.3,3.8-2.8,4.7-1.6c0.8,1.2,2.7,2.4,4.7,0.5c2-1.9,5.1-1.8,5.2-0.8c0.2,1,0.8,2.2,3.5,2c2.7-0.2,11.3,0.4,11.3-2.7c0-3.1,4.7-3.2,5.6-2.4c0.8,0.8,1.3,4.5,2-0.4c0.7-5,2.7-8.2,5.1-2.4c2.4,5.7,1.7,6.2,2.9,7.4c1.2,1.2,1.9,3.2,1.9,5.2c0,2,4.6,6.1,6.2,8.6c1.7,2.5,6.4,7.1,7.8,8.8c1,1.2,2.2,7.4,4.2,10.3c2,2.9,4.3,3.4,5.9,9.1c0.7,2.6,0.8,2.9,0.8,2.9',
    tx: 85, ty: 40,
  },
  {
    id: 'chungbuk', name: '충북',
    path: 'M92.3,64.4c-1.1,1.9-0.7,4.1-0.7,4.1s1.4,5.6-4.8,3.1c-6.2-2.4-5.2,0-7.1,0.6c-1.9,0.6-3.6,3.5-5.4,5c-1.8,1.5-5.2,2.4-3.8,4.1c1.4,1.8,2.5,3.4,2,5.3c-0.4,1.9-3.1,3.5-2.4,5.1c0.8,1.6,2.8,2,5,2c2.2-0.1,2.6,1.8,0.9,4.4c-1.7,2.6-1.9,5.7-2.5,6.2l-1.7,1.6c-2.9-1.5-7-1.6-7-1.6l-0.2-1.1c-1.4-4-1.7-6.4-2.1-7.2c-1-2-3-1.2-3-1.2l0.6-1.3c0.1-0.3,0.4-2.5,0.6-3.4c0.2-0.9,0.2-2.7-0.1-3.4c-0.3-0.7-0.8-0.6-1.5-0.8c-0.7-0.2-3.3-2.3-3.3-2.3s-1.6-2.9-2.6-4.2c-3.2-4,0.7-4.9,0.7-4.9s7.2-1.4,1-6.6c0,0,2.2-4.2,3.1-4.7c0.9-0.5,3.3-0.9,4.5-1.6c1.2-0.7,4.2-3.3,4.2-3.3l0.6-0.5l0.3-0.3c0,0,5.6,1.7,7.1-3.2c0,0,1.1-2.6,1.9,0.5c0.8,3.1,4-0.8,4-0.8s1.7-1.7,3.7,1.3c1.9,3.1,0.6,2.3,6.4,3.7c0,0,2.8-0.2,3.5,3.4C94.3,62.7,93,63.3,92.3,64.4z',
    tx: 72, ty: 80,
  },
  {
    id: 'sejong', name: '세종',
    path: 'M59.6,95l-0.3,0.4c-0.9,1.3-0.8,1.1-1.1,1.4c-0.3,0.3-1.5,1.1-2.7,0.4c-1.3-0.7-3.7,0-4.1-5.7c-0.4-5.8,3.9-5,4.4-6.2c0,0,0.3-0.9,0.2-1.4s2.6,2.1,3.2,2.3c0.7,0.2,1.1,0.1,1.5,0.8c0.3,0.7,0.3,2.5,0.1,3.4c-0.2,0.9-0.5,3.1-0.6,3.4L59.6,95z',
    tx: 55, ty: 90,
  },
  {
    id: 'daejeon', name: '대전',
    path: 'M52.4,75.8c-0.5,0.7-0.6,1.8,1,3.8c1,1.3,2.7,4.4,2.7,4.4l0,0c0.2,0.4-0.3,1.3-0.3,1.3C55.3,86.1,53,86,51.9,88l-0.3,0c0,0,0,0-1.3-0.3c-1.3-0.3-1.6-1.6-2-4.6c-0.4-2.9,0.5-2.8-0.5-2.9c-1-0.1-0.4-1.1-0.1-2.2c0.3-1-0.6-1.9-0.9-3.3c-0.3-1.4,1.7-2.4,2.3-1.1c0.8,1.8,3.4,1.9,3.4,1.9S52.5,75.8,52.4,75.8z',
    tx: 50, ty: 83,
  },
  {
    id: 'chungnam', name: '충남',
    path: 'M67.7,57.8l0-0.3c0,0,0.4-5.1,0.8-6.6c0.4-1.5,0.1-3.9-0.3-4.8c-0.3-0.8,0.1-1.5,0.1-1.5c2.8-6.1-1.8-4.4-3.4-4.8c-0.9-0.2-3.4-0.8-3.7-2c-0.3-1.3-1.1-3.8-1.1-5.8s1-2.7,1-3.7c0-1,1.4-4.4-7.1-8.9c-8.5-4.4-6.1-7.4-6.1-7.4s-8.6,2.1-9.2,2.5s-3,2-3.9,2.2c-0.7,0.2-2.8,1,0,2.2s5.2,2.1,1.2,4.8c-4,2.7-4.5,0.9-2.9,2.7c1.6,1.8,1.2,3.5-3,5.5c0,0-4.1,3.3-1.9,4.9c0,0,0.8-0.3,0.8,3.1c0,0-0.3,0.8,1.9,0.2c2.3-0.6,4.4-0.6,5.1,0.5c0.7,1.1,2.5,3.9-2.2,7.6l-2.6,2.8c0,0,0.1,2.8-1.3,3.3c-1.5,0.5-2.1,1.9-0.9,3.6c1.2,1.7,4.5,5.4,4.6,5.8c0.1,0.5,2.3,5.4,9.4,3.1c0,0,2.7-1.6,7,0s5.1,1.3,5.1,1.3s2.2-4.2,3.1-4.7c0.9-0.5,3.3-0.9,4.5-1.6c1.2-0.7,4.2-3.3,4.2-3.3l0.6-0.5L67.7,57.8z',
    tx: 38, ty: 68,
  },
  {
    id: 'jeonbuk', name: '전북',
    path: 'M27,105.6c-3.1,0.3,1.3,4.2,1.3,4.2c3.8,5-1.4,8.7-1.5,8.8c-0.1,0.1-3.2,2-2.8,4.1c0.5,2.3-0.5,2-0.9,2.5c-1.5,2.2-0.3,3.2-0.3,3.2s2.6,3.7,4.1,4.9c0,0,1.4,0.7,2.6,0.7c0,0,4.2-2.6,5.6-5.2c1.4-2.6,6.1,0.7,7.4,1.5c1.3,0.8,3.4,5.1,5.5,4.4c2.1-0.8,3.7-0.8,5.1-0.3c1.4,0.6,4.5-1.2,5.3-1.9c2.2-1.8,4.1,1.5,4,1c-0.1-0.5,1.5-3.3,1.5-3.3c1-2.3-0.4-2.7-0.8-3.7c-0.4-1-1.1-4.1-0.2-4.8c0.9-0.7,1.3-2.3,1.3-2.3c0.6-7.4,8.4-8.6,8.4-8.6c0-0.8-0.5-3.2-0.8-4.4c-0.3-1.2-6.8-1.9-6.8-1.9c0.6,2.5-6.2,2.1-7.9,1.6c-1.7-0.5-1.9-3.1-3.4-4.8c-1.4-1.7-4.1,1-5.5,2.1c-1.3,1.1-4,0.9-4-0.8c0.1-1.7-1.1-4.1-2.6-4.3c-1.5-0.3-2.9,1.7-4.3,5.1c-1.4,3.5-6.8,1.5-6.8,1.5L27,105.6z',
    tx: 45, ty: 120,
  },
  {
    id: 'jeonnam', name: '전남',
    path: 'M70.6,154.5c0.4-4.6-0.8-3.3-1.3-4.5c-0.4-1.2-0.5-3.9-0.8-4.4c-0.3-0.5-3.8-2.3-4.5-5.1c-0.5-1.9-1.4-4.3-1.5-6.4l-0.1-0.3c-0.2-1.5-2.8-2.7-3.9-1.5c-0.7,0.7-3.9,2.5-5.3,1.9c-1.4-0.6-3-0.5-5.1,0.3c-2.1,0.8-4.2-3.5-5.5-4.4c-1.3-0.8-6-4.1-7.4-1.5c-1.4,2.6-5.6,5.2-5.6,5.2c-1.1,0-2.6-0.7-2.6-0.7c-1.5-1.2-4.1-4.9-4.1-4.9s-0.5-1.1-1.3,0.2c-1,1.6,0.2,1.5,0,2.5c-0.2,1-3.5,2-2,5.2c1.5,3.2-1,3.7-3,4.2c-2,0.5-3.5-0.3-7.1,0c-3.5,0.3-2,2.9,0.7,4.4c2.7,1.5,2.1,3.5-0.7,4.2c-1.7,0.4-2.4,0.1-2.2,1.5c0.6,4.7-1.5,3.5-2.4,4.4c-0.9,0.8-1.3,1.7-0.7,3.2c0.7,1.5,1.5,1.2,1.5,3c0,1.9-2.5,2.5,1.7,3.9c4.2,1.4,1.3,2.8,0.5,3.2c-2.4,1.2-4.4,5.6-5.7,9.1c-1.3,3.5,1.8,1.7,1.9,2.5c0.4,1.8,1.9,4.6,6.8,0c9.1,0.8,2.5-5.6,3.7-5.6c1.2,0,5.1-1.2,6.1-1.3c1-0.2,4.4,1.5,4.4,1.5l5.4,2c0,0,5.4,0,8.9,0.2c3.5,0.2,4.6,0.3,6.1-0.5c1.5-0.8,0.8-3.4,1.3-4.2c0.5-0.8,3.4-0.5,5.1-0.5c1.7,0,0.2-3.4,3.7-2c3.5,1.3,4.7,0.2,4.9-2.4c0.2-2.5-4.2-6.7,2.7-4.6c6.9,2.2,6.8-1.6,7.6-3l0.2-1C70.9,158.6,70.5,157.7,70.6,154.5',
    tx: 35, ty: 160,
  },
  {
    id: 'gwangju', name: '광주',
    path: 'M31.5,136.6c0.2-0.5,0.7,0.2,2-0.1c1.3-0.3,2.9-1.1,4.9-0.7c2,0.4,4.6,2.8,4,6.8c-0.7,4-5.9,3.4-7.3,2.4c-1.1-0.8-0.1-1.3-2.8-2.2c-2.7-0.9-2-2.6-1.1-4C31.2,138.8,31.2,137.4,31.5,136.6z',
    tx: 34, ty: 140,
  },
  {
    id: 'gyeongbuk', name: '경북',
    path: 'M95.4,121.7c0.9,1.1,6.4,1.9,9,1.5c2.6-0.3,2.9-1.8,4.7-2.3c1.9-0.5,3.1-3.2,5.1-3.6c1.9-0.4,3.2,0.4,4.6,1.3c1.3,0.8,7.2,0,7.2-1.2c0-0.2-0.2-0.6-0.2-0.6c-1-1.9-0.2-1.3,0.8-3.2c1-1.9,0.7-3,1.9-5.4c1.2-2.4-0.4-3.4,0-5.7c0.3-2.4-2-2.2-2.2-1c-0.2,1.2-2.9,2.7-3.4,1.7c-0.5-1,0-2.4-0.3-3.7c-0.3-1.3-0.8-3-1.2-7.6c-0.3-4.6,1-2.2,2-4c1-1.9-1-5.9-0.7-8.6c0.3-2.7,1.5-7.6,0-8.9c-1.2-1.1-0.4-2.1-0.2-2.7c0.1-0.6,1.2-5.8,0-6.9c-1.3-1.1-2.7-4.2-2.7-4.2s-2.8,4.9-5.1,4.8c-2.3-0.1-5.2-1.2-5.7-1.2c-0.5,0-1.4,0.3-1.8,1.2c-0.4,0.9-2.4,0.8-3.5,0c-1.2-0.8-1.8-0.1-3.5,0.3c-1.7,0.3-6.1,0.3-7.8,3c-1.1,1.8-0.7,4.1-0.7,4.1s1.4,5.6-4.8,3.1c-6.2-2.4-5.2,0-7.1,0.6c-1.9,0.6-3.6,3.5-5.4,5c-1.8,1.5-5.2,2.4-3.8,4.1c1.4,1.8,2.5,3.4,2,5.3c-0.4,1.9-3.1,3.5-2.4,5.1c0.8,1.6,2.8,2,5,2c2.2-0.1,2.6,1.8,0.9,4.4s-1.9,5.7-2.5,6.2c-1,0.9-1.9,1.8-1.9,1.8s0.8,2.8,0.8,4.4c0,0,8.4,3,9.2,3.5c0.8,0.5,2.3,2.4,1.5,4.1c0,0-0.4,2.2,4,1.9c0,0,3.6-4.7,1.1-7.8c0,0-2.3-2.2,1-3.5c3.3-1.4,2-3.4,4.7-3.5c2.7-0.2,4.9-1.5,5.7-0.8c0.8,0.8,4.6,4.2,3.1,5.7c-1.5,1.5-4.7,6.8-5.8,7.4c-1.1,0.6-2.7,0.5-2.6,1.5c0,0.2,0.5,2.1,0.5,2.1L95.4,121.7z',
    tx: 98, ty: 90,
  },
  {
    id: 'daegu', name: '대구',
    path: 'M95,121.2c0,0-0.5-1.8-0.5-2.1c-0.1-1,1.5-0.9,2.6-1.5c1.1-0.6,4.3-5.9,5.8-7.4c1.5-1.5-2.4-5-3.1-5.7c-0.8-0.8-3,0.6-5.7,0.8c-2.7,0.2-1.4,2.2-4.7,3.5c-3.3,1.3-1,3.5-1,3.5c2.6,2.7-0.8,7.7-0.8,7.7S92.8,119.6,95,121.2z',
    tx: 92, ty: 112,
  },
  {
    id: 'gyeongnam', name: '경남',
    path: 'M106.3,136.8c-2.1,0.9-1.9,2.7-1.9,2.7c-1.5,4.1-3.7,2.6-4.8,1.8c-1.1-0.8-2.7-1.8-2.9-0.6c-0.2,1.2-3.3,2.7-3.3,2.7c-3.9,1.7-1.1,3.7-1.1,3.7c3.4,3.7,3.6,1.6,6-1.3c2.4-2.8,4.9,1.6,4.9,1.6c-0.6,0.6-0.7,3.5-0.7,3.5c-0.2,5.2-3.4,9.3-5.9,9.2c-2.5-0.1-7.2-0.1-7.8-3.7c-0.7-3.6-2.5-1.9-3.2-1.3c-0.8,0.6-3.9,1.2-4.8,1c-0.9-0.1-1.9,0.6-2.1,2.5c0,0,0.7,1.9-1.7,0.8c-2.4-1.1-4.1-1-5.8-0.6c0,0-0.4-0.8-0.4-4.2l0,0.1c0.4-4.6-0.8-3.3-1.3-4.5c-0.4-1.2-0.5-3.9-0.8-4.4c-0.3-0.5-3.8-2.3-4.5-5.1c-0.5-1.9-1.4-4.3-1.5-6.4l-0.1-0.3l0-0.5c-0.1-0.5,1.5-3.3,1.5-3.3c1-2.3-0.4-2.7-0.8-3.7c-0.4-1-1.1-4.1-0.2-4.8c0.9-0.7,1.3-2.3,1.3-2.3c0.6-7.4,8.4-8.6,8.4-8.6s8.4,3,9.2,3.5c0.8,0.5,2.3,2.4,1.5,4.1c0,0-0.4,2.2,4,1.9l0.3-0.1c0,0,5.3-0.4,7.4,1.2l0.4,0.4c0.9,1.1,6.4,1.9,9,1.5c2.6-0.3,2.9-1.8,4.7-2.3l1-0.5c0,0,0.4,2-0.9,3.2c-1.3,1.3,0.1,2,1.7,2.7c1.6,0.7,5.1,1.3,5.7,2.9C116.7,129.3,113.8,133.4,106.3,136.8z',
    tx: 80, ty: 140,
  },
  {
    id: 'busan', name: '부산',
    path: 'M118.5,138.1c-1.6,4.1-3.7,3.6-4,3.1c-0.4-0.5-3-0.7-3,0.6c0,1.3-1.6,2.2-1.6,2.2c-5.4,1.5-6.7,3.3-6.7,3.3s-2.5-4.4-4.9-1.6c-2.4,2.9-2.6,5-6,1.3c0,0-2.8-2,1.1-3.7c0,0,3.1-1.4,3.3-2.7c0.2-1.2,1.8-0.2,2.9,0.6c1.1,0.8,3.4,2.4,4.8-1.8c0,0-0.1-1.8,1.9-2.7c7.5-3.4,10.3-7.7,10.4-7.5c0.2,0.5-0.1,4.8,3.8,4C121.1,133.2,118.5,138.1,118.5,138.1z',
    tx: 108, ty: 142,
  },
  {
    id: 'ulsan', name: '울산',
    path: 'M122.2,129c-0.3-0.7-0.1-1.1,2-2.8c2-1.8,1.7-8.8,1.7-8.8c0,1.2-5.7,2-7.1,1.2c-1.5-0.9-2.3-1.7-4.7-1.2c-1,0.2-3.9,3.1-3.9,3.1s0.4,2-0.9,3.2c-1.3,1.3,0.1,2,1.7,2.7c1.6,0.7,5.1,1.3,5.7,2.9c0,0,0.1,4.4,3,4l0.8,0C120.5,133.3,122.8,130.4,122.2,129z',
    tx: 117, ty: 124,
  },
  {
    id: 'jeju', name: '제주',
    path: 'M21.5,188.9c0,0-2.2,3.3-6.1,3.9c-3.9,0.6-2.5,5.8-0.3,7.2c2.2,1.4,3,3.7,6.1,1.6c1.6-1.1,4.8,0.1,8.8-0.3c1.6-0.1,11.5-4.8,10.8-8.9c-0.8-4.1-2.7-6.6-7-5.3c-4.3,1.3-7.5,1.1-8.7,1.1C23.8,188.4,22.8,188.1,21.5,188.9z',
    tx: 25, ty: 195,
  },
]

// 바다권역 — 클릭 가능 영역 + 경계선
// 서해/남해 경계: 전남 해남 부근 (약 x=5, y=175)
// 남해/동해 경계: 부산 부근 (약 x=120, y=145)
const seaZones = [
  {
    id: 'westSea', name: '서해',
    // 왼쪽 절반 상부 — 육지 아래까지 확장 (육지가 위에 덮음)
    area: 'M-15,-5 L65,-5 L65,170 L5,170 L-5,178 L-15,185 Z',
    labelX: 5, labelY: 110,
  },
  {
    id: 'eastSea', name: '동해',
    // 오른쪽 절반 상부 — 육지 아래까지 확장
    area: 'M65,-5 L145,-5 L145,150 L132,148 L120,145 L65,170 Z',
    labelX: 135, labelY: 80,
  },
  {
    id: 'southSea', name: '남해',
    // 하단 전체
    area: 'M-15,185 L-5,178 L5,170 L65,170 L120,145 L132,148 L145,150 L145,220 L-15,220 Z',
    labelX: 65, labelY: 200,
  },
]

// 바다 경계선 (점선)
const seaBoundaries = [
  // 서해-남해 경계선: 전남 해남에서 남서쪽 viewBox 끝까지
  { d: 'M5,170 C0,174 -5,177 -8,182 C-11,187 -13,192 -15,198' },
  // 남해-동해 경계선: 부산에서 동쪽 viewBox 끝까지
  { d: 'M120,145 C126,146 132,148 138,150 C141,151 143,152 145,153' },
]

export default function RegulationsPage() {
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  const data = selected ? regulationsData[selected] : null

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    return allRegions.filter((r) => r.name.includes(search.trim()))
  }, [search])

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (id) => {
    setSelected(id)
    setSearch('')
    setShowSuggestions(false)
  }

  return (
    <div className="h-full gradient-mid pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute top-20 left-0 w-48 h-48 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100, 140, 180, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* 바다 선택 시 페이지 전체 하이라이트 */}
      {selected === 'westSea' && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.08) 35%, transparent 50%)',
          }}
        />
      )}
      {selected === 'eastSea' && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to left, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.08) 35%, transparent 50%)',
          }}
        />
      )}
      {selected === 'southSea' && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.08) 40%, transparent 60%)',
          }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 mb-6 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            규정 확인
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Regulations
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          지역을 클릭하거나 검색하여 금어기 / 금지체장을 확인하세요
        </p>
      </div>

      {/* Search bar */}
      <div className="relative z-20 mb-5" ref={searchRef}>
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => search && setShowSuggestions(true)}
            placeholder="지역명 검색 (예: 강원, 동해권)"
            className="bg-transparent border-none outline-none flex-1 font-sans text-[14px] text-white/80 placeholder:text-white/30"
          />
        </div>

        {/* Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(30, 40, 55, 0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {suggestions.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="w-full text-left px-4 py-3 font-sans text-[14px] text-white/75 border-none cursor-pointer transition-colors duration-150"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Map */}
      <div className="relative z-10 mb-6 -mx-5">
          <svg viewBox="-15 -5 160 225" className="w-full" style={{ display: 'block', maxHeight: 'calc(100vh - 200px)' }}>
            {/* 바다권역 영역 (육지 뒤에 깔림 — 먼저 렌더) */}
            {seaZones.map((z) => (
              <g key={z.id} onClick={() => handleSelect(z.id)} style={{ cursor: 'pointer' }}>
                <path
                  d={z.area}
                  fill={selected === z.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent'}
                  stroke="none"
                  style={{ transition: 'fill 0.2s' }}
                />
                <text
                  x={z.labelX}
                  y={z.labelY}
                  textAnchor="middle"
                  fill={selected === z.id ? 'rgba(186, 230, 253, 0.9)' : 'rgba(186, 230, 253, 0.35)'}
                  fontSize="4"
                  fontFamily="sans-serif"
                  fontWeight={500}
                  style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                >
                  {z.name}
                </text>
              </g>
            ))}

            {/* 바다 경계선 (점선) */}
            {seaBoundaries.map((b, i) => (
              <path
                key={i}
                d={b.d}
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={0.7}
                strokeDasharray="3,2"
                style={{ pointerEvents: 'none' }}
              />
            ))}

            {/* 시도 영역 (육지 — 바다 위에 렌더) */}
            {provinces.map((p) => (
              <g key={p.id} onClick={() => handleSelect(p.id)} style={{ cursor: 'pointer' }}>
                <path
                  d={p.path}
                  fill={selected === p.id ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255,255,255,0.12)'}
                  stroke={selected === p.id ? 'rgba(96, 165, 250, 0.9)' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={selected === p.id ? 0.8 : 0.4}
                  strokeLinejoin="round"
                  style={{ transition: 'all 0.2s' }}
                />
                <text
                  x={p.tx}
                  y={p.ty}
                  textAnchor="middle"
                  fill={selected === p.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)'}
                  fontSize="4"
                  fontFamily="sans-serif"
                  fontWeight={selected === p.id ? 600 : 400}
                  style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                >
                  {p.name}
                </text>
              </g>
            ))}
          </svg>
      </div>

      {/* Content */}
      {!data ? (
        <div className="relative z-10 h-40 flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <span className="font-sans text-2xl text-white/20">?</span>
          </div>
          <p className="font-sans text-[14px] text-white/30 text-center leading-relaxed">
            지도에서 지역을 선택하거나
            <br />
            검색하여 규정을 확인하세요
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-5 animate-fadeUp">
          {/* Region Header */}
          <div className="mb-2">
            <div className="flex items-baseline gap-3">
              <h2 className="font-sans text-[36px] font-extralight text-white/85 tracking-tight">
                {data.name}
              </h2>
              <span className="font-mono text-[10px] text-white/25 tracking-wider">
                {data.nameEn}
              </span>
            </div>
          </div>

          {/* Prohibited / Closed Season */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-3 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
              <h3 className="font-sans text-[12px] font-medium text-white/40 uppercase tracking-wider">
                금지어종 / 금어기
              </h3>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            >
              {data.prohibited.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-3.5"
                  style={{
                    borderBottom: index < data.prohibited.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : 'none',
                  }}
                >
                  <span className="font-sans text-[14px] text-white/70">{item.name}</span>
                  <span className="font-mono text-[12px] text-white/45">
                    {item.period}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Size */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-3 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400/70" />
              <h3 className="font-sans text-[12px] font-medium text-white/40 uppercase tracking-wider">
                금지체장
              </h3>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            >
              {data.minSize.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-3.5"
                  style={{
                    borderBottom: index < data.minSize.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : 'none',
                  }}
                >
                  <span className="font-sans text-[14px] text-white/70">{item.name}</span>
                  <span className="font-mono text-[13px] text-white/55">
                    {item.size}<span className="text-[11px] text-white/30 ml-0.5">cm</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <p className="font-sans text-[11px] text-white/25 leading-relaxed pl-1">
            * 규정은 변경될 수 있습니다. 출조 전 해당 지역 관할 기관에 최신 정보를 확인하세요.
          </p>
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}
