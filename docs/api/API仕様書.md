# Massvision Web API仕様書

## 1. API概要

### 1.1 基本情報
- ベースURL: `/api/v1`
- 認証方式: JWT (JSON Web Token)
- レスポンス形式: JSON
- エンコーディング: UTF-8

### 1.2 共通レスポンス形式
```json
{
  "status": "success" | "error",
  "data": object | null,
  "error": {
    "code": string,
    "message": string
  } | null
}
```

### 1.3 エラーコード
| コード | 説明 |
|--------|------|
| 400 | リクエストが不正 |
| 401 | 認証エラー |
| 403 | 権限エラー |
| 404 | リソースが見つからない |
| 409 | リソースの競合 |
| 500 | サーバーエラー |

## 2. 認証API

### 2.1 ユーザー登録
```
POST /auth/register
```

リクエスト:
```json
{
  "email": string,
  "password": string,
  "name": string
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": string,
      "email": string,
      "name": string,
      "created_at": string
    },
    "token": string
  }
}
```

### 2.2 ログイン
```
POST /auth/login
```

リクエスト:
```json
{
  "email": string,
  "password": string
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": string,
      "email": string,
      "name": string
    },
    "token": string
  }
}
```

## 3. プロジェクトAPI

### 3.1 プロジェクト一覧取得
```
GET /projects
```

クエリパラメータ:
- page: ページ番号（デフォルト: 1）
- limit: 1ページあたりの件数（デフォルト: 20）

レスポンス:
```json
{
  "status": "success",
  "data": {
    "projects": [
      {
        "id": string,
        "name": string,
        "description": string,
        "created_at": string,
        "updated_at": string
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

### 3.2 プロジェクト作成
```
POST /projects
```

リクエスト:
```json
{
  "name": string,
  "description": string
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "created_at": string,
    "updated_at": string
  }
}
```

### 3.3 プロジェクト更新
```
PUT /projects/{project_id}
```

リクエスト:
```json
{
  "name": string,
  "description": string
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "updated_at": string
  }
}
```

### 3.4 プロジェクト削除
```
DELETE /projects/{project_id}
```

レスポンス:
```json
{
  "status": "success",
  "data": null
}
```

## 4. シーンAPI

### 4.1 シーン一覧取得
```
GET /projects/{project_id}/scenes
```

クエリパラメータ:
- page: ページ番号（デフォルト: 1）
- limit: 1ページあたりの件数（デフォルト: 20）

レスポンス:
```json
{
  "status": "success",
  "data": {
    "scenes": [
      {
        "id": string,
        "name": string,
        "count": number,
        "created_at": string,
        "updated_at": string
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

### 4.2 シーン作成
```
POST /projects/{project_id}/scenes
```

リクエスト:
```json
{
  "name": string,
  "count": number
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "name": string,
    "count": number,
    "created_at": string,
    "updated_at": string
  }
}
```

### 4.3 シーン更新
```
PUT /scenes/{scene_id}
```

リクエスト:
```json
{
  "name": string,
  "count": number
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "name": string,
    "count": number,
    "updated_at": string
  }
}
```

### 4.4 シーン削除
```
DELETE /scenes/{scene_id}
```

レスポンス:
```json
{
  "status": "success",
  "data": null
}
```

## 5. キャラクタAPI

### 5.1 キャラクタ一覧取得
```
GET /scenes/{scene_id}/characters
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "characters": [
      {
        "id": string,
        "position_x": number,
        "position_y": number,
        "initial_direction": number,
        "macro_id": string,
        "created_at": string,
        "updated_at": string
      }
    ]
  }
}
```

### 5.2 キャラクタ作成
```
POST /scenes/{scene_id}/characters
```

リクエスト:
```json
{
  "position_x": number,
  "position_y": number,
  "initial_direction": number,
  "macro_id": string
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "position_x": number,
    "position_y": number,
    "initial_direction": number,
    "macro_id": string,
    "created_at": string,
    "updated_at": string
  }
}
```

### 5.3 キャラクタ一括作成
```
POST /scenes/{scene_id}/characters/bulk
```

リクエスト:
```json
{
  "characters": [
    {
      "position_x": number,
      "position_y": number,
      "initial_direction": number,
      "macro_id": string
    }
  ]
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "characters": [
      {
        "id": string,
        "position_x": number,
        "position_y": number,
        "initial_direction": number,
        "macro_id": string,
        "created_at": string,
        "updated_at": string
      }
    ]
  }
}
```

### 5.4 キャラクタ更新
```
PUT /characters/{character_id}
```

リクエスト:
```json
{
  "position_x": number,
  "position_y": number,
  "initial_direction": number,
  "macro_id": string
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "position_x": number,
    "position_y": number,
    "initial_direction": number,
    "macro_id": string,
    "updated_at": string
  }
}
```

### 5.5 キャラクタ削除
```
DELETE /characters/{character_id}
```

レスポンス:
```json
{
  "status": "success",
  "data": null
}
```

## 6. マクロAPI

### 6.1 マクロ一覧取得
```
GET /scenes/{scene_id}/macros
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "macros": [
      {
        "id": string,
        "content": string,
        "variables": object,
        "created_at": string,
        "updated_at": string
      }
    ]
  }
}
```

### 6.2 マクロ作成
```
POST /scenes/{scene_id}/macros
```

リクエスト:
```json
{
  "content": string,
  "variables": object
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "content": string,
    "variables": object,
    "created_at": string,
    "updated_at": string
  }
}
```

### 6.3 マクロ更新
```
PUT /macros/{macro_id}
```

リクエスト:
```json
{
  "content": string,
  "variables": object
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "id": string,
    "content": string,
    "variables": object,
    "updated_at": string
  }
}
```

### 6.4 マクロ削除
```
DELETE /macros/{macro_id}
```

レスポンス:
```json
{
  "status": "success",
  "data": null
}
```

## 7. アニメーションAPI

### 7.1 アニメーション実行
```
POST /scenes/{scene_id}/animate
```

リクエスト:
```json
{
  "count": number,
  "wait": number
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "animation_id": string,
    "status": "running" | "completed" | "error",
    "current_count": number,
    "total_count": number,
    "characters": [
      {
        "id": string,
        "position_x": number,
        "position_y": number,
        "direction": number
      }
    ]
  }
}
```

### 7.2 アニメーション状態取得
```
GET /animations/{animation_id}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "animation_id": string,
    "status": "running" | "completed" | "error",
    "current_count": number,
    "total_count": number,
    "characters": [
      {
        "id": string,
        "position_x": number,
        "position_y": number,
        "direction": number
      }
    ]
  }
}
```

## 8. エクスポートAPI

### 8.1 プロジェクトエクスポート
```
POST /projects/{project_id}/export
```

リクエスト:
```json
{
  "format": "json" | "csv" | "pdf",
  "include_scenes": boolean,
  "include_characters": boolean,
  "include_macros": boolean
}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "export_id": string,
    "status": "processing" | "completed" | "error",
    "download_url": string
  }
}
```

### 8.2 エクスポート状態取得
```
GET /exports/{export_id}
```

レスポンス:
```json
{
  "status": "success",
  "data": {
    "export_id": string,
    "status": "processing" | "completed" | "error",
    "download_url": string
  }
}
``` 