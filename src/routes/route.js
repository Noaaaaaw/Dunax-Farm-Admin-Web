import HomePage from '../Home/Dashboard/homepage.js';
import JualKomoditas from '../Home/Jual-Komoditas/jual-komoditas.js';
import SettingProdukPage from '../Home/setting-komoditas/setting-produk.js'; 
import Login from '../auth/Login/login.js';
import AuthService from '../auth/auth-services.js';

const routes = {
  '#/': HomePage,
  '#/homepage': HomePage,
  '#/jual-komoditas': JualKomoditas,
  '#/login': Login,
};

export const resolveRoute = async () => {
  const hash = location.hash || '#/';
  
  if (!AuthService.checkAccess()) return null;

  let page = routes[hash];

  // Logika Dinamis untuk nangkep #/setting-xxx
  if (!page && hash.startsWith('#/setting-')) {
    page = SettingProdukPage; 
  }

  if (!page) {
    location.hash = '#/';
    return null;
  }

  return page;
};

export default routes;