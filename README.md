# xDTU – Frontend & REST API Contract

> Mạng xã hội dành cho cộng đồng Đại học Duy Tân. Frontend sử dụng HTML, CSS, JavaScript thuần; Backend do bạn xây dựng bằng C# ASP.NET Core Web API và SQL Server.

> **Trạng thái API:** README này mô tả contract đề xuất để xây dựng Backend, không xác nhận Backend đã tồn tại hoặc các endpoint đã hoạt động. Workspace hiện chỉ có mã Frontend; các lời gọi bên dưới là những endpoint có call-site trong Frontend.

## 1. Mục tiêu và nguyên tắc phối hợp

- Frontend chịu trách nhiệm hiển thị giao diện, lấy dữ liệu và gửi yêu cầu HTTP.
- Backend chịu trách nhiệm xác thực, phân quyền, kiểm tra dữ liệu, nghiệp vụ, truy vấn SQL Server và lưu trữ.
- Không xem việc ẩn nút ở Frontend là bảo mật. Mọi quyền phải được kiểm tra lại ở Backend.
- Các thông tin hồ sơ được đồng bộ từ dữ liệu sinh viên/giảng viên phải được Backend bảo vệ, không cho phép sửa qua API hồ sơ.
- Mỗi người chỉ thuộc một đơn vị trực thuộc. Backend phải xác định đơn vị từ dữ liệu chính thức, không tin `schoolId` do trình duyệt gửi lên.

## 2. Công nghệ

### Frontend
- HTML5
- CSS3 (giao diện sáng, responsive)
- JavaScript ES6+
- Fetch API
- REST API + JSON
- JWT lưu trong `localStorage` ở bản demo này

### Backend đề xuất
- ASP.NET Core Web API
- C#
- SQL Server
- Entity Framework Core hoặc ADO.NET (tùy lựa chọn của bạn)
- JWT Bearer Authentication
- Swagger / OpenAPI

## 3. Chạy Frontend

1. Giải nén thư mục `xDTU-Frontend`.
2. Mở thư mục bằng VS Code.
3. Mở `js/api.js`.
4. Sửa `API_BASE` thành địa chỉ Backend của bạn, ví dụ:

```js
const API_BASE = "https://localhost:7001/api";
```

5. Chạy `index.html` bằng Live Server.
6. Khi Backend chưa sẵn sàng, giao diện đang bật chế độ demo để bạn có thể xem bố cục. Khi muốn gọi API thật, trong `js/app.js` đổi `demo: true` thành `demo: false`.

> Không dùng `http://0.0.0.0` làm địa chỉ gọi API từ trình duyệt. Hãy dùng đúng host mà trình duyệt truy cập được, ví dụ `https://localhost:7001` hoặc URL tunnel. `API_BASE` hiện được giữ tại `https://localhost:7001/api`; chỉ sửa khi Backend của bạn chạy ở địa chỉ khác. Chế độ demo đang bật mặc định (`demo: true`); muốn thử API thật, bạn tự đổi thành `false` sau khi Backend sẵn sàng.

### 3.1 Các endpoint có call-site trong Frontend hiện tại

`demo: true` đang được bật trong `js/app.js`, vì vậy các call-site này không chạy trong luồng demo mặc định. Bảng dưới mô tả những gì mã Frontend hiện gửi hoặc đọc; đây không phải xác nhận rằng Backend đã triển khai các endpoint này.

Contract và dữ liệu demo hiện dùng `code` để định danh user. Các ID của bài viết và các đối tượng khác vẫn được giữ riêng. Backend chưa có trong workspace, nên các endpoint vẫn là contract đề xuất chứ chưa được xác minh.

| Method và endpoint | Request Frontend gửi | Response/dữ liệu Frontend đang dùng |
|---|---|---|
| `POST /auth/login` | JSON `{ "code": "...", "password": "..." }` | Đọc trường `token`. Sau đó Frontend gọi `GET /users/me`. |
| `GET /users/me` | Không có body; gửi JWT nếu đã lưu | Đọc `code`, `fullName`, `displayName`, `role`, `school`/`schoolName`, `birthDate`/`dateOfBirth`, `hometown`, `major`, `avatarUrl`, `nickname`, `nicknameEnabled`, `interests`, `relationshipStatus`, `bio`, `postCount`, `followerCount`. |
| `GET /posts/feed` | Không có query phân trang hiện tại | Client chấp nhận array/`items`; đọc `id`, `content`, `createdAt`, `visibility`/`scope`, `group`, counts, `isLikedByCurrentUser`, `isOwnedByCurrentUser` và `author.code` khi không ẩn danh. |
| `POST /posts` | JSON `{ "content": "...", "visibility": "Public" }` hoặc multipart `content`, `visibility`, `images` lặp lại và tối đa một `videos` | Đọc `id`, `author.code` (nếu công khai), `images`, `videos` (hoặc `media`), `createdAt`, các count và trạng thái like; Frontend đánh dấu bài vừa tạo là của người hiện tại. |
| `GET /posts/{postId}/comments`, `POST /posts/{postId}/comments`, `DELETE /comments/{commentId}` | GET phân trang; POST JSON `{ "content": "...", "parentCommentId": null }` hoặc multipart gồm trường đó cùng `images`/`videos`; DELETE không body | Đọc `id`, `postId`, `parentCommentId`, `content`, `author.code`, `images`/`videos` (hoặc `media`), `createdAt`, `total`. |
| `POST/DELETE /posts/{postId}/likes` | POST/DELETE không body | Đọc `likeCount`, `isLikedByCurrentUser` nếu response có body. |
| `GET /conversations?page=1&pageSize=50`, `POST /conversations`, `GET/POST /conversations/{conversationId}/messages` | Tạo hội thoại JSON `{ "code": "..." }`; tin nhắn JSON hoặc multipart `content` + `file` | Đọc ID hội thoại/tin nhắn, `otherUser.code`, `sender.code`, `content`, `createdAt`, `status`, `attachment`. |
| `GET /conversations/{conversationId}/messages?afterMessageId={messageId}` | Polling 5 giây khi tab chat hiển thị; dùng `0` nếu chưa có tin | Đọc danh sách tin mới có `id`; ID tin nhắn không phải mã user. |
| `GET /messages/{messageId}/attachment` | GET binary, gửi JWT | Đọc response Blob và `Content-Disposition` để tải file. |
| `GET /groups?page=1&pageSize=50`, `GET /groups/{groupId}`, `POST /groups/{groupId}/members`, `GET/POST /groups/{groupId}/posts` | Query phân trang; tham gia không body; tạo bài JSON `{ "content": "..." }` | Đọc ID nhóm/bài viết, `schoolName`, `memberCount`, `isMember`, `canPost`, `author.code`. |
| `GET /users/{code}`, `GET /users/{code}/posts`, `PUT /users/me/avatar` | Mã user trong URL; avatar multipart trường `avatar` | Đọc `code`, `avatarUrl` và danh sách bài viết của user. |
| `DELETE /posts/{postId}` | Không có body | Không đọc response body; chỉ cập nhật giao diện sau khi request thành công. `postId` là ID bài viết, không phải mã user. |
| `PUT /users/me/profile` | JSON `{ "nickname": "...", "nicknameEnabled": true, "interests": "...", "relationshipStatus": "...", "bio": "..." }` | Đọc hồ sơ mới, kiểm tra `code` còn đúng user hiện tại. |
| `GET /users/search?q={keyword}` | Query `q` được URL-encode; chưa gửi tham số phân trang | Client chấp nhận array/`items` và đọc `code`, `displayName`, `nickname`, `nicknameEnabled`, `fullName`. |

