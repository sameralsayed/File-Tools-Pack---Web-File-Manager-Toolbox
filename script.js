// script.js
let currentPath = 'root';
let viewMode = 'grid';
let selectedItem = null;

const fakeFileSystem = {
    root: [
        { id: 1, name: "Photos", type: "folder", icon: "bi-folder", size: "", children: "images" },
        { id: 2, name: "Videos", type: "folder", icon: "bi-film", size: "", children: "videos" },
        { id: 3, name: "Documents", type: "folder", icon: "bi-file-earmark-text", size: "", children: "docs" },
        { id: 4, name: "Downloads", type: "folder", icon: "bi-download", size: "" },
        { id: 5, name: "report.pdf", type: "file", icon: "bi-file-earmark-pdf", size: "2.4 MB" },
        { id: 6, name: "invoice.docx", type: "file", icon: "bi-file-earmark-word", size: "856 KB" }
    ],
    images: [
        { id: 10, name: "summer-vacation.jpg", type: "image", icon: "bi-image", size: "3.8 MB", url: "https://picsum.photos/id/1015/800/600" },
        { id: 11, name: "family-pic.png", type: "image", icon: "bi-image", size: "1.9 MB", url: "https://picsum.photos/id/133/800/600" },
        { id: 12, name: "mountain-view.jpg", type: "image", icon: "bi-image", size: "4.1 MB", url: "https://picsum.photos/id/201/800/600" }
    ],
    videos: [
        { id: 20, name: "trip-highlights.mp4", type: "video", icon: "bi-film", size: "124 MB", url: "https://test-streams.mux.dev/x264_480p.mp4" },
        { id: 21, name: "unboxing.mp4", type: "video", icon: "bi-film", size: "68 MB", url: "https://test-streams.mux.dev/x264_480p.mp4" }
    ],
    docs: [
        { id: 30, name: "Resume.pdf", type: "file", icon: "bi-file-earmark-pdf", size: "1.2 MB" },
        { id: 31, name: "Project-Plan.docx", type: "file", icon: "bi-file-earmark-word", size: "945 KB" },
        { id: 32, name: "Notes.txt", type: "file", icon: "bi-file-earmark-text", size: "12 KB" }
    ]
};

$(document).ready(function () {
    console.log('%c🚀 File Tools Pack Web - Full file manager by SAMER SAEID', 'color:#00ff88; font-weight:bold');
    loadRecentFiles();
    renderExplorer('root');
    
    // Right-click simulation on file list
    document.getElementById('fileList').addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (e.target.closest('.file-card')) {
            selectedItem = e.target.closest('.file-card').dataset.id;
            showContextMenu(e.pageX, e.pageY);
        }
    });
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', () => {
        document.getElementById('contextMenu').classList.add('d-none');
    });
});

function switchTab(n) {
    $('.tab-panel').removeClass('active');
    $('#tab-' + n).addClass('active');
    if (n === 1) renderExplorer(currentPath);
    if (n === 2) renderGallery();
    if (n === 3) renderVideos();
    if (n === 4) renderDocuments();
}

function toggleSidebar() {
    $('#sidebar').toggleClass('show');
}

function navigateTo(folder) {
    currentPath = folder;
    $('#sidebar').removeClass('show');
    switchTab(1);
}

function renderExplorer(path) {
    currentPath = path;
    document.getElementById('currentPath').innerHTML = path === 'root' ? '/' : path;
    document.getElementById('breadcrumb').innerHTML = path === 'root' ? 'Internal Storage' : `Internal Storage / ${path}`;
    
    const container = document.getElementById('fileList');
    let html = '';
    const files = fakeFileSystem[path] || fakeFileSystem.root;
    
    files.forEach(file => {
        const cardHTML = viewMode === 'grid' ? `
            <div class="col-md-3 col-6" data-id="${file.id}">
                <div onclick="openItem(${file.id}, '${path}')" class="file-card card bg-black border-success h-100 text-center p-3">
                    <i class="bi ${file.icon} fs-1 mb-2 text-success"></i>
                    <h6 class="mb-1">${file.name}</h6>
                    <small class="text-muted">${file.size || 'Folder'}</small>
                </div>
            </div>` : `
            <div class="col-12 list-group-item bg-black border-success d-flex align-items-center" data-id="${file.id}">
                <i class="bi ${file.icon} fs-4 me-3 text-success"></i>
                <div class="flex-grow-1" onclick="openItem(${file.id}, '${path}')">${file.name}</div>
                <small class="text-muted">${file.size || 'Folder'}</small>
                <button onclick="event.stopImmediatePropagation();actionRename(${file.id});" class="btn btn-sm btn-link text-success">✏️</button>
            </div>`;
        html += cardHTML;
    });
    
    container.innerHTML = html || `<div class="col-12 text-center py-5 text-muted">This folder is empty</div>`;
}

function openItem(id, path) {
    const files = fakeFileSystem[path] || fakeFileSystem.root;
    const item = files.find(f => f.id === id);
    
    if (!item) return;
    
    if (item.type === 'folder' || item.children) {
        renderExplorer(item.children || item.name.toLowerCase());
    } else if (item.type === 'image') {
        showPreview(item);
    } else if (item.type === 'video') {
        showPreview(item);
    } else {
        alert(`📄 Opened ${item.name} (demo preview would open here)`);
    }
}

