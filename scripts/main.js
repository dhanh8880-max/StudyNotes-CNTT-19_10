const API_DOC = "https://6a41344d1ff1d27becc1568e.mockapi.io/api/v1/documents";
const API_SUB = "https://6a41344d1ff1d27becc1568e.mockapi.io/api/v1/subjects";
const STORAGE_KEY = "studynotes_docs";

const defaultSubjects = [
    { id: "toan", name: "Toán", keywords: ["toan", "toan hoc", "math", "toán học"] },
    { id: "van", name: "Ngữ Văn", keywords: ["van", "ngu van", "literature", "ngữ văn"] },
    { id: "anh", name: "Tiếng Anh", keywords: ["anh", "tieng anh", "english"] },
    { id: "ly", name: "Vật Lý", keywords: ["ly", "vat ly", "physics"] },
    { id: "hoa", name: "Hóa Học", keywords: ["hoa", "hoa hoc", "chemistry"] },
    { id: "sinh", name: "Sinh Học", keywords: ["sinh", "sinh hoc", "biology"] },
    { id: "su", name: "Lịch Sử", keywords: ["su", "lich su", "history"] },
    { id: "dia", name: "Địa Lý", keywords: ["dia", "dia ly", "geography"] },
    { id: "gdcd", name: "GDCD", keywords: ["gdcd", "cong dan", "citizenship"] },
    { id: "dgnl", name: "ĐGNL", keywords: ["dgnl", "danh gia nang luc", "assessment"] }
];

const defaultDocuments = [
    { id: "doc-1", title: "Tài liệu Toán", description: "Tài liệu ôn tập môn Toán từ thư mục tài liệu học tập.", year: "2026", fileUrl: "tailieu/tailieutoan.pdf", subjectId: "toan", subjectName: "Toán", thumbnail: "img/toan.jpg" },
    { id: "doc-2", title: "Tài liệu Ngữ Văn", description: "Tài liệu ôn tập môn Ngữ Văn từ thư mục tài liệu học tập.", year: "2025", fileUrl: "tailieu/tailieuvan.pdf", subjectId: "van", subjectName: "Ngữ Văn", thumbnail: "img/van.jpg" },
    { id: "doc-3", title: "Tài liệu Tiếng Anh", description: "Tài liệu ôn tập môn Tiếng Anh từ thư mục tài liệu học tập.", year: "2025", fileUrl: "tailieu/tailieuanh.docx", subjectId: "anh", subjectName: "Tiếng Anh", thumbnail: "img/tienganh.jpg" },
    { id: "doc-4", title: "Tài liệu Vật Lý", description: "Tài liệu ôn tập môn Vật Lý từ thư mục tài liệu học tập.", year: "2025", fileUrl: "tailieu/tailieuvatly.pdf", subjectId: "ly", subjectName: "Vật Lý", thumbnail: "img/vatly.jpg" },
    { id: "doc-5", title: "Tài liệu Hóa Học", description: "Tài liệu ôn tập môn Hóa Học từ thư mục tài liệu học tập.", year: "2024", fileUrl: "tailieu/tailieuhoa.pdf", subjectId: "hoa", subjectName: "Hóa Học", thumbnail: "img/hoahoc.jpg" },
    { id: "doc-6", title: "Tài liệu Sinh Học", description: "Tài liệu ôn tập môn Sinh Học từ thư mục tài liệu học tập.", year: "2025", fileUrl: "tailieu/tailieusinh.pdf", subjectId: "sinh", subjectName: "Sinh Học", thumbnail: "img/sinhhoc.jpg" },
    { id: "doc-7", title: "Tài liệu Lịch Sử", description: "Tài liệu ôn tập môn Lịch Sử từ thư mục tài liệu học tập.", year: "2025", fileUrl: "tailieu/tailieusu.pdf", subjectId: "su", subjectName: "Lịch Sử", thumbnail: "img/lichsu.jpg" },
    { id: "doc-8", title: "Tài liệu Địa Lý", description: "Tài liệu ôn tập môn Địa Lý từ thư mục tài liệu học tập.", year: "2026", fileUrl: "tailieu/tailieudia.pdf", subjectId: "dia", subjectName: "Địa Lý", thumbnail: "img/dialy.jpg" },
    { id: "doc-9", title: "Tài liệu GDCD", description: "Tài liệu ôn tập môn GDCD từ thư mục tài liệu học tập.", year: "2024", fileUrl: "tailieu/tailieugdcd.pdf", subjectId: "gdcd", subjectName: "GDCD", thumbnail: "img/gdcd.jpg" },
    { id: "doc-10", title: "Tài liệu ĐGNL", description: "Tài liệu ôn tập cho ĐGNL từ thư mục tài liệu học tập.", year: "2025", fileUrl: "tailieu/tailieudgnl.jpg", subjectId: "dgnl", subjectName: "ĐGNL", thumbnail: "img/dgnl.jpg" }
];