Các call-site nhóm, hồ sơ, bình luận, ảnh và chat được triển khai để chạy với Backend theo hợp đồng ở các mục sau; chúng chưa thể xác nhận hoạt động do chưa có Backend. Chợ xDTU, ghép đôi, tìm bạn, thông báo và chia sẻ vẫn là giao diện/contract, chưa có luồng dữ liệu hoàn chỉnh.

## 4. Quy ước chung của API

### 4.1 Base URL

```text
https://localhost:7001/api
```

### 4.2 Header

Các API cần đăng nhập:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

Với request upload, Frontend gửi `FormData` và **không tự đặt** `Content-Type`; trình duyệt phải tự thêm multipart boundary. File được gửi dạng binary, không mã hóa Base64.

### 4.3 Định dạng thành công

API trả JSON. Với hai endpoint mà Frontend hiện dùng trực tiếp như mảng (`GET /posts/feed` và `GET /users/search`), Backend cần trả mảng trực tiếp để khớp mã hiện tại. Các endpoint danh sách khác trong contract đề xuất dùng object phân trang thống nhất:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

### 4.4 HTTP Status Code

| Mã | Ý nghĩa | Khi nào dùng |
|---|---|---|
| 200 | OK | GET, PUT, PATCH thành công |
| 201 | Created | Tạo bài viết, bình luận, tin đăng... |
| 204 | No Content | Xóa thành công, không cần body |
| 400 | Bad Request | Dữ liệu gửi lên không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc JWT không hợp lệ |
| 403 | Forbidden | Đã đăng nhập nhưng không có quyền |
| 404 | Not Found | Không tìm thấy tài nguyên |
| 409 | Conflict | Trạng thái nghiệp vụ xung đột, ví dụ món hàng đã bán |
| 413 | Payload Too Large | File upload vượt giới hạn |
| 415 | Unsupported Media Type | Content-Type không được hỗ trợ |
| 500 | Internal Server Error | Lỗi hệ thống |

Lỗi nên có cấu trúc thống nhất:

```json
{
  "status": 403,
  "message": "Bạn không thuộc đơn vị trực thuộc này"
}
```

### 4.5 Quy tắc đặt tên
- URL dùng danh từ số nhiều: `/posts`, `/users`, `/groups`.
- Dùng `POST` để tạo, `GET` để đọc, `PUT` hoặc `PATCH` để sửa, `DELETE` để xóa.
- JSON dùng camelCase: `fullName`, `createdAt`, `schoolId`.
- Ngày giờ dùng ISO 8601, ví dụ `2026-11-23T15:30:00Z`.
- Người dùng được định danh bằng `code`; không trả hoặc nhận thuộc tính `id` để định danh user.
- Frontend loại bỏ thuộc tính `id` nếu API vô tình gửi trong object user; Backend vẫn nên chỉ trả `code`.
- Khi truyền mã user trong URL, dùng tham số `{code}`; khi truyền trong JSON body, dùng thuộc tính `code`. Không dùng tên `userId` cho mã user.
- Các đối tượng không phải user (bài viết, nhóm, bình luận, tin nhắn, hội thoại...) tiếp tục dùng `id` hoặc tham số ID riêng như `postId`, `groupId`, `messageId`.
- ID của các đối tượng không phải user nên dùng kiểu số nguyên hoặc GUID nhất quán toàn hệ thống.

## 5. Đăng nhập và phân loại tài khoản

### POST `/auth/login`

Request:

```json
{
  "code": "SV000001",
  "password": "your-password"
}
```

Backend tra cứu mã trong nguồn dữ liệu sinh viên/giảng viên. Không cần frontend chọn loại tài khoản.

Response `200`:

```json
{
  "token": "JWT_ACCESS_TOKEN",
  "tokenType": "Bearer",
  "expiresAt": "2026-11-23T16:30:00Z",
  "user": {
    "code": "SV000001",
    "fullName": "Nguyễn Minh Anh",
    "role": "Student",
    "schoolId": 1,
    "schoolName": "Khoa học Máy tính",
    "major": "Kỹ thuật phần mềm"
  }
}
```

Sai mã hoặc mật khẩu: `401`.

### GET `/users/me`

Lấy hồ sơ người dùng hiện tại từ JWT. Frontend gọi ngay sau đăng nhập hoặc dùng `user` trong response login.

Response đề xuất:

```json
{
  "code": "SV000001",
  "fullName": "Nguyễn Minh Anh",
  "role": "Student",
  "dateOfBirth": "2005-01-15",
  "hometown": "Đà Nẵng",
  "schoolId": 1,
  "schoolName": "Khoa học Máy tính",
  "major": "Kỹ thuật phần mềm",
  "avatarUrl": null,
  "coverUrl": null,
  "nickname": null,
  "nicknameEnabled": false,
  "interests": null,
  "bio": null,
  "relationshipStatus": null,
  "followerCount": 0,
  "postCount": 0
}
```

**Lưu ý quan trọng:** `code`, `fullName`, `role`, `dateOfBirth`, `hometown`, `schoolId`, `schoolName`, `major` là dữ liệu gốc do nhà trường cung cấp. Không cho phép người dùng sửa các trường này qua API cập nhật hồ sơ.

### PUT `/users/me/profile`

Chỉ cập nhật trường người dùng tự thiết lập:

```json
{
  "nickname": "Minh Anh",
  "nicknameEnabled": true,
  "interests": "Lập trình, đọc sách",
  "bio": "Xin chào mọi người!",
  "relationshipStatus": "Single"
}
```

