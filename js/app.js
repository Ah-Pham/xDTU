const $ = (selector) => document.querySelector(selector);
const state = {
  user: null, page: "feed", posts: [], activeGroup: null,
  demo: true,
  groups: ["Khoa học Máy tính","Công nghệ","Y Dược","Kinh tế","Ngôn ngữ - Xã hội Nhân văn","Đào tạo Quốc tế","Du lịch","Đoàn Quản lý Nam Khê"]
};
const demoUser = {
  id: 1, code: "SV000001", fullName: "Nguyễn Minh Anh", displayName: "Nguyễn Minh Anh",
  role: "Sinh viên", school: "Khoa học Máy tính", major: "Kỹ thuật phần mềm",
  hometown: "Đà Nẵng", birthDate: "", avatarUrl: "", bio: "Chào mừng bạn đến với xDTU!",
  interests: "", relationshipStatus: "", followerCount: 128, postCount: 3, nicknameEnabled: false
};
const demoPosts = [
  {id:1, author:demoUser, content:"Chào mọi người! Đây là không gian kết nối của cộng đồng Duy Tân. 🎓", createdAt:"Vừa xong", scope:"public", likes:12, comments:3},
  {id:2, author:{...demoUser,fullName:"Trần Gia Huy",displayName:"Trần Gia Huy",code:"SV000245"},content:"Có bạn nào đang học ASP.NET Core không? Mình muốn tìm người cùng trao đổi kiến thức.",createdAt:"2 giờ trước",scope:"public",likes:8,comments:2},
  {id:3, author:{...demoUser,fullName:"Lê Thu Hà",displayName:"Lê Thu Hà",code:"GV000012",role:"Giảng viên"},content:"Chúc các bạn một tuần học tập hiệu quả!",createdAt:"Hôm qua",scope:"public",likes:26,comments:5}
];
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function initials(name="x"){return name.trim().split(/\s+/).slice(-2).map(x=>x[0]).join("").toUpperCase()}
function displayName(user){return user?.nicknameEnabled && user?.nickname ? user.nickname : (user?.displayName || user?.fullName || "Người dùng xDTU")}
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function avatar(user,small=false){return `<div class="avatar ${small?"small":""}">${escapeHtml(initials(displayName(user)))}</div>`}
function requireLogin(){if(!state.user){toast("Vui lòng đăng nhập trước.");return false}return true}

