import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PptxGenJS from 'pptxgenjs';
import html2canvas from 'html2canvas';
import { IPReport, QCCReport } from '../types';
// FIX: Changed to a named import as QCC_STEPS is not a default export.
import { QCC_STEPS, IP_STEPS } from '../constants';

const captureElementAsImage = async (elementId: string): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) return '';
    const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
    return canvas.toDataURL('image/png');
};

const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
        // Use a proxy if running into CORS issues in development
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            console.error(`Failed to fetch image from ${url}, status: ${response.status}`);
            return ''; 
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Error converting image URL to base64: ${url}`, error);
        return '';
    }
};

// --- PDF EXPORT CONSTANTS & HELPERS ---

const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 15;
const MAX_WIDTH = A4_WIDTH - MARGIN * 2;
let yPos = MARGIN;

const checkPageBreak = (doc: jsPDF, neededHeight: number) => {
    if (yPos + neededHeight > A4_HEIGHT - MARGIN) {
        doc.addPage();
        yPos = MARGIN;
    }
};

const addTitle = (doc: jsPDF, title: string) => {
    checkPageBreak(doc, 20);
    doc.setFontSize(18).setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(title, MAX_WIDTH);
    doc.text(lines, MARGIN, yPos);
    yPos += (lines.length * 7) + 5;
};

const addSubTitle = (doc: jsPDF, title: string) => {
    checkPageBreak(doc, 15);
    doc.setFontSize(14).setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(title, MAX_WIDTH);
    doc.text(lines, MARGIN, yPos);
    yPos += (lines.length * 6) + 4;
};

const addText = (doc: jsPDF, text: string) => {
    checkPageBreak(doc, 10);
    doc.setFontSize(11).setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, MAX_WIDTH);
    doc.text(lines, MARGIN, yPos);
    yPos += (lines.length * 5) + 5;
};


// --- QCC PDF EXPORT ---
export const exportToPDF = async (report: QCCReport) => {
    const doc = new jsPDF();
    yPos = MARGIN;

    // --- Title Page ---
    doc.setFontSize(24).setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(report.judul, MAX_WIDTH), MARGIN, yPos + 10);
    yPos += 40;

    doc.setFontSize(12).setFont('helvetica', 'normal');
    addText(doc, `Tim: ${report.tim}`);
    addText(doc, `Lokasi: ${report.lokasi}`);
    addText(doc, `Tanggal: ${report.tanggal}`);

    const addSection = async (title: string, contentGenerator: () => Promise<void>) => {
        doc.addPage();
        yPos = MARGIN;
        addTitle(doc, title);
        await contentGenerator();
    };

    // --- Step 1 ---
    await addSection(QCC_STEPS[0], async () => {
        addSubTitle(doc, 'Latar Belakang');
        addText(doc, report.langkah1.latarBelakang);
        addSubTitle(doc, 'Kondisi Awal');
        addText(doc, report.langkah1.kondisiAwal);
    });

    // --- Step 2 ---
    await addSection(QCC_STEPS[1], async () => {
        addSubTitle(doc, 'Target Kuantitatif');
        autoTable(doc, {
            startY: yPos,
            head: [['Metrik', 'Baseline', 'Target']],
            body: report.langkah2.targetKuantitatif.map(t => [t.metrik, t.baseline, t.target]),
            theme: 'grid',
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        addSubTitle(doc, 'Target Kualitatif');
        report.langkah2.targetKualitatif.forEach(t => addText(doc, `- ${t}`));
    });

    // --- Step 3 ---
    await addSection(QCC_STEPS[2], async () => {
        const fishboneImg = await captureElementAsImage('fishbone-diagram-export');
        if (fishboneImg) doc.addImage(fishboneImg, 'PNG', MARGIN, yPos, 180, 80);
        yPos += 90;
        addSubTitle(doc, 'Analisis 5 Why & Akar Masalah');
        addText(doc, `Akar Masalah: ${report.langkah3.akarMasalah}`);
    });

    // --- Step 4 ---
    await addSection(QCC_STEPS[3], async () => {
        addSubTitle(doc, 'Ide & Rencana Perbaikan');
        autoTable(doc, {
            startY: yPos,
            head: [['Ide', 'Deskripsi', 'PJ']],
            body: report.langkah4.idePerbaikan.map(idea => [idea.ide, idea.deskripsi, idea.penanggungJawab]),
            theme: 'grid'
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        const ganttImg = await captureElementAsImage('gantt-chart-export');
        if (ganttImg) doc.addImage(ganttImg, 'PNG', MARGIN, yPos, 180, 60);
        yPos += 65;
    });
    
    // --- Step 5 ---
     await addSection(QCC_STEPS[4], async () => {
        addText(doc, report.langkah5.implementasi);
        addText(doc, 'Dokumentasi visual sebelum dan sesudah perbaikan dapat dilihat pada file PPTX.');
    });

    // --- Step 6 ---
    await addSection(QCC_STEPS[5], async () => {
        addText(doc, report.langkah6.evaluasi);
        const chartImg = await captureElementAsImage('before-after-chart-export');
        if (chartImg) doc.addImage(chartImg, 'PNG', MARGIN, yPos, 180, 90);
        yPos += 95;
    });
    
    // --- Step 7 ---
    await addSection(QCC_STEPS[6], async () => {
        addSubTitle(doc, 'Standardisasi');
        report.langkah7.standardisasi.forEach(s => addText(doc, `- ${s.dokumen}: ${s.deskripsi}`));
        addSubTitle(doc, 'Rencana Pencegahan');
        addText(doc, report.langkah7.pencegahan);
        addSubTitle(doc, 'Horizontal Development');
        addText(doc, report.langkah7.horizontalDevelopment);
    });

    // --- Step 8 ---
    await addSection(QCC_STEPS[7], async () => {
        addText(doc, report.langkah8.rencanaBerikutnya);
    });

    doc.save(`${report.judul.replace(/\s/g, '_')}.pdf`);
};


// --- IP PDF EXPORT (REFACTORED) ---
export const exportIPToPDF = async (report: IPReport) => {
    const doc = new jsPDF();
    yPos = MARGIN;

    // --- Title Page ---
    doc.setFontSize(24).setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(report.judul, MAX_WIDTH), MARGIN, yPos);
    yPos += 20;
    doc.setFontSize(12).setFont('helvetica', 'normal');
    doc.text(`Laporan Proyek Individual`, MARGIN, yPos);
    
    doc.addPage();
    yPos = MARGIN;
    
    // Step 1: Jadwal
    addTitle(doc, `1. ${IP_STEPS[0]}`);
    autoTable(doc, {
        startY: yPos,
        head: [['Tugas', 'Mulai', 'Selesai', 'Durasi (Hari)']],
        body: report.jadwalKegiatan.map(t => [t.task, t.start, t.end, t.duration]),
        theme: 'grid',
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Step 2: Tema & Target
    checkPageBreak(doc, 60);
    addTitle(doc, `2. ${IP_STEPS[1]}`);
    addSubTitle(doc, 'Data Penentuan Tema');
    addText(doc, report.penentuanTema.data);
    addSubTitle(doc, 'Analisa Situasi');
    addText(doc, report.penentuanTema.analisaSituasi);
    addSubTitle(doc, 'Target');
    addText(doc, report.penentuanTema.target);

    // Step 3: Analisa Masalah
    checkPageBreak(doc, 80);
    addTitle(doc, `3. ${IP_STEPS[2]}`);
    addSubTitle(doc, 'Analisa Fishbone (Akar Masalah)');
    Object.entries(report.analisaMasalah.fishbone).forEach(([category, causes]) => {
        checkPageBreak(doc, (causes.length + 1) * 6);
        doc.setFontSize(12).setFont('helvetica', 'bold');
        doc.text(category.charAt(0).toUpperCase() + category.slice(1), MARGIN, yPos);
        yPos += 6;
        doc.setFontSize(11).setFont('helvetica', 'normal');
        (causes as string[]).forEach(cause => {
             const lines = doc.splitTextToSize(`- ${cause}`, MAX_WIDTH - 5);
             doc.text(lines, MARGIN + 5, yPos);
             yPos += (lines.length * 5);
        });
        yPos += 3;
    });

    addSubTitle(doc, 'Verifikasi Akar Masalah');
    autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Root Cause', 'Verifikasi', 'Validasi']],
        body: report.analisaMasalah.verifikasiAkarMasalah.map(v => [v.kategori, v.rootCause, v.verifikasi, v.validasi]),
        theme: 'grid',
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Step 4: Alternatif Solusi
    checkPageBreak(doc, 20);
    addTitle(doc, `4. ${IP_STEPS[3]}`);
    report.alternatifSolusi.forEach(solusi => {
        checkPageBreak(doc, 20);
        addSubTitle(doc, solusi.rootCause);
        autoTable(doc, {
            startY: yPos,
            head: [['Opsi', 'Inspirasi Ide', 'Analisa (+/-)', 'Kesimpulan']],
            body: solusi.opsi.map(o => [o.nama, o.inspirasiIde, o.analisa, o.kesimpulan]),
            theme: 'grid',
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
    });
    
    // Step 5: Desain Perbaikan
    checkPageBreak(doc, 60);
    addTitle(doc, `5. ${IP_STEPS[4]}`);
    addSubTitle(doc, 'Desain Solusi');
    report.desainRencanaPerbaikan.desainSolusi.forEach(d => addText(doc, `${d.judul}: ${d.deskripsi}`));
    addSubTitle(doc, 'Rencana Detail (5W2H)');
    autoTable(doc, {
        startY: yPos,
        head: [['Activity', 'Why', 'How', 'Where', 'When', 'Who', 'How Much']],
        body: report.desainRencanaPerbaikan.rencanaDetail.map(d => [d.activity, d.why, d.how, d.where, d.when, d.who, d.howMuch]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fontSize: 8, fontStyle: 'bold' }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Step 6: Implementasi
    checkPageBreak(doc, 60);
    addTitle(doc, `6. ${IP_STEPS[5]}`);
    report.implementasiPerbaikan.langkah.forEach(l => {
        addSubTitle(doc, l.judul);
        addText(doc, `Study & Final Design: ${l.studyDanFinalDesign}`);
        addText(doc, `Persiapan Perbaikan: ${l.persiapanPerbaikan}`);
        addText(doc, `Proses Perbaikan: ${l.prosesPerbaikan}`);
        addText(doc, `Trial & Evaluasi: ${l.trialDanEvaluasi}`);
    });

    // Step 7: Evaluasi
    checkPageBreak(doc, 40);
    addTitle(doc, `7. ${IP_STEPS[6]}`);
    addSubTitle(doc, 'Evaluasi QCDSM');
    autoTable(doc, {
        startY: yPos,
        head: [['Aspek', 'Sebelum Perbaikan', 'Sesudah Perbaikan', 'Data']],
        body: report.evaluasi.evaluasiQCDSM.map(e => [e.aspek, e.sebelumPerbaikan, e.sesudahPerbaikan, e.data]),
        theme: 'grid',
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Step 8: Standarisasi
    checkPageBreak(doc, 40);
    addTitle(doc, `8. ${IP_STEPS[7]}`);
    addSubTitle(doc, 'Standarisasi');
    addText(doc, report.standarisasi.deskripsiStandarisasi);
    addSubTitle(doc, 'Horizontal Development');
    addText(doc, report.standarisasi.horizontalDevelopment);

    doc.save(`IP_${report.judul.replace(/\s/g, '_')}.pdf`);
};


// --- IP WORD EXPORT ---
export const exportIPToWord = (report: IPReport) => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>`;
    const footer = "</body></html>";
    
    let content = `
        <h1>${report.judul}</h1>
        
        <h2>1. ${IP_STEPS[0]}</h2>
        <table border="1" style="width:100%; border-collapse: collapse;">
            <thead><tr><th>Tugas</th><th>Mulai</th><th>Selesai</th><th>Durasi (Hari)</th></tr></thead>
            <tbody>
                ${report.jadwalKegiatan.map(t => `<tr><td style="padding: 5px;">${t.task}</td><td style="padding: 5px;">${t.start}</td><td style="padding: 5px;">${t.end}</td><td style="padding: 5px;">${t.duration}</td></tr>`).join('')}
            </tbody>
        </table>
        
        <h2>2. ${IP_STEPS[1]}</h2>
        <h3>Data Penentuan Tema</h3><p>${report.penentuanTema.data}</p>
        <h3>Analisa Situasi</h3><p>${report.penentuanTema.analisaSituasi}</p>
        <h3>Target</h3><p>${report.penentuanTema.target}</p>
        
        <h2>3. ${IP_STEPS[2]}</h2>
        <h3>Analisa Fishbone</h3>
        ${Object.entries(report.analisaMasalah.fishbone).map(([key, value]) => `
            <h4>${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
            <ul>${(value as string[]).map(item => `<li>${item}</li>`).join('')}</ul>
        `).join('')}
        <h3>Verifikasi Akar Masalah</h3>
        <table border="1" style="width:100%; border-collapse: collapse;">
             <thead><tr><th>Kategori</th><th>Root Cause</th><th>Verifikasi</th><th>Validasi</th></tr></thead>
            <tbody>
                ${report.analisaMasalah.verifikasiAkarMasalah.map(v => `<tr><td style="padding: 5px;">${v.kategori}</td><td style="padding: 5px;">${v.rootCause}</td><td style="padding: 5px;">${v.verifikasi}</td><td style="padding: 5px;">${v.validasi}</td></tr>`).join('')}
            </tbody>
        </table>

        <h2>4. ${IP_STEPS[3]}</h2>
        ${report.alternatifSolusi.map(solusi => `
            <h3>${solusi.rootCause}</h3>
            <table border="1" style="width:100%; border-collapse: collapse;">
                <thead><tr><th>Opsi</th><th>Inspirasi Ide</th><th>Analisa (+/-)</th><th>Kesimpulan</th></tr></thead>
                <tbody>
                    ${solusi.opsi.map(o => `<tr><td style="padding: 5px;">${o.nama}</td><td style="padding: 5px;">${o.inspirasiIde}</td><td style="padding: 5px;">${o.analisa}</td><td style="padding: 5px;">${o.kesimpulan}</td></tr>`).join('')}
                </tbody>
            </table>
        `).join('')}
        
        <h2>5. ${IP_STEPS[4]}</h2>
        <h3>Desain Solusi</h3>
        ${report.desainRencanaPerbaikan.desainSolusi.map(d => `<p><b>${d.judul}:</b> ${d.deskripsi}</p>`).join('')}
        <h3>Rencana Detail (5W2H)</h3>
        <table border="1" style="width:100%; border-collapse: collapse;">
             <thead><tr><th>Activity</th><th>Why</th><th>How</th><th>Where</th><th>When</th><th>Who</th><th>How Much</th></tr></thead>
            <tbody>
                ${report.desainRencanaPerbaikan.rencanaDetail.map(d => `<tr><td style="padding: 5px;">${d.activity}</td><td style="padding: 5px;">${d.why}</td><td style="padding: 5px;">${d.how}</td><td style="padding: 5px;">${d.where}</td><td style="padding: 5px;">${d.when}</td><td style="padding: 5px;">${d.who}</td><td style="padding: 5px;">${d.howMuch}</td></tr>`).join('')}
            </tbody>
        </table>

        <h2>6. ${IP_STEPS[5]}</h2>
        ${report.implementasiPerbaikan.langkah.map(l => `
            <h3>${l.judul}</h3>
            <p><b>Study & Final Design:</b> ${l.studyDanFinalDesign}</p>
            <p><b>Persiapan Perbaikan:</b> ${l.persiapanPerbaikan}</p>
            <p><b>Proses Perbaikan:</b> ${l.prosesPerbaikan}</p>
            <p><b>Trial & Evaluasi:</b> ${l.trialDanEvaluasi}</p>
        `).join('')}
        
        <h2>7. ${IP_STEPS[6]}</h2>
        <h3>Evaluasi QCDSM</h3>
         <table border="1" style="width:100%; border-collapse: collapse;">
             <thead><tr><th>Aspek</th><th>Sebelum Perbaikan</th><th>Sesudah Perbaikan</th><th>Data</th></tr></thead>
            <tbody>
                ${report.evaluasi.evaluasiQCDSM.map(e => `<tr><td style="padding: 5px;">${e.aspek}</td><td style="padding: 5px;">${e.sebelumPerbaikan}</td><td style="padding: 5px;">${e.sesudahPerbaikan}</td><td style="padding: 5px;">${e.data}</td></tr>`).join('')}
            </tbody>
        </table>
        
        <h2>8. ${IP_STEPS[7]}</h2>
        <h3>Standarisasi</h3><p>${report.standarisasi.deskripsiStandarisasi}</p>
        <h3>Horizontal Development</h3><p>${report.standarisasi.horizontalDevelopment}</p>
    `;

    const source = header + content + footer;
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(source);
    fileDownload.download = `IP_${report.judul.replace(/\s/g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
};


// --- PPTX EXPORT REFACTORED ---

export const exportToPPTX = async (report: QCCReport) => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9 layout

    const SLIDE_MARGIN = 0.5;
    const SLIDE_WIDTH = pptx.presLayout.width - SLIDE_MARGIN * 2;

    // Title Slide
    let titleSlide = pptx.addSlide();
    titleSlide.background = { color: 'F1F5F9' };
    titleSlide.addText(report.judul, { x: SLIDE_MARGIN, y: 2.5, w: SLIDE_WIDTH, h: 1.5, fontSize: 36, bold: true, align: 'center', color: '0F172A' });
    titleSlide.addText(`Tim: ${report.tim} | Lokasi: ${report.lokasi} | Tanggal: ${report.tanggal}`, { x: SLIDE_MARGIN, y: 4.2, w: SLIDE_WIDTH, h: 0.5, fontSize: 16, align: 'center', color: '475569' });

    const addContentSlide = (title: string, contentFn: (slide: PptxGenJS.Slide) => void | Promise<void>) => {
        const slide = pptx.addSlide();
        slide.addText(title, { x: SLIDE_MARGIN, y: 0.2, w: SLIDE_WIDTH, h: 0.75, fontSize: 24, bold: true, color: '00529B' });
        // Add a separator line below the title
        // Fix: The 'lineColor' and 'lineWidth' properties are incorrect. They should be nested within a 'line' object.
slide.addShape(PptxGenJS.ShapeType.line, { x: SLIDE_MARGIN, y: 0.9, w: SLIDE_WIDTH, h: 0, line: { color: '00529B', width: 1 } });
        return Promise.resolve(contentFn(slide));
    };
    
    const textOptions = { x: SLIDE_MARGIN, y: 1.2, w: SLIDE_WIDTH, h: 5.8, fontSize: 14, autoFit: true };

    await addContentSlide(QCC_STEPS[0], (slide) => {
        slide.addText([
            { text: 'Latar Belakang:', options: { bold: true, fontSize: 16 } },
            { text: `\n${report.langkah1.latarBelakang}\n`, options: { breakLine: true } },
            { text: 'Kondisi Awal:', options: { bold: true, fontSize: 16 } },
            { text: `\n${report.langkah1.kondisiAwal}` }
        ], textOptions);
    });

    await addContentSlide(QCC_STEPS[1], (slide) => {
        const header = [
            { text: 'Metrik', options: { bold: true, color: 'FFFFFF', fill: { color: '00529B' }, align: 'center' as const } }, 
            { text: 'Baseline', options: { bold: true, color: 'FFFFFF', fill: { color: '00529B' }, align: 'center' as const } }, 
            { text: 'Target', options: { bold: true, color: 'FFFFFF', fill: { color: '00529B' }, align: 'center' as const } }
        ];
        const body = report.langkah2.targetKuantitatif.map(t => [
            { text: t.metrik },
            { text: t.baseline },
            { text: t.target },
        ]);
        const tableData = [header, ...body];
        slide.addTable(tableData, { x: 0.5, y: 1.2, w: 9, autoPage: true, rowH: 0.4 });
    });

    await addContentSlide(QCC_STEPS[2], async (slide) => {
         const fishboneImg = await captureElementAsImage('fishbone-diagram-export');
         if(fishboneImg) slide.addImage({ data: fishboneImg, x: SLIDE_MARGIN, y: 1.2, w: 9, h: 5, sizing: { type: 'contain', w: 9, h: 5 } });
    });

    await addContentSlide(QCC_STEPS[3], async (slide) => {
        const ganttImg = await captureElementAsImage('gantt-chart-export');
        if(ganttImg) slide.addImage({ data: ganttImg, x: SLIDE_MARGIN, y: 1.2, w: 9, h: 5, sizing: { type: 'contain', w: 9, h: 5 } });
    });

    await addContentSlide(QCC_STEPS[4], async (slide) => {
        slide.addText(report.langkah5.implementasi, { x:SLIDE_MARGIN, y: 1.2, w:SLIDE_WIDTH, h: 1.5, fontSize:14, autoFit:true});
        
        const beforeImgBase64 = await imageUrlToBase64(report.langkah5.fotoSebelumUrl);
        if (beforeImgBase64) {
          slide.addImage({ data: beforeImgBase64, x: 0.5, y: 3, w: 4.2, h: 3.2, sizing: { type: 'cover', w: 4.2, h: 3.2 } });
        }
        slide.addText('Sebelum', { x: 0.5, y: 6.2, w: 4.2, align: 'center', bold: true});

        const afterImgBase64 = await imageUrlToBase64(report.langkah5.fotoSesudahUrl);
        if (afterImgBase64) {
          slide.addImage({ data: afterImgBase64, x: 5.3, y: 3, w: 4.2, h: 3.2, sizing: { type: 'cover', w: 4.2, h: 3.2 } });
        }
        slide.addText('Sesudah', { x: 5.3, y: 6.2, w: 4.2, align: 'center', bold: true});
    });
    
    await addContentSlide(QCC_STEPS[5], async (slide) => {
        slide.addText(report.langkah6.evaluasi, { x:SLIDE_MARGIN, y: 1.2, w:SLIDE_WIDTH, h: 1.2, fontSize:14, autoFit:true});
        const chartImg = await captureElementAsImage('before-after-chart-export');
        if (chartImg) {
          slide.addImage({ data: chartImg, x: SLIDE_MARGIN, y: 2.5, w: 9, h: 4, sizing: { type: 'contain', w: 9, h: 4 } });
        }
    });
    
    await addContentSlide(QCC_STEPS[6], (slide) => {
         slide.addText([
            { text: 'Standardisasi:', options: { bold: true, fontSize: 16 } },
            ...report.langkah7.standardisasi.flatMap(s => [{text: `\n• ${s.dokumen}: ${s.deskripsi}`}]),
            { text: '\n\nRencana Pencegahan:', options: { bold: true, fontSize: 16, breakLine: true } },
            { text: `\n${report.langkah7.pencegahan}` },
            { text: '\n\nHorizontal Development:', options: { bold: true, fontSize: 16, breakLine: true } },
            { text: `\n${report.langkah7.horizontalDevelopment}` }
        ], textOptions);
    });

    await addContentSlide(QCC_STEPS[7], (slide) => {
        slide.addText(report.langkah8.rencanaBerikutnya, textOptions);
    });

    pptx.writeFile({ fileName: `${report.judul.replace(/\s/g, '_')}.pptx` });
};