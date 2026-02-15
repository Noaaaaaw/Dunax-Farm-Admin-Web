import AuthService from '../auth/auth-services.js';

const AppBar = {
  render() {
    const user = AuthService.getUser();
    const fullDisplayName = user?.nama || user?.name || 'User'; 
    const userEmail = user?.email || user?.user_email || 'Email Bermasalah'; 
    const displayRole = user?.role || 'KARYAWAN';
    
    const firstName = fullDisplayName.split(' ')[0]; 
    const displayAvatar = `https://ui-avatars.com/api/?name=${firstName}&background=41644A&color=fff&bold=true`;
    
    const currentHash = window.location.hash || '#/';
    const isActive = (path) => (currentHash === path ? 'active' : '');

    return `
      <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
      
      <header class="appbar">
        <div class="appbar-inner"> 
          <div class="appbar-top-row">
            <div class="brand-section">
              <h1 class="app-title" style="font-family: 'Luckiest Guy', cursive; font-weight: normal; letter-spacing: 2px; color: #000000; font-size: 1.8rem;">
                DUNAX FARM (DNX) <span class="title-sub" style="font-family: sans-serif; font-weight: 2.2 rem; font-size: 0.7rem; letter-spacing: 1px; margin-left: 5px;">OPERATIONAL</span>
              </h1>
            </div>

            <div class="right-action-group">
              <div class="profile-section desktop-only">
                <div class="user-profile-box" id="profileToggle">
                  <div class="user-meta-vertical">
                    <span class="u-name-label">${fullDisplayName}</span>
                    <span class="u-role-badge">${displayRole.toUpperCase()}</span>
                  </div>
                  <div class="avatar-box-wrapper">
                    <img src="${displayAvatar}" alt="Profile">
                    <span class="online-status-indicator"></span> 
                  </div>
                </div>
                
                <div class="profile-dropdown-card" id="profileDropdown">
                  <div class="dropdown-header">
                    <p class="dropdown-user-name">${fullDisplayName}</p>
                    <p class="dropdown-user-email">${userEmail}</p>
                  </div>
                  <div class="dropdown-divider"></div>
                  <button class="btn-logout-full" id="logoutBtn">Logout Keluar Sistem</button>
                </div>
              </div>

              <button id="menuMobileBtn" class="menu-mobile-btn">
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>

          <nav class="desktop-nav-row">
            <a href="#/" class="${isActive('#/')}">DASHBOARD</a>
            <a href="#/laporan" class="${isActive('#/laporan')}">OPERASIONAL</a>
            <a href="#/pembibitan" class="${isActive('#/pembibitan')}">PEMBIBITAN</a>
            <a href="#/jual-komoditas" class="${isActive('#/jual-komoditas')}">KOMODITAS</a>
            <a href="#/new-asset" class="${isActive('#/new-asset')}">MANAJEMEN ASSET</a>
            <a href="#/pustaka" class="${isActive('#/pustaka')}">PUSTAKA</a>
          </nav>
        </div>
        
        <div id="mobileSidebar" class="mobile-sidebar">
          <div class="sidebar-header-mobile">
            <div class="avatar-mobile-wrapper">
               <img src="${displayAvatar}" alt="Profile">
               <span class="mobile-online-dot"></span>
            </div>
            <div class="mobile-user-info">
              <p class="mobile-u-name">${fullDisplayName}</p>
              <p class="mobile-u-email">${userEmail}</p> 
              <span class="mobile-u-role">${displayRole.toUpperCase()}</span>
              <button id="logoutMobileBtn" class="mobile-logout-inline-btn">Logout Keluar Sistem</button>
            </div>
          </div>
          <nav class="mobile-nav-links">
            <a href="#/" class="${isActive('#/')}">DASHBOARD</a>
            <a href="#/laporan" class="${isActive('#/laporan')}">OPERASIONAL</a>
            <a href="#/pembibitan" class="${isActive('#/pembibitan')}">PEMBIBITAN</a>
            <a href="#/jual-komoditas" class="${isActive('#/jual-komoditas')}">KOMODITAS</a>
            <a href="#/new-asset" class="${isActive('#/new-asset')}">MANAJEMEN ASSET</a>
            <a href="#/pustaka" class="${isActive('#/pustaka')}">PUSTAKA</a>
          </nav>
        </div>
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
      </header>
    `;
  },

  async afterRender() {
    // ... Logic JS tetap sama ...
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutMobileBtn = document.getElementById('logoutMobileBtn');
    const menuMobileBtn = document.getElementById('menuMobileBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (profileToggle) {
      profileToggle.onclick = (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
      };
    }

    if (menuMobileBtn) {
      menuMobileBtn.onclick = (e) => {
        e.stopPropagation();
        mobileSidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('visible');
      };
    }

    const closeSidebar = () => {
      mobileSidebar.classList.remove('open');
      sidebarOverlay.classList.remove('visible');
    };

    if (sidebarOverlay) sidebarOverlay.onclick = closeSidebar;

    const doLogout = () => {
      if (confirm('Yakin mau keluar sistem?')) {
        AuthService.logout();
        window.location.hash = '#/login';
      }
    };

    if (logoutBtn) logoutBtn.onclick = doLogout;
    if (logoutMobileBtn) logoutMobileBtn.onclick = doLogout;

    window.onclick = () => { 
      if (profileDropdown) profileDropdown.classList.remove('active'); 
    };
  }
};

export default AppBar;