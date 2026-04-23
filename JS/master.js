// Data Start
//load data
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let employees = JSON.parse(localStorage.getItem("employees")) || [];
let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
let currentRoom = JSON.parse(localStorage.getItem("currentRoom"));
if (currentRoom === undefined) currentRoom = null;

//save data
function saveAll() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("rooms", JSON.stringify(rooms));
    localStorage.setItem("currentRoom", JSON.stringify(currentRoom));
}
// Data End

            // ========================================================================
            // ========================================================================
            // ========================================================================


// navbar Start
const navbar = document.querySelector(".navbar");
if (navbar) {
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
}


//tasks section
function addTask() {
    const title = document.getElementById("taskTitle");
    const desc = document.getElementById("taskDesc");
    const deadline = document.getElementById("taskDeadline");

    if (!title?.value.trim()) return;

    tasks.push({
        title: title.value.trim(),
        description: desc.value.trim(),
        deadline: deadline.value,
        done: false
    });

    title.value = "";
    desc.value = "";
    deadline.value = "";

    saveAll();
    renderTasks();
    updateDashboard();
}

function toggleTask(i) {
    tasks[i].done = !tasks[i].done;
    saveAll();
    renderTasks();
    updateDashboard();
}

function deleteTask(i) {
    tasks.splice(i, 1);
    saveAll();
    renderTasks();
    updateDashboard();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;

    list.innerHTML = "";

    tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.className = "task-item" + (t.done ? " done" : "");

        li.innerHTML = `
            <div>
                <h3>${t.title}</h3>
                <p>${t.description}</p>
                <small>${t.deadline}</small>
            </div>
            <div class="task-actions">
                <button onclick="toggleTask(${i})" class="done-btn">Done</button>
                <button onclick="deleteTask(${i})" class="remove-btn">Delete</button>
            </div>
        `;

        list.appendChild(li);
    });
}


// employees section
function addEmployee() {
    const name = document.getElementById("empName");
    const id = document.getElementById("empId");
    const group = document.getElementById("empGroup");

    if (!name?.value.trim()) return;

    employees.push({
        name: name.value.trim(),
        id: id.value.trim(),
        group: group.value.trim()
    });

    name.value = "";
    id.value = "";
    group.value = "";

    saveAll();
    renderEmployees();
    updateDashboard();
}

function deleteEmp(i) {
    employees.splice(i, 1);
    saveAll();
    renderEmployees();
    updateDashboard();
}

function renderEmployees() {
    const box = document.getElementById("empList");
    if (!box) return;

    box.innerHTML = "";

    employees.forEach((e, i) => {
        const div = document.createElement("div");
        div.className = "emp-card";

        div.innerHTML = `
            <h3>${e.name}</h3>
            <p>ID: ${e.id}</p>
            <p>Group: ${e.group}</p>
            <button onclick="deleteEmp(${i})">Remove</button>
        `;

        box.appendChild(div);
    });
}

// navbar End





            // ========================================================================
            // ========================================================================
            // ========================================================================

//dashboard Start

//update data in the dashboard
function updateDashboard() {
    const t = document.getElementById("totalTasks");
    const e = document.getElementById("totalEmployees");
    const c = document.getElementById("completedTasks");

    if (t) t.innerText = tasks.length;
    if (e) e.innerText = employees.length;
    if (c) c.innerText = tasks.filter(x => x.done).length;
}


// room sections start
function addRoom() {
    let name = prompt("Room name?");
    if (!name?.trim()) return;

    rooms.push({
        name: name.trim(),
        messages: []
    });

    saveAll();
    renderRooms();
}


// render rooms
function renderRooms() {
    const list = document.getElementById("roomList");
    if (!list) return;

    list.innerHTML = "";

    rooms.forEach((room, i) => {
        const div = document.createElement("div");
        div.className = "room";

        if (i === currentRoom) {
            div.classList.add("active-room");
        }

        div.innerHTML = `
            <span class="room-name">${room.name}</span>
            <button class="delete-room">🗑</button>
        `;

        div.querySelector(".room-name").onclick = () => openRoom(i);

        div.querySelector(".delete-room").onclick = (e) => {
            e.stopPropagation();

            rooms.splice(i, 1);

            if (currentRoom === i) {
                currentRoom = null;
                clearChatUI();
            } else if (currentRoom > i) {
                currentRoom--;
            }

            saveAll();
            renderRooms();
            renderMessages();
        };

        list.appendChild(div);
    });
}


