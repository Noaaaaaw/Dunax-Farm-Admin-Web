import { CONFIG } from '../../config.js';

class TetasPresenter {
  constructor({ onDataReady, onUpdateUI }) {
    this.onDataReady = onDataReady;
    this.onUpdateUI = onUpdateUI;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    const hash = window.location.hash.slice(1);
    const categoryId = hash.includes('-') ? hash.split('-').slice(1).join('-') : '';
    
    try {
      const [resCat, resMesin] = await Promise.all([
        fetch(`${this.baseUrl}/commodities/${categoryId}`),
        fetch(`${this.baseUrl}/api/mesin-tetas/status/${categoryId}`)
      ]);
      
      const cat = await resCat.json();
      const mesin = await resMesin.json();
      
      if (cat.status === 'success') this.onDataReady(cat.data);
      if (mesin.status === 'success') this.onUpdateUI(mesin.data);
      
    } catch (err) { 
      console.error("Tetas Presenter Error:", err); 
    }
  }

  async moveMesin(payload) {
    const res = await fetch(`${this.baseUrl}/api/mesin-tetas/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
}

export default TetasPresenter;