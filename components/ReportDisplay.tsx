import React, { useState } from 'react';
import { AnyReport, GeneratorType, IPReport, QCCReport } from '../types';
import { exportToPDF, exportQCCToWord, exportIPToPDF, exportIPToWord } from '../services/exportService';
import { exportIPToPPT, exportQCCToPPT, PresentationStyle } from '../services/pptService';
import PptStyleModal from './PptStyleModal';
import StepCard from './StepCard';
import { QCC_STEPS, IP_STEPS } from '../constants';
import BeforeAfterChart from './charts/BeforeAfterChart';
import GanttChartDisplay from './charts/GanttChartDisplay';
import { PdfIcon, EditIcon, SaveIcon, WordIcon, CameraIcon, PptIcon } from './icons';
import html2canvas from 'html2canvas';

interface ReportDisplayProps {
  report: AnyReport;
  onUpdateReport: (report: AnyReport) => void;
  showNotification: (message: string) => void;
}

const EditableText = ({ value, onChange, isEditing, isTextarea = false, className = '' }) => {
    const commonClasses = "w-full p-2 rounded-md transition-shadow";
    const editClasses = "bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500";
    if (isEditing) {
        return isTextarea ? (
            <textarea value={value} onChange={onChange} className={`${commonClasses} ${editClasses} ${className}`} rows={4} />
        ) : (
            <input type="text" value={value} onChange={onChange} className={`${commonClasses} ${editClasses} ${className}`} />
        );
    }
    return <p className={`text-gray-700 mt-1 ${className}`}>{value}</p>;
};

// FIX: Added explicit types for the Section component props to resolve type inference issues.
interface SectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => (
    <div className={className}>
        <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
        <div className="mt-2 text-gray-700 space-y-2">{children}</div>
    </div>
);