// open room
function openRoom(i) {
    if (!rooms[i]) return;

    currentRoom = i;
    saveAll();

    document.getElementById("roomTitle").innerText = rooms[i].name;
    document.getElementById("activeRoomName").innerText = rooms[i].name;

    renderRooms();
    renderMessages();
    updateRoomInfo();
}


// clear UI
function clearChatUI() {
    const t = document.getElementById("roomTitle");
    const a = document.getElementById("activeRoomName");
    const c = document.getElementById("chatBox");

    if (t) t.innerText = "Select a room";
    if (a) a.innerText = "No room selected";
    if (c) c.innerHTML = "";
}
// room sections End
//dashboard End






            // ========================================================================
            // ========================================================================
            // ========================================================================



// messages Start
function sendMessage() {
    const input = document.getElementById("msgInput");

    if (!input?.value.trim()) return;
    if (currentRoom === null) return;

    const now = new Date();
    const time = getTime12h();

    rooms[currentRoom].messages.push({
        type: "text",
        data: input.value.trim(),
        time: time
    });

    input.value = "";

    saveAll();
    renderMessages();
    updateRoomInfo();
}

function renderMessages() {
    const box = document.getElementById("chatBox");
    if (!box) return;

    box.innerHTML = "";

    if (currentRoom === null) return;

    rooms[currentRoom].messages.forEach(m => {
        const div = document.createElement("div");
        div.className = "message";

        let content = "";

        if (m.type === "text") {
            content = `<div class="msg-text">${m.data}</div>`;
        }

        else if (m.type === "image") {
            content = `<img src="${m.data}" style="max-width:200px;border-radius:10px;">`;
        }

        else if (m.type === "video") {
            content = `<video src="${m.data}" controls style="max-width:200px;border-radius:10px;"></video>`;
        }

        else if (m.type === "audio") {
            content = `<audio src="${m.data}" controls></audio>`;
        }

        else if (m.type === "file") {
            content = `<a href="${m.data}" download="${m.name}"> ${m.name}</a>`;
        }

        div.innerHTML = `
            ${content}
            <div class="msg-time">${m.time || ""}</div>
        `;

        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
}


function updateRoomInfo() {
    if (currentRoom === null || !rooms[currentRoom]) return;

    const msg = document.getElementById("msgCount");
    if (msg) msg.innerText = rooms[currentRoom].messages.length;
}



function clearChat() {
    if (currentRoom === null) return;

    rooms[currentRoom].messages = [];
    saveAll();
    renderMessages();
    updateRoomInfo();
}
// messages End




            // ========================================================================
            // ========================================================================
            // ========================================================================



// handler (الجزء اللي في الروم يا كريم لما بنرسل الفايلات و كدا يعني) Start
function handleFile(e) {   
    const file = e.target.files[0];   
    if (!file || currentRoom === null) return;   

    const time = getTime12h();

    // IMAGE
    if (file.type.startsWith("image/")) {   
        const reader = new FileReader();   

        reader.onload = (event) => {   
            const message = {   
                type: "image",   
                data: event.target.result,
                time: time
            };   

            rooms[currentRoom].messages.push(message);   

            saveAll();  
            renderMessages();   
            updateRoomInfo();   
        };   

        reader.readAsDataURL(file);   
    }   

    // VIDEO / AUDIO / FILE
    else {   
        const fileURL = URL.createObjectURL(file);   

        let message = {};   

        if (file.type.startsWith("video/")) {   
            message = { 
                type: "video", 
                data: fileURL,
                time: time
            };   
        }   
        else if (file.type.startsWith("audio/")) {   
            message = { 
                type: "audio", 
                data: fileURL,
                time: time
            };   
        }   
        else {   
            message = {   
                type: "file",   
                name: file.name,   
                data: fileURL,
                time: time
            };   
        }   

        rooms[currentRoom].messages.push(message);   

        saveAll();   
        renderMessages();   
        updateRoomInfo();   
    }   

    e.target.value = "";   
}

function startCall() {
    if (currentRoom === null) {
        alert("Please select a room first");
        return;
    }

    const roomName = rooms[currentRoom].name;

    const speech = new SpeechSynthesisUtterance();

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    speech.text = "Preparing your call now in room " + roomName;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

    alert("Calling " + roomName);
}



//دا مثلا الحتة بتاعت الساعة و كدا اللي بتظهر في الرسالة 
function getTime12h() {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
// handler End

            // ========================================================================
            // ========================================================================
            // ========================================================================




//dark mode Start 
document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("darkToggle");

    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        if (toggle) toggle.checked = true;
    }

    if (toggle) {
        toggle.onchange = () => {
            if (toggle.checked) {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "light");
            }
        };
    }

    // ===== DRAG WIDGET =====
    const widget = document.getElementById("themeWidget");

    if (widget) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        widget.style.position = "fixed";

        const saved = JSON.parse(localStorage.getItem("widgetPos"));
        if (saved) {
            widget.style.left = saved.x + "px";
            widget.style.top = saved.y + "px";
            widget.style.right = "auto";
        }

        widget.addEventListener("mousedown", (e) => {
            isDragging = true;

            const rect = widget.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            widget.style.left = (e.clientX - offsetX) + "px";
            widget.style.top = (e.clientY - offsetY) + "px";
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;

            isDragging = false;

            localStorage.setItem("widgetPos", JSON.stringify({
                x: widget.offsetLeft,
                y: widget.offsetTop
            }));
        });
    }

    initApp();
});
//dark mode End 


            // ========================================================================
            // ========================================================================
            // ========================================================================