$("#loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const code=$("#loginCode").value.trim(), password=$("#loginPassword").value;
  try{
    let user;
    if(state.demo){ user={...demoUser,code,fullName:code==="GV000012"?"Lê Thu Hà":demoUser.fullName}; }
    else{
      const result=await Api.post("/auth/login",{code,password});
      localStorage.setItem("xdtu_token",result.token);
      user=await Api.get("/users/me");
    }
    state.user=user; state.posts=state.demo?[...demoPosts]:await Api.get("/posts/feed");
    showApp(); renderPage();
  }catch(err){toast(err.message)}
});
function showApp(){$("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");$("#sideName").textContent=displayName(state.user);$("#sideRole").textContent=`${state.user.role} · ${state.user.code}`;$("#sideAvatar").textContent=initials(displayName(state.user));$("#topAvatar").textContent=initials(displayName(state.user))}
$("#logoutBtn").addEventListener("click",()=>{localStorage.removeItem("xdtu_token");state.user=null;$("#appView").classList.add("hidden");$("#loginView").classList.remove("hidden")});
$("#mainNav").addEventListener("click",e=>{const btn=e.target.closest("[data-page]");if(btn)navigate(btn.dataset.page)});
document.querySelectorAll(".topbar [data-page]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));
function navigate(page){state.page=page;document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));renderPage()}
function renderPage(){
  const titles={feed:"Bảng tin",profile:"Trang cá nhân",groups:"Nhóm đơn vị",market:"Chợ xDTU",dating:"Ghép đôi",hangout:"Tìm bạn đi chơi",study:"Tìm bạn học",messages:"Tin nhắn",notifications:"Thông báo"};
  $("#pageTitle").textContent=titles[state.page]||"xDTU";
  const pages={feed:renderFeed,profile:renderProfile,groups:renderGroups,market:()=>renderFeature("Chợ xDTU","Trao đổi, pass đồ dùng và mua bán trong cộng đồng Duy Tân.","◇","Đăng tin bán đồ"),dating:()=>renderFeature("Ghép đôi","Tạo bài đăng và gửi lời ghép đôi một cách tôn trọng, có sự đồng ý của cả hai bên.","♡","Tạo hồ sơ ghép đôi"),hangout:()=>renderFeature("Tìm bạn đi chơi","Tìm người đồng hành cho những buổi cà phê, xem phim và hoạt động ngoại khóa.","☕","Tạo bài tìm bạn"),study:()=>renderFeature("Tìm bạn học","Kết nối với người cùng môn học, mục tiêu và lịch học.","▤","Tạo bài tìm bạn học"),messages:renderMessages,notifications:renderNotifications};
  $("#pageContent").innerHTML=(pages[state.page]||renderFeed)();
  bindPageActions();
}
function renderFeed(){
  return `<div class="card composer"><div class="composer-top">${avatar(state.user)}<textarea id="postContent" placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng xDTU..."></textarea></div><div class="composer-bottom"><div class="composer-options"><select id="postScope" class="select-small"><option value="public">🌐 Công khai</option><option value="anonymous">◉ Đăng ẩn danh</option></select><span class="muted small-text">Bài đăng công khai</span></div><button class="btn btn-primary" id="publishPost">Đăng bài</button></div></div><div class="section-title">Bài viết mới nhất</div>${state.posts.map(postCard).join("")||emptyState("Chưa có bài viết","Hãy là người đầu tiên chia sẻ điều gì đó.")}`;
}
function postCard(p){
  const anonymous=p.scope==="anonymous";
  const author=anonymous?"Người dùng ẩn danh":displayName(p.author);
  return `<article class="card post" data-post-id="${p.id}"><div class="post-head">${anonymous?'<div class="avatar">?</div>':avatar(p.author)}<div class="post-author"><strong>${escapeHtml(author)}</strong><small>${escapeHtml(p.createdAt||"Vừa xong")}${p.group?` · ${escapeHtml(p.group)}`:" · Công khai"}</small></div><button class="icon-btn post-menu" title="Tùy chọn">···</button></div><div class="post-body">${escapeHtml(p.content)}</div><div class="post-actions"><button class="like-btn">♡ Thích · ${p.likes||0}</button><button class="comment-btn">▢ Bình luận · ${p.comments||0}</button><button class="share-btn">↗ Chia sẻ</button>${p.author?.id===state.user.id?'<button class="edit-post">Sửa</button><button class="delete-post">Xóa</button>':""}</div></article>`;
}
function renderProfile(){
 const u=state.user;
 return `<div class="profile-cover"><div class="avatar profile-avatar">${escapeHtml(initials(displayName(u)))}</div></div><div class="card" style="margin-top:-40px;padding-top:52px"><div class="profile-info"><div><h2>${escapeHtml(u.fullName||"Họ tên")}</h2><div class="muted small-text">${escapeHtml(u.code)} · ${escapeHtml(u.role)} · ${escapeHtml(u.school||"Chưa cập nhật đơn vị")}</div></div><button class="btn btn-secondary" id="editProfile">Chỉnh sửa thông tin</button></div><div class="profile-meta"><span><strong>${u.postCount||0}</strong> bài viết</span><span><strong>${u.followerCount||0}</strong> người theo dõi</span></div></div><div class="profile-grid" style="margin-top:14px"><div class="card"><div class="panel-heading">Giới thiệu</div>${info("Mã định danh",u.code)}${info("Họ và tên",u.fullName)}${info("Ngày sinh",u.birthDate)}${info("Quê quán",u.hometown)}${info("Trường trực thuộc",u.school)}${info("Ngành học",u.major)}${info("Vai trò",u.role)}${info("Sở thích",u.interests)}${info("Tình trạng",u.relationshipStatus)}${info("Mô tả",u.bio)}</div><div><div class="section-title">Bài viết của ${escapeHtml(displayName(u))}</div>${state.posts.filter(p=>p.author?.id===u.id).map(postCard).join("")||emptyState("Chưa có bài viết","Những bài viết của bạn sẽ xuất hiện tại đây.")}</div></div>`;
}
function info(label,value){return `<div class="info-row"><span>${label}</span>${escapeHtml(value||"Chưa cập nhật")}</div>`}
function renderGroups(){return `<h3 class="section-title">Không gian đơn vị trực thuộc</h3><p class="section-subtitle">Bạn chỉ có thể truy cập nhóm trùng với đơn vị được ghi nhận trong hồ sơ của mình.</p><div class="tile-grid">${state.groups.map((g,i)=>`<button class="tile group-tile" data-group="${escapeHtml(g)}"><div class="tile-icon">▦</div><strong>${escapeHtml(g)}</strong><small>${g===state.user.school?"Đơn vị của bạn · Có thể truy cập":"Không thuộc đơn vị này"}</small></button>`).join("")}</div>`}
function renderFeature(title,desc,icon,button){return `<div class="card"><div class="tile-icon" style="font-size:32px">${icon}</div><h3 class="section-title">${title}</h3><p class="muted">${desc}</p><button class="btn btn-primary feature-create">${button}</button><p class="muted small-text" style="margin-top:16px">Khu vực này đã có khung giao diện. Các thao tác dữ liệu sẽ được kết nối khi Backend triển khai API theo README.</p></div><div class="section-title" style="margin-top:22px">Bài đăng mới nhất</div><div class="empty"><strong>Chưa có nội dung</strong>Các bài đăng phù hợp sẽ hiển thị tại đây.</div>`}
function renderMessages(){return `<div class="card"><h3 class="section-title">Tin nhắn</h3><p class="muted">Nhắn tin trực tiếp giữa các tài khoản xDTU thông qua REST API.</p><div class="empty"><strong>Chưa có cuộc trò chuyện</strong>Danh sách hội thoại sẽ xuất hiện tại đây khi kết nối API.</div></div>`}
function renderNotifications(){return `<div class="card"><h3 class="section-title">Thông báo</h3><div class="empty"><strong>Bạn đã cập nhật!</strong>Thông báo theo dõi, bình luận, mua hàng và ghép đôi sẽ xuất hiện tại đây.</div></div>`}
function emptyState(title,desc){return `<div class="empty"><strong>${title}</strong>${desc}</div>`}
function bindPageActions(){
 $("#publishPost")?.addEventListener("click",async()=>{
   const content=$("#postContent").value.trim();if(!content)return toast("Bạn chưa nhập nội dung.");
   const scope=$("#postScope").value;
   try{let p;if(state.demo){p={id:Date.now(),author:state.user,content,createdAt:"Vừa xong",scope,likes:0,comments:0};state.posts.unshift(p)}
   else{p=await Api.post("/posts",{content,visibility:scope==="anonymous"?"Anonymous":"Public"});state.posts.unshift(p)}
   renderPage();toast("Đã đăng bài.");
   }catch(err){toast(err.message)}
 });
 document.querySelectorAll(".group-tile").forEach(btn=>btn.addEventListener("click",()=>{if(btn.dataset.group!==state.user.school){toast("Bạn không thuộc đơn vị trực thuộc này");return}state.activeGroup=btn.dataset.group;toast(`Đã mở nhóm ${state.activeGroup}. API nhóm sẽ được kết nối theo README.`)}));
 $("#editProfile")?.addEventListener("click",openProfileModal);
 document.querySelectorAll(".like-btn").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("liked");b.textContent=b.classList.contains("liked")?"♥ Đã thích":"♡ Thích"}));
 document.querySelectorAll(".comment-btn").forEach(b=>b.addEventListener("click",()=>toast("Khung bình luận sẽ được kết nối với API bình luận.")));
 document.querySelectorAll(".share-btn").forEach(b=>b.addEventListener("click",()=>toast("Chức năng chia sẻ sẽ được kết nối với API chia sẻ.")));
 document.querySelectorAll(".delete-post").forEach(b=>b.addEventListener("click",async()=>{const id=Number(b.closest("[data-post-id]").dataset.postId);if(!confirm("Bạn chắc chắn muốn xóa bài viết?"))return;try{if(!state.demo)await Api.delete(`/posts/${id}`);state.posts=state.posts.filter(p=>p.id!==id);renderPage();toast("Đã xóa bài viết.")}catch(err){toast(err.message)}}));
 document.querySelectorAll(".edit-post").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.closest("[data-post-id]").dataset.postId);const p=state.posts.find(x=>x.id===id);const value=prompt("Sửa nội dung bài viết:",p.content);if(value===null||!value.trim())return;p.content=value.trim();renderPage();toast("Đã cập nhật nội dung (demo).")}));
 document.querySelectorAll(".feature-create").forEach(b=>b.addEventListener("click",()=>toast("Biểu mẫu đăng tin sẽ được bật khi hoàn thiện API của chức năng này.")));
}
function openProfileModal(){
 const u=state.user;
 $("#modalRoot").innerHTML=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Chỉnh sửa trang cá nhân</h3><button class="modal-close">×</button></div><p class="muted small-text">Thông tin định danh do nhà trường cung cấp được khóa và không thể chỉnh sửa.</p><div class="form-grid"><div class="form-group"><label>Mã sinh viên / giảng viên (khóa)</label><input class="field" value="${escapeHtml(u.code)}" disabled></div><div class="form-group"><label>Họ tên (khóa)</label><input class="field" value="${escapeHtml(u.fullName)}" disabled></div><div class="form-group full-row"><label>Nickname (tùy chọn)</label><input id="nickname" class="field" value="${escapeHtml(u.nickname||"")}" placeholder="Tên hiển thị thay cho họ tên"></div><div class="form-group"><label>Sở thích</label><input id="interests" class="field" value="${escapeHtml(u.interests||"")}"></div><div class="form-group"><label>Tình trạng</label><select id="relationship" class="field"><option value="">Chưa chọn</option><option>Độc thân</option><option>Hẹn hò</option></select></div><div class="form-group full-row"><label>Mô tả</label><textarea id="bio" class="field" rows="3">${escapeHtml(u.bio||"")}</textarea></div><div class="form-group full-row"><label><input id="nicknameEnabled" type="checkbox" ${u.nicknameEnabled?"checked":""}> Sử dụng nickname thay cho tên thật khi hiển thị</label></div></div><div class="modal-actions"><button class="btn btn-secondary modal-close">Hủy</button><button id="saveProfile" class="btn btn-primary">Lưu thay đổi</button></div></div></div>`;
 document.querySelectorAll(".modal-close").forEach(b=>b.addEventListener("click",()=>$("#modalRoot").innerHTML=""));
 $("#saveProfile").addEventListener("click",async()=>{u.nickname=$("#nickname").value.trim();u.nicknameEnabled=$("#nicknameEnabled").checked;u.interests=$("#interests").value.trim();u.relationshipStatus=$("#relationship").value;u.bio=$("#bio").value.trim();try{if(!state.demo)await Api.put("/users/me/profile",{nickname:u.nickname,nicknameEnabled:u.nicknameEnabled,interests:u.interests,relationshipStatus:u.relationshipStatus,bio:u.bio});$("#modalRoot").innerHTML="";showApp();renderPage();toast("Đã lưu hồ sơ.")}catch(err){toast(err.message)}});
}
$("#userSearch").addEventListener("input",async e=>{
 const q=e.target.value.trim(),box=$("#searchResults");if(q.length<2){box.classList.add("hidden");return}
 try{let users=state.demo?[demoUser,{...demoUser,id:2,code:"SV000245",fullName:"Trần Gia Huy",displayName:"Trần Gia Huy"}].filter(u=>u.fullName.toLowerCase().includes(q.toLowerCase())||u.code.toLowerCase().includes(q.toLowerCase())):await Api.get(`/users/search?q=${encodeURIComponent(q)}`);
 box.innerHTML=users.map(u=>`<div class="search-result">${avatar(u,true)}<div><strong>${escapeHtml(displayName(u))}</strong><div class="muted small-text">${escapeHtml(u.code)}</div></div></div>`).join("")||'<div class="muted small-text" style="padding:10px">Không tìm thấy người dùng.</div>';box.classList.remove("hidden")
 }catch(err){box.innerHTML=`<div class="muted small-text">${escapeHtml(err.message)}</div>`;box.classList.remove("hidden")}
});
document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap")&&!e.target.closest(".search-results"))$("#searchResults").classList.add("hidden")});
