# 說明
1. 登入後將userID以及conversationID結合，產生jwt token供後續認證使用。
   
2. 若redis內無可用conversationID 清單，將會檢查mongoDB有無備份，若沒有備份才會產生全新清單。

## 設定
1.  複製.env.example並修改檔案名稱。

2.  進入.env設定相關參數，詳細內容如下：
```console
PORT=

# jwt 相關設定
TOKEN_SECRET=                  jwt 加密
TOKEN_EXPIRE_TIME=             token可用時間

# mongoDB 相關設定
MONGODB_URI=                   mongoDB URI
MONGODB_NAME=                  mongoDB Database名稱

# redis 相關設定
IDS_AMOUNT=                    ID數量
CONTEXT_SAVE_TIME=             對話紀錄儲存時間
CONVERSATION_ID_LIST=          conversationID list儲存名稱
CONVERSATION_DATA=             對話紀錄儲存名稱
TOKEN_REDIS_EXPIRE_TIME=       Token 儲存於redis時間
TOKEN_SECRET=                  token密鑰
TOKEN_EXPIRE_TIME=             產生token之時效

```

## API
### 登入並產生token
- 路由: `POST /confirm/login`
- Request:
  - Header
    |Key|Value|
    |--|--|
    |`Content-Type`|`application/json`|
  - Body
    |Key|Type|Value|Description|required|
    |--|--|--|--|--|
    |`user`|`string`|`"username"`|使用者名稱|true|
    |`password`|`string`|`"password"`|密碼|true|
    |`platform`|`string`|`"web"`|登入平台|true|

- Response: 
   #### 成功
  - Status Code: 200
  - Type: JSON
  - Body
    
    |Key|Type|Value|Description|
    |--|--|--|--|
    |`user`|`string`|`"username"`|使用者名稱|

   #### 失敗

  - Reason: 帳密錯誤
  - Status Code: 403
  - Body

### 驗證token
- 路由: `/confirm/verify` 
- Request:
  - Header
    |Key|Value|
    |--|--|
    |`Content-Type`|`application/json`|
    |`authorization`|`token`|
  - Body
    |Key|Type|Value|Description|required|
    |--|--|--|--|--|
    |`platform`|`string`|`"web"`|登入平台|true|

- Response: 
   #### 成功
  - Status Code: 200
  - Type: JSON
  - Body
    
    |Key|Type|Value|Description|
    |--|--|--|--|
    |`decodedToken`|`json`|`userInfo`|使用者資訊|

   #### 失敗

  - Reason: 授權過期
  - Status Code: 401
  - Body
  
    |Key|Type|Value|Description|
    |--|--|--|--|
    |`message`|`json`|`"error message"`|錯誤訊息|

### 登出
- 路由: `/confirm/logout` 
  - Request:
  - Header
    |Key|Value|
    |--|--|
    |`Content-Type`|`application/json`|
    |`authorization`|`token`|
  - Body
    |Key|Type|Value|Description|required|
    |--|--|--|--|--|
    |`platform`|`string`|`"web"`|登入平台|true|
- Response: 
   #### 成功
  - Status Code: 200
  - Type: JSON
  - Body
    
    |Key|Type|Value|Description|
    |--|--|--|--|
    |`status`|`string`|`"Logout"`|使用者名稱|
   #### 失敗
  - Reason: 授權過期
  - Status Code: 401
  - Body
  
    |Key|Type|Value|Description|
    |--|--|--|--|
    |`message`|`json`|`"error message"`|錯誤訊息|


## 其他
jwt詳細內容可參考[套件文件](https://www.npmjs.com/package/jsonwebtoken)