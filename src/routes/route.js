import HomePage from '../Home/Dashboard/homepage.js';
import JualKomoditas from '../Home/Jual-Komoditas/jual-komoditas.js';
import SettingProdukPage from '../Home/setting-komoditas/setting-produk.js';
import LaporanMain from '../Home/Operasional/laporan-main.js'; 
import LaporanKandang from '../Home/Laporan/laporan.js';
import Pembibitan from '../Home/Pembibitan/pembibitan.js';
import Login from '../auth/Login/login.js';
import AuthService from '../auth/auth-services.js';

const routes = {
  '#/': HomePage,
  '#/homepage': HomePage,
  '#/jual-komoditas': JualKomoditas,
  '#/laporan': LaporanMain, // Gerbang Utama Pusat Laporan
  '#/laporan-harian-kandang': LaporanKandang, // Sub-halaman Detail
  '#/pembibitan': Pembibitan,
  '#/login': Login,
};

export const resolveRoute = async () => {
  const hash = location.hash || '#/';
  if (!AuthService.checkAccess()) return null;

  let page = routes[hash];

  if (!page && hash.startsWith('#/setting-')) {
    page = SettingProdukPage; 
  }

  if (!page) {
    location.hash = '#/'; // Balik ke Home kalau typo/tidak ketemu
    return null;
  }

  return page;
};

export default routes;