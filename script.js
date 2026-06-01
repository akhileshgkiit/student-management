// default student data (loaded on first visit)
let defaultStudents = [
    {
        name: "Aarav Sharma",
        category: "Computer Science",
        image: "https://picsum.photos/seed/aarav/300/200",
        description: "Passionate about web development and machine learning"
    },
    {
        name: "Priya Patel",
        category: "Engineering",
        image: "https://picsum.photos/seed/priya/300/200",
        description: "Mechanical engineering student interested in robotics"
    },
    {
        name: "Rohan Thapa",
        category: "Business",
        image: "https://picsum.photos/seed/rohan/300/200",
        description: "Aspiring entrepreneur focused on digital marketing"
    },
    {
        name: "Sita Gurung",
        category: "Arts",
        image: "https://picsum.photos/seed/sita/300/200",
        description: "Creative student majoring in graphic design"
    },
    {
        name: "Bikash KC",
        category: "Computer Science",
        image: "https://picsum.photos/seed/bikash/300/200",
        description: "Full stack developer in training who loves building apps"
    },
    {
        name: "Anisha Rai",
        category: "Science",
        image: "https://picsum.photos/seed/anisha/300/200",
        description: "Biology student interested in environmental research"
    }
];

// load from localStorage or use defaults
let students = [];
let savedData = localStorage.getItem("students");

if (savedData) {
    let parsed = JSON.parse(savedData);
    // if old format (has email/course instead of category), reset data
    if (parsed.length > 0 && parsed[0].email !== undefined) {
        students = defaultStudents;
        localStorage.setItem("students", JSON.stringify(students));
    } else {
        students = parsed;
    }
} else {
    students = defaultStudents;
    localStorage.setItem("students", JSON.stringify(students));
}

let isCardView = true;

// show public students on load
showPublicStudents();


// ===== PUBLIC SECTION =====

function showPublicStudents() {
    let grid = document.getElementById("publicStudentGrid");
    grid.innerHTML = "";

    for (let i = 0; i < students.length; i++) {
        let student = students[i];

        let card = document.createElement("div");
        card.className = "student-card";

        card.innerHTML =
            '<img src="' + student.image + '" alt="' + student.name + '" onerror="this.src=\'https://placehold.co/300x200?text=No+Image\'">' +
            '<div class="card-body">' +
                '<h3>' + student.name + '</h3>' +
                '<span class="dept-badge">' + student.category + '</span>' +
                '<p>' + student.description + '</p>' +
            '</div>';

        grid.appendChild(card);
    }
}


// ===== LOGIN / LOGOUT & REGISTRATION =====

function openLogin() {
    // reset views to login form by default
    showLoginForm();
    document.getElementById("loginModal").classList.add("active");
}

function closeLogin() {
    document.getElementById("loginModal").classList.remove("active");
    
    // clear login fields
    document.getElementById("loginError").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    
    // clear registration fields
    document.getElementById("regError").style.display = "none";
    document.getElementById("regUsername").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regConfirmPassword").value = "";
}

function showRegisterForm() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
    document.getElementById("regError").style.display = "none";
}

function showLoginForm() {
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("loginError").style.display = "none";
}

function handleRegister() {
    let regUser = document.getElementById("regUsername").value.trim();
    let regPass = document.getElementById("regPassword").value;
    let regConfirm = document.getElementById("regConfirmPassword").value;

    // validation
    if (regUser === "" || regPass === "" || regConfirm === "") {
        alert("Please fill in all fields!");
        return;
    }

    if (regPass !== regConfirm) {
        document.getElementById("regError").textContent = "Passwords do not match!";
        document.getElementById("regError").style.display = "block";
        return;
    }

    // prevent registering the default username
    if (regUser.toLowerCase() === "akhil") {
        document.getElementById("regError").textContent = "Username already exists!";
        document.getElementById("regError").style.display = "block";
        return;
    }

    // read existing accounts
    let accounts = [];
    let savedAccounts = localStorage.getItem("adminAccounts");
    if (savedAccounts) {
        accounts = JSON.parse(savedAccounts);
    }

    // check duplicate username
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].username.toLowerCase() === regUser.toLowerCase()) {
            document.getElementById("regError").textContent = "Username already exists!";
            document.getElementById("regError").style.display = "block";
            return;
        }
    }

    // save account
    accounts.push({
        username: regUser,
        password: regPass
    });
    localStorage.setItem("adminAccounts", JSON.stringify(accounts));

    alert("Registration successful! You can now log in.");
    showLoginForm();
    
    // pre-fill the username for convenience
    document.getElementById("username").value = regUser;
}

function handleLogin() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value;

    let isAuthorized = false;

    // 1. check default credentials
    if (user === "akhil" && pass === "akhil@123") {
        isAuthorized = true;
    }

    // 2. check registered credentials in localStorage
    if (!isAuthorized) {
        let savedAccounts = localStorage.getItem("adminAccounts");
        if (savedAccounts) {
            let accounts = JSON.parse(savedAccounts);
            for (let i = 0; i < accounts.length; i++) {
                if (accounts[i].username === user && accounts[i].password === pass) {
                    isAuthorized = true;
                    break;
                }
            }
        }
    }

    if (isAuthorized) {
        closeLogin();
        document.getElementById("publicSite").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        updateStats();
        renderAdmin();
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

function handleLogout() {
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("publicSite").style.display = "block";
    showPublicStudents();
}


// ===== ADMIN FUNCTIONS =====

function addStudent() {
    let name = document.getElementById("studentName").value.trim();
    let category = document.getElementById("studentCategory").value;
    let image = document.getElementById("studentImage").value.trim();
    let desc = document.getElementById("studentDesc").value.trim();

    // validation
    if (name === "" || category === "" || desc === "") {
        alert("Please fill in all required fields!");
        return;
    }

    // default image if empty
    if (image === "") {
        image = "https://placehold.co/300x200?text=" + name.split(" ")[0];
    }

    let newStudent = {
        name: name,
        category: category,
        image: image,
        description: desc
    };

    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));

    // clear form fields
    document.getElementById("studentName").value = "";
    document.getElementById("studentCategory").value = "";
    document.getElementById("studentImage").value = "";
    document.getElementById("studentDesc").value = "";

    updateStats();
    renderAdmin();
    alert("Student added successfully!");
}