let documents = [...defaultDocuments];
let subjects = [...defaultSubjects];
let currentFilter = "";
let currentSearch = "";
let currentCategory = "";

function normalizeText(value = "") {
    return String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function loadDocumentsFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function saveDocumentsToStorage(data = []) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function buildSubjectOptions(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
        return [...defaultSubjects];
    }

    return data.map(subject => ({
        id: String(subject.id || subject.value || subject.name || ""),
        name: String(subject.name || subject.title || subject.label || subject.subjectName || subject.subject || "")
    })).filter(subject => subject.name);
}

function getDocumentSubject(doc) {
    const candidates = [
        doc.subjectld,
        doc.subjectId,
        doc.subject_id,
        doc.subject,
        doc.subjectName,
        doc.subject_name,
        doc.category,
        doc.type,
        doc.title,
        doc.description
    ].filter(Boolean);

    const combinedText = normalizeText(candidates.join(" "));

    for (const subject of subjects) {
        const subjectText = normalizeText(`${subject.name} ${subject.keywords ? subject.keywords.join(" ") : ""}`);

        if (subject.id && candidates.some(candidate => normalizeText(String(candidate)).includes(normalizeText(String(subject.id))))) {
            return subject;
        }

        if (subject.keywords && subject.keywords.some(keyword => combinedText.includes(normalizeText(keyword)))) {
            return subject;
        }

        if (subjectText && combinedText.includes(subjectText)) {
            return subject;
        }
    }

    const numberMatch = String(candidates.join(" ")).match(/\d+/);
    if (numberMatch) {
        const index = Number(numberMatch[0]) - 1;
        if (!Number.isNaN(index) && subjects[index]) {
            return subjects[index];
        }
    }

    return null;
}

async function loadSubjects() {
    try {
        const res = await fetch(API_SUB);
        const data = await res.json();
        subjects = buildSubjectOptions(data);
    } catch (err) {
        subjects = [...defaultSubjects];
        console.log(err);
    }

    let html = '<option value="">Tất cả môn học</option>';

    subjects.forEach(subject => {
        html += `<option value="${subject.id}">${subject.name}</option>`;
    });

    document.getElementById("filter").innerHTML = html;
}

async function loadDocuments() {
    const storedDocuments = loadDocumentsFromStorage();
    if (storedDocuments && storedDocuments.length) {
        documents = storedDocuments;
        applyFilters();
        return;
    }

    try {
        const res = await fetch(API_DOC);
        const data = await res.json();

        const hasMeaningfulData = Array.isArray(data) && data.some(doc => {
            const title = normalizeText(doc.title || "");
            const desc = normalizeText(doc.description || "");
            return title && !title.startsWith("title") && desc && !desc.startsWith("description");
        });

        documents = hasMeaningfulData ? data : [...defaultDocuments];
    } catch (err) {
        documents = [...defaultDocuments];
        console.log(err);
    }

    saveDocumentsToStorage(documents);
    applyFilters();
}

