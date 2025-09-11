import PptxGenJS from 'pptxgenjs';
import { IPReport, QCCReport } from '../types';

export type PresentationStyle = 'minimalist' | 'professional' | 'colorful';

// --- STYLE DEFINITIONS ---
const styles = {
    minimalist: {
        bg: 'FFFFFF', textColor: '000000', titleColor: '000000', accentColor: '4A4A4A', font: 'Arial',
    },
    professional: {
        bg: 'FFFFFF', textColor: '333333', titleColor: '003366', accentColor: '005A9C', font: 'Calibri',
    },
    colorful: {
        bg: 'FFFFFF', textColor: '34495E', titleColor: '16A085', accentColor: 'E74C3C', font: 'Helvetica',
    }
};

const commonOptions = {
    y: 0.25, h: 0.75, w: '90%', x: 0.5,
    fontSize: 24, bold: true
};

// --- HELPER FUNCTIONS ---
const addTitleSlide = (pptx: PptxGenJS, title: string, subtitle: string, theme: any) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };
    slide.addText(title, {
        x: 0.5, y: 1.5, w: '90%', h: 1, fontSize: 32, fontFace: theme.font, color: theme.titleColor, bold: true, align: 'center'
    });
    slide.addText(subtitle, {
        x: 0.5, y: 2.5, w: '90%', h: 1, fontSize: 20, fontFace: theme.font, color: theme.accentColor, align: 'center'
    });
};

const addContentSlide = (pptx: PptxGenJS, slideTitle: string, theme: any) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };
    slide.addText(slideTitle, { ...commonOptions, fontFace: theme.font, color: theme.titleColor });
    return slide;
};

const addTextSection = (slide: PptxGenJS.Slide, title: string, content: string, y: number, theme: any) => {
    slide.addText(title, { x: 0.5, y, w: '90%', h: 0.5, fontSize: 18, fontFace: theme.font, color: theme.accentColor, bold: true });
    slide.addText(content, { x: 0.5, y: y + 0.4, w: '90%', h: 1.5, fontSize: 14, fontFace: theme.font, color: theme.textColor });
};

