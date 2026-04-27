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
async function addTask() {
    const user = getAuthUser();
    const title = document.getElementById("taskTitle").value;

    const taskData = {
        title: title,
        status: "PENDING",
        assignedTo: { id: user.id } 
    };

    const response = await fetch(`${API_BASE}/tasks/create`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'userId': user.id // We pass this so the backend knows who sent it
        },
        body: JSON.stringify(taskData)
    });

    if (response.ok) {
        alert("Task saved in Database!");
    }
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
// Frontend change: create rooms through backend first so they receive a real room id for members/chat
async function addRoom() {
    let name = prompt("Room name?");
    if (!name?.trim()) return;

    const user = getAuthUser();
    const roomName = name.trim();

    if (user?.id) {
        try {
            const response = await fetch(`${API_BASE}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'userId': user.id
                },
                body: JSON.stringify({
                    name: roomName,
                    type: 'CHAT'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create room");
            }

            const createdRoom = await response.json();
            rooms.push({
                id: createdRoom.id,
                name: createdRoom.name,
                type: createdRoom.type,
                active: createdRoom.active,
                messages: []
            });

            saveAll();
            renderRooms();
            return;
        } catch (error) {
            alert("Could not create room on server. Falling back to local room.");
        }
    }

    rooms.push({
        id: null,
        name: roomName,
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
// Frontend change: load old backend messages and room members before rendering the selected room
async function openRoom(i) {
    if (!rooms[i]) return;

    currentRoom = i;
    saveAll();

    document.getElementById("roomTitle").innerText = rooms[i].name;
    document.getElementById("activeRoomName").innerText = rooms[i].name;

    await loadMessagesFromServer(i);

    renderRooms();
    renderMessages();
    updateRoomInfo();
    loadRoomMembers();

    if (typeof connect === "function" && rooms[i].id) {
        connect(rooms[i].id);
    }
}


// clear UI
function clearChatUI() {
    const t = document.getElementById("roomTitle");
    const a = document.getElementById("activeRoomName");
    const c = document.getElementById("chatBox");

    if (t) t.innerText = "Select a room";
    if (a) a.innerText = "No room selected";
    if (c) c.innerHTML = "";
    renderMemberList([]);
}
// room sections End
//dashboard End






            // ========================================================================
            // ========================================================================
            // ========================================================================



// messages Start
// Frontend change: send text messages through WebSocket for backend rooms, with local fallback for unsaved rooms
function sendMessage() {
    const input = document.getElementById("msgInput");
    const user = getAuthUser();
    const room = rooms[currentRoom];

    if (!input?.value.trim()) return;
    if (currentRoom === null) return;
    if (!room) return;

    const content = input.value.trim();

    if (room.id && user?.id && typeof stompClient !== "undefined" && stompClient?.connected) {
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({
            content: content,
            senderName: user.name,
            senderId: user.id,
            roomId: room.id,
            type: "CHAT"
        }));

        input.value = "";
        return;
    }

    const time = getTime12h();

    room.messages.push({
        type: "text",
        data: content,
        senderName: user?.name || "You",
        time: time
    });

    input.value = "";

    saveAll();
    renderMessages();
    updateRoomInfo();
}

// Frontend change: show sender name in text messages and keep all message types in one renderer
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
            const senderLabel = m.senderName ? `<div class="msg-sender">${m.senderName}</div>` : "";
            content = `${senderLabel}<div class="msg-text">${m.data}</div>`;
        }

        else if (m.type === "image") {
            content = `<img src="${m.data}" style="max-width:200px;border-radius:10px;">`;
        }

        else if (m.type === "video") {
            content = `<video src="${m.data}" controls style="max-width:200px;border-radius:10px;"></video>`;
        }

       else if (m.type === "audio") {

    content = `
    <div class="vm-msg">

        <button class="vm-play">▶</button>

        <audio src="${m.data}"></audio>

        <div class="vm-wave" onclick="vmSeek(event, this)">
            <div class="vm-progress"></div>
            ${generateFakeWave()}
        </div>

        <div class="vm-meta">
            <span class="vm-time">0:00 / ${m.duration || "0:00"}</span>

            <select onchange="vmChangeSpeed(this)">
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
            </select>
        </div>

    </div>
    `;
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

// Frontend change: restore old room messages from backend after refresh or room reopen
async function loadMessagesFromServer(roomIndex = currentRoom) {
    const user = getAuthUser();
    const room = rooms[roomIndex];

    if (!room || !room.id || !user?.id) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/messages/room/${room.id}`, {
            headers: {
                'userId': user.id
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load old messages");
        }

        const serverMessages = await response.json();
        room.messages = serverMessages.map(message => ({
            type: "text",
            data: message.content,
            senderName: message.senderName || "Unknown",
            time: message.time || ""
        }));

        saveAll();
    } catch (error) {
        console.error(error);
    }
}

// Frontend change: render room members in the right-side panel
function renderMemberList(members) {
    const list = document.getElementById("memberList");
    if (!list) return;

    list.innerHTML = "";

    if (!members || members.length === 0) {
        list.innerHTML = "<li>No members</li>";
        return;
    }

    members.forEach(member => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${member.name} (${member.role})</span>
            <button type="button" onclick="removeMember(${member.id})">Remove</button>
        `;
        list.appendChild(li);
    });
}

// Frontend change: fetch room members from backend for the selected backend room
async function loadRoomMembers() {
    const user = getAuthUser();
    const room = rooms[currentRoom];

    if (!room || !room.id) {
        renderMemberList([]);
        return;
    }

    if (!user?.id) {
        renderMemberList([]);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/rooms/${room.id}/members`, {
            headers: {
                'userId': user.id
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load members");
        }

        const members = await response.json();
        renderMemberList(members);
    } catch (error) {
        renderMemberList([]);
    }
}

// Frontend change: add room members by staff id from the frontend panel
async function promptAddMember() {
    const room = rooms[currentRoom];
    const user = getAuthUser();

    if (!room || !room.id) {
        alert("Please select a saved server room first.");
        return;
    }

    if (!user?.id) {
        alert("Please login first.");
        return;
    }

    const staffId = prompt("Enter member staff ID:");
    if (!staffId?.trim()) return;

    try {
        const response = await fetch(`${API_BASE}/rooms/${room.id}/members/by-staff/${encodeURIComponent(staffId.trim())}`, {
            method: 'POST',
            headers: {
                'userId': user.id
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to add member");
        }

        const members = await response.json();
        renderMemberList(members);
    } catch (error) {
        alert(error.message || "Failed to add member");
    }
}

// Frontend change: remove a selected room member through the backend API
async function removeMember(memberId) {
    const room = rooms[currentRoom];
    const user = getAuthUser();

    if (!room || !room.id || !user?.id) {
        alert("Room membership is only available for saved server rooms.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/rooms/${room.id}/members/${memberId}`, {
            method: 'DELETE',
            headers: {
                'userId': user.id
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to remove member");
        }

        const members = await response.json();
        renderMemberList(members);
    } catch (error) {
        alert(error.message || "Failed to remove member");
    }
}

// Frontend change: load backend rooms on startup so refresh does not lose server room metadata
async function loadRoomsFromServer() {
    const user = getAuthUser();
    if (!user?.id) return false;

    try {
        const response = await fetch(`${API_BASE}/rooms`, {
            headers: {
                'userId': user.id
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load rooms");
        }

        const serverRooms = await response.json();
        rooms = serverRooms.map(room => ({
            id: room.id,
            name: room.name,
            type: room.type,
            active: room.active,
            messages: []
        }));
        saveAll();
        return true;
    } catch (error) {
        return false;
    }
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
// Frontend change: bootstrap server rooms before rendering the rooms page
async function initApp() {
    await loadRoomsFromServer();
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

// Frontend change: namespace profile storage by logged-in user to stop profile data leaking between accounts
function getProfileStorageKey(field) {
    const user = getAuthUser();
    if (!user?.id) return null;
    return `profile_${user.id}_${field}`;
}

function getStoredProfileField(field, fallback = "") {
    const key = getProfileStorageKey(field);
    if (!key) return fallback;

    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) return storedValue;

    const user = getAuthUser();
    if (!user) return fallback;

    if (field === "name") return user.name || fallback;
    if (field === "email") return user.email || fallback;

    return fallback;
}

function setStoredProfileField(field, value) {
    const key = getProfileStorageKey(field);
    if (!key) return;
    localStorage.setItem(key, value);
}

function removeStoredProfileField(field) {
    const key = getProfileStorageKey(field);
    if (!key) return;
    localStorage.removeItem(key);
}

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

    if (displayName) 
    {
        displayName.innerText = getStoredProfileField("name", "Your Name");
        if(nameInput) nameInput.value = getStoredProfileField("name", "");
        if(emailInput) emailInput.value = getStoredProfileField("email", "");
    }

    if (profileImage) {
        profileImage.src = getStoredProfileField("image", profileImage.src);
    }

    const savedCover = getStoredProfileField("cover");
    if (savedCover) {
        cover.style.backgroundImage = `url(${savedCover})`;
    }

    //تغيير الكافر و كدا يعني
    if (cameraBtn) { 
        cameraBtn.onclick = () => {
            if (uploadMenu) {
                uploadMenu.style.display =
                    uploadMenu.style.display === "block" ? "none" : "block";
            }
        };
    }

    const chooseProfile = document.getElementById("chooseProfile");
    if (chooseProfile) { 
        chooseProfile.onclick = () => {
            imageInput.click();
            if (uploadMenu) uploadMenu.style.display = "none";
        };
    }

    const chooseCover = document.getElementById("chooseCover");
    if (chooseCover) { 
        chooseCover.onclick = () => {
            if (coverInput) coverInput.click();
            if (uploadMenu) uploadMenu.style.display = "none";
        };
    }

    
    if (imageInput) 
    {
        imageInput.onchange = function () 
        {
            const file = this.files[0];
            if (!file) return;
            compressImage(file, (compressedImage) => {
                profileImage.src = compressedImage;
                setStoredProfileField("image", compressedImage);
            });
        };
    }

    if (coverInput) 
    {
        coverInput.onchange = function () 
        {
            const file = this.files[0];
            if (!file) return;
            compressImage(file, (compressedImage) => {
                cover.style.backgroundImage = `url(${compressedImage})`;
                setStoredProfileField("cover", compressedImage);
            });
        };
    }

});



function saveProfile() {

    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const profileImage = document.getElementById("profileImage");

    setStoredProfileField("name", name);
    setStoredProfileField("email", email);

    if (profileImage.src.startsWith("data")) {
        setStoredProfileField("image", profileImage.src);
    }

    document.getElementById("displayName").innerText = name;

    alert("Saved");
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
        if (!list) return;
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

// Frontend change: load navbar profile data from per-user storage instead of shared browser keys
function loadNavbarProfile() {
    const name = getStoredProfileField("name", "Guest");
    const image = getStoredProfileField("image", "");

    const nameEl = document.getElementById("navUserName");
    const imgEl = document.getElementById("navUserAvatar");

    if (nameEl) 
    {
        nameEl.innerText = name;
    }
    if (imgEl) 
    {
        imgEl.src = image || "images/default.png";
    }

    if (imgEl && image) 
    {
        imgEl.src = image;
    } 
    else if (imgEl) 
    {
        imgEl.src = "images/default.png"; // دي اي صورة كدا بس لما بتحط صورة بقي هي اللي بتظهر فعلا
    }
}

loadNavbarProfile();

//load the picture in navbar End


//recording start



let vmRecorder;
let vmChunks = [];
let vmStream;
let vmAudioCtx;
let vmAnalyser;
let vmDataArray;
let vmAnimationId;
let vmRecording = false;

let smoothedScale = 1; 

const recordBtn = document.getElementById("recordBtn");

if (recordBtn) {
    recordBtn.addEventListener("click", async () => {
        if (!vmRecording) {
            await startRecording();
        } else {
            stopRecording();
        }
    });
}

async function startRecording() {
    if (currentRoom === null) {
        alert("Select a room first");
        return;
    }

    vmStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    vmRecorder = new MediaRecorder(vmStream);
    vmChunks = [];

    vmRecorder.ondataavailable = e => vmChunks.push(e.data);

    vmRecorder.onstop = () => {
        const blob = new Blob(vmChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        saveVoiceMessage(blob, url);
    };

    vmRecorder.start();
    vmRecording = true;

    recordBtn.classList.add("recording");

    startAudioMeter(vmStream);
}

function stopRecording() {
    vmRecording = false;

    recordBtn.classList.remove("recording");

    if (vmRecorder && vmRecorder.state !== "inactive") {
        vmRecorder.stop();
    }

    if (vmStream) {
        vmStream.getTracks().forEach(t => t.stop());
    }

    cancelAnimationFrame(vmAnimationId);

    vmRecorder.onstop = () => {

        const blob = new Blob(vmChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);

        audio.onloadedmetadata = () => {
            const duration = formatTime(audio.duration);
            saveVoiceMessage(blob, url, duration);
        };
    };
}

function startAudioMeter(stream) {

    vmAudioCtx = new AudioContext();
    const source = vmAudioCtx.createMediaStreamSource(stream);

    vmAnalyser = vmAudioCtx.createAnalyser();
    vmAnalyser.fftSize = 256;

    source.connect(vmAnalyser);

    vmDataArray = new Uint8Array(vmAnalyser.frequencyBinCount);

    function animate() {
        vmAnalyser.getByteFrequencyData(vmDataArray);

        
        let avg = vmDataArray.reduce((a, b) => a + b) / vmDataArray.length;
        let targetScale = 1 + (avg / 200);
        smoothedScale += (targetScale - smoothedScale) * 0.15;
        recordBtn.style.transform = `scale(${smoothedScale})`;

        drawLiveWave(vmDataArray);

        vmAnimationId = requestAnimationFrame(animate);
    }

    animate();
}

function saveVoiceMessage(blob, url, duration) {

    const time = getTime12h();

    const message = {
        type: "audio",
        data: url,
        duration: duration,
        time: time
    };

    rooms[currentRoom].messages.push(message);

    saveAll();
    renderMessages();
    updateRoomInfo();
}

function vmTogglePlay(btn) {
    const audio = btn.nextElementSibling;

    if (audio.paused) {
        audio.play();
        btn.innerText = "❚❚";
    } else {
        audio.pause();
        btn.innerText = "▶";
    }

    audio.onended = () => {
        btn.innerText = "▶";
    };
}

function generateFakeWave() {
    let wave = "";
    for (let i = 0; i < 25; i++) {
        wave += `<span style="height:${Math.random() * 15 + 5}px"></span>`;
    }
    return wave;
}

function vmChangeSpeed(select) {
    const audio = select.parentElement.parentElement.querySelector("audio");
    audio.playbackRate = select.value;
}

function formatTime(sec) {
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
}

document.addEventListener("click", function (e) {

    if (e.target.classList.contains("vm-play")) {

        const audio = e.target.nextElementSibling;
        const container = e.target.closest(".vm-msg");
        const progress = container.querySelector(".vm-progress");
        const timeText = container.querySelector(".vm-time");

        if (audio.paused) {
            audio.play();
            e.target.innerText = "❚❚";
        } else {
            audio.pause();
            e.target.innerText = "▶";
        }

        audio.ontimeupdate = () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = percent + "%";

            const current = formatTime(audio.currentTime);
            const total = formatTime(audio.duration);

            timeText.innerText = `${current} / ${total}`;
        };

        audio.onended = () => {
            e.target.innerText = "▶";
            progress.style.width = "0%";
        };
    }
});

function vmSeek(e, wave) {
    const audio = wave.parentElement.querySelector("audio");
    const rect = wave.getBoundingClientRect();

    const percent = (e.clientX - rect.left) / rect.width;

    audio.currentTime = percent * audio.duration;
}


//record End


/* 

       تحت الكمنت ده هتلاقي الربط 
        متلعبش فيه

*/


const API_BASE = "http://localhost:8080/api";
function getAuthUser() 
{
    return JSON.parse(sessionStorage.getItem("authUser"));
}

async function loginToServer(email, password, username, staffId) 
{
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('username', username);
    params.append('staffId', staffId);

    try 
    {
        const response = await fetch(`${API_BASE}/auth/login?${params.toString()}`, 
        {
            method: 'POST'
        });

        if (response.ok) {
            const user = await response.json();
            sessionStorage.setItem("authUser", JSON.stringify(user));
            window.location.href = "dashboard.html";
        } 
        else 
        {
            const errorMsg = await response.text();
            alert("Login Failed: " + errorMsg);
        }
    } 
    catch (error) 
    {
        alert("Server connection error.");
    }
}

async function triggerLogin() 
{
    const email = document.getElementById("loginEmail").value;
    const username = document.getElementById("loginUsername").value;
    const staffId = document.getElementById("loginStaffId").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !username || !staffId || !password) 
    {
        alert("Please fill all 4 fields");
        return;
    }
    await loginToServer(email, password, username, staffId);
}

async function triggerRegister() 
{
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const role = document.getElementById("regRole").value;
    const password = document.getElementById("regPass").value;

    const userData = { name, email, role, password, active: true };

    try 
    {
        const response = await fetch(`${API_BASE}/auth/register`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) 
        {
            alert("Registration Successful! Check your email for your Staff ID.");
            location.reload();
        } 
        else 
        {
            alert("Registration failed.");
        }
    }
    catch (err) 
    {
        alert("Error connecting to server.");
    }
}

//ملهاش علاقه بالربط

function updateNavbarState() 
{
    const user = getAuthUser();
    
    const LOGBT = document.querySelector(".login_button") || document.querySelector("a[href='login.html']");
    const SIGNUPBT = document.querySelector(".signup_button") || document.querySelector("a[href='signup.html']");
    
    if (user) 
    {
        if (LOGBT) LOGBT.style.display = "none";
        if (SIGNUPBT) SIGNUPBT.style.display = "none";

        const nav = document.querySelector(".nav-links");
        if (nav && !document.getElementById("logoutBtn")) 
        {
            const logoutLi = document.createElement("li");
            logoutLi.innerHTML = `<a href="#" id="logoutBtn" onclick="logout()" style="color: #fdbd41;">Logout</a>`;
            nav.appendChild(logoutLi);
        }
    }
}

function logout() 
{
    sessionStorage.removeItem("authUser");
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", updateNavbarState);

// Frontend change: remove only the current user's stored profile photo
function removeProfilePhoto() 
{
    if (confirm("Are you sure you want to remove your profile photo?")) 
    {
        removeStoredProfileField("image");
        
        const profileImage = document.getElementById("profileImage");
        const navAvatar = document.getElementById("navUserAvatar");

        if (profileImage) profileImage.src = "images/default.png"; 
        if (navAvatar) navAvatar.src = "images/default.png";
        
        alert("Profile photo removed.");
    }
}

// Frontend change: remove only the current user's stored cover photo
function removeCoverPhoto() 
{
    if (confirm("Are you sure you want to remove your cover photo?")) 
    {
        removeStoredProfileField("cover");
        
        const cover = document.getElementById("cover");
        if (cover) cover.style.backgroundImage = "none";
        
        alert("Cover photo removed.");
    }
}
