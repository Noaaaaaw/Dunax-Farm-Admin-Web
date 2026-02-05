class LaporanMainPresenter {
  constructor() {
    this.cardKandang = document.getElementById('cardKandang');
  }

  init() {
    if (this.cardKandang) {
      this.cardKandang.addEventListener('click', () => {
        console.log("Navigating to Detail Laporan...");
        // Pastikan Hash ini SAMA PERSIS dengan di routes.js
        window.location.hash = '#/laporan-harian-kandang';
      });

      // Hover Effect
      this.cardKandang.addEventListener('mouseenter', () => {
        this.cardKandang.style.transform = 'translateY(-8px)';
        this.cardKandang.style.borderColor = '#41644A';
      });
      this.cardKandang.addEventListener('mouseleave', () => {
        this.cardKandang.style.transform = 'translateY(0)';
        this.cardKandang.style.borderColor = '#eef2ed';
      });
    }
  }
}

export default LaporanMainPresenter;