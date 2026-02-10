# 낚고 알고 API 명세서

## 기본 정보

- **Base URL**: `https://api.nakgo-algo.com/v1`
- **인증 방식**: Bearer Token (JWT)
- **Content-Type**: `application/json`

---

## 1. 인증 (Auth)

### 1.1 카카오 로그인
카카오 OAuth 토큰으로 서버 인증

```
POST /auth/kakao
```

**Request Body**
```json
{
  "accessToken": "카카오에서 받은 access_token"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "nickname": "낚시왕",
      "profileImage": "https://...",
      "provider": "kakao",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  }
}
```

### 1.2 토큰 갱신
```
POST /auth/refresh
```

**Request Header**
```
Authorization: Bearer {refresh_token}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

### 1.3 로그아웃
```
POST /auth/logout
```

**Request Header**
```
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "success": true,
  "message": "로그아웃 되었습니다"
}
```

---

## 2. 사용자 (Users)

### 2.1 내 프로필 조회
```
GET /users/me
```

**Request Header**
```
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "낚시왕",
    "profileImage": "https://...",
    "provider": "kakao",
    "createdAt": "2024-01-15T09:00:00Z",
    "stats": {
      "pointsCount": 5,
      "catchRecordsCount": 12,
      "reportsCount": 2,
      "postsCount": 8
    }
  }
}
```

### 2.2 프로필 수정
```
PATCH /users/me
```

**Request Header**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "nickname": "새로운닉네임"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "새로운닉네임",
    "profileImage": "https://...",
    "provider": "kakao"
  }
}
```

---

## 3. 나만의 포인트 (Points)

### 3.1 포인트 목록 조회
```
GET /points
```