function setView(mode) {
    viewMode = mode;
    renderExplorer(currentPath);
}

function showPreview(item) {
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    document.getElementById('previewTitle').textContent = item.name;
    
    let body = '';
    if (item.type === 'image') {
        body = `<img src="${item.url}" class="img-fluid rounded-3" alt="${item.name}">`;
    } else if (item.type === 'video') {
        body = `<video controls class="w-100 rounded-3"><source src="${item.url}" type="video/mp4"></video>`;
    } else {
        body = `<div class="p-5 text-center"><i class="bi bi-file-earmark-text fs-1"></i><p class="mt-3">${item.name} opened in document viewer (demo)</p></div>`;
    }
    document.getElementById('previewBody').innerHTML = body;
    modal.show();
}

function closePreview() {
    bootstrap.Modal.getInstance(document.getElementById('previewModal')).hide();
}

function newFolder() {
    const name = prompt("📁 New folder name:", "New Folder");
    if (!name) return;
    alert(`✅ Folder "${name}" created (demo)`);
    renderExplorer(currentPath);
}

function fakeUpload() {
    alert("📤 File uploaded successfully! (demo mode - added to current folder)");
    renderExplorer(currentPath);
}

function loadRecentFiles() {
    const container = document.getElementById('recentFiles');
    const recents = [
        { name: "summer-vacation.jpg", icon: "bi-image" },
        { name: "trip-highlights.mp4", icon: "bi-film" },
        { name: "report.pdf", icon: "bi-file-earmark-pdf" }
    ];
    let html = '';
    recents.forEach(r => {
        html += `
        <div onclick="alert('📂 Opened recent file: ${r.name} (demo)')" class="col-md-4 col-6">
            <div class="card bg-black border-success p-3 d-flex align-items-center">
                <i class="bi ${r.icon} fs-3 text-success me-3"></i>
                <div>${r.name}</div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function renderGallery() {
    const container = document.getElementById('imageGallery');
    const imgs = fakeFileSystem.images || [];
    let html = '';
    imgs.forEach(img => {
        html += `
        <div class="col-md-4 col-6">
            <div onclick="showPreview({name:'${img.name}', type:'image', url:'${img.url}'})" class="card bg-black border-success overflow-hidden">
                <img src="${img.url}" class="card-img-top" style="height:180px;object-fit:cover">
                <div class="card-body text-center">${img.name}</div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function renderVideos() {
    const container = document.getElementById('videoLibrary');
    const vids = fakeFileSystem.videos || [];
    let html = '';
    vids.forEach(v => {
        html += `
        <div class="col-md-6">
            <div onclick="showPreview({name:'${v.name}', type:'video', url:'${v.url}'})" class="card bg-black border-success p-3">
                <i class="bi bi-film fs-1 text-success"></i>
                <h6 class="mt-3">${v.name}</h6>
                <small class="text-muted">${v.size}</small>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function renderDocuments() {
    const container = document.getElementById('docList');
    const docs = fakeFileSystem.docs || [];
    let html = '';
    docs.forEach(d => {
        html += `
        <div onclick="showPreview({name:'${d.name}', type:'file'})" class="list-group-item bg-black border-success d-flex justify-content-between align-items-center">
            <div><i class="bi ${d.icon} me-2"></i> ${d.name}</div>
            <small>${d.size}</small>
        </div>`;
    });
    container.innerHTML = html;
}

function performSearch() {
    const query = $('#searchInput').val().toLowerCase().trim();
    if (!query) return;
    alert(`🔍 Found results for "${query}" (demo mode)`);
    switchTab(1);
}

function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('d-none');
}

function actionRename() {
    document.getElementById('contextMenu').classList.add('d-none');
    const newName = prompt("✏️ Rename file/folder:", "New name");
    if (newName) {
        alert(`✅ Renamed to "${newName}" (demo)`);
        renderExplorer(currentPath);
    }
}

function actionDelete() {
    document.getElementById('contextMenu').classList.add('d-none');
    if (confirm("🗑️ Delete this item?")) {
        alert("✅ Item moved to trash (demo)");
        renderExplorer(currentPath);
    }
}

function actionCopy() {
    document.getElementById('contextMenu').classList.add('d-none');
    alert("📋 Copied to clipboard (demo - ready to paste anywhere)");
}

function actionMove() {
    document.getElementById('contextMenu').classList.add('d-none');
    alert("📦 Move dialog opened (demo)");
}

// Global exposure
window.switchTab = switchTab;
window.toggleSidebar = toggleSidebar;
window.navigateTo = navigateTo;
window.renderExplorer = renderExplorer;
window.openItem = openItem;
window.setView = setView;
window.showPreview = showPreview;
window.closePreview = closePreview;
window.newFolder = newFolder;
window.fakeUpload = fakeUpload;
window.performSearch = performSearch;
window.actionRename = actionRename;
window.actionDelete = actionDelete;
window.actionCopy = actionCopy;
window.actionMove = actionMove;
