export type GeneratorType = 'QCC' | 'IP';

export interface GanttChartTask {
  task: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  duration: number; // in days
}

export interface ReportGenerationParams {
  theme: string;
  additionalData: string;
  currentCondition: string;
  desiredCondition: string;
  supportingDataBefore?: string;
  supportingDataAfter?: string;
}

// 1. QCC Report
export interface QCCReport {
  type: 'QCC';
  judul: string;
  tim: string;
  lokasi: string;
  tanggal: string; // YYYY-MM-DD
  langkah1: {
    judul: string;
    latarBelakang: string;
    kondisiAwal: string;
    dataAwal: { label: string; value: number, unit: string }[];
  };
  langkah2: {
    judul: string;
    targetKuantitatif: { metrik: string; baseline: string; target: string }[];
    targetKualitatif: string[];
  };
  langkah3: {
    judul: string;
    fishbone: {
      manusia: string[];
      mesin: string[];
      metode: string[];
      material: string[];
      lingkungan: string[];
    };
    fiveWhy: { why: string; because: string }[];
    akarMasalah: string;
  };
  langkah4: {
    judul: string;
    idePerbaikan: { ide: string; deskripsi: string; penanggungJawab: string }[];
    ganttChart: GanttChartTask[];
  };
  langkah5: {
    judul: string;
    implementasi: string;
    fotoSebelumUrl: string;
    fotoSesudahUrl: string;
  };
  langkah6: {
    judul: string;
    evaluasi: string;
    dataPerbandingan: { name: string; sebelum: number; sesudah: number, unit: string }[];
  };
  langkah7: {
    judul: string;
    standardisasi: { dokumen: string; deskripsi: string }[];
    pencegahan: string;
    horizontalDevelopment: string;
  };
  langkah8: {
    judul: string;
    rencanaBerikutnya: string;
  };
}

// 2. IP (Improvement Project) Report - NEW STRUCTURE from PDF
export interface IPReport {
  type: 'IP';
  judul: string; // Judul Individual Project
  jadwalKegiatan: GanttChartTask[]; // Schedule Activity

  // Page 2 & 3: Theme, Situation Analysis & Target
  penentuanTema: {
    data: string; // Data Menentukan Tema
    analisaSituasi: string;
    target: string;
  };

  // Page 4: Problem Analysis
  analisaMasalah: {
    fishbone: {
      manusia: string[];
      material: string[];
      mesin: string[];
      metode: string[];
    };
    // The table on the right of page 4
    verifikasiAkarMasalah: {
      kategori: 'MAN' | 'MATERIAL' | 'MESIN' | 'METODE';
      rootCause: string;
      verifikasi: string;
      validasi: string;
    }[];
  };

  // Page 5: Alternative Solutions
  alternatifSolusi: {
    rootCause: string; // e.g., "Rootcause 1"
    opsi: { // Array of options for the root cause
      nama: string; // e.g., "XXX"
      inspirasiIde: string;
      analisa: string; // The (+),(-) part
      kesimpulan: string;
    }[];
  }[];

  // Page 6: Solution Design & Plan
  desainRencanaPerbaikan: {
    desainSolusi: {
      judul: string; // "Desain Solusi Root Cause 1"
      deskripsi: string;
    }[];
    // 5W2H plan
    rencanaDetail: {
      activity: string; // "Solusi 1"
      why: string;
      how: string;
      where: string;
      when: string;
      who: string;
      howMuch: string;
    }[];
  };

  // Page 7 & 8: Improvement Implementation
  implementasiPerbaikan: {
    // Array to handle one or more improvements (Perbaikan 1, Perbaikan 2)
    langkah: {
      judul: string; // "PERBAIKAN 1"
      studyDanFinalDesign: string;
      persiapanPerbaikan: string;
      prosesPerbaikan: string;
      trialDanEvaluasi: string;
    }[];
  };
  
  // Page 9: Evaluation
  evaluasi: {
    fotoSebelumUrl: string;
    fotoSesudahUrl: string;
    evaluasiQCDSM: {
      aspek: 'Q' | 'C' | 'D' | 'S' | 'M';
      sebelumPerbaikan: string;
      sesudahPerbaikan: string;
      data: string; // e.g., "Reduction from 10% to 2%"
    }[];
  };

  // Page 10: Standardization
  standarisasi: {
    deskripsiStandarisasi: string;
    horizontalDevelopment: string;
  };
}


export type AnyReport = QCCReport | IPReport;