function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        students.splice(index, 1);
        localStorage.setItem("students", JSON.stringify(students));
        updateStats();
        renderAdmin();
    }
}

// ===== EDIT FUNCTIONS =====

function editStudent(index) {
    let student = students[index];
    
    // populate edit form fields
    document.getElementById("editIndex").value = index;
    document.getElementById("editStudentName").value = student.name;
    document.getElementById("editStudentCategory").value = student.category;
    
    // handle placeholder vs custom image
    if (student.image.startsWith("https://placehold.co")) {
        document.getElementById("editStudentImage").value = "";
    } else {
        document.getElementById("editStudentImage").value = student.image;
    }
    
    document.getElementById("editStudentDesc").value = student.description;
    
    // open the edit modal
    document.getElementById("editModal").classList.add("active");
}

function closeEdit() {
    document.getElementById("editModal").classList.remove("active");
}

function saveEdit() {
    let index = document.getElementById("editIndex").value;
    let name = document.getElementById("editStudentName").value.trim();
    let category = document.getElementById("editStudentCategory").value;
    let image = document.getElementById("editStudentImage").value.trim();
    let desc = document.getElementById("editStudentDesc").value.trim();

    // validation
    if (name === "" || category === "" || desc === "") {
        alert("Please fill in all required fields!");
        return;
    }

    // default image if empty
    if (image === "") {
        image = "https://placehold.co/300x200?text=" + name.split(" ")[0];
    }

    // update student array
    students[index].name = name;
    students[index].category = category;
    students[index].image = image;
    students[index].description = desc;

    localStorage.setItem("students", JSON.stringify(students));
    
    closeEdit();
    updateStats();
    renderAdmin();
    alert("Student updated successfully!");
}

function updateStats() {
    document.getElementById("statTotal").textContent = students.length;

    // count unique departments
    let depts = [];
    for (let i = 0; i < students.length; i++) {
        if (depts.indexOf(students[i].category) === -1) {
            depts.push(students[i].category);
        }
    }
    document.getElementById("statDepts").textContent = depts.length;
}

function renderAdmin() {
    let searchVal = document.getElementById("searchInput").value.toLowerCase();
    let filterVal = document.getElementById("filterDept").value;

    // filter students based on search and department
    let filtered = [];
    for (let i = 0; i < students.length; i++) {
        let s = students[i];
        let matchSearch = s.name.toLowerCase().includes(searchVal) ||
                          s.category.toLowerCase().includes(searchVal);
        let matchFilter = (filterVal === "all") || (s.category === filterVal);

        if (matchSearch && matchFilter) {
            filtered.push({ student: s, index: i });
        }
    }

    if (isCardView) {
        // card view
        document.getElementById("adminStudentContainer").style.display = "grid";
        document.getElementById("adminStudentTable").style.display = "none";

        let container = document.getElementById("adminStudentContainer");
        container.innerHTML = "";

        for (let i = 0; i < filtered.length; i++) {
            let student = filtered[i].student;
            let realIndex = filtered[i].index;

            container.innerHTML +=
                '<div class="student-card">' +
                    '<img src="' + student.image + '" alt="' + student.name + '" onerror="this.src=\'https://placehold.co/300x200?text=No+Image\'">' +
                    '<div class="card-body">' +
                        '<h3>' + student.name + '</h3>' +
                        '<span class="dept-badge">' + student.category + '</span>' +
                        '<p>' + student.description + '</p>' +
                        '<button class="edit-btn" onclick="editStudent(' + realIndex + ')">Edit</button>' +
                        '<button class="delete-btn" onclick="deleteStudent(' + realIndex + ')">Delete</button>' +
                    '</div>' +
                '</div>';
        }

    } else {
        // table view
        document.getElementById("adminStudentContainer").style.display = "none";
        document.getElementById("adminStudentTable").style.display = "block";

        let tbody = document.getElementById("studentTableBody");
        tbody.innerHTML = "";

        for (let i = 0; i < filtered.length; i++) {
            let student = filtered[i].student;
            let realIndex = filtered[i].index;

            tbody.innerHTML +=
                '<tr>' +
                    '<td>' + student.name + '</td>' +
                    '<td>' + student.category + '</td>' +
                    '<td>' + student.description + '</td>' +
                    '<td>' +
                        '<button class="edit-btn" onclick="editStudent(' + realIndex + ')">Edit</button>' +
                        '<button class="delete-btn" onclick="deleteStudent(' + realIndex + ')">Delete</button>' +
                    '</td>' +
                '</tr>';
        }
    }
}

function toggleView() {
    isCardView = !isCardView;

    let btn = document.getElementById("viewToggleBtn");
    if (isCardView) {
        btn.textContent = "Table View";
    } else {
        btn.textContent = "Card View";
    }

    renderAdmin();
}


// ===== CONTACT FORM =====

function handleContact(event) {
    event.preventDefault();

    document.getElementById("contactSuccess").style.display = "block";
    document.getElementById("contactForm").reset();

    // hide message after 3 seconds
    setTimeout(function() {
        document.getElementById("contactSuccess").style.display = "none";
    }, 3000);
}


// ===== MOBILE MENU =====

function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}