//init Start
function initApp() {
    renderTasks();
    renderEmployees();
    renderRooms();
    updateDashboard();

    if (currentRoom !== null && rooms[currentRoom]) {
        openRoom(currentRoom);
    } else {
        clearChatUI();
    }
}


//init End








            // ========================================================================
            // ========================================================================
            // ========================================================================








// profile Start

document.addEventListener("DOMContentLoaded", function () {

    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const displayName = document.getElementById("displayName");

    const profileImage = document.getElementById("profileImage");
    const imageInput = document.getElementById("imageInput");

    const cover = document.getElementById("cover");
    const coverInput = document.getElementById("coverInput");

    const cameraBtn = document.getElementById("cameraBtn");
    const uploadMenu = document.getElementById("uploadMenu");

    //دا يا كريم كود معقد كدا شات عملوا ليا علشان لما نبعت بس الصورة تفضل متخزنة فهمني فبيضغتها حاولل انت بقي ترفعها عل الداتا بيز 
    function compressImage(file, callback) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const MAX_WIDTH = 300;
                const scale = MAX_WIDTH / img.width;

                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressed = canvas.toDataURL("image/jpeg", 0.6);

                callback(compressed);
            };
        };

        reader.readAsDataURL(file);
    }

    //الاسم و كدا اللي في البروفايل 
    displayName.innerText = localStorage.getItem("userName") || "Your Name";
    nameInput.value = localStorage.getItem("userName") || "";
    emailInput.value = localStorage.getItem("userEmail") || "";

    profileImage.src = localStorage.getItem("userImage") || profileImage.src;

    const savedCover = localStorage.getItem("userCover");
    if (savedCover) {
        cover.style.backgroundImage = `url(${savedCover})`;
    }

    //تغيير الكافر و كدا يعني
    cameraBtn.onclick = () => {
        uploadMenu.style.display =
            uploadMenu.style.display === "block" ? "none" : "block";
    };

    document.getElementById("chooseProfile").onclick = () => {
        imageInput.click();
        uploadMenu.style.display = "none";
    };

    document.getElementById("chooseCover").onclick = () => {
        coverInput.click();
        uploadMenu.style.display = "none";
    };

    
    imageInput.onchange = function () {
        const file = this.files[0];
        if (!file) return;

        compressImage(file, (compressedImage) => {
            profileImage.src = compressedImage;
            localStorage.setItem("userImage", compressedImage);
        });
    };

    
    coverInput.onchange = function () {
        const file = this.files[0];
        if (!file) return;

        compressImage(file, (compressedImage) => {
            cover.style.backgroundImage = `url(${compressedImage})`;
            localStorage.setItem("userCover", compressedImage);
        });
    };

});