Giá trị `relationshipStatus`: `Single`, `Dating`, hoặc `null`. Response `200` trả hồ sơ cập nhật; lỗi dữ liệu trả `400`, token hết hạn trả `401`.

Response `200`: trả hồ sơ mới nhất. Backend phải bỏ qua/từ chối mọi trường định danh nếu client cố gửi thêm.

### GET `/users/{code}`

Lấy hồ sơ công khai theo mã user. Trả các trường được phép xem, ví dụ:

```json
{
  "code": "SV000245",
  "displayName": "Trần Gia Huy",
  "role": "Student",
  "schoolName": "Công nghệ",
  "major": "Kỹ thuật phần mềm",
  "avatarUrl": null,
  "bio": "Xin chào!",
  "followerCount": 10,
  "postCount": 4
}
```

Không trả `id` user. Backend quyết định các trường hồ sơ được phép công khai. Thành công `200`, chưa đăng nhập `401`, không tìm thấy `404`.

### GET `/users/{code}/posts?page=1&pageSize=20`

Trả danh sách bài viết của user được xem; dùng cấu trúc phân trang chung. Bài riêng tư chỉ được trả khi người gọi có quyền xem. Thành công `200`; người xem không có quyền nhận `403` hoặc chỉ nhận bài công khai theo chính sách Backend.

### PUT `/users/me/avatar`

Tải ảnh đại diện bằng multipart với một trường `avatar` kiểu File; tối đa 5 MiB, JPEG/PNG/WebP. Không tự đặt `Content-Type`. Response `200` trả hồ sơ cập nhật, gồm `code` và `avatarUrl`. Backend kiểm tra lại nội dung file và quyền cập nhật; dùng `400`/`413`/`415` cho file sai dữ liệu/quá lớn/sai loại.

## 6. Người dùng, tìm kiếm, theo dõi

### GET `/users/search?q={keyword}&page=1&pageSize=20`

Tìm theo họ tên hoặc mã sinh viên/giảng viên. Không tìm kiếm bài viết.

Response:

```json
[
  {
    "code": "SV000245",
    "displayName": "Trần Gia Huy",
    "avatarUrl": null,
    "schoolName": "Công nghệ",
    "isFollowing": false
  }
]
```

Frontend hiện không gửi `page`/`pageSize`; mã client chấp nhận mảng trực tiếp hoặc object `{ "items": [...] }`. Backend có thể áp dụng giới hạn mặc định. Thành công `200`, cần JWT `401`.

Quy tắc tên hiển thị:
- Nếu người dùng bật nickname, `displayName` trả nickname.
- Nếu không bật, `displayName` trả họ tên thật.
- Tên thật chỉ hiển thị trong trang hồ sơ theo quy tắc quyền riêng tư mà sản phẩm thống nhất.

### POST `/users/{code}/follow`
Theo dõi người dùng. Response `201` hoặc `200`.

### DELETE `/users/{code}/follow`
Bỏ theo dõi. Response `204`.

### GET `/users/{code}/followers?page=1&pageSize=20`
### GET `/users/{code}/following?page=1&pageSize=20`

`{code}` là mã sinh viên/giảng viên của user cần xem. Response danh sách user phải dùng trường `code`, không dùng `id`.

## 7. Bài viết công khai

### GET `/posts/feed`

Chỉ trả bài viết thuộc bảng tin công khai. Không trộn bài đăng trong group, chợ, ghép đôi, tìm bạn đi chơi hoặc tìm bạn học.
Frontend hiện không gửi tham số phân trang; client chấp nhận mảng trực tiếp hoặc object `{ "items": [...] }`.
Frontend gọi endpoint sau đăng nhập; lỗi tải được hiển thị trên feed cùng nút thử lại. Thành công `200`, chưa đăng nhập `401`.

### POST `/posts`

Tạo bài chỉ có văn bản: `Content-Type: application/json`.

```json
{
  "content": "Nội dung bài viết",
  "visibility": "Public"
}
```

Giá trị `visibility`: `Public` hoặc `Anonymous`.

Nếu `Anonymous`, Backend không được trả mã user (`code`), tên, avatar hoặc thông tin nào có thể lần ngược danh tính người đăng trong API công khai.

Nếu có ảnh hoặc video, Frontend gửi `multipart/form-data` tới cùng endpoint; không đặt header `Content-Type` thủ công:

| Tên trường FormData | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `content` | string | Có khi JSON; multipart có thể rỗng nếu có media | Nội dung bài viết |
| `visibility` | string | Có | `Public` hoặc `Anonymous` |
| `images` | File, lặp nhiều lần | Không | Tối đa 5 ảnh, mỗi ảnh tối đa 8 MiB; JPEG, PNG, WebP hoặc GIF |
| `videos` | File, tối đa một lần | Không | Tối đa 1 video, tối đa 50 MiB; MP4 hoặc WebM |

Frontend cho phép bài chỉ văn bản, văn bản + media, hoặc media không có văn bản; giao diện preview cho phép bỏ từng ảnh/video trước khi gửi. Khi gửi media, Frontend hiển thị trạng thái tải lên, không phải phần trăm tiến trình. Backend phải kiểm tra lại số lượng, loại, dung lượng và nội dung thực tế; lưu file ngoài dữ liệu JSON và trả URL cùng thông tin file.
Response thành công `201`; dữ liệu sai `400`, chưa đăng nhập `401`, vượt dung lượng `413`, loại file không hỗ trợ `415`.

Response `201`:

```json
{
  "id": 101,
  "content": "Nội dung bài viết",
  "visibility": "Public",
  "author": {
    "code": "SV000001",
    "displayName": "Nguyễn Minh Anh",
    "avatarUrl": null
  },
  "images": [
    {
      "id": 501,
      "url": "https://files.example.edu/posts/101/photo-1.webp",
      "fileName": "photo-1.webp",
      "contentType": "image/webp",
      "sizeBytes": 245120
    }
  ],
  "videos": [
    {
      "id": 502,
      "url": "https://files.example.edu/posts/101/clip.mp4",
      "fileName": "clip.mp4",
      "contentType": "video/mp4",
      "sizeBytes": 8388608
    }
  ],
  "createdAt": "2026-11-23T15:30:00Z",
  "likeCount": 0,
  "commentCount": 0,
  "isLikedByCurrentUser": false,
  "isOwnedByCurrentUser": true
}
```

`images` và `videos` có thể là mảng rỗng. Giữ nguyên `images` để tương thích dữ liệu Frontend cũ; có thể trả riêng `videos` hoặc trả mảng `media` thống nhất, trong đó từng phần tử phải có `contentType` hoặc `fileName` để Frontend nhận diện ảnh/video. Ảnh/video dùng URL, không dùng Base64. Backend cấp URL truy cập được bởi người có quyền xem nội dung. Với nội dung cần bảo vệ, ưu tiên URL ký có thời hạn; Frontend phát media bằng URL đó trực tiếp.