**Request Header**
```
Authorization: Bearer {token}
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| page | number | X | 페이지 번호 (기본: 1) |
| limit | number | X | 페이지당 개수 (기본: 20) |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "points": [
      {
        "id": 1,
        "name": "비밀 포인트",
        "memo": "감성돔 잘 나옴",
        "lat": 35.1234,
        "lng": 129.5678,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 3.2 포인트 생성
```
POST /points
```

**Request Header**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "name": "비밀 포인트",
  "memo": "감성돔 잘 나옴",
  "lat": 35.1234,
  "lng": 129.5678
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "비밀 포인트",
    "memo": "감성돔 잘 나옴",
    "lat": 35.1234,
    "lng": 129.5678,
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

### 3.3 포인트 수정
```
PATCH /points/{pointId}
```

**Request Body**
```json
{
  "name": "수정된 이름",
  "memo": "수정된 메모"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "수정된 이름",
    "memo": "수정된 메모",
    "lat": 35.1234,
    "lng": 129.5678,
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

### 3.4 포인트 삭제
```
DELETE /points/{pointId}
```

**Response (200)**
```json
{
  "success": true,
  "message": "포인트가 삭제되었습니다"
}
```

---

## 4. 조과 기록 (Catch Records)

### 4.1 조과 기록 목록
```
GET /catches
```

**Request Header**
```
Authorization: Bearer {token}
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| page | number | X | 페이지 번호 |
| limit | number | X | 페이지당 개수 |
| startDate | string | X | 시작일 (YYYY-MM-DD) |
| endDate | string | X | 종료일 (YYYY-MM-DD) |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "catches": [
      {
        "id": 1,
        "fishType": "감성돔",
        "size": 45.5,
        "weight": 2.3,
        "imageUrl": "https://...",
        "lat": 35.1234,
        "lng": 129.5678,
        "locationName": "부산 송도",
        "memo": "4짜 감생이!",
        "caughtAt": "2024-01-15T14:30:00Z",
        "createdAt": "2024-01-15T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

### 4.2 조과 기록 생성
```
POST /catches
```

**Request Header**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData)**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|-----|------|
| fishType | string | O | 어종 |
| size | number | X | 크기 (cm) |
| weight | number | X | 무게 (kg) |
| image | file | X | 사진 파일 |
| lat | number | O | 위도 |
| lng | number | O | 경도 |
| locationName | string | X | 장소명 |
| memo | string | X | 메모 |
| caughtAt | string | O | 잡은 시간 (ISO 8601) |

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fishType": "감성돔",
    "size": 45.5,
    "weight": 2.3,
    "imageUrl": "https://...",
    "lat": 35.1234,
    "lng": 129.5678,
    "locationName": "부산 송도",
    "memo": "4짜 감생이!",
    "caughtAt": "2024-01-15T14:30:00Z",
    "createdAt": "2024-01-15T15:00:00Z"
  }
}
```

### 4.3 조과 기록 삭제
```
DELETE /catches/{catchId}
```

**Response (200)**
```json
{
  "success": true,
  "message": "조과 기록이 삭제되었습니다"
}
```

---

## 5. 오류 제보 (Reports)

### 5.1 제보 목록 조회 (내가 한 제보)
```
GET /reports
```

**Request Header**
```
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "type": "missing",
        "description": "여기 낚시금지구역인데 지도에 없어요",
        "lat": 35.1234,
        "lng": 129.5678,
        "imageUrl": "https://...",
        "status": "pending",
        "adminNote": null,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### 5.2 제보 생성
```
POST /reports
```

**Request Header**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData)**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|-----|------|
| type | string | O | 제보 유형 (missing: 누락, wrong: 오류, other: 기타) |
| description | string | O | 상세 설명 |
| lat | number | O | 위도 |
| lng | number | O | 경도 |
| image | file | X | 증거 사진 |

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "missing",
    "description": "여기 낚시금지구역인데 지도에 없어요",
    "lat": 35.1234,
    "lng": 129.5678,
    "imageUrl": "https://...",
    "status": "pending",
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

### 5.3 제보 상태값
| 상태 | 설명 |
|-----|------|
| pending | 검토 대기중 |
| reviewing | 검토중 |
| approved | 반영 완료 |
| rejected | 반려됨 |

---

## 6. 게시판 (Posts)

### 6.1 게시글 목록
```
GET /posts
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| page | number | X | 페이지 번호 |
| limit | number | X | 페이지당 개수 |
| category | string | X | 카테고리 필터 |
| search | string | X | 검색어 |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "오늘 조황 공유합니다",
        "content": "부산 송도에서 감성돔 5마리...",
        "category": "fishing",
        "imageUrls": ["https://..."],
        "author": {
          "id": 1,
          "nickname": "낚시왕",
          "profileImage": "https://..."
        },
        "viewCount": 123,
        "likeCount": 45,
        "commentCount": 12,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 6.2 게시글 상세
```
GET /posts/{postId}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "오늘 조황 공유합니다",
    "content": "부산 송도에서 감성돔 5마리 잡았습니다...",
    "category": "fishing",
    "imageUrls": ["https://..."],
    "author": {
      "id": 1,
      "nickname": "낚시왕",
      "profileImage": "https://..."
    },
    "viewCount": 124,
    "likeCount": 45,
    "commentCount": 12,
    "isLiked": false,
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z"
  }
}
```

### 6.3 게시글 작성
```
POST /posts
```

**Request Header**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData)**
| 필드 | 타입 | 필수 | 설명 |
|-----|------|-----|------|
| title | string | O | 제목 |
| content | string | O | 내용 |
| category | string | O | 카테고리 |
| images | file[] | X | 이미지 파일들 (최대 5개) |

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "오늘 조황 공유합니다",
    "content": "...",
    "category": "fishing",
    "imageUrls": [],
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

### 6.4 게시글 수정
```
PATCH /posts/{postId}
```

**Request Body**
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "content": "수정된 내용",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 6.5 게시글 삭제
```
DELETE /posts/{postId}
```

**Response (200)**
```json
{
  "success": true,
  "message": "게시글이 삭제되었습니다"
}
```

### 6.6 게시글 좋아요
```
POST /posts/{postId}/like
```

**Request Header**
```
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 46
  }
}
```

### 6.7 게시글 좋아요 취소
```
DELETE /posts/{postId}/like
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likeCount": 45
  }
}
```

