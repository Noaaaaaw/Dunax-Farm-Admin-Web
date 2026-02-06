import HomePage from '../Home/Dashboard/homepage.js';
import JualKomoditas from '../Home/Jual-Komoditas/jual-komoditas.js';
import SettingProdukPage from '../Home/setting-komoditas/setting-produk.js';
import LaporanMain from '../Home/Operasional/laporan-main.js'; 
import LaporanKandang from '../Home/Laporan/laporan.js';
import Pembibitan from '../Home/Pembibitan/pembibitan.js';
import Bibit from '../Home/Bibit/bibit.js'; 
import Login from '../auth/Login/login.js';
import AuthService from '../auth/auth-services.js';

const routes = {
  '#/': HomePage,
  '#/homepage': HomePage,
  '#/jual-komoditas': JualKomoditas,
  '#/laporan': LaporanMain, 
  '#/laporan-harian-kandang': LaporanKandang,
  '#/pembibitan': Pembibitan,
  // 2. DAFTARKAN ROUTE MASTER PEMBIBITAN
  '#/bibit': Bibit, 
  '#/login': Login,
};

export const resolveRoute = async () => {
  const hash = location.hash || '#/';
  if (!AuthService.checkAccess()) return null;

  let page = routes[hash];

  // 3. LOGIC DYNAMIC ROUTING UNTUK SETTING PRODUK
  if (!page && hash.startsWith('#/setting-')) {
    page = SettingProdukPage; 
  }

  // 4. LOGIC DYNAMIC ROUTING UNTUK DETAIL BIBIT PER KATEGORI
  // Contoh: #/bibit-ayam-kampung bakal lari ke halaman Bibit
  if (!page && hash.startsWith('#/bibit-')) {
    page = Bibit; 
  }

  if (!page) {
    location.hash = '#/'; 
    return null;
  }

  return page;
};

export default routes;