Video phải có URL trình duyệt truy cập được, HTTP `Content-Type` đúng (`video/mp4` hoặc `video/webm`) và hỗ trợ HTTP Range (`Accept-Ranges: bytes`, phản hồi `206 Partial Content` cho yêu cầu Range) để trình phát HTML5 tua được. Nếu URL ký hết hạn, Backend cần trả URL mới khi tải lại bài viết. Backend CORS phải cho phép origin Frontend và các header Range cần thiết.

Với bài ẩn danh, `author` phải là `null` hoặc object không chứa thông tin định danh. Mọi response post nên có `isOwnedByCurrentUser` boolean do Backend tính theo JWT; trường này cho phép chủ bài ẩn danh sửa/xóa mà không tiết lộ danh tính cho người xem khác. Không tin trường này để phân quyền ở Backend.

### GET `/posts/{postId}`

Trả một bài viết theo cùng cấu trúc response tạo bài; Backend chỉ trả bài mà người gọi có quyền xem.

### PUT `/posts/{postId}`

Request sửa:

```json
{
  "content": "Nội dung đã chỉnh sửa"
}
```

Chỉ chủ bài viết được sửa.
Response `200`; lỗi `400`/`401`/`403`/`404` theo dữ liệu, đăng nhập, quyền sở hữu và tài nguyên.

### DELETE `/posts/{postId}`

Chỉ chủ bài viết hoặc quản trị viên có quyền mới được xóa.
Response `204`; các lỗi quyền/tài nguyên dùng `401`/`403`/`404`.

### POST `/posts/{postId}/likes`
Thích bài viết. Response `200` hoặc `201`, JSON `{ "isLikedByCurrentUser": true, "likeCount": 13 }`. Backend tránh tạo like trùng khi người dùng gửi lặp request.

### DELETE `/posts/{postId}/likes`
Bỏ thích. Response `200` JSON `{ "isLikedByCurrentUser": false, "likeCount": 12 }`, hoặc `204`; nếu trả `204`, Frontend tự cập nhật số đếm.

### GET `/posts/{postId}/comments?page=1&pageSize=50`

Trả danh sách comment đã phân trang. Mỗi comment dùng `parentCommentId` để liên kết câu trả lời với comment cha; Frontend dựng cây trả lời từ danh sách phẳng.