// --- IP REPORT PPT EXPORT ---
export const exportIPToPPT = async (report: IPReport, style: PresentationStyle) => {
    const pptx = new PptxGenJS();
    const theme = styles[style];
    pptx.layout = 'LAYOUT_WIDE';
    
    // Slide 1: Judul
    addTitleSlide(pptx, report.judul, 'Laporan Individual Project', theme);

    // Slide 2: Problem & Goal
    const slide2 = addContentSlide(pptx, 'Problem Statement & Goal', theme);
    addTextSection(slide2, 'Problem Statement', report.penentuanTema.analisaSituasi, 1.2, theme);
    addTextSection(slide2, 'Goal Statement', report.penentuanTema.target, 3.2, theme);

    // Slide 3: Jadwal
    const slide3 = addContentSlide(pptx, 'Jadwal Kegiatan', theme);
    const scheduleRows = report.jadwalKegiatan.map(t => [t.task, t.start, t.end, `${t.duration} hari`]);
    slide3.addTable([['Aktivitas', 'Mulai', 'Selesai', 'Durasi'], ...scheduleRows], { 
        x: 0.5, y: 1.2, w: '90%', autoPage: true,
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Slide 4: Analisa Masalah
    const slide4 = addContentSlide(pptx, 'Analisa Masalah: Fishbone', theme);
    // FIX: Replaced grouping parentheses with array brackets to correctly construct the array for slide text. This resolves a syntax error that caused subsequent issues.
    const fishboneText = Object.entries(report.analisaMasalah.fishbone).map(([category, causes]) => [
        { text: `${category.toUpperCase()}:`, options: { bullet: true, indentLevel: 0, bold: true, color: theme.textColor } },
        ...(causes as string[]).map(cause => ({ text: cause, options: { bullet: 'dot', indentLevel: 1, color: theme.textColor } }))
    ]).flat();
    slide4.addText(fishboneText, { x: 0.5, y: 1.2, w: '90%', h: 4, fontFace: theme.font });

    // Slide 5: Verifikasi Akar Masalah
    const slide5 = addContentSlide(pptx, 'Analisa Masalah: Verifikasi Root Cause', theme);
    const verificationRows = report.analisaMasalah.verifikasiAkarMasalah.map(v => [v.kategori, v.rootCause, v.validasi]);
    slide5.addTable([['Kategori', 'Root Cause', 'Validasi'], ...verificationRows], {
        x: 0.5, y: 1.2, w: '90%', autoPage: true,
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Slide 6: Alternatif Solusi
    const slide6 = addContentSlide(pptx, 'Alternatif Solusi', theme);
    const solutionRows = report.alternatifSolusi.flatMap(s => s.opsi.map(o => [s.rootCause, o.nama, o.kesimpulan]));
    slide6.addTable([['Root Cause', 'Opsi Solusi', 'Kesimpulan'], ...solutionRows], {
        x: 0.5, y: 1.2, w: '90%', autoPage: true,
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });
    
    // Slide 7: Desain & Rencana Perbaikan
    const slide7 = addContentSlide(pptx, 'Desain & Rencana Perbaikan (5W2H)', theme);
    const planRows = report.desainRencanaPerbaikan.rencanaDetail.map(p => [p.activity, p.why, p.who, p.when]);
    slide7.addTable([['Activity', 'Why', 'Who', 'When'], ...planRows], {
        x: 0.5, y: 1.2, w: '90%', autoPage: true,
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Slide 8: Implementasi
    const slide8 = addContentSlide(pptx, 'Implementasi Perbaikan', theme);
    const implText = report.implementasiPerbaikan.langkah.flatMap(l => [
        { text: l.judul, options: { bold: true, color: theme.textColor } },
        { text: `- Study & Final Design: ${l.studyDanFinalDesign}`, options: { bullet: 'dot', indentLevel: 1, color: theme.textColor } },
        { text: `- Implementasi: ${l.prosesPerbaikan}`, options: { bullet: 'dot', indentLevel: 1, color: theme.textColor } },
        { text: ``, options: { breakLine: true } }
    ]);
    slide8.addText(implText, { x: 0.5, y: 1.2, w: '90%', h: 4, fontFace: theme.font });
    
    // Slide 9: Evaluasi
    const slide9 = addContentSlide(pptx, 'Evaluasi (QCDSM)', theme);
    const evalRows = report.evaluasi.evaluasiQCDSM.map(e => [e.aspek, e.sebelumPerbaikan, e.sesudahPerbaikan, e.data]);
    slide9.addTable([['Aspek', 'Sebelum', 'Sesudah', 'Data'], ...evalRows], {
        x: 0.5, y: 1.2, w: '90%', autoPage: true,
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Slide 10: Standarisasi
    const slide10 = addContentSlide(pptx, 'Standarisasi & Horizontal Development', theme);
    addTextSection(slide10, 'Standarisasi', report.standarisasi.deskripsiStandarisasi, 1.2, theme);
    addTextSection(slide10, 'Horizontal Development', report.standarisasi.horizontalDevelopment, 3.2, theme);

    // Slide 11: Kesimpulan
    const slide11 = addContentSlide(pptx, 'Kesimpulan', theme);
    slide11.addText('Proyek improvement berhasil mencapai target yang ditetapkan melalui analisa dan implementasi solusi yang sistematis.', { x: 0.5, y: 2, w: '90%', h: 2, fontSize: 18, align: 'center', fontFace: theme.font, color: theme.textColor });

    pptx.writeFile({ fileName: `Presentasi_Proyek_RAB.pptx` });
};


// --- QCC REPORT PPT EXPORT ---
export const exportQCCToPPT = async (report: QCCReport, style: PresentationStyle) => {
    const pptx = new PptxGenJS();
    const theme = styles[style];
    pptx.layout = 'LAYOUT_WIDE';

    // Slide 1: Judul
    addTitleSlide(pptx, report.judul, 'Laporan Quality Control Circle (QCC)', theme);

    // Step 1
    const slide1 = addContentSlide(pptx, 'Langkah 1: Menetapkan Tema', theme);
    addTextSection(slide1, 'Latar Belakang', report.langkah1.latarBelakang, 1.2, theme);
    addTextSection(slide1, 'Kondisi Awal', report.langkah1.kondisiAwal, 3.2, theme);

    // Step 2
    const slide2 = addContentSlide(pptx, 'Langkah 2: Target', theme);
    const targetRows = report.langkah2.targetKuantitatif.map(t => [t.metrik, t.baseline, t.target]);
    slide2.addTable([['Metrik', 'Baseline', 'Target'], ...targetRows], {
        x: 0.5, y: 1.2, w: '90%',
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Step 3
    const slide3 = addContentSlide(pptx, 'Langkah 3: Analisa Masalah', theme);
    slide3.addText(`Akar Masalah Utama: ${report.langkah3.akarMasalah}`, { x: 0.5, y: 1.2, w: '90%', h: 1, fontFace: theme.font, color: theme.textColor, fontSize: 16 });

    // Step 4
    const slide4 = addContentSlide(pptx, 'Langkah 4: Rencana Perbaikan', theme);
    const planRows = report.langkah4.idePerbaikan.map(p => [p.ide, p.deskripsi, p.penanggungJawab]);
    slide4.addTable([['Ide', 'Deskripsi', 'PJ'], ...planRows], {
        x: 0.5, y: 1.2, w: '90%', autoPage: true,
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Step 5
    addContentSlide(pptx, 'Langkah 5: Implementasi', theme)
        .addText(report.langkah5.implementasi, { x: 0.5, y: 1.2, w: '90%', h: 4, fontFace: theme.font, color: theme.textColor });

    // Step 6
    const slide6 = addContentSlide(pptx, 'Langkah 6: Evaluasi', theme);
    const evalRows = report.langkah6.dataPerbandingan.map(e => [e.name, e.sebelum, e.sesudah, e.unit]);
    slide6.addTable([['Metrik', 'Sebelum', 'Sesudah', 'Unit'], ...evalRows], {
        x: 0.5, y: 1.2, w: '90%',
        border: { type: 'solid', pt: 1, color: theme.accentColor },
        color: theme.textColor, fontFace: theme.font,
        header: { bold: true, color: 'FFFFFF', fill: { color: theme.accentColor } }
    });

    // Step 7
    const slide7 = addContentSlide(pptx, 'Langkah 7: Standarisasi', theme);
    addTextSection(slide7, 'Standardisasi', report.langkah7.standardisasi.map(s => `${s.dokumen}: ${s.deskripsi}`).join('\n'), 1.2, theme);
    
    // Step 8
    addContentSlide(pptx, 'Langkah 8: Rencana Selanjutnya', theme)
        .addText(report.langkah8.rencanaBerikutnya, { x: 0.5, y: 1.2, w: '90%', h: 4, fontFace: theme.font, color: theme.textColor });

    // Final Slide
    addTitleSlide(pptx, 'Terima Kasih', '', theme);

    pptx.writeFile({ fileName: `Presentasi_Proyek_RAB.pptx` });
};