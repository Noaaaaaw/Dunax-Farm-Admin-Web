import HomePage from '../Home/Dashboard/homepage.js';
import JualKomoditas from '../Home/Jual-Komoditas/jual-komoditas.js';
import SettingProdukPage from '../Home/setting-komoditas/setting-produk.js';
import LaporanMain from '../Home/Operasional/laporan-main.js'; 
import LaporanKandang from '../Home/Laporan/laporan.js';
import Pembibitan from '../Home/Pembibitan/pembibitan.js';
import Bibit from '../Home/Bibit/bibit.js'; 
import Tetas from '../Home/Mesin-Tetas/Tetas.js';
import Doc from '../Home/DOC/doc.js';
import Pullet from '../Home/Pullet/pullet.js'; 
import Ayam from '../Home/Ayam/ayam.js';
import Login from '../auth/Login/login.js';
import AuthService from '../auth/auth-services.js';
import BibitBaru from '../Home/Bibit Baru/Bibit-baru.js';

const routes = {
  '#/': HomePage,
  '#/homepage': HomePage,
  '#/jual-komoditas': JualKomoditas,
  '#/laporan': LaporanMain, 
  '#/laporan-harian-kandang': LaporanKandang,
  '#/pembibitan': Pembibitan,
  '#/bibit': Bibit,
  '#/tetas': Tetas,
  '#/doc': Doc,
  '#/pullet': Pullet, 
  '#/ayam': Ayam,
  '#/login': Login,
  '#/new-asset': BibitBaru,
};

export const resolveRoute = async () => {
  const hash = location.hash || '#/';
  if (!AuthService.checkAccess()) return null;

  let page = routes[hash];
  
  if (!page && hash.startsWith('#/setting-')) {
    page = SettingProdukPage; 
  }
  if (!page && hash.startsWith('#/bibit-')) {
    page = Bibit; 
  }
  if (!page && hash.startsWith('#/tetas-')) {
    page = Tetas; 
  }
  if (!page && hash.startsWith('#/doc-')) {
    page = Doc; 
  }
  if (!page && hash.startsWith('#/pullet-')) {
    page = Pullet; 
  }
  if (!page && hash.startsWith('#/ayam-')) {
    page = Ayam; 
  }
  if (!page && hash.startsWith('#/new-asset-')) {
    page = BibitBaru; 
  }
  
  if (!page) {
    location.hash = '#/'; 
    return null;
  }

  return page;
};

export default routes;