### 6.8 카테고리 목록
| 카테고리 | 설명 |
|---------|------|
| fishing | 조황/출조 |
| gear | 장비/채비 |
| spot | 포인트 정보 |
| question | 질문 |
| free | 자유 |

---

## 7. 댓글 (Comments)

### 7.1 댓글 목록
```
GET /posts/{postId}/comments
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "대박이네요!",
        "author": {
          "id": 2,
          "nickname": "바다사나이",
          "profileImage": "https://..."
        },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

### 7.2 댓글 작성
```
POST /posts/{postId}/comments
```

**Request Header**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "content": "대박이네요!"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "대박이네요!",
    "author": {
      "id": 2,
      "nickname": "바다사나이",
      "profileImage": "https://..."
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 7.3 댓글 삭제
```
DELETE /posts/{postId}/comments/{commentId}
```

**Response (200)**
```json
{
  "success": true,
  "message": "댓글이 삭제되었습니다"
}
```

---

## 8. 낚시 금지구역 (Zones)

### 8.1 금지구역 목록 조회
```
GET /zones
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| swLat | number | O | 남서 위도 |
| swLng | number | O | 남서 경도 |
| neLat | number | O | 북동 위도 |
| neLng | number | O | 북동 경도 |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": 1,
        "type": "prohibited",
        "name": "부산항 제1부두",
        "description": "선박 안전을 위해 낚시 금지",
        "coordinates": [
          { "lat": 35.1234, "lng": 129.5678 },
          { "lat": 35.1235, "lng": 129.5679 }
        ],
        "period": null
      },
      {
        "id": 2,
        "type": "restricted",
        "name": "해운대 해수욕장",
        "description": "해수욕 시즌 중 낚시 제한",
        "coordinates": [...],
        "period": {
          "start": "06-01",
          "end": "08-31"
        }
      }
    ]
  }
}
```

### 8.2 구역 타입
| 타입 | 설명 |
|-----|------|
| prohibited | 금지구역 (연중) |
| restricted | 제한구역 (기간/조건부) |

---

## 에러 응답

### 공통 에러 형식
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다"
  }
}
```

### 에러 코드
| HTTP 상태 | 코드 | 설명 |
|----------|------|------|
| 400 | BAD_REQUEST | 잘못된 요청 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 충돌 (중복 등) |
| 422 | VALIDATION_ERROR | 유효성 검사 실패 |
| 500 | INTERNAL_ERROR | 서버 오류 |

### 유효성 검사 에러
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": [
      {
        "field": "nickname",
        "message": "닉네임은 2자 이상 10자 이하여야 합니다"
      }
    ]
  }
}
```

---

## 데이터베이스 스키마 (참고용)

```sql
-- 사용자
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  kakao_id VARCHAR(50) UNIQUE,
  nickname VARCHAR(20) NOT NULL,
  profile_image VARCHAR(500),
  provider ENUM('kakao', 'demo') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 나만의 포인트
CREATE TABLE points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(50) NOT NULL,
  memo TEXT,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 조과 기록
CREATE TABLE catch_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  fish_type VARCHAR(30) NOT NULL,
  size DECIMAL(5, 1),
  weight DECIMAL(5, 2),
  image_url VARCHAR(500),
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  location_name VARCHAR(100),
  memo TEXT,
  caught_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 오류 제보
CREATE TABLE reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type ENUM('missing', 'wrong', 'other') NOT NULL,
  description TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  image_url VARCHAR(500),
  status ENUM('pending', 'reviewing', 'approved', 'rejected') DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 게시글
CREATE TABLE posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('fishing', 'gear', 'spot', 'question', 'free') NOT NULL,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 게시글 이미지
CREATE TABLE post_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 좋아요
CREATE TABLE post_likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 댓글
CREATE TABLE comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 낚시 금지구역
CREATE TABLE zones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('prohibited', 'restricted') NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coordinates JSON NOT NULL,
  period_start VARCHAR(5),
  period_end VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 연락처

- **프론트엔드**: 허영재
- **작성일**: 2024-01-15
- **버전**: v1.0.0
