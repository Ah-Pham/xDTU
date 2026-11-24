# xDTU – Frontend & REST API Contract

> Mạng xã hội dành cho cộng đồng Đại học Duy Tân. Frontend sử dụng HTML, CSS, JavaScript thuần; Backend do bạn xây dựng bằng C# ASP.NET Core Web API và SQL Server.

## 1. Mục tiêu và nguyên tắc phối hợp

- Frontend chịu trách nhiệm hiển thị giao diện, lấy dữ liệu và gửi yêu cầu HTTP.
- Backend chịu trách nhiệm xác thực, phân quyền, kiểm tra dữ liệu, nghiệp vụ, truy vấn SQL Server và lưu trữ.
- Không xem việc ẩn nút ở Frontend là bảo mật. Mọi quyền phải được kiểm tra lại ở Backend.
- Các thông tin hồ sơ được đồng bộ từ dữ liệu sinh viên/giảng viên phải được Backend bảo vệ, không cho phép sửa qua API hồ sơ.
- Mỗi người chỉ thuộc một đơn vị trực thuộc. Backend phải xác định đơn vị từ dữ liệu chính thức, không tin `schoolId` do trình duyệt gửi lên.

## 2. Công nghệ

### Frontend
- HTML5
- CSS3 (dark theme, responsive)
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

> Không dùng `http://0.0.0.0` làm địa chỉ gọi API từ trình duyệt. Hãy dùng đúng host mà trình duyệt truy cập được, ví dụ `https://localhost:7001` hoặc URL tunnel.

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

### 4.3 Định dạng thành công

API trả JSON. Danh sách có thể trả trực tiếp dưới dạng mảng hoặc bọc trong object; khuyến nghị thống nhất:

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
- ID nên dùng kiểu số nguyên hoặc GUID nhất quán toàn hệ thống.

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
    "id": 1,
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
  "id": 1,
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

Giá trị `relationshipStatus`: `Single`, `Dating`, hoặc `null`.

Response `200`: trả hồ sơ mới nhất. Backend phải bỏ qua/từ chối mọi trường định danh nếu client cố gửi thêm.

## 6. Người dùng, tìm kiếm, theo dõi

### GET `/users/search?q={keyword}&page=1&pageSize=20`

Tìm theo họ tên hoặc mã sinh viên/giảng viên. Không tìm kiếm bài viết.

Response:

```json
{
  "items": [
    {
      "id": 2,
      "code": "SV000245",
      "displayName": "Trần Gia Huy",
      "avatarUrl": null,
      "schoolName": "Công nghệ",
      "isFollowing": false
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Quy tắc tên hiển thị:
- Nếu người dùng bật nickname, `displayName` trả nickname.
- Nếu không bật, `displayName` trả họ tên thật.
- Tên thật chỉ hiển thị trong trang hồ sơ theo quy tắc quyền riêng tư mà sản phẩm thống nhất.

### POST `/users/{userId}/follow`
Theo dõi người dùng. Response `201` hoặc `200`.

### DELETE `/users/{userId}/follow`
Bỏ theo dõi. Response `204`.

### GET `/users/{userId}/followers?page=1&pageSize=20`
### GET `/users/{userId}/following?page=1&pageSize=20`

## 7. Bài viết công khai

### GET `/posts/feed?page=1&pageSize=20`

Chỉ trả bài viết thuộc bảng tin công khai. Không trộn bài đăng trong group, chợ, ghép đôi, tìm bạn đi chơi hoặc tìm bạn học.

### POST `/posts`

Request:

```json
{
  "content": "Nội dung bài viết",
  "visibility": "Public"
}
```

Giá trị `visibility`: `Public` hoặc `Anonymous`.

Nếu `Anonymous`, Backend không được trả `authorId`, mã, tên, avatar hoặc thông tin nào có thể lần ngược danh tính người đăng trong API công khai.

Response `201`:

```json
{
  "id": 101,
  "content": "Nội dung bài viết",
  "visibility": "Public",
  "author": {
    "id": 1,
    "displayName": "Nguyễn Minh Anh",
    "avatarUrl": null
  },
  "createdAt": "2026-11-23T15:30:00Z",
  "likeCount": 0,
  "commentCount": 0
}
```

Với bài ẩn danh, `author` nên là `null` hoặc object đã ẩn hoàn toàn danh tính, tùy quy ước thống nhất.

### GET `/posts/{postId}`
### PUT `/posts/{postId}`

Request sửa:

```json
{
  "content": "Nội dung đã chỉnh sửa"
}
```

Chỉ chủ bài viết được sửa.

### DELETE `/posts/{postId}`

Chỉ chủ bài viết hoặc quản trị viên có quyền mới được xóa.

### POST `/posts/{postId}/likes`
Thích bài viết.

### DELETE `/posts/{postId}/likes`
Bỏ thích.

### GET `/posts/{postId}/comments?page=1&pageSize=20`
### POST `/posts/{postId}/comments`

```json
{ "content": "Bình luận của tôi" }
```

### PUT `/comments/{commentId}`
```json
{ "content": "Bình luận đã sửa" }
```

### DELETE `/comments/{commentId}`

Chỉ chủ bình luận hoặc người có quyền quản trị phù hợp mới được sửa/xóa.

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

### GET `/groups`
Trả danh sách nhóm và đơn vị tương ứng.

### GET `/groups/{groupId}/posts?page=1&pageSize=20`
Lấy bài viết trong một nhóm.

### POST `/groups/{groupId}/posts`

```json
{ "content": "Nội dung bài viết trong nhóm" }
```

### PUT `/groups/{groupId}/posts/{postId}`
### DELETE `/groups/{groupId}/posts/{postId}`

**Quy tắc phân quyền bắt buộc:**
- Backend lấy `schoolId` từ tài khoản đã xác thực.
- Backend lấy `schoolId` của group.
- Nếu hai ID không trùng, trả `403` với message chính xác: `Bạn không thuộc đơn vị trực thuộc này`.
- Không nhận `schoolId` người dùng gửi lên làm căn cứ phân quyền.
- Bài group không xuất hiện trong bảng tin public và không xuất hiện ở group khác.
- Trong trang cá nhân có thể hiển thị bài group mà người xem có quyền xem; nếu không có quyền thì không làm lộ nội dung.

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

Theo yêu cầu, dùng REST API, không bắt buộc SignalR/WebSocket.

### GET `/conversations?page=1&pageSize=20`
### POST `/conversations`

```json
{ "userId": 2 }
```

### GET `/conversations/{conversationId}/messages?page=1&pageSize=30`
### POST `/conversations/{conversationId}/messages`

```json
{
  "content": "Chào bạn!",
  "messageType": "Text"
}
```

### PUT `/messages/{messageId}`

```json
{ "content": "Nội dung đã sửa" }
```

### DELETE `/messages/{messageId}`
### PATCH `/conversations/{conversationId}/read`

Frontend có thể tải tin nhắn định kỳ bằng cách gọi GET theo chu kỳ, hoặc dùng nút tải tin mới. Với bản thi 7 ngày, ưu tiên REST API đơn giản. Backend phải kiểm tra người gọi là thành viên của conversation trước mọi thao tác.

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
              .AllowAnyMethod();
    });
});

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
```