function saveProfile() {

    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const profileImage = document.getElementById("profileImage");

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);

    if (profileImage.src.startsWith("data")) {
        localStorage.setItem("userImage", profileImage.src);
    }

    document.getElementById("displayName").innerText = name;

    alert("Saved ✔");
}


// =====================
// TABS
// =====================
function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}




            // ========================================================================
            // ========================================================================
            // ========================================================================




//posts Start 
//الحتة دي لسه تعتبر ستاتك و غامضة اوي اصلا ف سيبك منها سيبها استاتك كدا 
document.addEventListener("DOMContentLoaded", function () {

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    let currentUserId = localStorage.getItem("currentUser");

    if (!currentUserId) createUser("You");

    function getCurrentUser() {
        return users.find(u => u.id == currentUserId);
    }

    function saveAll() {
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("posts", JSON.stringify(posts));
    }

    // ================= CREATE USER =================
    function createUser(name) {
        const user = {
            id: Date.now(),
            name,
            image: "https://via.placeholder.com/100"
        };

        users.push(user);
        currentUserId = user.id;

        localStorage.setItem("currentUser", currentUserId);
        saveAll();
    }

    
    window.addPost = function () {
        const input = document.getElementById("postInput");
        if (!input.value.trim()) return;

        const user = getCurrentUser();

        const post = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            text: input.value,
            likes: [],
            comments: []
        };

        posts.unshift(post);

        input.value = "";

        saveAll();
        renderFeed();
    };

    
    window.likePost = function (postId) {
        const post = posts.find(p => p.id == postId);
        if (!post) return;

        const userId = currentUserId;

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id != userId);
        } else {
            post.likes.push(userId);
        }

        saveAll();
        renderFeed();
    };

    // ================= COMMENT =================
    window.addComment = function (postId, input) {
        const post = posts.find(p => p.id == postId);
        if (!post) return;

        if (!input.value.trim()) return;

        post.comments.push({
            userId: currentUserId,
            text: input.value
        });

        input.value = "";

        saveAll();
        renderFeed();
    };

    
    function renderFeed() {

        const list = document.getElementById("postList");
        list.innerHTML = "";

        posts.forEach(post => {

            const liked = post.likes.includes(currentUserId);

            list.innerHTML += `
                <div class="post">

                    <div class="post-header">
                        ${post.userName}
                    </div>

                    <div class="post-text">
                        ${post.text}
                    </div>

                    <div class="post-actions">

                        <button onclick="likePost(${post.id})"
                            style="color:${liked ? '#0a66c2' : '#555'}">
                            ❤️ Like (${post.likes.length})
                        </button>

                        <button onclick="toggleComment(${post.id})">
                            💬 Comment (${post.comments.length})
                        </button>

                    </div>

                    <div class="comment-box" id="comment-${post.id}" style="display:none;">

                        <input type="text"
                            placeholder="Write comment..."
                            onkeydown="if(event.key==='Enter') addComment(${post.id}, this)">

                        <div>
                            ${post.comments.map(c => `
                                <p>💬 ${c.text}</p>
                            `).join("")}
                        </div>

                    </div>

                </div>
            `;
        });
    }

    
    window.toggleComment = function (id) {
        const box = document.getElementById(`comment-${id}`);
        if (!box) return;

        box.style.display = box.style.display === "block" ? "none" : "block";
    };

   
    renderFeed();
});
//posts Start 
// profile End



            // ========================================================================
            // ========================================================================
            // ========================================================================



//load the picture in navbar Start

function loadNavbarProfile() {
    const name = localStorage.getItem("userName") || "Guest";
    const image = localStorage.getItem("userImage") || "";

    const nameEl = document.getElementById("navUserName");
    const imgEl = document.getElementById("navUserAvatar");

    if (nameEl) {
        nameEl.innerText = name;
    }

    if (imgEl && image) {
        imgEl.src = image;
    } else if (imgEl) {
        imgEl.src = "images/default.png"; // دي اي صورة كدا بس لما بتحط صورة بقي هي اللي بتظهر فعلا
    }
}

loadNavbarProfile();

//load the picture in navbar End