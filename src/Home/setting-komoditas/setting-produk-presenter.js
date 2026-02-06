import { CONFIG } from "../../config.js";

class SettingProdukPresenter {
  constructor({ container, categoryId }) {
    this.container = container;
    this.categoryId = categoryId;
    this.baseUrl = CONFIG.BASE_URL;
  }

  async init() {
    const displayTitle = this.categoryId.replace(/-/g, " ").toUpperCase();
    this.container.style.cssText = "background: transparent; padding: 0; boxShadow: none; border: none;";

    this.container.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
      
      <div id="settingHeader" class="page-header-card" style="background: white !important; margin: 0 auto 30px auto; padding: 40px 20px; border-radius: 24px; text-align: center; border: 1px solid #e0eadd; box-shadow: 0 8px 24px rgba(0,0,0,0.04); max-width: 1200px;">
        <h1 style="margin: 0; font-family: 'Luckiest Guy', cursive; font-size: 2.8rem; color: #6CA651; letter-spacing: 3px; text-transform: uppercase;">
          SETTING PRODUK ${displayTitle}
        </h1>
      </div>

      <div id="productGrid" style="display: flex; flex-wrap: wrap; gap: 25px; justify-content: center; padding: 10px 0; max-width: 1200px; margin: 0 auto;">
          <div style="padding: 100px; text-align: center; width: 100%; color: #6CA651; font-weight: 800;">
            <p>⏳ Menghubungkan ke database...</p>
          </div>
      </div>
    `;

    try {
      const resProd = await fetch(`${this.baseUrl}/commodities/${this.categoryId}`);
      const resultProd = await resProd.json();

      if (resultProd.status === "success") {
        this._renderProducts(resultProd.data.details);
      }
    } catch (err) {
      console.error("Gagal load:", err);
      document.getElementById("productGrid").innerHTML = `<div style="width: 100%; text-align: center; color: #e74c3c;">⚠️ Server Error!</div>`;
    }
  }

  _renderProducts(products) {
    const grid = document.getElementById("productGrid");

    grid.innerHTML = products.map((p) => {
        return `
      <div class="setting-card" id="card-${p.id}" style="background: white; padding: 35px 25px; border-radius: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #e0eadd; width: 280px; display: flex; flex-direction: column; justify-content: space-between;">
        <h3 style="font-size: 1.4rem; margin-bottom: 25px; color: #1f3326; font-weight: 900; text-align: center; min-height: 70px; display: flex; align-items: center; justify-content: center;">
            ${p.nama}
        </h3>
        
        <div>
            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
              <div style="flex: 1;">
                <label style="display: block; font-size: 0.65rem; font-weight: 900; color: #4a5a4d; margin-bottom: 8px; text-align: center;">HARGA</label>
                <input type="number" class="prod-harga" value="${p.harga}" disabled style="width: 100%; padding: 12px; border: 2px solid #f4f6f4; background: #f9fbf9; border-radius: 12px; font-weight: 800; text-align: center;">
              </div>
              <div style="flex: 1;">
                <label style="display: block; font-size: 0.65rem; font-weight: 900; color: #4a5a4d; margin-bottom: 8px; text-align: center;">STOK</label>
                <input type="number" class="prod-stok-locked" value="${p.stok}" disabled style="width: 100%; padding: 12px; border: 2px solid #eee; background: #f1f3f1; border-radius: 12px; font-weight: 800; text-align: center; color: #999; cursor: not-allowed;">
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; background: #f1f8f1; padding: 12px; border-radius: 15px; margin-bottom: 25px; gap: 10px; border: 1px solid #eef2ed;">
                <span style="font-size: 0.85rem; font-weight: 800; color: #6CA651;">Status Jual</span>
                <input type="checkbox" class="prod-aktif" ${p.aktif ? "checked" : ""} disabled style="width: 20px; height: 20px; accent-color: #6CA651;">
            </div>

            <button class="edit-btn" data-id="${p.id}" 
                    style="width: 100%; padding: 18px; background: #6CA651; color: white; border: none; border-radius: 18px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 1rem;">
                EDIT DATA
            </button>
        </div>
      </div>`;
      }).join("");

    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const card = this.container.querySelector(`#card-${id}`);
        
        // HANYA AMBIL INPUT HARGA DAN CHECKBOX (STOK DIABAIKAN)
        const inputHarga = card.querySelector(".prod-harga");
        const inputAktif = card.querySelector(".prod-aktif");

        if (e.target.innerText !== "SIMPAN") {
          // Buka kunci Harga & Status Jual
          inputHarga.disabled = false;
          inputHarga.style.background = "#fff";
          inputHarga.style.borderColor = "#6CA651";
          
          inputAktif.disabled = false;

          e.target.innerText = "SIMPAN";
          e.target.style.background = "#f39c12";
        } else {
          this._handleSave(card, id);
        }
      };
    });
  }

  async _handleSave(card, id) {
    const payload = {
      id: id,
      harga: Number(card.querySelector(".prod-harga").value),
      // STOK TETAP DIKIRIM SESUAI DATA LAMA (AGAR TIDAK BERUBAH DI DATABASE)
      stok: Number(card.querySelector(".prod-stok-locked").value),
      aktif: card.querySelector(".prod-aktif").checked,
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/commodities/update-product`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
      });
      if ((await res.json()).status === "success") {
        alert("Data Berhasil Diperbarui! ✨");
        this.init();
      }
    } catch (err) {
      alert("Gagal simpan!");
    }
  }
}
export default SettingProdukPresenter;