Thứ tự middleware cần phù hợp với cấu hình ứng dụng. Khi deploy, thay origin local bằng domain Frontend thật.

## 16. Thứ tự triển khai Backend đề xuất trong 7 ngày

### Ngày 1 – Nền tảng
- Tạo project ASP.NET Core Web API.
- Kết nối SQL Server.
- Cấu hình CORS.
- Tạo login, JWT và `/users/me`.
- Xác định được tài khoản là Student hay Lecturer và đơn vị trực thuộc.

### Ngày 2 – Hồ sơ và người dùng
- GET/PUT profile.
- Search user.
- Follow/unfollow.
- Phân biệt dữ liệu gốc và dữ liệu người dùng tự cập nhật.

### Ngày 3 – Bảng tin public
- CRUD post.
- Like/unlike.
- CRUD comment.
- Share.
- Ẩn danh và quyền xem.

### Ngày 4 – Group
- Danh sách 8 group.
- Đọc/đăng/sửa/xóa bài group.
- Kiểm tra schoolId ở Backend.

### Ngày 5 – Chợ xDTU
- CRUD listing.
- Purchase request.
- Inbox người bán.
- Accept sale, transaction và khóa tin đã bán.

### Ngày 6 – Ghép đôi, tìm bạn
- Matching.
- Hangout.
- Study partner.
- Notification.

### Ngày 7 – Tin nhắn và kiểm thử
- Conversation và message REST API.
- Đánh dấu đã đọc.
- Kiểm thử 401/403/404/409.
- Kiểm thử tài khoản khác đơn vị.
- Kiểm thử bài ẩn danh và tin đã bán.
- Sửa lỗi tích hợp, chuẩn bị demo.

**Ưu tiên nếu thiếu thời gian:** đăng nhập, hồ sơ, public feed, group và phân quyền là luồng lõi cần hoàn thiện trước. Những khu vực còn lại có thể triển khai theo mức tối thiểu nhưng không nên làm nút giao diện giả vờ đã lưu dữ liệu.

## 17. Kiểm thử tích hợp Frontend – Backend

- [ ] Đăng nhập đúng mã và mật khẩu.
- [ ] Đăng nhập sai trả 401.
- [ ] Tài khoản Student và Lecturer đều dùng chung màn hình đăng nhập.
- [ ] Hồ sơ tự điền đúng dữ liệu nguồn.
- [ ] API không cho sửa mã, họ tên, đơn vị, ngành học gốc.
- [ ] Tìm kiếm theo tên và mã.
- [ ] Đăng/sửa/xóa bài public.
- [ ] Like, comment, share.
- [ ] Bài ẩn danh không lộ tác giả.
- [ ] Người khác đơn vị nhận 403 và đúng thông báo.
- [ ] Group không bị trộn với feed public.
- [ ] Tin đã bán không thể mua tiếp.
- [ ] Chỉ chủ bài có thể chấp nhận yêu cầu ghép đôi.
- [ ] Chỉ thành viên hội thoại đọc được tin nhắn.
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

## 19. Ghi chú về phiên bản giao diện hiện tại

Phiên bản này là **bản khung Frontend tích hợp ban đầu**:
- Đã có màn hình đăng nhập, bố cục dark theme, menu điều hướng và các trang chức năng.
- Có dữ liệu demo để mở giao diện trước khi Backend hoàn thành.
- Có một số thao tác mẫu ở bảng tin và hồ sơ.
- Các trang chợ, ghép đôi, tìm bạn và nhắn tin hiện là khung chức năng; cần tiếp tục hoàn thiện biểu mẫu, danh sách, trạng thái và kết nối API tương ứng.
- `js/api.js` là nơi tập trung cấu hình gọi API.
- README này là hợp đồng API đề xuất để hai bên thống nhất trước khi code. Nếu bạn đổi tên route hoặc DTO, cần cập nhật cả Backend và Frontend đồng thời.

**Không được coi bản demo là hệ thống hoàn chỉnh hoặc dùng dữ liệu demo khi thi chính thức.**