```json
{
  "items": [
    {
      "id": 701,
      "postId": 101,
      "parentCommentId": null,
      "content": "Bài viết rất hữu ích!",
      "author": {
        "code": "SV000245",
        "displayName": "Trần Gia Huy",
        "avatarUrl": null
      },
      "createdAt": "2026-11-23T15:35:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### POST `/posts/{postId}/comments`

```json
{
  "content": "Bình luận của tôi",
  "parentCommentId": null
}
```

Để trả lời comment, đặt `parentCommentId` bằng ID comment cha; comment gốc gửi `null`. Response `201` trả comment vừa tạo theo cấu trúc trong danh sách.

Nếu đính kèm ảnh/video, dùng cùng endpoint với `multipart/form-data` (trình duyệt tự tạo boundary). Các trường `content` (chuỗi, có thể rỗng), `parentCommentId` (ID comment cha dạng chuỗi; gửi chuỗi rỗng nếu là comment gốc), `images` (0-5 file lặp lại, JPEG/PNG/WebP/GIF tối đa 8 MiB mỗi ảnh), `videos` (0-1 file MP4/WebM tối đa 50 MiB). Giới hạn này được kiểm tra ở Frontend và phải được xác minh lại ở Backend. Khi không có media, Frontend giữ request JSON ban đầu với `parentCommentId: null` cho comment gốc.

Response `201` trả comment như mẫu trên và có `images` cùng `videos` (hoặc `media` thống nhất có `contentType`, `url`, `fileName`, `sizeBytes`). Frontend dựng preview trước khi gửi, có thể bỏ từng tệp, và hiển thị media trong comment sau khi nhận response. Backend trả `400` cho trường/parent sai, `401` nếu thiếu JWT, `403` nếu không có quyền bình luận, `404` nếu bài/comment cha không tồn tại, `413` nếu tệp quá lớn, `415` nếu loại không hỗ trợ. Backend chỉ nhận `parentCommentId` thuộc đúng bài viết.

### DELETE `/comments/{commentId}`

Chỉ chủ bình luận hoặc người có quyền quản trị phù hợp mới được xóa. Response `204`. Khi xóa comment cha, Backend cần xóa cả các comment con để khớp với giao diện; Backend cập nhật `commentCount`, Frontend giảm số đếm theo tổng comment vừa xóa.

### PUT `/comments/{commentId}` (contract tùy chọn)

Request `{ "content": "Nội dung đã sửa" }`. Chỉ chủ comment được sửa; Response `200` trả comment đã cập nhật. Frontend hiện chưa có thao tác sửa comment.

### POST `/posts/{postId}/shares`

```json
{ "caption": "Chia sẻ bài viết này" }
```

### DELETE `/shares/{shareId}`

Chia sẻ nên tạo bản ghi tham chiếu tới bài viết gốc, không nhân bản nội dung gốc. Kiểm tra quyền xem bài gốc trước khi trả nội dung được chia sẻ.

## 8. Tám nhóm đơn vị trực thuộc

Danh sách nhóm:
1. Khoa học Máy tính
2. Công nghệ
3. Y Dược
4. Kinh tế
5. Ngôn ngữ - Xã hội Nhân văn
6. Đào tạo Quốc tế
7. Du lịch
8. Đoàn Quản lý Nam Khê

### GET `/groups?page=1&pageSize=50`

Trả object phân trang với `items` gồm:

```json
{
  "items": [
    {
      "id": 12,
      "name": "Khoa học Máy tính",
      "description": "Không gian sinh viên khoa",
      "schoolName": "Khoa học Máy tính",
      "memberCount": 120,
      "isMember": true,
      "canPost": true
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 8
}
```

`id` là ID nhóm, được giữ nguyên và không phải định danh user.

### GET `/groups/{groupId}`

Trả thông tin chi tiết nhóm theo cùng cấu trúc một phần tử GET `/groups`.

### POST `/groups/{groupId}/members`

Tham gia nhóm hiện có quyền tham gia. Body rỗng; Response `200` gồm `{ "isMember": true, "memberCount": 121 }`. Backend tự xác định user từ JWT và `code`.

### GET `/groups/{groupId}/posts?page=1&pageSize=20`

Lấy bài viết trong nhóm hiện tại. Response phân trang, mỗi bài dùng `id` riêng và có thêm `groupId`, `author.code`, `content`, `createdAt`:

```json
{
  "items": [
    {
      "id": 3101,
      "groupId": 12,
      "content": "Nội dung bài đăng trong nhóm",
      "author": { "code": "SV000245", "displayName": "Trần Gia Huy", "avatarUrl": null },
      "createdAt": "2026-11-23T15:30:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### POST `/groups/{groupId}/posts`

```json
{ "content": "Nội dung bài viết trong nhóm" }
```

Frontend hiện đăng bài nhóm dạng văn bản bằng JSON. Response `201` trả bài vừa tạo theo cấu trúc ví dụ ở GET nhóm. Frontend chỉ hiển thị và đăng bài nhóm; chưa bật tải ảnh nhóm. Gửi sai nội dung trả `400`; chưa đăng nhập trả `401`; không có quyền trả `403`; nhóm không tồn tại trả `404`.

### PUT `/groups/{groupId}/posts/{postId}`
### DELETE `/groups/{groupId}/posts/{postId}`

**Quy tắc phân quyền bắt buộc:**
- Backend lấy `schoolId` từ tài khoản đã xác thực.
- Backend lấy `schoolId` của group.
- Nếu hai ID không trùng, trả `403` với message chính xác: `Bạn không thuộc đơn vị trực thuộc này`.
- Không nhận `schoolId` người dùng gửi lên làm căn cứ phân quyền.
- Bài group không xuất hiện trong bảng tin public và không xuất hiện ở group khác.
- Trong trang cá nhân có thể hiển thị bài group mà người xem có quyền xem; nếu không có quyền thì không làm lộ nội dung.
- Frontend chỉ hiển thị nút đăng bài khi API trả `canPost: true`; Backend vẫn phải xác minh quyền khi nhận request.
- Lỗi tham gia/đọc/đăng bài cần dùng các status `401`, `403`, `404` hoặc `400` theo mục 4.4 và trả JSON lỗi thống nhất.

## 9. Chợ xDTU – Pass đồ và mua bán

Đây là không gian độc lập, không trộn vào feed công khai hoặc group.

### GET `/market/listings?page=1&pageSize=20`
### POST `/market/listings`

```json
{
  "title": "Giáo trình lập trình C#",
  "description": "Sách còn mới",
  "price": 50000,
  "condition": "Used",
  "imageUrls": []
}
```

### GET `/market/listings/{listingId}`
### PUT `/market/listings/{listingId}`
### DELETE `/market/listings/{listingId}`

Chỉ chủ tin đăng được sửa/xóa.

### POST `/market/listings/{listingId}/purchase-requests`

Người mua bấm nút mua. Backend tạo yêu cầu mua và gửi thông báo cho người bán.

```json
{ "message": "Tôi muốn mua sản phẩm này" }
```

### GET `/market/sale-requests/inbox`
Người bán xem các yêu cầu mua của mình. Response phải có thông tin người mua theo quyền cho phép: tên hiển thị, mã, avatar và thông tin liên hệ mà người mua đồng ý cung cấp.

### POST `/market/sale-requests/{requestId}/accept`

Người bán xác nhận bán:
- Chuyển tin đăng sang `Sold`.
- Tạo thông báo cho người mua.
- Từ chối hoặc vô hiệu hóa các yêu cầu mua còn lại.
- Không cho tạo yêu cầu mua mới với tin đã bán.

Trạng thái listing: `Available`, `Sold`, `Hidden`.
Trạng thái yêu cầu mua: `Pending`, `Accepted`, `Rejected`, `Cancelled`.

Cần dùng transaction ở Backend để tránh hai người bán/luồng xử lý xác nhận bán cùng một tin đồng thời.

## 10. Ghép đôi

Không gian riêng, không đưa bài lên feed public.

### GET `/matching/posts?page=1&pageSize=20`
### POST `/matching/posts`

```json
{
  "content": "Mình muốn tìm hiểu và kết nối với một người bạn...",
  "preferences": "Sở thích hoặc tiêu chí tự nguyện chia sẻ"
}
```

### PUT `/matching/posts/{postId}`
### DELETE `/matching/posts/{postId}`

### POST `/matching/posts/{postId}/requests`
Người khác gửi lời đề nghị ghép đôi.

### GET `/matching/requests/inbox`
Chủ bài xem danh sách người gửi lời đề nghị.

### POST `/matching/requests/{requestId}/accept`
Chủ bài đồng ý. Backend:
- Đánh dấu cặp ghép đôi đã được chấp nhận.
- Đánh dấu bài đăng đã ghép đôi/đóng.
- Ngăn yêu cầu mới vào bài đó.
- Gửi thông báo cho người gửi yêu cầu.

Trạng thái bài: `Open`, `Matched`, `Closed`.
Trạng thái yêu cầu: `Pending`, `Accepted`, `Rejected`, `Cancelled`.

## 11. Tìm bạn đi chơi và tìm bạn học

Hai chức năng có luồng tương tự ghép đôi nhưng cần phân biệt loại bài đăng và dữ liệu riêng.

### Tìm bạn đi chơi
- `GET /hangout/posts`
- `POST /hangout/posts`
- `GET /hangout/posts/{postId}`
- `PUT /hangout/posts/{postId}`
- `DELETE /hangout/posts/{postId}`
- `POST /hangout/posts/{postId}/requests`
- `GET /hangout/requests/inbox`
- `POST /hangout/requests/{requestId}/accept`

Request tạo bài:

```json
{
  "title": "Tìm bạn đi cà phê cuối tuần",
  "content": "Mình muốn tìm 1-2 bạn...",
  "location": "Hải Châu, Đà Nẵng",
  "plannedAt": "2026-11-28T08:00:00+07:00",
  "maxPeople": 3
}
```

### Tìm bạn học
- `GET /study-partners/posts`
- `POST /study-partners/posts`
- `GET /study-partners/posts/{postId}`
- `PUT /study-partners/posts/{postId}`
- `DELETE /study-partners/posts/{postId}`
- `POST /study-partners/posts/{postId}/requests`
- `GET /study-partners/requests/inbox`
- `POST /study-partners/requests/{requestId}/accept`

Request tạo bài:

```json
{
  "title": "Tìm bạn học C#",
  "content": "Mình muốn học cùng và trao đổi bài tập...",
  "subject": "Lập trình C#",
  "studyMode": "Offline",
  "location": "Đại học Duy Tân"
}
```

Nên dùng bảng dữ liệu riêng hoặc một mô hình dùng chung có `postType` rõ ràng; không trộn dữ liệu hai khu vực trong feed public.

## 12. Thông báo

### GET `/notifications?page=1&pageSize=20`
### GET `/notifications/unread-count`
### PATCH `/notifications/{notificationId}/read`

Response mẫu:

```json
{
  "id": 9001,
  "type": "MarketPurchaseRequest",
  "title": "Có người muốn mua sản phẩm của bạn",
  "message": "Một người dùng đã gửi yêu cầu mua.",
  "isRead": false,
  "createdAt": "2026-11-23T15:30:00Z",
  "referenceId": 501
}
```

Các loại thông báo có thể gồm:
- Follow
- Like
- Comment
- Share
- MarketPurchaseRequest
- MarketSaleAccepted
- MatchingRequest
- MatchingAccepted
- HangoutRequest
- StudyPartnerRequest
- Message

Không đưa dữ liệu nhạy cảm vào nội dung thông báo nếu người nhận chưa có quyền xem.

## 13. Nhắn tin bằng REST API

Chat cá nhân dùng REST API và polling; không yêu cầu SignalR/WebSocket. Tất cả endpoint dưới đây yêu cầu JWT và kiểm tra thành viên hội thoại.

### GET `/conversations?page=1&pageSize=50`

Frontend hiện tìm kiếm cuộc trò chuyện ở phía trình duyệt trong danh sách đã tải; request hiện tại không gửi `q`. Response là object phân trang:

```json
{
  "items": [
    {
      "id": 301,
      "otherUser": {
        "code": "SV000245",
        "displayName": "Trần Gia Huy",
        "avatarUrl": null
      },
      "lastMessage": {
        "id": 901,
        "content": "Chào bạn!",
        "messageType": "Text",
        "createdAt": "2026-11-24T05:30:00Z"
      },
      "unreadCount": 0
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

`conversation.id` và `lastMessage.id` là ID riêng, không phải ID user.

### POST `/conversations`

Tạo hoặc lấy hội thoại cá nhân với user được định danh bằng `code`.

```json
{ "code": "SV000245" }
```

Response `200` hoặc `201`: trả conversation theo cấu trúc GET. Backend xác định người gọi từ JWT, không nhận `senderCode` hoặc ID user trong body; người chưa đăng nhập nhận `401`, người nhận không hợp lệ nhận `400`/`404`.

### GET `/conversations/{conversationId}/messages?page=1&pageSize=50`

Trả lịch sử theo thứ tự thời gian tăng dần. Mỗi message:

```json
{
  "id": 902,
  "conversationId": 301,
  "sender": {
    "code": "SV000245",
    "displayName": "Trần Gia Huy",
    "avatarUrl": null
  },
  "content": "Chào bạn!",
  "messageType": "Text",
  "attachment": null,
  "createdAt": "2026-11-24T05:30:00Z",
  "status": "Read"
}
```

Response danh sách dùng `{ "items": [], "page": 1, "pageSize": 30, "total": 0 }`. `status` có thể là `Sent`, `Delivered`, `Read`; nếu Backend không hỗ trợ trạng thái, có thể bỏ trường này.

### GET `/conversations/{conversationId}/messages?afterMessageId={messageId}`

Dùng polling lấy tin mới hơn message ID đã nhận gần nhất. Response `{ "items": [ ... ] }`, cùng cấu trúc từng message ở trên. Frontend gọi khoảng 5 giây/lần khi hội thoại đang mở và tab đang hiển thị; Backend nên trả `items: []` khi chưa có tin mới. Nếu chưa có tin nhắn nào, Frontend gửi `afterMessageId=0` để lấy tin đầu tiên.

### POST `/conversations/{conversationId}/messages`

Tin nhắn văn bản gửi JSON:

```json
{
  "content": "Chào bạn!",
  "messageType": "Text"
}
```

Response `201`: message hoàn chỉnh theo mẫu message ở trên.

#### Gửi file đính kèm

Dùng cùng endpoint với `multipart/form-data`; trình duyệt tự đặt boundary:

| Tên trường FormData | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `file` | File | Có | Một ảnh hoặc tệp đính kèm |
| `content` | string | Không | Chú thích đi kèm |

Giới hạn Frontend: một tệp mỗi tin nhắn. Cho phép JPEG, PNG, GIF, WebP, video MP4/WebM, PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV và ZIP. Video tối đa 50 MiB; mọi loại tệp khác tối đa 10 MiB. Frontend kiểm tra phần mở rộng, MIME nếu trình duyệt cung cấp và dung lượng; Backend vẫn phải xác minh nội dung thực tế/signature, quyền truy cập và lưu file an toàn. Preview ảnh/video có thể bỏ trước khi gửi; tài liệu hiển thị tên, MIME và dung lượng. Sau khi gửi, ảnh hiển thị trong hội thoại, video dùng HTML5 controls và mọi attachment có nút tải xuống.

Response `201` trả message có:

```json
{
  "id": 903,
  "conversationId": 301,
  "sender": {
    "code": "SV000001",
    "displayName": "Nguyễn Minh Anh",
    "avatarUrl": null
  },
  "content": "",
  "messageType": "File",
  "attachment": {
    "id": 6501,
    "fileName": "tai-lieu.pdf",
    "contentType": "application/pdf",
    "sizeBytes": 524288,
    "url": "https://files.example.edu/signed/temporary-file-url"
  },
  "createdAt": "2026-11-24T05:35:00Z",
  "status": "Sent"
}
```

`messageType` là `Image` cho ảnh, `File` cho video/tài liệu, hoặc `Text`. `attachment.url` phải là URL có quyền truy cập phù hợp; ảnh/video phát trực tiếp bằng thẻ HTML, vì vậy URL cần là URL ký có thời hạn (hoặc URL được bảo vệ tương đương) mà trình duyệt truy cập được mà không cần tự thêm Bearer header. Không đặt JWT vào query string. Endpoint tải xuống bên dưới luôn dùng JWT Bearer và trả Blob. Không trả file dạng Base64.

Video attachment cũng cần trả `contentType: video/mp4` hoặc `video/webm`; URL phải hỗ trợ HTTP Range/`206 Partial Content` để tua được. Với mọi attachment, Backend phải kiểm tra hội thoại, thành viên, dung lượng, MIME thật, tên file và quyền đọc/tải. Lỗi dùng `400`, `401`, `403`, `404`, `413`, `415` tương ứng.
Lỗi file sai định dạng trả `415`, file quá lớn trả `413`; người không thuộc hội thoại nhận `403`, hội thoại không tồn tại nhận `404`.

### GET `/messages/{messageId}/attachment`

Tải file binary, yêu cầu JWT Bearer. Thành công `200`, trả đúng `Content-Type` và `Content-Disposition: attachment; filename=...`. Frontend gọi bằng Fetch kèm JWT rồi tạo download từ Blob; không dùng Base64. Backend chỉ cho thành viên hội thoại tải file (`401`/`403`/`404` khi không hợp lệ). CORS cần expose header `Content-Disposition` để Frontend đọc tên file:

```http
Access-Control-Expose-Headers: Content-Disposition
```

Video playback có thể gọi URL ký trực tiếp từ `<video>`; URL đó cần hỗ trợ `Range`, trả `206` với `Content-Range` khi có yêu cầu, và giữ đúng `Content-Type`. API download có JWT vẫn là luồng tải file chính thức và không được thay bằng URL công khai.

### PUT `/messages/{messageId}`

Sửa tin nhắn văn bản của chính mình:

```json
{ "content": "Nội dung đã sửa" }
```

### DELETE `/messages/{messageId}`

Xóa tin nhắn theo quyền Backend; Response `204`.

### PATCH `/conversations/{conversationId}/read`

Đánh dấu hội thoại đã đọc; Response `204`.

## 14. Phân quyền Backend – các điểm không được bỏ qua

| Nghiệp vụ | Quy tắc bắt buộc |
|---|---|
| Hồ sơ | Không cho sửa dữ liệu gốc từ nhà trường |
| Bài viết | Chỉ chủ bài hoặc admin có quyền mới sửa/xóa |
| Ẩn danh | Không trả danh tính tác giả trong API công khai |
| Group | Chỉ thành viên đúng đơn vị được đọc/đăng |
| Theo dõi | Không cho tự theo dõi chính mình nếu không muốn hỗ trợ |
| Chợ | Chỉ chủ tin xác nhận bán; tin Sold không nhận yêu cầu mới |
| Ghép đôi | Chỉ chủ bài được chấp nhận yêu cầu |
| Tin nhắn | Chỉ thành viên hội thoại được đọc/gửi |
| Thông báo | Chỉ người nhận được đọc thông báo |

## 15. CORS

Nếu chạy Frontend bằng Live Server, origin thường là `http://127.0.0.1:5500` hoặc `http://localhost:5500`. Hãy cấu hình đúng origin thực tế đang hiện trên thanh địa chỉ trình duyệt.

Ví dụ trong ASP.NET Core:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Disposition", "Accept-Ranges", "Content-Range");
    });
});

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
```

Thứ tự middleware cần phù hợp với cấu hình ứng dụng. Khi deploy, thay origin local bằng domain Frontend thật.

## 16. Lộ trình ưu tiên 5 ngày

Đây là thứ tự ưu tiên đề xuất để một người có thể tập trung vào các luồng cần thiết trước. Backend chưa được triển khai hoặc kiểm chứng trong workspace này.

### Ngày 1 – Đăng nhập, JWT và dữ liệu người dùng
- Cấu hình ASP.NET Core, SQL Server, CORS và JWT.
- Hoàn thiện `POST /auth/login`, `GET /users/me`, sửa hồ sơ và tìm kiếm theo `code`.
- Xác nhận không có API nào dùng `id` làm khóa user.

### Ngày 2 – Bài viết và bình luận
- CRUD bài public, ảnh multipart, ẩn danh, like/unlike, comment/reply/delete.
- Kiểm tra quyền sở hữu và cập nhật số đếm.
- Kiểm tra upload file sai loại/quá dung lượng.

### Ngày 3 – Chat và file
- Conversation, lịch sử tin nhắn, gửi/nhận text, polling.
- Upload/download ảnh, video (50 MiB) và tài liệu (10 MiB), quyền thành viên hội thoại.
- Kiểm tra trạng thái tin nhắn nếu Backend hỗ trợ.

### Ngày 4 – Nhóm và hồ sơ
- Danh sách/chi tiết/tham gia nhóm, đọc và đăng bài nhóm.
- Hồ sơ công khai/cá nhân, cập nhật profile, avatar, bài viết theo `code`.
- Kiểm tra 403 khi truy cập sai đơn vị.

### Ngày 5 – Tích hợp và nghiệm thu
- Kiểm thử các luồng Frontend thật với Backend và tài khoản Student/Lecturer.
- Kiểm tra lỗi 400/401/403/404/413/415 và CORS.
- Chốt README theo API và response thực tế. Những mục chợ, ghép đôi, tìm bạn và thông báo hiện chưa có luồng dữ liệu hoàn chỉnh, có thể để sau khi luồng cốt lõi ổn định.

## 17. Kiểm thử tích hợp Frontend – Backend

- [ ] Đăng nhập đúng mã và mật khẩu.
- [ ] Đăng nhập sai trả 401.
- [ ] Tài khoản Student và Lecturer đều dùng chung màn hình đăng nhập.
- [ ] Hồ sơ tự điền đúng dữ liệu nguồn.
- [ ] API không cho sửa mã, họ tên, đơn vị, ngành học gốc.
- [ ] Tìm kiếm theo tên và mã.
- [ ] Đăng/sửa/xóa bài public.
- [ ] Đăng bài văn bản, 1–5 ảnh, tối đa 1 video; preview/xóa media; ảnh sai loại/quá 8 MiB hoặc video sai loại/quá 50 MiB bị từ chối.
- [ ] Bài viết hiển thị đúng ảnh/video trong feed và hồ sơ; video có controls, tua được và không tự phát.
- [ ] Like/unlike và comment; nút share vẫn placeholder, không kiểm thử như một chức năng hoạt động.
- [ ] Trả lời và xóa comment; xác nhận số comment cập nhật chính xác.
- [ ] Bình luận gửi ảnh/video, preview/xóa trước khi gửi, xem media sau khi gửi.
- [ ] Bài ẩn danh không lộ tác giả.
- [ ] Tải avatar; multipart có boundary do trình duyệt tự thiết lập.
- [ ] Người khác đơn vị nhận 403 và đúng thông báo.
- [ ] Group không bị trộn với feed public.
- [ ] Tham gia nhóm đủ điều kiện, đọc và đăng bài nhóm.
- [ ] Tin đã bán không thể mua tiếp.
- [ ] Chỉ chủ bài có thể chấp nhận yêu cầu ghép đôi.
- [ ] Chỉ thành viên hội thoại đọc được tin nhắn.
- [ ] Bắt đầu hội thoại từ hồ sơ, tìm conversation, gửi text và nhận tin qua polling.
- [ ] Upload/download ảnh, video và tài liệu cho phép; từ chối sai loại, ảnh/tài liệu >10 MiB hoặc video >50 MiB.
- [ ] Video stream trả đúng MIME, hỗ trợ Range/206 và URL playback hợp lệ; download attachment cần JWT.
- [ ] Người dùng chỉ xem được thông báo của chính mình.

## 18. Cấu trúc thư mục

```text
xDTU-Frontend/
│
├── index.html
├── README.md
│
├── assets/
│   └── logo.webp
│
├── css/
│   └── style.css
│
└── js/
    ├── api.js
    └── app.js
```

| File | Vai trò |
|---|---|
| `index.html` | Khung ứng dụng, màn hình đăng nhập, sidebar/header, vùng render trang, toast và các ID hook được JavaScript sử dụng. |
| `css/style.css` | Theme xDTU, thành phần giao diện, media preview/player, modal, chat và các breakpoint responsive. |
| `js/api.js` | REST API client: Base URL, JWT Bearer, JSON/FormData, xử lý lỗi HTTP và tải Blob. |
| `js/app.js` | State, dữ liệu demo, render trang, sự kiện UI, xác thực dữ liệu, các luồng bài viết/bình luận/chat/nhóm/hồ sơ và call-site API. |
| `assets/logo.webp` | Logo/nhận diện xDTU. |
| `README.md` | Hướng dẫn chạy Frontend và hợp đồng API đề xuất cho Backend. |

## 19. Trạng thái chức năng Frontend

| Khu vực | Trạng thái hiện tại |
|---|---|
| Đăng nhập/đăng xuất | Có chế độ demo mặc định; API login và lấy hồ sơ được định nghĩa, chưa thể thử với Backend. |
| Bảng tin/bài viết | Demo và call-site API cho tạo text/ảnh/video, preview/xóa media, xem ảnh lớn, HTML5 video, sửa/xóa bài của mình, like/unlike, công khai/ẩn danh. |
| Bình luận | Demo và call-site API cho danh sách, trả lời lồng nhau, tạo/xóa comment và đính kèm ảnh/video; API chưa được Backend xác minh. |
| Chat cá nhân | Demo và call-site API cho danh sách/tìm hội thoại, lịch sử, gửi text/ảnh/video/tài liệu, polling, preview, tải Blob có JWT. |
| Nhóm | Demo và call-site API cho danh sách, chi tiết, tham gia, đọc/đăng bài văn bản trong nhóm. |
| Hồ sơ/tìm kiếm | Demo và call-site API cho xem hồ sơ theo `code`, danh sách bài, sửa thông tin, đổi avatar và tìm kiếm user. |
| Chợ, ghép đôi, tìm bạn, thông báo | Hiện là giao diện/placeholder; chưa có luồng dữ liệu hoàn chỉnh trong Frontend. |

`demo: true` đang bật trong `js/app.js`, vì vậy dữ liệu thay đổi chỉ ở bộ nhớ trình duyệt và không lưu lên Backend. Chuyển sang `demo: false` chỉ khi Backend đã triển khai đúng contract và bạn đã chỉnh Base URL trong `js/api.js`.

README là hợp đồng API đề xuất, không phải bằng chứng rằng các endpoint hoạt động. Chưa có Backend trong workspace, nên không thể xác nhận request/response, JWT, CORS hay lưu trữ file thực tế.

**Không được coi bản demo là hệ thống hoàn chỉnh hoặc dùng dữ liệu demo khi thi chính thức.**

### Cập nhật định danh người dùng

Các đối tượng user trong Frontend và contract dùng `code` làm khóa định danh; không dùng `user.id` hoặc `author.id`. ID của bài viết, nhóm, bình luận, tin nhắn và hội thoại vẫn là các ID riêng, không thay bằng `code`.

## 20. Giao diện sau Giai đoạn 2

- Giao diện sử dụng nền sáng, card trắng, chữ tối và màu đỏ xDTU làm điểm nhấn; sidebar giữ tông tối để phân biệt vùng điều hướng.
- Bố cục tự thay đổi theo màn hình: sidebar dọc trên desktop, thanh điều hướng cuộn ngang ở cạnh dưới trên điện thoại; right rail được ẩn ở màn hình hẹp.
- Form, nút, card bài viết, hồ sơ, nhóm, modal, toast và trạng thái rỗng dùng chung hệ màu, khoảng cách và kiểu bo góc.
- Có focus hiển thị rõ cho thao tác bàn phím, nhãn hỗ trợ đọc màn hình cho ô tìm kiếm và hỗ trợ `prefers-reduced-motion`.
- `style.css` có kiểu `loading-state`, `error-state`, preview ảnh/video/file, comment, chat và layout responsive; JavaScript hiện sử dụng trạng thái tải/lỗi ở các luồng đã kết nối API.
- Giữ nguyên logo xDTU, cấu trúc HTML/CSS/JavaScript thuần và các ID của đối tượng không phải user. Các luồng mới có call-site API được mô tả ở các mục tương ứng; Backend vẫn do bạn triển khai.

## 21. Hoàn thiện media và biểu tượng

- Bài viết hỗ trợ văn bản, tối đa 5 ảnh JPEG/PNG/WebP/GIF (8 MiB mỗi ảnh) và tối đa 1 video MP4/WebM (50 MiB). Composer cho xem trước và bỏ từng tệp; khi upload có trạng thái đang tải. Video hiển thị bằng `<video controls playsinline preload="metadata">`, không autoplay.
- Bình luận/trả lời giữ nguyên luồng hiện tại và bổ sung multipart ảnh/video theo giới hạn bài viết. Tệp được hiển thị trong comment sau khi tạo; chỉ chủ comment thấy nút xóa.
- Chat một tệp mỗi tin nhắn: ảnh và tài liệu tối đa 10 MiB; video MP4/WebM tối đa 50 MiB. Gửi upload bằng `FormData`, tải xuống bằng endpoint có JWT và Blob. Polling/lịch sử vẫn dùng các endpoint hiện tại.
- Mọi icon chức năng được render bằng SVG outline inline qua helper `icon()` trong `js/app.js` hoặc SVG inline trong `index.html`; không cần tải icon từ CDN. Emoji trong nội dung bài demo là nội dung văn bản, không phải icon điều khiển.
- Chợ, ghép đôi, tìm bạn, thông báo và chia sẻ vẫn là placeholder; các nút chưa có luồng thực tế bị disable hoặc chỉ hiển thị trạng thái rỗng. Không coi chúng là chức năng đã triển khai.
- Các thay đổi trên mới được kiểm tra tĩnh và bằng luồng demo nếu có thể; chưa có Backend để xác nhận tích hợp thật. Trình duyệt thực tế cần được kiểm tra riêng trước khi triển khai.
