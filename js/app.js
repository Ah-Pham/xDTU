const $ = (selector) => document.querySelector(selector);
const state = {
  user: null, page: "feed", posts: [], feedLoading: false, feedError: "", activeGroup: null, viewedProfile: null, profilePosts: null,
  demo: false,
  pendingPostImages: [], pendingPostVideo: null, commentsByPost: {}, commentAttachments: {},
  pendingCommentImages: [], pendingCommentVideo: null,
  conversations: [], messagesByConversation: {}, activeConversationId: null,
  conversationQuery: "", chatError: "", messageDraft: "", messageAttachment: null,
  conversationsLoading: false, messagesLoading: false, pollTimer: null, pollInFlight: false,
  groups: [], groupPosts: [], groupError: "", groupsLoading: false, profileError: ""
};
const demoUser = {
  code: "SV000001", fullName: "Nguyễn Minh Anh", displayName: "Nguyễn Minh Anh",
  role: "Sinh viên", school: "Khoa học Máy tính", major: "Kỹ thuật phần mềm",
  hometown: "Đà Nẵng", birthDate: "", avatarUrl: "", bio: "Chào mừng bạn đến với xDTU!",
  interests: "", relationshipStatus: "", followerCount: 128, postCount: 3, nicknameEnabled: false
};
const demoPosts = [
  {id:1, author:demoUser, content:"Chào mọi người! Đây là không gian kết nối của cộng đồng Duy Tân. 🎓", createdAt:"Vừa xong", scope:"public", likes:12, comments:3},
  {id:2, author:{...demoUser,fullName:"Trần Gia Huy",displayName:"Trần Gia Huy",code:"SV000245"},content:"Có bạn nào đang học ASP.NET Core không? Mình muốn tìm người cùng trao đổi kiến thức.",createdAt:"2 giờ trước",scope:"public",likes:8,comments:2},
  {id:3, author:{...demoUser,fullName:"Lê Thu Hà",displayName:"Lê Thu Hà",code:"GV000012",role:"Giảng viên"},content:"Chúc các bạn một tuần học tập hiệu quả!",createdAt:"Hôm qua",scope:"public",likes:26,comments:5}
];
const demoConversations = [
  {id:301,otherUser:{code:"SV000245",fullName:"Trần Gia Huy",displayName:"Trần Gia Huy"},unreadCount:1,lastMessage:{content:"Chào bạn! Mình gửi tài liệu nhé.",createdAt:"2026-11-24T05:30:00Z"}},
  {id:302,otherUser:{code:"GV000012",fullName:"Lê Thu Hà",displayName:"Lê Thu Hà",role:"Giảng viên"},unreadCount:0,lastMessage:{content:"Cảm ơn em.",createdAt:"2026-11-23T09:10:00Z"}}
];
const demoMessages={
  301:[
    {id:901,conversationId:301,sender:{...demoUser,code:"SV000245",fullName:"Trần Gia Huy",displayName:"Trần Gia Huy"},content:"Chào bạn! Bạn có đang học ASP.NET Core không?",messageType:"Text",createdAt:"2026-11-24T05:20:00Z",status:"Read"},
    {id:902,conversationId:301,sender:demoUser,content:"Có, mình đang làm một dự án nhỏ.",messageType:"Text",createdAt:"2026-11-24T05:25:00Z",status:"Delivered"},
    {id:903,conversationId:301,sender:{...demoUser,code:"SV000245",fullName:"Trần Gia Huy",displayName:"Trần Gia Huy"},content:"Chào bạn! Mình gửi tài liệu nhé.",messageType:"Text",createdAt:"2026-11-24T05:30:00Z",status:"Sent"}
  ],
  302:[
    {id:904,conversationId:302,sender:{...demoUser,code:"GV000012",fullName:"Lê Thu Hà",displayName:"Lê Thu Hà",role:"Giảng viên"},content:"Em nhớ xem thông báo môn học nhé.",messageType:"Text",createdAt:"2026-11-23T09:00:00Z"},
    {id:905,conversationId:302,sender:demoUser,content:"Dạ em đã nhận được ạ.",messageType:"Text",createdAt:"2026-11-23T09:10:00Z"}
  ]
};
const demoGroups=[
  {id:1,name:"Khoa học Máy tính",description:"Không gian chia sẻ học tập và hoạt động của Khoa học Máy tính.",schoolName:"Khoa học Máy tính",memberCount:128,isMember:false,canPost:false},
  {id:2,name:"Công nghệ",description:"Cộng đồng sinh viên khối ngành Công nghệ.",schoolName:"Công nghệ",memberCount:96,isMember:false,canPost:false},
  {id:3,name:"Y Dược",description:"Cộng đồng sinh viên Y Dược.",schoolName:"Y Dược",memberCount:182,isMember:false,canPost:false},
  {id:4,name:"Kinh tế",description:"Cộng đồng sinh viên Kinh tế.",schoolName:"Kinh tế",memberCount:143,isMember:false,canPost:false},
  {id:5,name:"Ngôn ngữ - Xã hội Nhân văn",description:"Cộng đồng sinh viên Ngôn ngữ và Xã hội Nhân văn.",schoolName:"Ngôn ngữ - Xã hội Nhân văn",memberCount:87,isMember:false,canPost:false},
  {id:6,name:"Đào tạo Quốc tế",description:"Cộng đồng sinh viên chương trình quốc tế.",schoolName:"Đào tạo Quốc tế",memberCount:64,isMember:false,canPost:false},
  {id:7,name:"Du lịch",description:"Cộng đồng sinh viên Du lịch.",schoolName:"Du lịch",memberCount:91,isMember:false,canPost:false},
  {id:8,name:"Đoàn Quản lý Nam Khê",description:"Cộng đồng sinh viên Đoàn Quản lý Nam Khê.",schoolName:"Đoàn Quản lý Nam Khê",memberCount:53,isMember:false,canPost:false}
];
const demoGroupPosts={
  1:[
    {id:101,author:{...demoUser,code:"SV000245",fullName:"Trần Gia Huy",displayName:"Trần Gia Huy"},content:"Chào mọi người, tuần này có buổi trao đổi về ASP.NET Core không?",createdAt:"Hôm nay"},
    {id:102,author:demoUser,content:"Mình sẽ đăng lịch ôn tập môn Cấu trúc dữ liệu sau nhé.",createdAt:"Hôm qua"}
  ]
};
let userSearchGeneration=0;
function createDemoComments(currentUser=demoUser){
  const author={code:"SV000245",fullName:"Trần Gia Huy",displayName:"Trần Gia Huy"};
  return {
    1:[
      {id:11,postId:1,parentCommentId:null,content:"Chào mừng mọi người đến với cộng đồng!",author,createdAt:"Vừa xong"},
      {id:12,postId:1,parentCommentId:11,content:"Cảm ơn bạn đã chia sẻ.",author:currentUser,createdAt:"Vừa xong"},
      {id:13,postId:1,parentCommentId:null,content:"Rất vui được kết nối cùng mọi người.",author:currentUser,createdAt:"Vừa xong"}
    ],
    2:[
      {id:21,postId:2,parentCommentId:null,content:"Mình cũng đang học, có thể trao đổi cùng nhau.",author:currentUser,createdAt:"Vừa xong"},
      {id:22,postId:2,parentCommentId:21,content:"Tuyệt, mình sẽ nhắn bạn nhé!",author,createdAt:"Vừa xong"}
    ],
    3:[
      {id:31,postId:3,parentCommentId:null,content:"Em cảm ơn cô ạ!",author:currentUser,createdAt:"Vừa xong"},
      {id:32,postId:3,parentCommentId:null,content:"Chúc cô một tuần vui vẻ.",author,createdAt:"Vừa xong"},
      {id:33,postId:3,parentCommentId:32,content:"Cảm ơn em.",author:{code:"GV000012",fullName:"Lê Thu Hà",displayName:"Lê Thu Hà"},createdAt:"Vừa xong"},
      {id:34,postId:3,parentCommentId:null,content:"Chúc mọi người học tốt!",author,createdAt:"Vừa xong"},
      {id:35,postId:3,parentCommentId:null,content:"Cùng cố gắng nhé.",author:currentUser,createdAt:"Vừa xong"}
    ]
  };
}
function createDemoMessages(currentUser){
 const messages=JSON.parse(JSON.stringify(demoMessages));
 Object.values(messages).flat().forEach(message=>{
   if(message.sender?.code===demoUser.code)message.sender=currentUser;
 });
 return messages;
}
function createDemoGroupPosts(groupId,currentUser){
 return JSON.parse(JSON.stringify(demoGroupPosts[groupId]||[])).map(post=>({
   ...post,
   author:post.author?.code===demoUser.code?currentUser:post.author
 }));
}
const ICON_PATHS={
  home:'<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
  user:'<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shoppingBag:'<path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  heartHandshake:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/><path d="m8 12 2 2 4-4"/>',
  coffee:'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M4 7h14v8a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V7Z"/><path d="M18 10h1a3 3 0 1 1 0 6h-2"/>',
  bookOpen:'<path d="M12 7v14"/><path d="M3 18V5a1 1 0 0 1 1-1h4a4 4 0 0 1 4 4 4 4 0 0 1 4-4h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4a4 4 0 0 0-4 4 4 4 0 0 0-4-4H4a1 1 0 0 1-1-1Z"/>',
  messages:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
  userRound:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  video:'<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  paperclip:'<path d="m21.4 11.1-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  messageCircle:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4.4"/><path d="m8.6 13.3 6.8 4.4"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  close:'<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
  reply:'<path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  chevronLeft:'<path d="m15 18-6-6 6-6"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  check:'<path d="m20 6-11 11-5-5"/>'
};
function icon(name,className="icon"){
 const paths=ICON_PATHS[name];
 if(!paths)throw new Error(`Icon không được hỗ trợ: ${name}`);
 return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function initials(name="x"){return name.trim().split(/\s+/).slice(-2).map(x=>x[0]).join("").toUpperCase()}
function displayName(user){return user?.nicknameEnabled && user?.nickname ? user.nickname : (user?.displayName || user?.fullName || "Người dùng xDTU")}
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function avatar(user,small=false,extraClass=""){return `<div class="avatar ${small?"small":""} ${extraClass}">${user?.avatarUrl?`<img src="${escapeHtml(user.avatarUrl)}" alt="">`:escapeHtml(initials(displayName(user)))}</div>`}
function requireLogin(){if(!state.user){toast("Vui lòng đăng nhập trước.");return false}return true}
function normalizeUser(user){
  if(!user||typeof user.code!=="string"||!user.code.trim())throw new Error("Backend trả về hồ sơ không có mã người dùng (code).");
  const normalized={...user};
  delete normalized.id;
  return {...normalized,fullName:user.fullName||user.displayName||"",displayName:user.displayName||user.fullName||"",school:user.school||user.schoolName||"",birthDate:user.birthDate||user.dateOfBirth||""};
}
function normalizeGroup(group){
  if(!group||group.id==null||typeof group.name!=="string"||typeof group.schoolName!=="string")throw new Error("Backend trả về nhóm thiếu id, name hoặc schoolName.");
  return {...group};
}
function responseItems(response){
  if(Array.isArray(response))return response;
  if(response&&Array.isArray(response.items))return response.items;
  throw new Error("Backend trả về danh sách không đúng định dạng.");
}
function normalizePost(post){
  if(!post||post.id==null)throw new Error("Backend trả về bài viết thiếu id.");
  const visibility=post.visibility||post.scope||"Public";
  const media=Array.isArray(post.media)?post.media:[];
  const isOwnedByCurrentUser=typeof post.isOwnedByCurrentUser==="boolean"
    ?post.isOwnedByCurrentUser
    :post.author?.code===state.user?.code;
  return {
    ...post,
    author:post.author?normalizeUser(post.author):null,
    isOwnedByCurrentUser,
    scope:String(visibility).toLowerCase()==="anonymous"?"anonymous":"public",
    likes:post.likeCount??post.likes??0,
    comments:post.commentCount??post.comments??0,
    likedByMe:post.isLikedByCurrentUser??post.likedByMe??false,
    images:Array.isArray(post.images)?post.images:media.filter(item=>contentTypeFromName(item.fileName,item.contentType).startsWith("image/")),
    videos:Array.isArray(post.videos)?post.videos:media.filter(item=>contentTypeFromName(item.fileName,item.contentType).startsWith("video/"))
  };
}
function normalizeComment(comment){
  if(!comment||comment.id==null)throw new Error("Backend trả về bình luận thiếu id.");
  const media=Array.isArray(comment.media)?comment.media:[];
  return {
    ...comment,
    author:normalizeUser(comment.author),
    images:Array.isArray(comment.images)?comment.images:media.filter(item=>contentTypeFromName(item.fileName,item.contentType).startsWith("image/")),
    videos:Array.isArray(comment.videos)?comment.videos:media.filter(item=>contentTypeFromName(item.fileName,item.contentType).startsWith("video/"))
  };
}
function normalizeConversation(conversation){
  if(!conversation||conversation.id==null)throw new Error("Backend trả về hội thoại thiếu id.");
  return {...conversation,otherUser:normalizeUser(conversation.otherUser)};
}
function normalizeMessage(message){
  if(!message||message.id==null||message.conversationId==null)throw new Error("Backend trả về tin nhắn thiếu id hoặc conversationId.");
  const attachment=message.attachment?{
    ...message.attachment,
    contentType:contentTypeFromName(message.attachment.fileName,message.attachment.contentType||"")
  }:null;
  return {...message,sender:normalizeUser(message.sender),attachment};
}
function fileError(file,types,maxBytes){
  if(!types.includes(file.type))return `Định dạng ${file.name} không được hỗ trợ.`;
  if(file.size>maxBytes)return `Tệp ${file.name} vượt quá giới hạn ${Math.round(maxBytes/1024/1024)} MiB.`;
  return "";
}
function validateMediaFile(file,kind){
 const extension=file.name.split(".").pop().toLowerCase();
 const contentType=mimeEssence(file.type);
 if(kind==="image"){
  const allowed={"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","webp":"image/webp","gif":"image/gif"};
  if(!Object.prototype.hasOwnProperty.call(allowed,extension))return "Chỉ hỗ trợ ảnh JPEG, PNG, WebP hoặc GIF.";
  if(contentType&&contentType!=="application/octet-stream"&&contentType!==allowed[extension])return "Loại nội dung ảnh không khớp với phần mở rộng.";
  if(file.size>8*1024*1024)return "Ảnh không được lớn hơn 8 MiB.";
  return "";
 }
 const allowedVideos={"mp4":"video/mp4","webm":"video/webm"};
 if(!Object.prototype.hasOwnProperty.call(allowedVideos,extension))return "Video chỉ hỗ trợ định dạng MP4 hoặc WebM.";
 if(contentType&&contentType!=="application/octet-stream"&&contentType!==allowedVideos[extension])return "Loại nội dung video không khớp với phần mở rộng.";
 if(file.size>50*1024*1024)return "Video không được lớn hơn 50 MiB.";
 return "";
}
function mimeEssence(contentType=""){
 return String(contentType).split(";",1)[0].trim().toLowerCase();
}
function mediaContentType(file){
 return contentTypeFromName(file.name,file.type);
}
function contentTypeFromName(fileName,providedType=""){
 if(providedType&&providedType!=="application/octet-stream")return providedType;
 const extension=String(fileName||"").split(".").pop().toLowerCase();
 const types={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif",mp4:"video/mp4",webm:"video/webm",pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",ppt:"application/vnd.ms-powerpoint",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",txt:"text/plain",csv:"text/csv",zip:"application/zip"};
 return types[extension]||"application/octet-stream";
}
function revokePreview(url){if(url&&url.startsWith("blob:"))URL.revokeObjectURL(url)}

$("#loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const code=$("#loginCode").value.trim(), password=$("#loginPassword").value;
  try{
    let user;
    if(state.demo){ user={...demoUser,code,fullName:code==="GV000012"?"Lê Thu Hà":demoUser.fullName,displayName:code==="GV000012"?"Lê Thu Hà":demoUser.displayName,role:code==="GV000012"?"Giảng viên":demoUser.role}; }
    else{
      const result=await Api.post("/auth/login",{code,password});
      localStorage.setItem("xdtu_token",result.token);
      user=normalizeUser(await Api.get("/users/me"));
    }
    user=normalizeUser(user);
    state.user=user;
    state.page="feed";state.activeGroup=null;state.groupError="";state.groupsLoading=false;state.profileError="";
    state.posts=state.demo?demoPosts.map(post=>normalizePost({...post,author:post.author.code===demoUser.code?user:post.author})):[];
    state.feedError="";state.feedLoading=false;
    state.commentsByPost=state.demo?createDemoComments(user):{};
    state.conversations=state.demo?JSON.parse(JSON.stringify(demoConversations)):[];
    state.messagesByConversation=state.demo?createDemoMessages(user):{};
    state.activeConversationId=state.demo?state.conversations[0]?.id:null;
    state.conversationQuery="";state.chatError="";state.viewedProfile=null;state.profilePosts=null;
    state.groups=state.demo?JSON.parse(JSON.stringify(demoGroups)):[];
    state.groupPosts=state.demo?createDemoGroupPosts(1,user):[];
    showApp(); renderPage();
    if(!state.demo)await loadFeed();
  }catch(err){toast(err.message)}
});
function fillAvatar(element,user){element.innerHTML=user?.avatarUrl?`<img src="${escapeHtml(user.avatarUrl)}" alt="">`:escapeHtml(initials(displayName(user)))}
function showApp(){$("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");$("#sideName").textContent=displayName(state.user);$("#sideRole").textContent=`${state.user.role} · ${state.user.code}`;fillAvatar($("#sideAvatar"),state.user);fillAvatar($("#topAvatar"),state.user)}
$("#logoutBtn").addEventListener("click",()=>{
  localStorage.removeItem("xdtu_token");
  if(state.pollTimer)clearInterval(state.pollTimer);
  state.pollTimer=null;state.pollInFlight=false;
  if(state.messageAttachment)revokePreview(state.messageAttachment.previewUrl);
  state.pendingPostImages.forEach(item=>revokePreview(item.previewUrl));
  if(state.pendingPostVideo)revokePreview(state.pendingPostVideo.previewUrl);
  state.pendingCommentImages.forEach(item=>revokePreview(item.previewUrl));
  if(state.pendingCommentVideo)revokePreview(state.pendingCommentVideo.previewUrl);
  state.posts.forEach(post=>(post.images||[]).forEach(image=>revokePreview(image.previewUrl)));
  Object.values(state.messagesByConversation).flat().forEach(message=>revokePreview(message.attachment?.previewUrl));
  if(state.user)revokePreview(state.user.avatarUrl);
  state.pendingPostImages=[];state.pendingPostVideo=null;state.pendingCommentImages=[];state.pendingCommentVideo=null;state.commentAttachments={};state.commentsByPost={};state.posts=[];state.feedLoading=false;state.feedError="";state.conversations=[];state.messagesByConversation={};state.messageAttachment=null;state.messageDraft="";state.activeConversationId=null;state.user=null;state.page="feed";state.activeGroup=null;state.viewedProfile=null;state.profilePosts=null;state.profileError="";state.groups=[];state.groupPosts=[];state.groupError="";
  $("#appView").classList.add("hidden");$("#loginView").classList.remove("hidden");
});
$("#mainNav").addEventListener("click",e=>{const btn=e.target.closest("[data-page]");if(btn)navigate(btn.dataset.page)});
document.querySelectorAll(".topbar [data-page]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));
function navigate(page){
  if(page!=="messages"&&state.pollTimer){clearInterval(state.pollTimer);state.pollTimer=null}
  state.page=page;
  if(page==="profile"){state.viewedProfile=null;state.profilePosts=null;state.profileError=""}
  if(page==="groups"){state.activeGroup=null;state.groupError=""}
  document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  if(page==="groups"&&!state.demo)loadGroups();
  if(page==="profile"&&!state.demo)loadMyProfilePosts();
  renderPage();
  if(page==="messages"&&!state.demo)loadConversations();
}
function renderPage(){
  const titles={feed:"Bảng tin",profile:"Trang cá nhân",groups:"Nhóm đơn vị",market:"Chợ xDTU",dating:"Ghép đôi",hangout:"Tìm bạn đi chơi",study:"Tìm bạn học",messages:"Tin nhắn",notifications:"Thông báo"};
  $("#pageTitle").textContent=titles[state.page]||"xDTU";
  const pages={feed:renderFeed,profile:renderProfile,groups:renderGroups,market:()=>renderFeature("Chợ xDTU","Trao đổi, pass đồ dùng và mua bán trong cộng đồng Duy Tân.","shoppingBag","Đăng tin bán đồ"),dating:()=>renderFeature("Ghép đôi","Tạo bài đăng và gửi lời ghép đôi một cách tôn trọng, có sự đồng ý của cả hai bên.","heartHandshake","Tạo hồ sơ ghép đôi"),hangout:()=>renderFeature("Tìm bạn đi chơi","Tìm người đồng hành cho những buổi cà phê, xem phim và hoạt động ngoại khóa.","coffee","Tạo bài tìm bạn"),study:()=>renderFeature("Tìm bạn học","Kết nối với người cùng môn học, mục tiêu và lịch học.","bookOpen","Tạo bài tìm bạn học"),messages:renderMessages,notifications:renderNotifications};
  $("#pageContent").innerHTML=(pages[state.page]||renderFeed)();
  bindPageActions();
  if(state.page==="feed")renderPendingPostImages();
}
function renderFeed(){
  const feedContent=state.feedLoading?'<div class="loading-state" aria-label="Đang tải bảng tin"></div>'
    :`${state.feedError?`<div class="error-state feed-error">${escapeHtml(state.feedError)} <button id="retryFeed" class="btn btn-secondary" type="button">Thử lại</button></div>`:""}${state.posts.map(postCard).join("")||(!state.feedError?emptyState("Chưa có bài viết","Hãy là người đầu tiên chia sẻ điều gì đó."):"")}`;
  return `<div class="card composer">
    <div class="composer-heading"><div><div class="eyebrow">CỘNG ĐỒNG xDTU</div><h3>Chia sẻ cùng mọi người</h3></div></div>
    <div class="composer-top">${avatar(state.user)}<textarea id="postContent" aria-label="Nội dung bài viết" placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng xDTU..."></textarea></div>
    <div id="postImagePreview" class="attachment-preview-grid"></div>
    <div id="postVideoPreview" class="attachment-preview-grid"></div>
    <div class="composer-bottom">
      <div class="composer-options">
        <select id="postScope" class="select-small" aria-label="Đối tượng có thể xem bài viết"><option value="public">Công khai</option><option value="anonymous">Đăng ẩn danh</option></select>
        <button class="btn btn-attach" id="choosePostImages" type="button">${icon("image")}<span>Thêm ảnh</span></button>
        <input id="postImageInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple>
        <button class="btn btn-attach" id="choosePostVideo" type="button">${icon("video")}<span>Thêm video</span></button>
        <input id="postVideoInput" class="sr-only" type="file" accept="video/mp4,video/webm,.mp4,.webm">
      </div>
      <button class="btn btn-primary" id="publishPost" type="button">Đăng bài</button>
    </div>
  </div>
  <div class="feed-heading"><div><div class="eyebrow">DÒNG THỜI GIAN</div><h3>Bài viết mới nhất</h3></div><span class="feed-count">${state.posts.length} bài viết</span></div>
  ${feedContent}`;
}
async function loadFeed(){
 if(!state.user)return;
 const userCode=state.user.code;
 state.feedLoading=true;state.feedError="";
 if(state.page==="feed")renderPage();
 try{
  const posts=responseItems(await Api.get("/posts/feed")).map(normalizePost);
  if(state.user?.code!==userCode)return;
  state.posts=posts;
 }catch(error){
  if(state.user?.code!==userCode)return;
  state.feedError=error.message;
 }finally{
  if(state.user?.code===userCode){state.feedLoading=false;if(state.page==="feed")renderPage()}
 }
}
function postCard(p){
  const anonymous=p.scope==="anonymous";
  const author=anonymous?"Người dùng ẩn danh":displayName(p.author);
  const visibility=anonymous?"Bài đăng ẩn danh":(p.groupName||p.group||(p.groupId!==undefined&&p.groupId!==null?"Bài viết trong nhóm":"Bài viết công khai"));
  const canEdit=p.isOwnedByCurrentUser??p.author?.code===state.user.code;
  const interactions=p.groupId===undefined||p.groupId===null?`<div class="post-actions">
      <button class="like-btn ${p.likedByMe?"liked":""}" type="button" aria-pressed="${p.likedByMe?"true":"false"}">${icon("heart")}<span>${p.likedByMe?"Đã thích":"Thích"} · ${escapeHtml(p.likes)}</span></button>
      <button class="comment-btn" type="button">${icon("messageCircle")}<span>Bình luận · ${escapeHtml(p.comments)}</span></button>
      <button class="share-btn" type="button" disabled title="Chia sẻ chưa được kết nối API">${icon("share")}<span>Chia sẻ</span></button>
    </div>`:"";
  return `<article class="card post" data-post-id="${escapeHtml(p.id)}">
    <div class="post-head">${anonymous?'<div class="avatar">?</div>':avatar(p.author)}
      <div class="post-author"><strong>${escapeHtml(author)}</strong><small>${escapeHtml(p.createdAt||"Vừa xong")} · ${escapeHtml(visibility)}</small></div>
      ${canEdit?`<div class="post-menu-actions"><button class="icon-btn post-menu" type="button" aria-label="Tùy chọn bài viết" title="Tùy chọn">${icon("more")}</button><div class="post-menu-popover"><button class="edit-post" type="button">${icon("edit")}Chỉnh sửa</button><button class="delete-post" type="button">${icon("trash")}Xóa bài viết</button></div></div>`:""}
    </div>
    <div class="post-body">${escapeHtml(p.content||"")}</div>
    ${renderPostMedia(p)}
    ${interactions}
  </article>`;
}
function renderPostMedia(post){
  const images=Array.isArray(post.images)?post.images:[];
  const videos=Array.isArray(post.videos)?post.videos:[];
  const imageMarkup=images.length?`<div class="post-image-grid">${images.map(image=>{
    const url=image.previewUrl||image.url;
    if(!url)return "";
    return `<button class="post-image-button" type="button" data-image-url="${escapeHtml(url)}" aria-label="Mở ảnh kích thước lớn"><img src="${escapeHtml(url)}" alt="${escapeHtml(image.fileName||"Ảnh trong bài viết")}" loading="lazy"></button>`;
  }).join("")}</div>`:"";
  const videoMarkup=videos.map(video=>renderVideo(video,"Video bài viết")).join("");
  return imageMarkup+videoMarkup;
}
function renderVideo(video,label="Video đính kèm"){
 const url=video?.previewUrl||video?.url;
 if(!url)return "";
 const type=contentTypeFromName(video.fileName,video.contentType||"");
 return `<div class="post-video"><video controls playsinline preload="metadata" aria-label="${escapeHtml(video.fileName||label)}"><source src="${escapeHtml(url)}" type="${escapeHtml(type)}">Trình duyệt không hỗ trợ phát video.</video></div>`;
}
function renderProfile(){
 const user=state.viewedProfile||state.user;
 const isOwn=user.code===state.user.code;
 const posts=state.profilePosts||state.posts.filter(post=>post.author?.code===user.code);
 const actions=isOwn?`<div class="profile-actions">
   <button class="btn btn-secondary" id="editProfile">Chỉnh sửa thông tin</button>
   <button class="btn btn-attach" id="changeAvatar">Đổi ảnh đại diện</button>
   <input id="profileAvatarInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp">
 </div>`:`<button class="btn btn-primary" id="startConversation">Nhắn tin</button>`;
 const details=[
   ["Mã định danh",user.code],["Họ và tên",user.fullName],["Ngày sinh",user.birthDate],
   ["Quê quán",user.hometown],["Trường trực thuộc",user.school],["Ngành học",user.major],
   ["Vai trò",user.role],["Sở thích",user.interests],["Tình trạng",user.relationshipStatus==="Single"||user.relationshipStatus==="Độc thân"?"Độc thân":user.relationshipStatus==="Dating"||user.relationshipStatus==="Hẹn hò"?"Hẹn hò":"Chưa cập nhật"],
   ["Mô tả",user.bio]
 ];
 return `<div class="profile-cover">${avatar(user,false,"profile-avatar")}</div>
   <div class="card profile-summary">
     <div class="profile-info">
       <div><h2>${escapeHtml(displayName(user))}</h2><div class="muted small-text">${escapeHtml(user.code)} · ${escapeHtml(user.role||"Thành viên")} · ${escapeHtml(user.school||"Chưa cập nhật đơn vị")}</div></div>
       ${actions}
     </div>
     <div class="profile-meta"><span><strong>${user.postCount??posts.length}</strong> bài viết</span><span><strong>${user.followerCount??0}</strong> người theo dõi</span></div>
   </div>
   ${state.profileError?`<div class="error-state">${escapeHtml(state.profileError)}</div>`:""}
   <div class="profile-grid">
     <div class="card"><div class="panel-heading">Giới thiệu</div>${details.map(([label,value])=>info(label,value)).join("")}</div>
     <div><div class="section-title">Bài viết của ${escapeHtml(displayName(user))}</div>${posts.map(postCard).join("")||emptyState("Chưa có bài viết","Những bài viết của người dùng sẽ xuất hiện tại đây.")}</div>
   </div>`;
}
function info(label,value){return `<div class="info-row"><span>${label}</span>${escapeHtml(value||"Chưa cập nhật")}</div>`}
function renderGroups(){
 if(state.activeGroup){
  const group=state.groups.find(item=>String(item.id)===String(state.activeGroup));
  if(!group)return `<button class="btn btn-secondary" id="backToGroups">${icon("chevronLeft")}Danh sách nhóm</button><div class="error-state">${escapeHtml(state.groupError||"Không tìm thấy nhóm.")}</div>`;
  return renderGroupDetail(group);
 }
 if(state.groupError)return `<div class="error-state">${escapeHtml(state.groupError)}</div>`;
 if(state.groupsLoading)return '<div class="loading-state"></div>';
 if(!state.groups.length)return emptyState("Chưa có nhóm","Chưa nhận được danh sách nhóm.");
 return `<div class="section-heading"><div>
   <h3 class="section-title">Không gian đơn vị trực thuộc</h3>
   <p class="section-subtitle">Nhóm hiển thị và quyền truy cập được Backend quyết định theo tài khoản của bạn.</p>
 </div></div><div class="tile-grid">${state.groups.map(renderGroupCard).join("")}</div>`;
}
function renderGroupDetail(group){
 const membership=group.isMember
   ?'<span class="badge badge-success">Đã tham gia</span>'
   :group.schoolName===state.user.school
     ?`<button class="btn btn-primary join-group" data-group-id="${escapeHtml(group.id)}">Tham gia nhóm</button>`
     :'<span class="muted small-text">Nhóm dành cho đơn vị khác</span>';
 const composer=group.canPost?`<form id="groupPostForm" class="card group-post-form">
   <label for="groupPostContent">Chia sẻ với nhóm</label>
   <textarea id="groupPostContent" class="field" rows="3" maxlength="5000" placeholder="Viết nội dung bài đăng..."></textarea>
   <button class="btn btn-primary" type="submit">Đăng bài trong nhóm</button>
 </form>`:"";
 const posts=state.groupsLoading?'<div class="loading-state"></div>'
   :state.groupPosts.length?state.groupPosts.map(renderGroupPost).join("")
     :emptyState("Chưa có bài viết","Hãy bắt đầu cuộc trò chuyện trong nhóm này.");
 return `<button class="btn btn-secondary group-back" id="backToGroups">${icon("chevronLeft")}Danh sách nhóm</button>
   <section class="card group-detail"><div class="tile-icon">${icon("users")}</div>
     <h2>${escapeHtml(group.name)}</h2>
     <p class="muted">${escapeHtml(group.description||"Không gian trao đổi của sinh viên.")}</p>
     <div class="group-stats"><span>${Number(group.memberCount)||0} thành viên</span><span>${escapeHtml(group.schoolName||"")}</span></div>
     ${membership}
   </section>
   ${composer}
   <div class="feed-heading"><div><div class="eyebrow">TRAO ĐỔI NHÓM</div><h3>Bài viết trong nhóm</h3></div></div>
   ${state.groupError?`<div class="error-state">${escapeHtml(state.groupError)}</div>`:""}${posts}`;
}
function renderGroupCard(group){
 const canAccess=group.schoolName===state.user.school;
 const membership=group.isMember?'<span class="badge badge-success">Đã tham gia</span>'
   :canAccess?`<button class="btn btn-primary join-group" data-group-id="${escapeHtml(group.id)}">Tham gia</button>`
     :'<span class="muted small-text">Không thuộc đơn vị</span>';
 return `<article class="tile group-card">
   <div class="tile-icon">${icon("users")}</div><strong>${escapeHtml(group.name)}</strong>
   <small>${escapeHtml(group.schoolName||"")} · ${Number(group.memberCount)||0} thành viên</small>
   <div class="group-card-actions">
     <button class="btn btn-secondary group-open" data-group-id="${escapeHtml(group.id)}" ${canAccess?"":"disabled"}>Xem nhóm</button>
     ${membership}
   </div>
 </article>`;
}
function renderGroupPost(post){
 return `<article class="card post"><div class="post-head">${avatar(post.author,true)}<div class="post-author"><strong>${escapeHtml(displayName(post.author))}</strong><small>${escapeHtml(post.createdAt||"")}</small></div></div><div class="post-body">${escapeHtml(post.content||"")}</div>${renderPostMedia(post)}</article>`;
}
async function startConversation(){
 const target=state.viewedProfile;
 if(!target||target.code===state.user.code)return;
 try{
  let conversation;
  if(state.demo){
   conversation=state.conversations.find(item=>item.otherUser?.code===target.code);
   if(!conversation){
    conversation={id:Date.now(),otherUser:target,unreadCount:0,lastMessage:null};
    state.conversations.unshift(conversation);
    state.messagesByConversation[conversation.id]=[];
   }
  }else conversation=normalizeConversation(await Api.post("/conversations",{code:target.code}));
  if(conversation.otherUser.code!==target.code)throw new Error("Backend trả về sai người nhận hội thoại.");
  const existing=state.conversations.find(item=>String(item.id)===String(conversation.id));
  if(existing)Object.assign(existing,conversation);
  else state.conversations.unshift(conversation);
  state.activeConversationId=conversation.id;
  state.page="messages";
  document.querySelectorAll(".nav-item[data-page]").forEach(button=>button.classList.toggle("active",button.dataset.page==="messages"));
  renderPage();
  await openConversation(conversation.id);
 }catch(error){toast(error.message)}
}
async function loadGroups(){
 state.groupsLoading=true;state.groupError="";renderPage();
 try{state.groups=responseItems(await Api.get("/groups?page=1&pageSize=50")).map(normalizeGroup);state.groupsLoading=false;renderPage()}
 catch(error){state.groupsLoading=false;state.groupError=error.message;renderPage()}
}
async function openGroup(groupId){
 const group=state.groups.find(item=>String(item.id)===String(groupId));
 if(!group||group.schoolName!==state.user.school){toast("Bạn không thuộc đơn vị trực thuộc này");return}
 state.activeGroup=group.id;state.groupError="";
 if(!state.demo){
  state.groupsLoading=true;state.groupPosts=[];renderPage();
  try{
   const detail=normalizeGroup(await Api.get(`/groups/${encodeURIComponent(group.id)}`));
   const posts=await Api.get(`/groups/${encodeURIComponent(group.id)}/posts?page=1&pageSize=20`);
   if(String(detail.id)!==String(group.id))throw new Error("Backend trả về thông tin sai nhóm.");
   Object.assign(group,detail);
   state.groupPosts=responseItems(posts).map(normalizePost);state.groupsLoading=false;
  }catch(error){state.groupsLoading=false;state.groupError=error.message}
 }else state.groupPosts=createDemoGroupPosts(group.id,state.user);
 renderPage();
}
async function joinGroup(groupId){
 const group=state.groups.find(item=>String(item.id)===String(groupId));
 if(!group||group.schoolName!==state.user.school){toast("Bạn không thuộc đơn vị trực thuộc này");return}
 try{
  const result=state.demo?{isMember:true,memberCount:(Number(group.memberCount)||0)+1}:await Api.post(`/groups/${encodeURIComponent(group.id)}/members`);
  if(!result||result.isMember!==true||!Number.isFinite(result.memberCount))throw new Error("Backend không trả về trạng thái tham gia nhóm hợp lệ.");
  group.isMember=result.isMember;group.memberCount=result.memberCount;group.canPost=result.canPost??result.isMember;
  toast("Đã tham gia nhóm.");renderPage();
 }catch(error){toast(error.message)}
}
async function submitGroupPost(event){
 event.preventDefault();
 const content=$("#groupPostContent").value.trim();
 if(!content){toast("Hãy nhập nội dung bài đăng.");return}
 const submit=$("#groupPostForm").querySelector('[type="submit"]');
 submit.disabled=true;submit.textContent="Đang đăng...";
 const group=state.groups.find(item=>String(item.id)===String(state.activeGroup));
 if(!group?.canPost){submit.disabled=false;submit.textContent="Đăng bài trong nhóm";toast("Bạn không có quyền đăng bài trong nhóm này.");return}
 try{
  const post=state.demo?{id:Date.now(),author:state.user,content,createdAt:"Vừa xong"}:normalizePost(await Api.post(`/groups/${encodeURIComponent(group.id)}/posts`,{content}));
  if(!post||post.id===undefined||post.author?.code!==state.user.code)throw new Error("Backend không trả về bài viết nhóm hợp lệ.");
  state.groupPosts.unshift(post);renderPage();toast("Đã đăng bài trong nhóm.");
 }catch(error){toast(error.message)}
}
function renderFeature(title,desc,iconName,actionLabel){return `<div class="card"><div class="tile-icon">${icon(iconName)}</div><h3 class="section-title">${escapeHtml(title)}</h3><p class="muted">${escapeHtml(desc)}</p><button class="btn btn-secondary" type="button" disabled title="Chức năng chưa được triển khai">${escapeHtml(actionLabel)} · Chưa khả dụng</button><p class="muted small-text" style="margin-top:16px">Khu vực này hiện chỉ có giao diện minh họa; chưa đọc hoặc lưu dữ liệu Backend.</p></div><div class="section-title" style="margin-top:22px">Bài đăng mới nhất</div><div class="empty"><strong>Chưa có nội dung</strong>Các bài đăng phù hợp sẽ hiển thị tại đây.</div>`}
function formatTime(value){
  if(!value)return "";
  const date=new Date(value);
  return Number.isNaN(date.getTime())?escapeHtml(value):new Intl.DateTimeFormat("vi-VN",{hour:"2-digit",minute:"2-digit"}).format(date);
}
function formatFileSize(bytes){
  if(!Number.isFinite(bytes)||bytes<0)return "Không rõ dung lượng";
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1024*1024)return `${(bytes/1024).toFixed(0)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}
function renderConversations(){
  const query=state.conversationQuery.trim().toLocaleLowerCase("vi");
  const conversations=state.conversations.filter(item=>{
    const user=item.otherUser||{};
    return !query||`${displayName(user)} ${user.code||""}`.toLocaleLowerCase("vi").includes(query);
  });
  if(!conversations.length)return emptyState(query?"Không tìm thấy hội thoại":"Chưa có hội thoại","Các cuộc trò chuyện của bạn sẽ hiển thị tại đây.");
  return conversations.map(item=>{
    const user=item.otherUser||{};
    const active=String(item.id)===String(state.activeConversationId);
    const lastMessage=item.lastMessage;
    const preview=lastMessage?.content||(
      lastMessage?.attachment?.fileName?`Đã gửi tệp: ${lastMessage.attachment.fileName}`
      :lastMessage?.messageType==="Image"?"Đã gửi ảnh":"Chưa có tin nhắn"
    );
    return `<button class="conversation-item ${active?"active":""}" type="button" data-conversation-id="${escapeHtml(item.id)}">
      ${avatar(user,true)}<span class="conversation-summary"><strong>${escapeHtml(displayName(user))}</strong><small>${escapeHtml(preview)}</small></span>
      <span class="conversation-meta">${item.unreadCount?`<i class="unread-badge">${item.unreadCount}</i>`:""}<time>${formatTime(lastMessage?.createdAt)}</time></span>
    </button>`;
  }).join("");
}
function renderMessage(message){
  const own=message.sender?.code===state.user.code;
  const attachment=message.attachment;
  const image=attachment&&String(attachment.contentType||"").startsWith("image/");
  const video=attachment&&String(attachment.contentType||"").startsWith("video/");
  let attachmentMarkup="";
  if(attachment){
    attachmentMarkup=image&&attachment.url
      ?`<div class="message-image-attachment"><button class="message-image" type="button" data-image-url="${escapeHtml(attachment.url)}"><img src="${escapeHtml(attachment.url)}" alt="${escapeHtml(attachment.fileName||"Ảnh đính kèm")}" loading="lazy"></button><button class="download-attachment icon-btn" type="button" data-message-id="${escapeHtml(message.id)}" aria-label="Tải ảnh xuống">${icon("download")}</button></div>`
      :video&&attachment.url
        ?`<div class="message-video-attachment">${renderVideo(attachment,"Video trong tin nhắn")}<button class="download-attachment icon-btn" type="button" data-message-id="${escapeHtml(message.id)}" aria-label="Tải video xuống">${icon("download")}</button></div>`
        :`<div class="file-attachment-card"><span class="file-type-icon">${icon("file","icon file-icon")}</span><span class="file-metadata"><strong>${escapeHtml(attachment.fileName||"Tệp đính kèm")}</strong><small>${escapeHtml(attachment.contentType||"Định dạng không rõ")} · ${formatFileSize(attachment.sizeBytes)}</small></span><button class="download-attachment icon-btn" type="button" data-message-id="${escapeHtml(message.id)}" aria-label="Tải tệp xuống">${icon("download")}</button></div>`;
  }
  const status=message.status?`<span class="message-status">${escapeHtml(message.status)}</span>`:"";
  return `<article class="message-row ${own?"own":""}"><div class="message-bubble">${message.content?`<p>${escapeHtml(message.content)}</p>`:""}${attachmentMarkup}<div class="message-meta"><time>${formatTime(message.createdAt)}</time>${own?status:""}</div></div></article>`;
}
function renderChatThread(conversation){
  if(!conversation)return `<section class="chat-thread"><div class="empty"><strong>Chọn một cuộc trò chuyện</strong>Mở hội thoại để xem tin nhắn.</div></section>`;
  const messages=state.messagesByConversation[conversation.id]||[];
  const user=conversation.otherUser||{};
  const selected=state.messageAttachment;
  return `<section class="chat-thread">
    <header class="chat-thread-header">${avatar(user,true)}<div><strong>${escapeHtml(displayName(user))}</strong><small>${escapeHtml(user.code||"Thành viên xDTU")}</small></div></header>
    <div class="error-state chat-error ${state.chatError?"":"hidden"}">${escapeHtml(state.chatError)}</div>
    <div id="messageHistory" class="message-history">${state.messagesLoading?'<div class="loading-state" aria-label="Đang tải tin nhắn"></div>':messages.length?messages.map(renderMessage).join(""):emptyState("Chưa có tin nhắn","Hãy gửi lời chào để bắt đầu.")}</div>
    <form id="messageForm" class="message-composer">
      <div id="messageAttachmentPreview" class="message-attachment-preview ${selected?.contentType.startsWith("video/")?"has-video":""}">${selected?`${selected.contentType.startsWith("image/")?`<img src="${escapeHtml(selected.previewUrl)}" alt="Ảnh xem trước">`:selected.contentType.startsWith("video/")?`<video controls playsinline preload="metadata" aria-label="Xem trước video ${escapeHtml(selected.file.name)}"><source src="${escapeHtml(selected.previewUrl)}" type="${escapeHtml(selected.contentType)}"></video>`:`<span class="file-type-icon">${icon("file","icon file-icon")}</span>`}<span><strong>${escapeHtml(selected.file.name)}</strong><small>${escapeHtml(selected.contentType)} · ${formatFileSize(selected.file.size)}</small></span><button id="removeMessageAttachment" class="icon-btn" type="button" aria-label="Bỏ tệp">${icon("close")}</button>`:""}</div>
      <label class="sr-only" for="messageDraft">Nội dung tin nhắn</label>
      <textarea id="messageDraft" rows="2" placeholder="Viết tin nhắn..." aria-label="Nội dung tin nhắn">${escapeHtml(state.messageDraft)}</textarea>
      <div class="message-composer-actions"><div class="attachment-tools"><button id="messageFileButton" class="btn btn-attach" type="button">${icon("paperclip")}<span>Đính kèm</span></button><input id="messageFileInput" class="sr-only" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"></div><button class="btn btn-primary" type="submit">${icon("send")}<span>Gửi tin nhắn</span></button></div>
    </form>
  </section>`;
}
function renderMessages(){
  const active=state.conversations.find(item=>String(item.id)===String(state.activeConversationId));
  return `<div class="chat-layout">
    <aside class="chat-conversation-list"><div class="chat-list-heading"><div class="eyebrow">KẾT NỐI RIÊNG</div><h3>Tin nhắn</h3><input id="conversationSearch" class="field" type="search" value="${escapeHtml(state.conversationQuery)}" placeholder="Tìm hội thoại..." aria-label="Tìm hội thoại"></div><div id="conversationItems" class="conversation-items">${state.conversationsLoading?'<div class="loading-state"></div>':state.chatError&&!state.conversations.length?`<div class="error-state">${escapeHtml(state.chatError)}</div>`:renderConversations()}</div></aside>
    ${renderChatThread(active)}
  </div>`;
}
function renderNotifications(){return `<div class="card"><h3 class="section-title">Thông báo</h3><div class="empty"><strong>Bạn đã cập nhật!</strong>Thông báo theo dõi, bình luận, mua hàng và ghép đôi sẽ xuất hiện tại đây.</div></div>`}
function emptyState(title,desc){return `<div class="empty"><strong>${title}</strong>${desc}</div>`}
function bindPageActions(){
 $("#retryFeed")?.addEventListener("click",loadFeed);
 $("#choosePostImages")?.addEventListener("click",()=>$("#postImageInput").click());
 $("#postImageInput")?.addEventListener("change",e=>{
   const files=Array.from(e.target.files||[]);
   for(const file of files){
     const error=validateMediaFile(file,"image");
     if(error){toast(error);continue}
     if(state.pendingPostImages.length>=5){toast("Mỗi bài viết có thể đính kèm tối đa 5 ảnh.");break}
     state.pendingPostImages.push({file,previewUrl:URL.createObjectURL(file),contentType:mediaContentType(file)});
   }
   e.target.value="";
   renderPendingPostImages();
 });
 $("#choosePostVideo")?.addEventListener("click",()=>$("#postVideoInput").click());
 $("#postVideoInput")?.addEventListener("change",event=>{
   const file=event.target.files?.[0];event.target.value="";
   if(!file)return;
   const error=validateMediaFile(file,"video");
   if(error){toast(error);return}
   if(state.pendingPostVideo)revokePreview(state.pendingPostVideo.previewUrl);
   state.pendingPostVideo={file,previewUrl:URL.createObjectURL(file),contentType:mediaContentType(file)};
   renderPendingPostVideo();
 });
 document.querySelectorAll(".remove-post-image").forEach(button=>button.addEventListener("click",()=>{
   const index=Number(button.dataset.index),removed=state.pendingPostImages.splice(index,1)[0];
   if(removed)revokePreview(removed.previewUrl);
   renderPendingPostImages();
 }));
 $("#publishPost")?.addEventListener("click",publishPost);
 document.querySelectorAll(".remove-post-video").forEach(button=>button.addEventListener("click",()=>{
   if(state.pendingPostVideo)revokePreview(state.pendingPostVideo.previewUrl);
   state.pendingPostVideo=null;renderPendingPostVideo();
 }));
 document.querySelectorAll(".group-open").forEach(button=>button.addEventListener("click",()=>openGroup(button.dataset.groupId)));
 document.querySelectorAll(".join-group").forEach(button=>button.addEventListener("click",()=>joinGroup(button.dataset.groupId)));
 $("#backToGroups")?.addEventListener("click",()=>{state.activeGroup=null;state.groupError="";renderPage()});
 $("#groupPostForm")?.addEventListener("submit",submitGroupPost);
 $("#editProfile")?.addEventListener("click",openProfileModal);
 $("#startConversation")?.addEventListener("click",startConversation);
 $("#changeAvatar")?.addEventListener("click",()=>$("#profileAvatarInput").click());
 $("#profileAvatarInput")?.addEventListener("change",async event=>{
   const file=event.target.files?.[0];event.target.value="";
   if(file)await uploadAvatar(file);
 });
 document.querySelectorAll(".like-btn").forEach(button=>button.addEventListener("click",()=>toggleLike(button)));
 document.querySelectorAll(".comment-btn").forEach(button=>button.addEventListener("click",()=>{const post=postForButton(button);if(post)openComments(post)}));
 document.querySelectorAll(".post-menu").forEach(button=>button.addEventListener("click",()=>button.closest(".post-menu-actions").classList.toggle("open")));
 document.querySelectorAll(".post-image-button").forEach(button=>button.addEventListener("click",()=>openImageViewer(button.dataset.imageUrl)));
 document.querySelectorAll(".delete-post").forEach(button=>button.addEventListener("click",()=>deletePost(postForButton(button))));
 document.querySelectorAll(".edit-post").forEach(button=>button.addEventListener("click",()=>openEditPost(postForButton(button))));
 if(state.page==="messages")bindChatActions();
}
function postForButton(button){
 const id=button.closest("[data-post-id]")?.dataset.postId;
 return [...state.posts,...(state.profilePosts||[])].find(post=>String(post.id)===String(id));
}
function renderPendingPostImages(){
 const box=$("#postImagePreview");
 if(!box)return;
 box.innerHTML=state.pendingPostImages.map((item,index)=>`<div class="attachment-preview"><img src="${escapeHtml(item.previewUrl)}" alt="${escapeHtml(item.file.name)}"><span>${escapeHtml(item.file.name)} · ${formatFileSize(item.file.size)}</span><button class="remove-post-image icon-btn" type="button" data-index="${index}" aria-label="Bỏ ảnh">${icon("close")}</button></div>`).join("");
 document.querySelectorAll(".remove-post-image").forEach(button=>button.addEventListener("click",()=>{
   const removed=state.pendingPostImages.splice(Number(button.dataset.index),1)[0];
   if(removed)revokePreview(removed.previewUrl);
   renderPendingPostImages();
 }));
}
function renderPendingPostVideo(){
 const box=$("#postVideoPreview");
 if(!box)return;
 const item=state.pendingPostVideo;
 box.innerHTML=item?`<div class="attachment-preview video-preview"><video controls playsinline preload="metadata" aria-label="Xem trước video ${escapeHtml(item.file.name)}"><source src="${escapeHtml(item.previewUrl)}" type="${escapeHtml(item.contentType||mediaContentType(item.file))}">Trình duyệt không hỗ trợ phát video.</video><span>${escapeHtml(item.file.name)} · ${formatFileSize(item.file.size)}</span><button class="remove-post-video icon-btn" type="button" aria-label="Bỏ video">${icon("close")}</button></div>`:"";
 box.querySelector(".remove-post-video")?.addEventListener("click",()=>{
  if(state.pendingPostVideo)revokePreview(state.pendingPostVideo.previewUrl);
  state.pendingPostVideo=null;renderPendingPostVideo();
 });
}
async function publishPost(){
 const content=$("#postContent").value.trim(),scope=$("#postScope").value;
 if(!content&&!state.pendingPostImages.length&&!state.pendingPostVideo)return toast("Nhập nội dung hoặc chọn ảnh/video.");
 const button=$("#publishPost");button.disabled=true;button.classList.add("is-loading");button.textContent=state.pendingPostImages.length||state.pendingPostVideo?"Đang tải media...":"Đang đăng...";
 try{
   let created;
   if(state.demo){
     created={id:Date.now(),author:state.user,content,visibility:scope==="anonymous"?"Anonymous":"Public",createdAt:"Vừa xong",likeCount:0,commentCount:0,isLikedByCurrentUser:false,images:state.pendingPostImages.map(item=>({url:item.previewUrl,previewUrl:item.previewUrl,fileName:item.file.name,contentType:item.contentType,sizeBytes:item.file.size})),videos:state.pendingPostVideo?[{url:state.pendingPostVideo.previewUrl,previewUrl:state.pendingPostVideo.previewUrl,fileName:state.pendingPostVideo.file.name,contentType:state.pendingPostVideo.contentType,sizeBytes:state.pendingPostVideo.file.size}]:[]};
   }else if(state.pendingPostImages.length||state.pendingPostVideo){
     const form=new FormData();
     form.append("content",content);form.append("visibility",scope==="anonymous"?"Anonymous":"Public");
     state.pendingPostImages.forEach(item=>form.append("images",item.file,item.file.name));
     if(state.pendingPostVideo)form.append("videos",state.pendingPostVideo.file,state.pendingPostVideo.file.name);
     created=await Api.postForm("/posts",form);
   }else{
     created=await Api.post("/posts",{content,visibility:scope==="anonymous"?"Anonymous":"Public"});
   }
   if(!created||created.id===undefined)throw new Error("Backend không trả về bài viết vừa tạo.");
   const post=normalizePost({...created,isOwnedByCurrentUser:true});
   state.posts.unshift(post);
   state.user.postCount=(Number(state.user.postCount)||0)+1;
   state.commentsByPost[post.id]=[];
   if(!state.demo){
    state.pendingPostImages.forEach(item=>revokePreview(item.previewUrl));
    if(state.pendingPostVideo)revokePreview(state.pendingPostVideo.previewUrl);
   }
   state.pendingPostImages=[];state.pendingPostVideo=null;
   renderPage();toast("Đã đăng bài.");
 }catch(err){button.disabled=false;button.classList.remove("is-loading");button.textContent="Đăng bài";toast(err.message)}
}
async function deletePost(post){
 if(!post||!await confirmDialog("Xóa bài viết?","Bài viết này sẽ bị xóa khỏi bảng tin. Bạn có chắc chắn muốn tiếp tục?"))return;
 try{
   if(!state.demo)await Api.delete(post.groupId!==undefined&&post.groupId!==null?`/groups/${encodeURIComponent(post.groupId)}/posts/${encodeURIComponent(post.id)}`:`/posts/${encodeURIComponent(post.id)}`);
   (post.images||[]).forEach(image=>revokePreview(image.previewUrl));
   (post.videos||[]).forEach(video=>revokePreview(video.previewUrl));
   state.posts=state.posts.filter(item=>String(item.id)!==String(post.id));
   if(state.profilePosts)state.profilePosts=state.profilePosts.filter(item=>String(item.id)!==String(post.id));
   if((post.groupId===undefined||post.groupId===null)&&post.isOwnedByCurrentUser)state.user.postCount=Math.max(0,(Number(state.user.postCount)||0)-1);
   renderPage();toast("Đã xóa bài viết.");
 }catch(err){toast(err.message)}
}
function openEditPost(post){
 if(!post)return;
 $("#modalRoot").innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="editPostTitle"><div class="modal-head"><h3 id="editPostTitle">Chỉnh sửa bài viết</h3><button class="modal-close icon-btn" type="button" aria-label="Đóng">${icon("close")}</button></div><label class="sr-only" for="editPostContent">Nội dung bài viết</label><textarea id="editPostContent" class="field" rows="5">${escapeHtml(post.content)}</textarea><div class="modal-actions"><button class="btn btn-secondary modal-close" type="button">Hủy</button><button id="savePostEdit" class="btn btn-primary" type="button">${icon("check")}Lưu thay đổi</button></div></section></div>`;
 document.querySelectorAll(".modal-close").forEach(button=>button.addEventListener("click",()=>$("#modalRoot").innerHTML=""));
 $("#savePostEdit").addEventListener("click",async()=>{
   const content=$("#editPostContent").value.trim();if(!content)return toast("Nội dung bài viết không được để trống.");
   try{
     if(state.demo)post.content=content;
     else{const path=post.groupId!==undefined&&post.groupId!==null?`/groups/${encodeURIComponent(post.groupId)}/posts/${encodeURIComponent(post.id)}`:`/posts/${encodeURIComponent(post.id)}`;const updated=await Api.put(path,{content});post.content=updated?.content??content}
     $("#modalRoot").innerHTML="";renderPage();toast("Đã cập nhật bài viết.");
   }catch(err){toast(err.message)}
 });
}
async function toggleLike(button){
 const post=postForButton(button);if(!post)return;
 const willLike=!post.likedByMe;
 try{
   let result=null;
   if(!state.demo)result=willLike?await Api.request(`/posts/${post.id}/likes`,{method:"POST"}):await Api.delete(`/posts/${post.id}/likes`);
   if(!state.demo&&willLike&&(!result||typeof result.likeCount!=="number"||result.isLikedByCurrentUser!==true))throw new Error("Backend trả về trạng thái thích không đúng định dạng.");
   post.likedByMe=willLike;
   if(result&&typeof result.likeCount==="number")post.likes=result.likeCount;
   else if(state.demo||result===null)post.likes=Math.max(0,post.likes+(willLike?1:-1));
   else throw new Error("Backend không trả về số lượt thích.");
   renderPage();
 }catch(err){toast(err.message)}
}
function openImageViewer(url){
 if(!url)return;
 const layer=document.createElement("div");
 layer.innerHTML=`<div class="image-viewer" role="dialog" aria-modal="true" aria-label="Xem ảnh kích thước lớn"><button class="image-viewer-close icon-btn" type="button" aria-label="Đóng ảnh">${icon("close")}</button><img src="${escapeHtml(url)}" alt="Ảnh bài viết"></div>`;
 const viewer=layer.firstElementChild;
 $("#modalRoot").append(viewer);
 const close=()=>viewer.remove();
 viewer.querySelector(".image-viewer-close").addEventListener("click",close);
 viewer.addEventListener("click",event=>{if(event.target===viewer)close()});
}
function commentTree(comments,parentId=null,depth=0){
 if(depth>4)return "";
 return comments.filter(comment=>String(comment.parentCommentId??"")===String(parentId??"")).map(comment=>{
   const own=comment.author?.code===state.user.code;
   return `<article class="comment-item" style="--comment-depth:${depth}"><div class="comment-avatar">${avatar(comment.author,true)}</div><div class="comment-content"><div class="comment-bubble"><strong>${escapeHtml(displayName(comment.author))}</strong><p>${escapeHtml(comment.content||"")}</p>${renderPostMedia(comment)}</div><div class="comment-meta"><time>${escapeHtml(comment.createdAt||"Vừa xong")}</time><button type="button" class="reply-comment" data-comment-id="${escapeHtml(comment.id)}">${icon("reply")}Trả lời</button>${own?`<button type="button" class="delete-comment" data-comment-id="${escapeHtml(comment.id)}">${icon("trash")}Xóa</button>`:""}</div>${commentTree(comments,comment.id,depth+1)}</div></article>`;
 }).join("");
}
function renderCommentsModal(post,error=""){
 const comments=state.commentsByPost[post.id]||[];
 $("#modalRoot").innerHTML=`<div class="modal-backdrop"><section class="modal comments-modal" role="dialog" aria-modal="true" aria-labelledby="commentsTitle"><div class="modal-head"><div><div class="eyebrow">THẢO LUẬN</div><h3 id="commentsTitle">Bình luận · ${post.comments}</h3></div><button class="modal-close icon-btn" type="button" aria-label="Đóng">${icon("close")}</button></div>${error?`<div class="error-state comments-error">${escapeHtml(error)}</div>`:`<div class="comments-list">${comments.length?commentTree(comments):emptyState("Chưa có bình luận","Hãy bắt đầu cuộc trò chuyện.")}</div>`}<form id="commentsForm" class="comment-form"><input id="replyToComment" type="hidden" value=""><div id="replyContext" class="reply-context hidden"><span></span><button id="cancelReply" class="icon-btn" type="button" aria-label="Hủy trả lời">${icon("close")}</button></div><label class="sr-only" for="newCommentContent">Viết bình luận</label><textarea id="newCommentContent" class="field" rows="2" placeholder="Viết bình luận hoặc đính kèm ảnh/video..." ></textarea><div id="commentAttachmentPreview" class="attachment-preview-grid"></div><div class="comment-form-actions"><div class="comment-attachment-tools"><button id="chooseCommentImages" class="btn btn-attach" type="button">${icon("image")}<span>Ảnh</span></button><input id="commentImageInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple><button id="chooseCommentVideo" class="btn btn-attach" type="button">${icon("video")}<span>Video</span></button><input id="commentVideoInput" class="sr-only" type="file" accept="video/mp4,video/webm,.mp4,.webm"></div><button class="btn btn-primary" type="submit">Gửi</button></div></form></section></div>`;
 document.querySelectorAll(".modal-close").forEach(button=>button.addEventListener("click",closeCommentsModal));
 $("#commentsForm").addEventListener("submit",event=>submitComment(event,post));
 $("#chooseCommentImages").addEventListener("click",()=>$("#commentImageInput").click());
 $("#commentImageInput").addEventListener("change",event=>{
  for(const file of Array.from(event.target.files||[])){
   const error=validateMediaFile(file,"image");
   if(error){toast(error);continue}
   if(state.pendingCommentImages.length>=5){toast("Mỗi bình luận có thể đính kèm tối đa 5 ảnh.");break}
   state.pendingCommentImages.push({file,previewUrl:URL.createObjectURL(file)});
  }
  event.target.value="";renderPendingCommentMedia();
 });
 $("#chooseCommentVideo").addEventListener("click",()=>$("#commentVideoInput").click());
 $("#commentVideoInput").addEventListener("change",event=>{
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  const error=validateMediaFile(file,"video");
  if(error){toast(error);return}
  if(state.pendingCommentVideo)revokePreview(state.pendingCommentVideo.previewUrl);
  state.pendingCommentVideo={file,previewUrl:URL.createObjectURL(file)};
  renderPendingCommentMedia();
 });
 document.querySelectorAll(".reply-comment").forEach(button=>button.addEventListener("click",()=>{
   const comment=comments.find(item=>String(item.id)===button.dataset.commentId);
   if(!comment)return;
   $("#replyToComment").value=comment.id;
   $("#replyContext").classList.remove("hidden");
   $("#replyContext").querySelector("span").textContent=`Đang trả lời ${displayName(comment.author)}`;
   $("#newCommentContent").focus();
 }));
 $("#cancelReply").addEventListener("click",()=>{$("#replyToComment").value="";$("#replyContext").classList.add("hidden")});
 document.querySelectorAll(".delete-comment").forEach(button=>button.addEventListener("click",()=>deleteComment(post,button.dataset.commentId)));
 document.querySelectorAll(".comments-list .post-image-button").forEach(button=>button.addEventListener("click",()=>openImageViewer(button.dataset.imageUrl)));
 renderPendingCommentMedia();
}
function clearPendingCommentMedia(){
 state.pendingCommentImages.forEach(item=>revokePreview(item.previewUrl));
 if(state.pendingCommentVideo)revokePreview(state.pendingCommentVideo.previewUrl);
 state.pendingCommentImages=[];state.pendingCommentVideo=null;
}
function closeCommentsModal(){
 clearPendingCommentMedia();
 $("#modalRoot").innerHTML="";
}
function renderPendingCommentMedia(){
 const box=$("#commentAttachmentPreview");
 if(!box)return;
 const imageItems=state.pendingCommentImages.map((item,index)=>`<div class="attachment-preview"><img src="${escapeHtml(item.previewUrl)}" alt="${escapeHtml(item.file.name)}"><span>${escapeHtml(item.file.name)} · ${formatFileSize(item.file.size)}</span><button class="remove-comment-image icon-btn" data-index="${index}" type="button" aria-label="Bỏ ảnh">${icon("close")}</button></div>`);
 if(state.pendingCommentVideo){
  const item=state.pendingCommentVideo;
  imageItems.push(`<div class="attachment-preview video-preview"><video controls playsinline preload="metadata" aria-label="Xem trước video ${escapeHtml(item.file.name)}"><source src="${escapeHtml(item.previewUrl)}" type="${escapeHtml(mediaContentType(item.file))}">Trình duyệt không hỗ trợ phát video.</video><span>${escapeHtml(item.file.name)} · ${formatFileSize(item.file.size)}</span><button class="remove-comment-video icon-btn" type="button" aria-label="Bỏ video">${icon("close")}</button></div>`);
 }
 box.innerHTML=imageItems.join("");
 box.querySelectorAll(".remove-comment-image").forEach(button=>button.addEventListener("click",()=>{
  const item=state.pendingCommentImages.splice(Number(button.dataset.index),1)[0];
  if(item)revokePreview(item.previewUrl);renderPendingCommentMedia();
 }));
 box.querySelector(".remove-comment-video")?.addEventListener("click",()=>{
  if(state.pendingCommentVideo)revokePreview(state.pendingCommentVideo.previewUrl);
  state.pendingCommentVideo=null;renderPendingCommentMedia();
 });
}
async function openComments(post){
 clearPendingCommentMedia();
 $("#modalRoot").innerHTML=`<div class="modal-backdrop"><section class="modal comments-modal"><div class="modal-head"><h3>Bình luận</h3><button class="modal-close icon-btn" type="button" aria-label="Đóng">${icon("close")}</button></div><div class="loading-state" aria-label="Đang tải bình luận"></div></section></div>`;
 document.querySelectorAll(".modal-close").forEach(button=>button.addEventListener("click",closeCommentsModal));
 try{
   if(state.demo)state.commentsByPost[post.id]=state.commentsByPost[post.id]||[];
   else{
    const result=await Api.get(`/posts/${encodeURIComponent(post.id)}/comments?page=1&pageSize=50`);
    state.commentsByPost[post.id]=responseItems(result).map(normalizeComment);
    if(Number.isFinite(result?.total))post.comments=result.total;
   }
   if(state.demo)post.comments=state.commentsByPost[post.id].length;
   renderCommentsModal(post);
 }catch(err){state.commentsByPost[post.id]=[];renderCommentsModal(post,err.message)}
}
async function submitComment(event,post){
 event.preventDefault();
 const content=$("#newCommentContent").value.trim();
 if(!content&&!state.pendingCommentImages.length&&!state.pendingCommentVideo)return toast("Nhập bình luận hoặc đính kèm ảnh/video.");
 const parentValue=$("#replyToComment").value;
 const submit=$("#commentsForm").querySelector('[type="submit"]');
 submit.disabled=true;submit.textContent=state.pendingCommentImages.length||state.pendingCommentVideo?"Đang tải media...":"Đang gửi...";
 try{
   let comment;
   const images=state.pendingCommentImages.map(item=>({url:item.previewUrl,previewUrl:item.previewUrl,fileName:item.file.name,contentType:mediaContentType(item.file),sizeBytes:item.file.size}));
   const videos=state.pendingCommentVideo?[{url:state.pendingCommentVideo.previewUrl,previewUrl:state.pendingCommentVideo.previewUrl,fileName:state.pendingCommentVideo.file.name,contentType:mediaContentType(state.pendingCommentVideo.file),sizeBytes:state.pendingCommentVideo.file.size}]:[];
   if(state.demo)comment={id:Date.now(),postId:post.id,parentCommentId:parentValue||null,content,author:state.user,images,videos,createdAt:"Vừa xong"};
   else if(state.pendingCommentImages.length||state.pendingCommentVideo){
    const form=new FormData();form.append("content",content);form.append("parentCommentId",parentValue||"");
    state.pendingCommentImages.forEach(item=>form.append("images",item.file,item.file.name));
    if(state.pendingCommentVideo)form.append("videos",state.pendingCommentVideo.file,state.pendingCommentVideo.file.name);
    comment=normalizeComment(await Api.postForm(`/posts/${encodeURIComponent(post.id)}/comments`,form));
   }else comment=normalizeComment(await Api.post(`/posts/${encodeURIComponent(post.id)}/comments`,{content,parentCommentId:parentValue||null}));
   if(!comment||comment.id===undefined)throw new Error("Backend không trả về bình luận vừa tạo.");
   state.commentsByPost[post.id].push(comment);
   post.comments++;
   if(!state.demo){state.pendingCommentImages.forEach(item=>revokePreview(item.previewUrl));if(state.pendingCommentVideo)revokePreview(state.pendingCommentVideo.previewUrl)}
   state.pendingCommentImages=[];state.pendingCommentVideo=null;
   renderCommentsModal(post);
 }catch(err){submit.disabled=false;submit.textContent="Gửi";toast(err.message)}
}
async function deleteComment(post,commentId){
 const comments=state.commentsByPost[post.id]||[];
 const comment=comments.find(item=>String(item.id)===String(commentId));
 if(!comment||!await confirmDialog("Xóa bình luận?","Bình luận và các câu trả lời bên dưới sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục?"))return;
 try{
   if(!state.demo)await Api.delete(`/comments/${comment.id}`);
   const removedIds=new Set([String(comment.id)]);
   let found=true;
   while(found){found=false;comments.forEach(item=>{if(removedIds.has(String(item.parentCommentId))&&!removedIds.has(String(item.id))){removedIds.add(String(item.id));found=true}})}
   state.commentsByPost[post.id]=comments.filter(item=>!removedIds.has(String(item.id)));
   post.comments=Math.max(0,post.comments-removedIds.size);
   renderCommentsModal(post);
 }catch(err){toast(err.message)}
}
function confirmDialog(title,message){
 return new Promise(resolve=>{
  const layer=document.createElement("div");
  layer.innerHTML=`<div class="modal-backdrop"><section class="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmMessage"><div class="modal-head"><h3 id="confirmTitle">${escapeHtml(title)}</h3><button class="cancel-confirm icon-btn" type="button" aria-label="Đóng">${icon("close")}</button></div><p id="confirmMessage" class="muted">${escapeHtml(message)}</p><div class="modal-actions"><button class="cancel-confirm btn btn-secondary" type="button">Hủy</button><button class="accept-confirm btn btn-danger" type="button">${icon("trash")}Xóa</button></div></section></div>`;
  const backdrop=layer.firstElementChild;
  $("#modalRoot").append(backdrop);
  const finish=value=>{backdrop.remove();resolve(value)};
  backdrop.querySelectorAll(".cancel-confirm").forEach(button=>button.addEventListener("click",()=>finish(false)));
  backdrop.querySelector(".accept-confirm").addEventListener("click",()=>finish(true));
  backdrop.addEventListener("click",event=>{if(event.target===backdrop)finish(false)});
 });
}
function messageFileError(file){
 const extension=file.name.split(".").pop().toLowerCase();
 const supportedTypes={
  jpg:["image/jpeg"],jpeg:["image/jpeg"],png:["image/png"],gif:["image/gif"],webp:["image/webp"],
  pdf:["application/pdf","application/x-pdf"],doc:["application/msword"],
  docx:["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls:["application/vnd.ms-excel"],xlsx:["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt:["application/vnd.ms-powerpoint"],pptx:["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  mp4:["video/mp4"],webm:["video/webm"],
  txt:["text/plain"],csv:["text/csv","application/vnd.ms-excel"],
  zip:["application/zip","application/x-zip-compressed","multipart/x-zip"]
 };
 const supportedExtensions=Object.keys(supportedTypes);
 if(!supportedExtensions.includes(extension))return "Định dạng tệp này chưa được hỗ trợ.";
 const contentType=mimeEssence(file.type);
 if(contentType&&contentType!=="application/octet-stream"&&!supportedTypes[extension].includes(contentType))return "Loại nội dung của tệp không khớp với phần mở rộng.";
 const maxBytes=["mp4","webm"].includes(extension)?50*1024*1024:10*1024*1024;
 if(file.size>maxBytes)return `Tệp đính kèm không được lớn hơn ${maxBytes/1024/1024} MiB.`;
 return "";
}
function messageContentType(file){
 return contentTypeFromName(file.name,file.type);
}
function bindChatActions(){
 $("#conversationSearch")?.addEventListener("input",event=>{
   state.conversationQuery=event.target.value;
   const query=state.conversationQuery.trim().toLocaleLowerCase("vi");
   document.querySelectorAll(".conversation-item").forEach(item=>{item.hidden=!item.textContent.toLocaleLowerCase("vi").includes(query)});
 });
 document.querySelectorAll(".conversation-item").forEach(button=>button.addEventListener("click",()=>openConversation(button.dataset.conversationId)));
 $("#messageDraft")?.addEventListener("input",event=>{state.messageDraft=event.target.value});
 $("#messageFileButton")?.addEventListener("click",()=>$("#messageFileInput").click());
 $("#messageFileInput")?.addEventListener("change",event=>{
   const file=event.target.files?.[0];
   event.target.value="";
   if(!file)return;
   const error=messageFileError(file);
   if(error){toast(error);return}
   if(state.messageAttachment)revokePreview(state.messageAttachment.previewUrl);
   state.messageAttachment={file,previewUrl:URL.createObjectURL(file),contentType:messageContentType(file)};
   renderPage();
 });
 $("#removeMessageAttachment")?.addEventListener("click",()=>{
   if(state.messageAttachment)revokePreview(state.messageAttachment.previewUrl);
   state.messageAttachment=null;renderPage();
 });
 $("#messageForm")?.addEventListener("submit",sendMessage);
 document.querySelectorAll(".download-attachment").forEach(button=>button.addEventListener("click",()=>downloadMessage(button.dataset.messageId)));
 document.querySelectorAll(".message-image").forEach(button=>button.addEventListener("click",()=>openImageViewer(button.dataset.imageUrl)));
}
async function loadConversations(){
 state.conversationsLoading=true;state.chatError="";renderPage();
 try{
   const result=await Api.get("/conversations?page=1&pageSize=50");
   state.conversations=responseItems(result).map(normalizeConversation);
   state.conversationsLoading=false;
   const selected=state.conversations.find(item=>String(item.id)===String(state.activeConversationId))||state.conversations[0];
   state.activeConversationId=selected?.id??null;
   if(selected)await openConversation(selected.id);else renderPage();
 }catch(err){state.conversationsLoading=false;state.chatError=err.message;renderPage()}
}
async function openConversation(conversationId){
 if(String(state.activeConversationId)!==String(conversationId)&&state.messageAttachment){revokePreview(state.messageAttachment.previewUrl);state.messageAttachment=null}
 state.activeConversationId=conversationId;state.chatError="";state.messageDraft="";
 if(!state.demo)state.messagesLoading=true;
 renderPage();
 if(state.demo){
   state.messagesLoading=false;
   startMessagePolling();
   return;
 }
 try{
   const messages=await Api.get(`/conversations/${encodeURIComponent(conversationId)}/messages?page=1&pageSize=50`);
   const normalized=responseItems(messages).map(normalizeMessage);
   if(normalized.some(message=>String(message.conversationId)!==String(conversationId)))throw new Error("Backend trả về tin nhắn thuộc hội thoại khác.");
   state.messagesByConversation[conversationId]=normalized;
   state.messagesLoading=false;
   renderPage();scrollMessageHistory();startMessagePolling();
 }catch(err){state.messagesLoading=false;state.chatError=err.message;renderPage()}
}
function startMessagePolling(){
 if(state.pollTimer)clearInterval(state.pollTimer);
 state.pollTimer=null;
 if(state.demo||state.page!=="messages"||state.activeConversationId===null)return;
 state.pollTimer=setInterval(()=>{if(!document.hidden)pollNewMessages()},5000);
}
async function pollNewMessages(){
 const conversationId=state.activeConversationId;
 if(conversationId===null||state.page!=="messages"||state.pollInFlight)return;
 const messages=state.messagesByConversation[conversationId]||[];
 const lastMessage=messages[messages.length-1];
 state.pollInFlight=true;
 try{
   const afterMessageId=lastMessage?lastMessage.id:0;
   const result=await Api.get(`/conversations/${encodeURIComponent(conversationId)}/messages?afterMessageId=${encodeURIComponent(afterMessageId)}`);
   if(state.page!=="messages"||String(state.activeConversationId)!==String(conversationId))return;
   const incoming=responseItems(result).map(normalizeMessage);
   if(incoming.some(message=>String(message.conversationId)!==String(conversationId)))throw new Error("Backend trả về tin nhắn thuộc hội thoại khác.");
   if(!incoming.length){state.chatError="";const errorBox=$("#pageContent .chat-error");if(errorBox){errorBox.textContent="";errorBox.classList.add("hidden")}return}
   const known=new Set(messages.map(message=>String(message.id)));
   const unique=incoming.filter(message=>!known.has(String(message.id)));
   if(!unique.length)return;
   state.messagesByConversation[conversationId]=messages.concat(unique);
   const conversation=state.conversations.find(item=>String(item.id)===String(conversationId));
   if(conversation)conversation.lastMessage=unique[unique.length-1];
   state.chatError="";renderPage();scrollMessageHistory();
 }catch(err){
  if(state.page==="messages"&&String(state.activeConversationId)===String(conversationId)){
   state.chatError=err.message;
   const errorBox=$("#pageContent .chat-error");
   if(errorBox){errorBox.textContent=err.message;errorBox.classList.remove("hidden")}
  }
 }finally{state.pollInFlight=false}
}
function scrollMessageHistory(){
 const history=$("#messageHistory");
 if(history)history.scrollTop=history.scrollHeight;
}
async function sendMessage(event){
 event.preventDefault();
 const conversationId=state.activeConversationId;
 if(conversationId===null)return;
 const content=state.messageDraft.trim(),selected=state.messageAttachment;
 if(!content&&!selected)return toast("Nhập tin nhắn hoặc chọn tệp đính kèm.");
 const submit=$("#messageForm").querySelector('[type="submit"]');
 submit.disabled=true;submit.textContent=selected?"Đang tải tệp...":"Đang gửi...";
 try{
   let message;
   if(state.demo){
     const attachment=selected?{fileName:selected.file.name,contentType:selected.contentType||messageContentType(selected.file),sizeBytes:selected.file.size,url:selected.previewUrl,previewUrl:selected.previewUrl}:null;
     message={id:Date.now(),conversationId,sender:state.user,content,messageType:attachment?(attachment.contentType.startsWith("image/")?"Image":"File"):"Text",attachment,createdAt:new Date().toISOString(),status:"Sent"};
   }else if(selected){
     const form=new FormData();form.append("file",selected.file,selected.file.name);form.append("content",content);
     message=normalizeMessage(await Api.postForm(`/conversations/${encodeURIComponent(conversationId)}/messages`,form));
   }else{
     message=normalizeMessage(await Api.post(`/conversations/${encodeURIComponent(conversationId)}/messages`,{content,messageType:"Text"}));
   }
   if(message.sender?.code!==state.user.code||String(message.conversationId)!==String(conversationId))throw new Error("Backend không trả về tin nhắn hợp lệ.");
   if(selected&&!message.attachment?.url)throw new Error("Backend không trả về URL tệp đính kèm hợp lệ.");
   if(!state.messagesByConversation[conversationId])state.messagesByConversation[conversationId]=[];
   state.messagesByConversation[conversationId].push(message);
   const conversation=state.conversations.find(item=>String(item.id)===String(conversationId));
   if(conversation)conversation.lastMessage=message;
   if(selected&&!state.demo)revokePreview(selected.previewUrl);
   state.messageAttachment=null;state.messageDraft="";state.chatError="";
   renderPage();scrollMessageHistory();startMessagePolling();
 }catch(err){submit.disabled=false;submit.textContent="Gửi tin nhắn";toast(err.message)}
}
async function downloadMessage(messageId){
 const button=Array.from(document.querySelectorAll(".download-attachment")).find(item=>String(item.dataset.messageId)===String(messageId));
 if(button){button.disabled=true;button.innerHTML=icon("download")}
 try{
   let blob,fileName="xdtu-attachment";
   if(state.demo){
     const message=Object.values(state.messagesByConversation).flat().find(item=>String(item.id)===String(messageId));
     if(!message?.attachment?.url)return toast("Không tìm thấy tệp đính kèm.");
     const response=await fetch(message.attachment.url);blob=await response.blob();fileName=message.attachment.fileName||fileName;
   }else{
     const result=await Api.download(`/messages/${encodeURIComponent(messageId)}/attachment`);
     blob=result.blob;
     const disposition=result.contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
     if(disposition)fileName=decodeURIComponent(disposition[1]||disposition[2]);
   }
   const url=URL.createObjectURL(blob),link=document.createElement("a");
   link.href=url;link.download=fileName;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Đã tải tệp xuống.");
 }catch(err){toast(err.message)}
 finally{if(button){button.disabled=false;button.innerHTML=icon("download")}}
}
function openProfileModal(){
 const u=state.user;
 $("#modalRoot").innerHTML=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Chỉnh sửa trang cá nhân</h3><button class="modal-close icon-btn" type="button" aria-label="Đóng">${icon("close")}</button></div><p class="muted small-text">Thông tin định danh do nhà trường cung cấp được khóa và không thể chỉnh sửa.</p><div class="form-grid"><div class="form-group"><label>Mã sinh viên / giảng viên (khóa)</label><input class="field" value="${escapeHtml(u.code)}" disabled></div><div class="form-group"><label>Họ tên (khóa)</label><input class="field" value="${escapeHtml(u.fullName)}" disabled></div><div class="form-group full-row"><label>Nickname (tùy chọn)</label><input id="nickname" class="field" value="${escapeHtml(u.nickname||"")}" placeholder="Tên hiển thị thay cho họ tên"></div><div class="form-group"><label>Sở thích</label><input id="interests" class="field" value="${escapeHtml(u.interests||"")}"></div><div class="form-group"><label>Tình trạng</label><select id="relationship" class="field"><option value="Chưa cập nhật">Chưa cập nhật</option><option value="Độc thân" ${u.relationshipStatus==="Độc thân"||u.relationshipStatus==="Single"?"selected":""}>Độc thân</option><option value="Hẹn hò" ${u.relationshipStatus==="Hẹn hò"||u.relationshipStatus==="Dating"?"selected":""}>Hẹn hò</option></select></div><div class="form-group full-row"><label>Mô tả</label><textarea id="bio" class="field" rows="3">${escapeHtml(u.bio||"")}</textarea></div><div class="form-group full-row"><label><input id="nicknameEnabled" type="checkbox" ${u.nicknameEnabled?"checked":""}> Sử dụng nickname thay cho họ tên khi hiển thị</label></div></div><div class="modal-actions"><button class="btn btn-secondary modal-close">Hủy</button><button id="saveProfile" class="btn btn-primary">Lưu thay đổi</button></div></div></div>`;
 document.querySelectorAll(".modal-close").forEach(b=>b.addEventListener("click",()=>$("#modalRoot").innerHTML=""));
 $("#saveProfile").addEventListener("click",async()=>{
  const updates={nickname:$("#nickname").value.trim(),nicknameEnabled:$("#nicknameEnabled").checked,interests:$("#interests").value.trim(),relationshipStatus:["Độc thân","Hẹn hò","Chưa cập nhật"].includes($("#relationship").value)?$("#relationship").value:"Chưa cập nhật",bio:$("#bio").value.trim()};
  try{
   const updated=state.demo?{...u,...updates}:normalizeUser(await Api.put("/users/me/profile",updates));
   if(updated.code!==u.code)throw new Error("Backend trả về hồ sơ không đúng người dùng hiện tại.");
   state.user=updated;$("#modalRoot").innerHTML="";showApp();renderPage();toast("Đã lưu hồ sơ.");
  }catch(err){toast(err.message)}
 });
}
async function uploadAvatar(file){
 const error=fileError(file,["image/jpeg","image/png","image/webp"],5*1024*1024);
 if(error){toast(error);return}
 const button=$("#changeAvatar");
 if(button){button.disabled=true;button.textContent="Đang tải ảnh..."}
 try{
  let updated;
  if(state.demo)updated={...state.user,avatarUrl:URL.createObjectURL(file)};
  else{const form=new FormData();form.append("avatar",file);updated=normalizeUser(await Api.putForm("/users/me/avatar",form))}
  if(updated.code!==state.user.code)throw new Error("Backend trả về hồ sơ không đúng người dùng hiện tại.");
  if(state.user.avatarUrl!==updated.avatarUrl)revokePreview(state.user.avatarUrl);
  state.user=updated;showApp();renderPage();toast("Đã cập nhật ảnh đại diện.");
 }catch(error){if(button){button.disabled=false;button.textContent="Đổi ảnh đại diện"}toast(error.message)}
}
async function loadMyProfilePosts(){
 state.profileError="";
 try{state.profilePosts=responseItems(await Api.get(`/users/${encodeURIComponent(state.user.code)}/posts?page=1&pageSize=20`)).map(normalizePost)}
 catch(error){state.profilePosts=[];state.profileError=error.message}
 if(state.page==="profile")renderPage();
}
async function openUserProfile(code){
 userSearchGeneration++;
 try{
  let user,posts;
  if(state.demo){
   user=[state.user,...demoPosts.map(post=>post.author)].find(item=>item.code===code);
   if(!user)throw new Error("Không tìm thấy người dùng.");
   posts=state.posts.filter(post=>post.author?.code===code);
  }else{
   user=normalizeUser(await Api.get(`/users/${encodeURIComponent(code)}`));
   if(user.code!==code)throw new Error("Backend trả về hồ sơ không đúng người dùng được yêu cầu.");
   posts=responseItems(await Api.get(`/users/${encodeURIComponent(code)}/posts?page=1&pageSize=20`)).map(normalizePost);
  }
  state.viewedProfile=user;state.profilePosts=posts;state.profileError="";state.page="profile";
  document.querySelectorAll(".nav-item[data-page]").forEach(button=>button.classList.toggle("active",button.dataset.page==="profile"));
  $("#searchResults").classList.add("hidden");renderPage();
 }catch(error){toast(error.message)}
}
$("#userSearch").addEventListener("input",async e=>{
 const generation=++userSearchGeneration;
 const q=e.target.value.trim(),box=$("#searchResults");
 if(q.length<2){box.classList.add("hidden");return}
 try{
  const users=state.demo
   ?[state.user,...demoPosts.map(post=>post.author)].filter((user,index,array)=>array.findIndex(item=>item.code===user.code)===index&&(displayName(user).toLowerCase().includes(q.toLowerCase())||user.code.toLowerCase().includes(q.toLowerCase())))
   :responseItems(await Api.get(`/users/search?q=${encodeURIComponent(q)}`)).map(normalizeUser);
  if(generation!==userSearchGeneration)return;
  box.innerHTML=users.map(user=>`<button class="search-result" type="button" data-user-code="${escapeHtml(user.code)}">${avatar(user,true)}<span><strong>${escapeHtml(displayName(user))}</strong><span class="muted small-text">${escapeHtml(user.code)}</span></span></button>`).join("")||'<div class="muted small-text" style="padding:10px">Không tìm thấy người dùng.</div>';
  box.classList.remove("hidden");
  box.querySelectorAll(".search-result[data-user-code]").forEach(button=>button.addEventListener("click",()=>openUserProfile(button.dataset.userCode)));
 }catch(error){
  if(generation!==userSearchGeneration)return;
  box.innerHTML=`<div class="muted small-text">${escapeHtml(error.message)}</div>`;box.classList.remove("hidden");
 }
});
document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap")&&!e.target.closest(".search-results")){userSearchGeneration++;$("#searchResults").classList.add("hidden")}});