const QCCReportView: React.FC<{report: QCCReport, onUpdateReport: (report: QCCReport) => void}> = ({ report, onUpdateReport }) => {
    const [isLangkah1Editing, setIsLangkah1Editing] = useState(false);
    const [isLangkah2Editing, setIsLangkah2Editing] = useState(false);
    const [isLangkah3Editing, setIsLangkah3Editing] = useState(false);
    const [isLangkah4Editing, setIsLangkah4Editing] = useState(false);
    const [isLangkah5Editing, setIsLangkah5Editing] = useState(false);
    const [isLangkah6Editing, setIsLangkah6Editing] = useState(false);
    const [isLangkah7Editing, setIsLangkah7Editing] = useState(false);
    const [isLangkah8Editing, setIsLangkah8Editing] = useState(false);
    
    const commonInputClass = "w-full p-1 bg-gray-50 border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200";

    const handleScreenshot = (elementId: string, filename: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${filename}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const handleFieldChange = (path: (string|number)[], value: any) => {
        const newReport = JSON.parse(JSON.stringify(report));
        let current = newReport;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        onUpdateReport(newReport);
    };
    
    const ActionButtons = ({ onEdit, isEditing, screenshotId, screenshotName }) => (
        <>
            <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-gray-200 transition text-gray-500" title={isEditing ? "Simpan" : "Ubah"}>
                {isEditing ? <SaveIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5"/>}
            </button>
            <button onClick={() => handleScreenshot(screenshotId, screenshotName)} className="p-1.5 rounded-md hover:bg-gray-200 transition text-gray-500" title="Screenshot Bagian Ini">
                <CameraIcon className="w-5 h-5"/>
            </button>
        </>
    );
    
    return (
        <>
            <StepCard title={QCC_STEPS[0]} actions={<ActionButtons onEdit={() => setIsLangkah1Editing(!isLangkah1Editing)} isEditing={isLangkah1Editing} screenshotId="qcc-step1-export" screenshotName="Langkah1_Tema" />}>
              <div id="qcc-step1-export" className="p-2 bg-white">
                <h4 className="font-semibold text-lg text-gray-800">Latar Belakang</h4>
                <EditableText value={report.langkah1.latarBelakang} onChange={e => handleFieldChange(['langkah1', 'latarBelakang'], e.target.value)} isEditing={isLangkah1Editing} isTextarea />
                <h4 className="font-semibold text-lg text-gray-800 mt-4">Kondisi Awal</h4>
                <EditableText value={report.langkah1.kondisiAwal} onChange={e => handleFieldChange(['langkah1', 'kondisiAwal'], e.target.value)} isEditing={isLangkah1Editing} isTextarea />
              </div>
            </StepCard>

            <StepCard title={QCC_STEPS[1]} actions={<ActionButtons onEdit={() => setIsLangkah2Editing(!isLangkah2Editing)} isEditing={isLangkah2Editing} screenshotId="qcc-step2-export" screenshotName="Langkah2_Target" />}>
              <div id="qcc-step2-export" className="p-2 bg-white">
                <h4 className="font-semibold text-lg text-gray-800">Target Kuantitatif</h4>
                <table className="mt-2 w-full text-left">
                    <thead className="border-b border-gray-200"><tr className="text-sm text-gray-600 uppercase"><th className="p-2 font-semibold">Metrik</th><th className="p-2 font-semibold">Baseline</th><th className="p-2 font-semibold">Target</th></tr></thead>
                    <tbody>
                        {report.langkah2.targetKuantitatif.map((t, i) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="p-2">{isLangkah2Editing ? <input value={t.metrik} onChange={e => handleFieldChange(['langkah2', 'targetKuantitatif', i, 'metrik'], e.target.value)} className={commonInputClass}/> : t.metrik}</td>
                                <td className="p-2">{isLangkah2Editing ? <input value={t.baseline} onChange={e => handleFieldChange(['langkah2', 'targetKuantitatif', i, 'baseline'], e.target.value)} className={commonInputClass}/> : t.baseline}</td>
                                <td className="p-2">{isLangkah2Editing ? <input value={t.target} onChange={e => handleFieldChange(['langkah2', 'targetKuantitatif', i, 'target'], e.target.value)} className={commonInputClass}/> : t.target}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h4 className="font-semibold text-lg text-gray-800 mt-4">Target Kualitatif</h4>
                <ul className="list-disc list-inside text-gray-700 mt-1">
                    {report.langkah2.targetKualitatif.map((t, i) => <li key={i}>{isLangkah2Editing ? <input value={t} onChange={e => handleFieldChange(['langkah2', 'targetKualitatif', i], e.target.value)} className={commonInputClass}/> : t}</li>)}
                </ul>
              </div>
            </StepCard>
            
            <StepCard title={QCC_STEPS[2]} actions={<ActionButtons onEdit={() => setIsLangkah3Editing(!isLangkah3Editing)} isEditing={isLangkah3Editing} screenshotId="qcc-step3-export" screenshotName="Langkah3_Analisa" />}>
                <div id="qcc-step3-export" className="p-2 bg-white">
                    <h4 className="font-semibold text-lg text-gray-800">Analisa Fishbone</h4>
                     <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left text-sm border">
                            <thead className="border-b bg-gray-50"><tr className="text-gray-600 uppercase">
                                <th className="p-2 font-semibold border-r">Kategori</th><th className="p-2 font-semibold">Potensi Penyebab</th>
                            </tr></thead>
                            <tbody>
                                {Object.entries(report.langkah3.fishbone).map(([category, causes]) => (
                                    (causes as string[]).length > 0 && <tr key={category} className="border-b">
                                        <td className="p-2 font-medium capitalize align-top border-r w-1/4">{category}</td>
                                        <td className="p-2">
                                            <ul className="list-disc list-inside space-y-1">
                                                {(causes as string[]).map((cause, index) => (
                                                    <li key={index}>
                                                        {isLangkah3Editing ? <input type="text" value={cause} onChange={e => handleFieldChange(['langkah3', 'fishbone', category, index], e.target.value)} className={`${commonInputClass} w-full`} /> : cause}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <h4 className="font-semibold text-lg text-gray-800 mt-6">Analisis 5 Why</h4>
                    <div className="space-y-2 mt-2">
                        {report.langkah3.fiveWhy.map((w,i) => (<div key={i} className="p-3 border-l-4 border-indigo-500 bg-indigo-50">
                            <p><strong>Why:</strong> {isLangkah3Editing ? <input value={w.why} onChange={e => handleFieldChange(['langkah3', 'fiveWhy', i, 'why'], e.target.value)} className={`${commonInputClass} bg-white`} /> : w.why}</p>
                            <p><strong>Because:</strong> {isLangkah3Editing ? <input value={w.because} onChange={e => handleFieldChange(['langkah3', 'fiveWhy', i, 'because'], e.target.value)} className={`${commonInputClass} bg-white`} /> : w.because}</p>
                        </div>))}
                    </div>
                    <h4 className="font-semibold text-lg text-gray-800 mt-4">Akar Permasalahan</h4>
                    <EditableText value={report.langkah3.akarMasalah} onChange={e => handleFieldChange(['langkah3', 'akarMasalah'], e.target.value)} isEditing={isLangkah3Editing} className="font-medium mt-1 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md"/>
                </div>
            </StepCard>
            
            <StepCard title={QCC_STEPS[3]} actions={<ActionButtons onEdit={() => setIsLangkah4Editing(!isLangkah4Editing)} isEditing={isLangkah4Editing} screenshotId="qcc-step4-export" screenshotName="Langkah4_Rencana" />}>
              <div id="qcc-step4-export" className="p-2 bg-white">
                <h4 className="font-semibold text-lg text-gray-800">Ide & Rencana Perbaikan</h4>
                <table className="mt-2 w-full text-left">
                    <thead className="border-b border-gray-200"><tr className="text-sm text-gray-600 uppercase"><th className="p-2 font-semibold">Ide</th><th className="p-2 font-semibold">Deskripsi</th><th className="p-2 font-semibold">PJ</th></tr></thead>
                    <tbody>{report.langkah4.idePerbaikan.map((idea, i) => (<tr key={i} className="border-b border-gray-100">
                        <td className="p-2">{isLangkah4Editing ? <input value={idea.ide} onChange={e => handleFieldChange(['langkah4', 'idePerbaikan', i, 'ide'], e.target.value)} className={commonInputClass}/> : idea.ide}</td>
                        <td className="p-2">{isLangkah4Editing ? <input value={idea.deskripsi} onChange={e => handleFieldChange(['langkah4', 'idePerbaikan', i, 'deskripsi'], e.target.value)} className={commonInputClass}/> : idea.deskripsi}</td>
                        <td className="p-2">{isLangkah4Editing ? <input value={idea.penanggungJawab} onChange={e => handleFieldChange(['langkah4', 'idePerbaikan', i, 'penanggungJawab'], e.target.value)} className={commonInputClass}/> : idea.penanggungJawab}</td>
                    </tr>))}</tbody>
                </table>
                <h4 className="font-semibold text-lg text-gray-800 mt-4">Gantt Chart Rencana</h4>
                <div id="gantt-chart-export" className="mt-2 p-2 rounded-lg"><GanttChartDisplay data={report.langkah4.ganttChart} /></div>
              </div>
            </StepCard>

            <StepCard title={QCC_STEPS[4]} actions={<ActionButtons onEdit={() => setIsLangkah5Editing(!isLangkah5Editing)} isEditing={isLangkah5Editing} screenshotId="qcc-step5-export" screenshotName="Langkah5_Implementasi" />}>
                <div id="qcc-step5-export" className="p-2 bg-white">
                  <EditableText value={report.langkah5.implementasi} onChange={e => handleFieldChange(['langkah5', 'implementasi'], e.target.value)} isEditing={isLangkah5Editing} isTextarea />
                </div>
            </StepCard>

            <StepCard title={QCC_STEPS[5]} actions={<ActionButtons onEdit={() => setIsLangkah6Editing(!isLangkah6Editing)} isEditing={isLangkah6Editing} screenshotId="qcc-step6-export" screenshotName="Langkah6_Evaluasi" />}>
              <div id="qcc-step6-export" className="p-2 bg-white">
                <EditableText value={report.langkah6.evaluasi} onChange={e => handleFieldChange(['langkah6', 'evaluasi'], e.target.value)} isEditing={isLangkah6Editing} isTextarea />
                <div id="before-after-chart-export" className="mt-4 w-full h-80 bg-gray-50 p-4 rounded-lg"><BeforeAfterChart data={report.langkah6.dataPerbandingan} /></div>
              </div>
            </StepCard>

            <StepCard title={QCC_STEPS[6]} actions={<ActionButtons onEdit={() => setIsLangkah7Editing(!isLangkah7Editing)} isEditing={isLangkah7Editing} screenshotId="qcc-step7-export" screenshotName="Langkah7_Standardisasi" />}>
              <div id="qcc-step7-export" className="p-2 bg-white">
                <h4 className="font-semibold text-lg text-gray-800">Standardisasi</h4>
                <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                    {report.langkah7.standardisasi.map((s,i) => (<li key={i}>
                        <strong>{isLangkah7Editing ? <input value={s.dokumen} onChange={e => handleFieldChange(['langkah7', 'standardisasi', i, 'dokumen'], e.target.value)} className={commonInputClass}/> : `${s.dokumen}:`}</strong> 
                        {isLangkah7Editing ? <input value={s.deskripsi} onChange={e => handleFieldChange(['langkah7', 'standardisasi', i, 'deskripsi'], e.target.value)} className={commonInputClass}/> : ` ${s.deskripsi}`}
                    </li>))}
                </ul>
                <h4 className="font-semibold text-lg text-gray-800 mt-4">Rencana Pencegahan</h4>
                <EditableText value={report.langkah7.pencegahan} onChange={e => handleFieldChange(['langkah7', 'pencegahan'], e.target.value)} isEditing={isLangkah7Editing} isTextarea />
                <h4 className="font-semibold text-lg text-gray-800 mt-4">Horizontal Development</h4>
                <EditableText value={report.langkah7.horizontalDevelopment} onChange={e => handleFieldChange(['langkah7', 'horizontalDevelopment'], e.target.value)} isEditing={isLangkah7Editing} isTextarea />
              </div>
            </StepCard>

            <StepCard title={QCC_STEPS[7]} actions={<ActionButtons onEdit={() => setIsLangkah8Editing(!isLangkah8Editing)} isEditing={isLangkah8Editing} screenshotId="qcc-step8-export" screenshotName="Langkah8_Berikutnya" />}>
                <div id="qcc-step8-export" className="p-2 bg-white">
                  <EditableText value={report.langkah8.rencanaBerikutnya} onChange={e => handleFieldChange(['langkah8', 'rencanaBerikutnya'], e.target.value)} isEditing={isLangkah8Editing} isTextarea />
                </div>
            </StepCard>
        </>
    );
};

const IPReportView: React.FC<{report: IPReport, onUpdateReport: (report: IPReport) => void}> = ({ report, onUpdateReport }) => {
    const [isScheduleEditing, setIsScheduleEditing] = useState(false);
    const [isAnalysisEditing, setIsAnalysisEditing] = useState(false);
    const [isThemeEditing, setIsThemeEditing] = useState(false);
    const [isSolutionEditing, setIsSolutionEditing] = useState(false);
    const [isDesignEditing, setIsDesignEditing] = useState(false);
    const [isImplementationEditing, setIsImplementationEditing] = useState(false);
    const [isEvaluationEditing, setIsEvaluationEditing] = useState(false);
    const [isStandardizationEditing, setIsStandardizationEditing] = useState(false);


    const handleScreenshot = (elementId: string, filename: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${filename}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const deepCloneAndUpdate = (updateLogic: (draft: IPReport) => void) => {
        const newReport = JSON.parse(JSON.stringify(report));
        updateLogic(newReport);
        onUpdateReport(newReport);
    };

    const handleFieldChange = (path: (string|number)[], value: any) => {
        deepCloneAndUpdate(draft => {
            let current = draft;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
        });
    };

    const ActionButtons = ({ onEdit, isEditing, screenshotId, screenshotName }) => (
        <>
            <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-gray-200 transition text-gray-500" title={isEditing ? "Simpan" : "Ubah"}>
                {isEditing ? <SaveIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5"/>}
            </button>
            <button onClick={() => handleScreenshot(screenshotId, screenshotName)} className="p-1.5 rounded-md hover:bg-gray-200 transition text-gray-500" title="Screenshot Bagian Ini">
                <CameraIcon className="w-5 h-5"/>
            </button>
        </>
    );
    
    return (
        <>
            <StepCard 
                title={IP_STEPS[0]}
                actions={<ActionButtons onEdit={() => setIsScheduleEditing(!isScheduleEditing)} isEditing={isScheduleEditing} screenshotId="ip-gantt-chart-export" screenshotName="Jadwal_Kegiatan"/>}
            >
                <div id="ip-gantt-chart-export">
                    <GanttChartDisplay data={report.jadwalKegiatan} isEditing={isScheduleEditing} onTaskChange={(index, field, value) => handleFieldChange(['jadwalKegiatan', index, field], value)} />
                </div>
            </StepCard>

            <StepCard 
                title={IP_STEPS[1]}
                actions={<ActionButtons onEdit={() => setIsThemeEditing(!isThemeEditing)} isEditing={isThemeEditing} screenshotId="ip-theme-export" screenshotName="Tema_Target"/>}
            >
                <div id="ip-theme-export" className="p-2 bg-white space-y-4">
                    <Section title="Data Penentuan Tema">
                         <EditableText value={report.penentuanTema.data} onChange={e => handleFieldChange(['penentuanTema', 'data'], e.target.value)} isEditing={isThemeEditing} isTextarea />
                    </Section>
                    <Section title="Analisa Situasi">
                        <EditableText value={report.penentuanTema.analisaSituasi} onChange={e => handleFieldChange(['penentuanTema', 'analisaSituasi'], e.target.value)} isEditing={isThemeEditing} isTextarea />
                    </Section>
                    <Section title="Target">
                        <EditableText value={report.penentuanTema.target} onChange={e => handleFieldChange(['penentuanTema', 'target'], e.target.value)} isEditing={isThemeEditing} isTextarea />
                    </Section>
                </div>
            </StepCard>

            <StepCard 
                title={IP_STEPS[2]}
                actions={<ActionButtons onEdit={() => setIsAnalysisEditing(!isAnalysisEditing)} isEditing={isAnalysisEditing} screenshotId="ip-analysis-export" screenshotName="Analisa_Masalah"/>}
            >
                 <div id="ip-analysis-export" className="p-2 bg-white">
                    <h4 className="font-semibold text-lg text-gray-800">Analisa Fishbone</h4>
                    {Object.entries(report.analisaMasalah.fishbone).map(([category, causes]) => (
                        <div key={category} className="mt-2">
                            <h5 className="font-semibold text-gray-700 capitalize">{category}</h5>
                            <ul className="list-disc list-inside ml-4 text-gray-600">
                                {(causes as string[]).map((cause, index) => (
                                    <li key={index}>
                                    {isAnalysisEditing ? (
                                        <input 
                                            type="text" 
                                            value={cause}
                                            onChange={(e) => handleFieldChange(['analisaMasalah', 'fishbone', category, index], e.target.value)}
                                            className="w-full p-1 bg-gray-50 border border-gray-300 rounded"
                                        />
                                    ) : ( cause )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <Section title="Verifikasi Akar Masalah" className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-gray-50"><tr className="text-gray-600 uppercase">
                                    <th className="p-2 font-semibold">Kategori</th><th className="p-2 font-semibold">Root Cause</th><th className="p-2 font-semibold">Verifikasi</th><th className="p-2 font-semibold">Validasi</th>
                                </tr></thead>
                                <tbody>{report.analisaMasalah.verifikasiAkarMasalah.map((item, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2">{item.kategori}</td>
                                        <td className="p-2"><EditableText value={item.rootCause} onChange={e => handleFieldChange(['analisaMasalah', 'verifikasiAkarMasalah', i, 'rootCause'], e.target.value)} isEditing={isAnalysisEditing} /></td>
                                        <td className="p-2"><EditableText value={item.verifikasi} onChange={e => handleFieldChange(['analisaMasalah', 'verifikasiAkarMasalah', i, 'verifikasi'], e.target.value)} isEditing={isAnalysisEditing} /></td>
                                        <td className="p-2"><EditableText value={item.validasi} onChange={e => handleFieldChange(['analisaMasalah', 'verifikasiAkarMasalah', i, 'validasi'], e.target.value)} isEditing={isAnalysisEditing} /></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </Section>
                 </div>
            </StepCard>

            <StepCard 
                title={IP_STEPS[3]}
                actions={<ActionButtons onEdit={() => setIsSolutionEditing(!isSolutionEditing)} isEditing={isSolutionEditing} screenshotId="ip-solution-export" screenshotName="Alternatif_Solusi"/>}
            >
                <div id="ip-solution-export" className="p-2 bg-white">
                    {report.alternatifSolusi.map((solusi, i) => (
                        <div key={i} className="mb-6 last:mb-0 p-4 border rounded-lg">
                            <h4 className="font-semibold text-lg text-gray-800"><EditableText value={solusi.rootCause} onChange={e => handleFieldChange(['alternatifSolusi', i, 'rootCause'], e.target.value)} isEditing={isSolutionEditing} /></h4>
                            <div className="overflow-x-auto mt-2">
                                 <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-gray-50"><tr className="text-gray-600 uppercase">
                                        <th className="p-2 font-semibold">Opsi</th><th className="p-2 font-semibold">Inspirasi Ide</th><th className="p-2 font-semibold">Analisa (+/-)</th><th className="p-2 font-semibold">Kesimpulan</th>
                                    </tr></thead>
                                    <tbody>{solusi.opsi.map((opsi, j) => (
                                        <tr key={j} className="border-b">
                                            <td className="p-2"><EditableText value={opsi.nama} onChange={e => handleFieldChange(['alternatifSolusi', i, 'opsi', j, 'nama'], e.target.value)} isEditing={isSolutionEditing}/></td>
                                            <td className="p-2"><EditableText value={opsi.inspirasiIde} onChange={e => handleFieldChange(['alternatifSolusi', i, 'opsi', j, 'inspirasiIde'], e.target.value)} isEditing={isSolutionEditing}/></td>
                                            <td className="p-2"><EditableText value={opsi.analisa} onChange={e => handleFieldChange(['alternatifSolusi', i, 'opsi', j, 'analisa'], e.target.value)} isEditing={isSolutionEditing} isTextarea/></td>
                                            <td className="p-2"><EditableText value={opsi.kesimpulan} onChange={e => handleFieldChange(['alternatifSolusi', i, 'opsi', j, 'kesimpulan'], e.target.value)} isEditing={isSolutionEditing}/></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </StepCard>

            <StepCard 
                title={IP_STEPS[4]}
                actions={<ActionButtons onEdit={() => setIsDesignEditing(!isDesignEditing)} isEditing={isDesignEditing} screenshotId="ip-design-export" screenshotName="Desain_Perbaikan"/>}
            >
                <div id="ip-design-export" className="p-2 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {report.desainRencanaPerbaikan.desainSolusi.map((desain, i) => (
                            <div key={i} className="p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-semibold text-center"><EditableText value={desain.judul} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'desainSolusi', i, 'judul'], e.target.value)} isEditing={isDesignEditing} /></h4>
                                <EditableText value={desain.deskripsi} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'desainSolusi', i, 'deskripsi'], e.target.value)} isEditing={isDesignEditing} isTextarea className="text-sm mt-2 text-center"/>
                            </div>
                        ))}
                    </div>
                     <Section title="Rencana Detail (5W2H)" className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-gray-50"><tr className="text-gray-600 uppercase">
                                    {[ 'Activity', 'Why', 'How', 'Where', 'When', 'Who', 'How Much' ].map(h => <th key={h} className="p-2 font-semibold">{h}</th>)}
                                </tr></thead>
                                <tbody>{report.desainRencanaPerbaikan.rencanaDetail.map((item, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2"><EditableText value={item.activity} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'activity'], e.target.value)} isEditing={isDesignEditing}/></td>
                                        <td className="p-2"><EditableText value={item.why} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'why'], e.target.value)} isEditing={isDesignEditing}/></td>
                                        <td className="p-2"><EditableText value={item.how} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'how'], e.target.value)} isEditing={isDesignEditing}/></td>
                                        <td className="p-2"><EditableText value={item.where} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'where'], e.target.value)} isEditing={isDesignEditing}/></td>
                                        <td className="p-2"><EditableText value={item.when} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'when'], e.target.value)} isEditing={isDesignEditing}/></td>
                                        <td className="p-2"><EditableText value={item.who} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'who'], e.target.value)} isEditing={isDesignEditing}/></td>
                                        <td className="p-2"><EditableText value={item.howMuch} onChange={e => handleFieldChange(['desainRencanaPerbaikan', 'rencanaDetail', i, 'howMuch'], e.target.value)} isEditing={isDesignEditing}/></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                     </Section>
                </div>
            </StepCard>
            
            <StepCard 
                title={IP_STEPS[5]}
                actions={<ActionButtons onEdit={() => setIsImplementationEditing(!isImplementationEditing)} isEditing={isImplementationEditing} screenshotId="ip-implementation-export" screenshotName="Implementasi"/>}
            >
                <div id="ip-implementation-export" className="p-2 bg-white">
                    {report.implementasiPerbaikan.langkah.map((langkah, i) => (
                        <div key={i}>
                            <h3 className="text-xl font-bold text-center text-gray-800 mb-4"><EditableText value={langkah.judul} onChange={e => handleFieldChange(['implementasiPerbaikan', 'langkah', i, 'judul'], e.target.value)} isEditing={isImplementationEditing}/></h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg bg-indigo-50"><h4 className="font-semibold text-indigo-800">Study & Final Design</h4><EditableText value={langkah.studyDanFinalDesign} onChange={e => handleFieldChange(['implementasiPerbaikan', 'langkah', i, 'studyDanFinalDesign'], e.target.value)} isEditing={isImplementationEditing} isTextarea className="text-sm"/></div>
                                <div className="p-4 border rounded-lg bg-sky-50"><h4 className="font-semibold text-sky-800">Persiapan Perbaikan</h4><EditableText value={langkah.persiapanPerbaikan} onChange={e => handleFieldChange(['implementasiPerbaikan', 'langkah', i, 'persiapanPerbaikan'], e.target.value)} isEditing={isImplementationEditing} isTextarea className="text-sm"/></div>
                                <div className="p-4 border rounded-lg bg-emerald-50"><h4 className="font-semibold text-emerald-800">Proses Perbaikan</h4><EditableText value={langkah.prosesPerbaikan} onChange={e => handleFieldChange(['implementasiPerbaikan', 'langkah', i, 'prosesPerbaikan'], e.target.value)} isEditing={isImplementationEditing} isTextarea className="text-sm"/></div>
                                <div className="p-4 border rounded-lg bg-amber-50"><h4 className="font-semibold text-amber-800">Trial & Evaluation</h4><EditableText value={langkah.trialDanEvaluasi} onChange={e => handleFieldChange(['implementasiPerbaikan', 'langkah', i, 'trialDanEvaluasi'], e.target.value)} isEditing={isImplementationEditing} isTextarea className="text-sm"/></div>
                            </div>
                        </div>
                    ))}
                </div>
            </StepCard>

            <StepCard 
                title={IP_STEPS[6]}
                actions={<ActionButtons onEdit={() => setIsEvaluationEditing(!isEvaluationEditing)} isEditing={isEvaluationEditing} screenshotId="ip-evaluation-export" screenshotName="Evaluasi"/>}
            >
                <div id="ip-evaluation-export" className="p-2 bg-white">
                    <Section title="Evaluasi QCDSM" className="mt-2">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-gray-50"><tr className="text-gray-600 uppercase">
                                    <th className="p-2 font-semibold">Aspek</th><th className="p-2 font-semibold">Sebelum Perbaikan</th><th className="p-2 font-semibold">Sesudah Perbaikan</th><th className="p-2 font-semibold">Data</th>
                                </tr></thead>
                                <tbody>{report.evaluasi.evaluasiQCDSM.map((item, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2 font-bold">{item.aspek}</td>
                                        <td className="p-2"><EditableText value={item.sebelumPerbaikan} onChange={e => handleFieldChange(['evaluasi', 'evaluasiQCDSM', i, 'sebelumPerbaikan'], e.target.value)} isEditing={isEvaluationEditing}/></td>
                                        <td className="p-2"><EditableText value={item.sesudahPerbaikan} onChange={e => handleFieldChange(['evaluasi', 'evaluasiQCDSM', i, 'sesudahPerbaikan'], e.target.value)} isEditing={isEvaluationEditing}/></td>
                                        <td className="p-2"><EditableText value={item.data} onChange={e => handleFieldChange(['evaluasi', 'evaluasiQCDSM', i, 'data'], e.target.value)} isEditing={isEvaluationEditing}/></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </Section>
                </div>
            </StepCard>

            <StepCard 
                title={IP_STEPS[7]}
                actions={<ActionButtons onEdit={() => setIsStandardizationEditing(!isStandardizationEditing)} isEditing={isStandardizationEditing} screenshotId="ip-standardization-export" screenshotName="Standarisasi"/>}
            >
                 <div id="ip-standardization-export" className="p-2 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg"><h4 className="font-semibold text-center">Standarisasi</h4><EditableText value={report.standarisasi.deskripsiStandarisasi} onChange={e => handleFieldChange(['standarisasi', 'deskripsiStandarisasi'], e.target.value)} isEditing={isStandardizationEditing} isTextarea className="text-sm mt-2"/></div>
                    <div className="p-4 border rounded-lg"><h4 className="font-semibold text-center">Horizontal Development</h4><EditableText value={report.standarisasi.horizontalDevelopment} onChange={e => handleFieldChange(['standarisasi', 'horizontalDevelopment'], e.target.value)} isEditing={isStandardizationEditing} isTextarea className="text-sm mt-2"/></div>
                </div>
            </StepCard>
        </>
    );
};


const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onUpdateReport, showNotification }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isPptModalOpen, setIsPptModalOpen] = useState(false);

  const isQCC = report.type === 'QCC';

  const handleExportPDF = async () => {
    setIsExporting(true);
    if (report.type === 'QCC') {
        await exportToPDF(report as QCCReport);
    } else if (report.type === 'IP') {
        await exportIPToPDF(report as IPReport);
    }
    setIsExporting(false);
  };

  const handleExportIPWord = async () => {
    if (report.type !== 'IP') return;
    setIsExporting(true);
    exportIPToWord(report as IPReport);
    setIsExporting(false);
  };
  
  const handleExportQCCWord = async () => {
    if (report.type !== 'QCC') return;
    setIsExporting(true);
    exportQCCToWord(report as QCCReport);
    setIsExporting(false);
  };

  const handleGeneratePPT = async (style: PresentationStyle) => {
    setIsPptModalOpen(false);
    setIsExporting(true);
    try {
        if (report.type === 'IP') {
            await exportIPToPPT(report as IPReport, style);
        } else if (report.type === 'QCC') {
            await exportQCCToPPT(report as QCCReport, style);
        }
        showNotification("Presentasi berhasil dibuat!");
    } catch (error) {
        console.error("Gagal membuat presentasi:", error);
        showNotification("Gagal membuat presentasi. Cek konsol untuk detail.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
      const newReport = { ...report, judul: newTitle };
      onUpdateReport(newReport);
  }

  const renderReportBody = () => {
    switch(report.type) {
        case 'QCC':
            return <QCCReportView report={report as QCCReport} onUpdateReport={onUpdateReport as (r: QCCReport) => void} />;
        case 'IP':
            return <IPReportView report={report as IPReport} onUpdateReport={onUpdateReport as (r: IPReport) => void} />;
        default:
            return null;
    }
  }

  return (
    <div id="report-container" className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-4">
            {isTitleEditing ? (
                <input type="text" value={report.judul} onChange={e => handleTitleChange(e.target.value)} className="text-3xl font-bold text-gray-900 w-full p-2 border border-indigo-300 rounded-md bg-indigo-50" />
            ) : (
                <h2 className="text-3xl font-bold text-gray-900">{report.judul}</h2>
            )}
            <button onClick={() => setIsTitleEditing(!isTitleEditing)} className="p-1.5 rounded-md hover:bg-gray-200 transition text-gray-500 flex-shrink-0" title={isTitleEditing ? "Simpan Judul" : "Ubah Judul"}>
                {isTitleEditing ? <SaveIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5"/>}
            </button>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 font-semibold rounded-lg hover:bg-red-100 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
            title="Unduh Laporan PDF"
          >
            <PdfIcon className="w-5 h-5"/>
            {isExporting ? 'Mengekspor...' : 'Unduh PDF'}
          </button>
          
          <button 
            onClick={() => setIsPptModalOpen(true)}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-200 text-green-700 bg-green-50 font-semibold rounded-xl hover:bg-green-100 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
            title="Buat Presentasi PPT"
          >
            <PptIcon className="w-5 h-5"/>
            {isExporting ? 'Mengekspor...' : 'Buat PPT'}
          </button>

          {report.type === 'IP' ? (
            <button 
                onClick={handleExportIPWord}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 font-semibold rounded-lg hover:bg-blue-100 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
            >
                <WordIcon className="w-5 h-5" />
                {isExporting ? 'Mengekspor...' : 'Unduh Word'}
            </button>
          ) : ( // isQCC
            <button 
                onClick={handleExportQCCWord}
                disabled={isExporting} 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 font-semibold rounded-lg hover:bg-blue-100 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
            >
                <WordIcon className="w-5 h-5" />
                {isExporting ? 'Mengekspor...' : 'Unduh Word'}
            </button>
          )}
        </div>
      </div>
      
      {renderReportBody()}

      {isPptModalOpen && (
        <PptStyleModal
            onClose={() => setIsPptModalOpen(false)}
            onGenerate={handleGeneratePPT}
        />
      )}

    </div>
  );
};

export default ReportDisplay;