function getImageBySubjectName(subjectName = "") {
    const normalized = normalizeText(subjectName);

    if (normalized.includes("toan")) return "img/toan.jpg";
    if (normalized.includes("van")) return "img/van.jpg";
    if (normalized.includes("tieng anh") || normalized.includes("anh")) return "img/tienganh.jpg";
    if (normalized.includes("vat ly") || normalized.includes("ly")) return "img/vatly.jpg";
    if (normalized.includes("hoa hoc") || normalized.includes("hoa")) return "img/hoahoc.jpg";
    if (normalized.includes("sinh hoc") || normalized.includes("sinh")) return "img/sinhhoc.jpg";
    if (normalized.includes("lich su") || normalized.includes("su")) return "img/lichsu.jpg";
    if (normalized.includes("dia ly") || normalized.includes("dia")) return "img/dialy.jpg";
    if (normalized.includes("gdcd") || normalized.includes("cong dan")) return "img/gdcd.jpg";
    if (normalized.includes("dgnl") || normalized.includes("danh gia nang luc")) return "img/dgnl.jpg";

    return "https://picsum.photos/300/200";
}

function getDocumentImage(doc) {
    const relatedSubject = getDocumentSubject(doc);
    if (relatedSubject) {
        return getImageBySubjectName(relatedSubject.name);
    }

    return doc.thumbnail || "https://picsum.photos/300/200";
}

function renderDocuments(data) {
    let html = "";

    if (!data || data.length === 0) {
        html = `
            <div class="col-12">
                <div class="empty-state">
                    <h3>Không tìm thấy tài liệu phù hợp</h3>
                    <p>Hãy thử tìm kiếm với từ khóa khác hoặc đổi môn học.</p>
                </div>
            </div>
        `;
    } else {
        data.forEach(doc => {
            const documentSubject = getDocumentSubject(doc);
            const imageUrl = getDocumentImage(doc);
            html += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100">
                        <img src="${imageUrl}" class="card-img-top" onerror="this.src='https://picsum.photos/300/200'">
                        <div class="card-body">
                            <h5>${doc.title}</h5>
                            <p><b>Môn:</b> ${documentSubject ? documentSubject.name : "Khác"}</p>
                            <p><b>Năm:</b> ${doc.year}</p>
                            <p>${doc.description}</p>
                            <button class="btn btn-primary" onclick="openFile('${doc.fileUrl}')">Xem tài liệu</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById("menu").innerHTML = html;
}

function applyFilters() {
    let result = documents.filter(doc => {
        const documentSubject = getDocumentSubject(doc);
        const subjectName = documentSubject ? documentSubject.name : "";
        const subjectId = documentSubject ? documentSubject.id : "";
        const text = `${doc.title || ""} ${doc.description || ""} ${subjectName}`.toLowerCase();
        const normalizedSearch = normalizeText(currentSearch);
        const matchesSearch = normalizedSearch === "" || normalizeText(text).includes(normalizedSearch);
        const matchesSubject = currentFilter === "" || subjectId === currentFilter || normalizeText(subjectName).includes(normalizeText(currentFilter));
        const matchesCategory = currentCategory === "" || currentCategory.split("|").some(keyword => normalizeText(text).includes(normalizeText(keyword)));
        return matchesSearch && matchesSubject && matchesCategory;
    });

    renderDocuments(result);
}

function openFile(url) {
    window.open(url, "_blank", "noopener");
}

function handleSearch(event) {
    currentSearch = event.target.value.toLowerCase();
    applyFilters();
}

function handleFilter(event) {
    currentFilter = event.target.value;
    applyFilters();
}

function handleCategory(event) {
    document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
    event.currentTarget.classList.add('active');
    currentCategory = event.currentTarget.dataset.keyword;
    applyFilters();
}

document.getElementById("search").addEventListener("input", handleSearch);
document.getElementById("filter").addEventListener("change", handleFilter);
document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', handleCategory));

loadSubjects();
loadDocuments();