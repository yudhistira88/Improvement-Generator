import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnyReport, GeneratorType, ReportGenerationParams } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ganttChartTaskSchema = {
    type: Type.OBJECT,
    properties: {
        task: { type: Type.STRING },
        start: { type: Type.STRING, description: "YYYY-MM-DD" },
        end: { type: Type.STRING, description: "YYYY-MM-DD" },
        duration: { type: Type.INTEGER }
    },
    required: ["task", "start", "end", "duration"]
};


// --- SCHEMAS DEFINITION ---
const qccReportSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['QCC']},
        judul: { type: Type.STRING, description: "Judul tema QCC yang menarik dan jelas." },
        langkah1: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 1: Menetapkan Tema" },
                latarBelakang: { type: Type.STRING, description: "Penjelasan mengapa tema ini penting dan mendesak." },
                kondisiAwal: { type: Type.STRING, description: "Deskripsi situasi atau masalah awal sebelum perbaikan." },
                dataAwal: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.NUMBER },
                            unit: { type: Type.STRING }
                        },
                        required: ["label", "value", "unit"]
                    }
                }
            },
            required: ["judul", "latarBelakang", "kondisiAwal", "dataAwal"]
        },
        langkah2: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 2: Target" },
                targetKuantitatif: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            metrik: { type: Type.STRING },
                            baseline: { type: Type.STRING },
                            target: { type: Type.STRING }
                        },
                         required: ["metrik", "baseline", "target"]
                    }
                },
                targetKualitatif: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["judul", "targetKuantitatif", "targetKualitatif"]
        },
        langkah3: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 3: Analisa Masalah" },
                fishbone: {
                    type: Type.OBJECT,
                    properties: {
                        manusia: { type: Type.ARRAY, items: { type: Type.STRING } },
                        mesin: { type: Type.ARRAY, items: { type: Type.STRING } },
                        metode: { type: Type.ARRAY, items: { type: Type.STRING } },
                        material: { type: Type.ARRAY, items: { type: Type.STRING } },
                        lingkungan: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["manusia", "mesin", "metode", "material", "lingkungan"]
                },
                fiveWhy: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            why: { type: Type.STRING },
                            because: { type: Type.STRING }
                        },
                        required: ["why", "because"]
                    }
                },
                akarMasalah: { type: Type.STRING }
            },
            required: ["judul", "fishbone", "fiveWhy", "akarMasalah"]
        },
        langkah4: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 4: Ide & Rencana Perbaikan" },
                idePerbaikan: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ide: { type: Type.STRING },
                            deskripsi: { type: Type.STRING },
                            penanggungJawab: { type: Type.STRING }
                        },
                        required: ["ide", "deskripsi", "penanggungJawab"]
                    }
                },
                ganttChart: {
                    type: Type.ARRAY,
                    items: ganttChartTaskSchema
                }
            },
            required: ["judul", "idePerbaikan", "ganttChart"]
        },
        langkah5: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 5: Implementasi Rencana Perbaikan" },
                implementasi: { type: Type.STRING, description: "Narasi detail tentang bagaimana perbaikan diimplementasikan." },
            },
            required: ["judul", "implementasi"]
        },
        langkah6: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 6: Evaluasi" },
                evaluasi: { type: Type.STRING, description: "Narasi hasil evaluasi, membandingkan hasil dengan target." },
                dataPerbandingan: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            sebelum: { type: Type.NUMBER },
                            sesudah: { type: Type.NUMBER },
                            unit: { type: Type.STRING }
                        },
                        required: ["name", "sebelum", "sesudah", "unit"]
                    }
                }
            },
            required: ["judul", "evaluasi", "dataPerbandingan"]
        },
        langkah7: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 7: Standardisasi" },
                standardisasi: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            dokumen: { type: Type.STRING, description: "Nama standar baru, misal: SOP, Instruksi Kerja." },
                            deskripsi: { type: Type.STRING }
                        },
                        required: ["dokumen", "deskripsi"]
                    }
                },
                pencegahan: { type: Type.STRING, description: "Rencana untuk mencegah masalah terulang kembali." },
                horizontalDevelopment: { type: Type.STRING, description: "Rencana untuk menerapkan perbaikan ini ke area atau proses lain yang serupa (Horizontal Development)." }
            },
            required: ["judul", "standardisasi", "pencegahan", "horizontalDevelopment"]
        },
        langkah8: {
            type: Type.OBJECT,
            properties: {
                judul: { type: Type.STRING, description: "Judul untuk Langkah 8: Rencana Selanjutnya" },
                rencanaBerikutnya: { type: Type.STRING, description: "Ide atau strategis untuk perbaikan selanjutnya." }
            },
            required: ["judul", "rencanaBerikutnya"]
        }
    },
    required: ["type", "judul", "langkah1", "langkah2", "langkah3", "langkah4", "langkah5", "langkah6", "langkah7", "langkah8"]
};
const ipReportSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['IP']},
        judul: { type: Type.STRING },
        jadwalKegiatan: { type: Type.ARRAY, items: ganttChartTaskSchema },
        penentuanTema: {
            type: Type.OBJECT,
            properties: {
                data: { type: Type.STRING },
                analisaSituasi: { type: Type.STRING },
                target: { type: Type.STRING },
            },
            required: ["data", "analisaSituasi", "target"]
        },
        analisaMasalah: {
            type: Type.OBJECT,
            properties: {
                fishbone: {
                    type: Type.OBJECT,
                    properties: {
                        manusia: { type: Type.ARRAY, items: { type: Type.STRING } },
                        material: { type: Type.ARRAY, items: { type: Type.STRING } },
                        mesin: { type: Type.ARRAY, items: { type: Type.STRING } },
                        metode: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["manusia", "material", "mesin", "metode"]
                },
                verifikasiAkarMasalah: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            kategori: { type: Type.STRING, enum: ['MAN', 'MATERIAL', 'MESIN', 'METODE'] },
                            rootCause: { type: Type.STRING },
                            verifikasi: { type: Type.STRING },
                            validasi: { type: Type.STRING },
                        },
                        required: ["kategori", "rootCause", "verifikasi", "validasi"]
                    }
                },
            },
            required: ["fishbone", "verifikasiAkarMasalah"]
        },
        alternatifSolusi: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    rootCause: { type: Type.STRING },
                    opsi: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                nama: { type: Type.STRING },
                                inspirasiIde: { type: Type.STRING },
                                analisa: { type: Type.STRING },
                                kesimpulan: { type: Type.STRING },
                            },
                            required: ["nama", "inspirasiIde", "analisa", "kesimpulan"]
                        }
                    },
                },
                required: ["rootCause", "opsi"]
            }
        },
        desainRencanaPerbaikan: {
            type: Type.OBJECT,
            properties: {
                desainSolusi: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            judul: { type: Type.STRING },
                            deskripsi: { type: Type.STRING },
                        },
                        required: ["judul", "deskripsi"]
                    }
                },
                rencanaDetail: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            activity: { type: Type.STRING },
                            why: { type: Type.STRING },
                            how: { type: Type.STRING },
                            where: { type: Type.STRING },
                            when: { type: Type.STRING },
                            who: { type: Type.STRING },
                            howMuch: { type: Type.STRING },
                        },
                        required: ["activity", "why", "how", "where", "when", "who", "howMuch"]
                    }
                },
            },
            required: ["desainSolusi", "rencanaDetail"]
        },
        implementasiPerbaikan: {
            type: Type.OBJECT,
            properties: {
                langkah: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            judul: { type: Type.STRING },
                            studyDanFinalDesign: { type: Type.STRING },
                            persiapanPerbaikan: { type: Type.STRING },
                            prosesPerbaikan: { type: Type.STRING },
                            trialDanEvaluasi: { type: Type.STRING },
                        },
                        required: ["judul", "studyDanFinalDesign", "persiapanPerbaikan", "prosesPerbaikan", "trialDanEvaluasi"]
                    }
                },
            },
            required: ["langkah"]
        },
        evaluasi: {
            type: Type.OBJECT,
            properties: {
                fotoSebelumUrl: { type: Type.STRING, description: "URL placeholder dari picsum.photos" },
                fotoSesudahUrl: { type: Type.STRING, description: "URL placeholder dari picsum.photos" },
                evaluasiQCDSM: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            aspek: { type: Type.STRING, enum: ['Q', 'C', 'D', 'S', 'M'] },
                            sebelumPerbaikan: { type: Type.STRING },
                            sesudahPerbaikan: { type: Type.STRING },
                            data: { type: Type.STRING },
                        },
                        required: ["aspek", "sebelumPerbaikan", "sesudahPerbaikan", "data"]
                    }
                },
            },
            required: ["fotoSebelumUrl", "fotoSesudahUrl", "evaluasiQCDSM"]
        },
        standarisasi: {
            type: Type.OBJECT,
            properties: {
                deskripsiStandarisasi: { type: Type.STRING },
                horizontalDevelopment: { type: Type.STRING },
            },
            required: ["deskripsiStandarisasi", "horizontalDevelopment"]
        },
    },
    required: ["type", "judul", "jadwalKegiatan", "penentuanTema", "analisaMasalah", "alternatifSolusi", "desainRencanaPerbaikan", "implementasiPerbaikan", "evaluasi", "standarisasi"]
};

// --- PROMPTS ---
const getQCCPrompt = (params: ReportGenerationParams) => {
    const { theme, additionalData, currentCondition, desiredCondition } = params;
    return `
    Anda adalah seorang konsultan manajemen senior dengan spesialisasi Lean & Six Sigma, bertugas membuat laporan Quality Control Circle (QCC) 8 langkah yang sangat detail, profesional, dan berbasis data.
    
    Informasi Proyek:
    - Tema QCC: "${theme}"
    - Kondisi Saat Ini (Masalah): "${currentCondition || 'Belum dideskripsikan, mohon dianalisis dari tema.'}"
    - Kondisi yang Diinginkan (Target): "${desiredCondition || 'Belum dideskripsikan, mohon formulasikan target yang relevan.'}"
    - Data Tambahan: "${additionalData || 'Tidak ada'}"

    Instruksi Detail per Langkah (WAJIB DIIKUTI):
    1.  **Langkah 1: Menetapkan Tema**: Analisis latar belakang dan kondisi awal dengan data.
    2.  **Langkah 2: Target**: Rumuskan target SMART (kuantitatif dan kualitatif).
    3.  **Langkah 3: Analisa Masalah**: Buat Fishbone Diagram (minimal 2 penyebab per kategori) dan analisis 5 Why yang logis hingga ke akar masalah.
    4.  **Langkah 4: Ide & Rencana Perbaikan**: Hasilkan ide perbaikan konkret dan buat Gantt Chart realistis.
    5.  **Langkah 5: Implementasi**: Narasi detail implementasi. JANGAN menyertakan foto atau URL gambar.
    6.  **Langkah 6: Evaluasi**: Bandingkan hasil dengan target secara kuantitatif.
    7.  **Langkah 7: Standardisasi**: Sebutkan dokumen standar baru, rencana pencegahan, dan rencana pengembangan horizontal.
    8.  **Langkah 8: Rencana Selanjutnya**: Berikan pandangan strategis untuk perbaikan berikutnya.

    Output HARUS berupa satu objek JSON valid tanpa markdown, sesuai skema yang diberikan. Jangan sertakan properti seperti 'tim', 'lokasi', atau 'tanggal'.
    `;
}

const getIPPrompt = (params: ReportGenerationParams) => {
    const { theme, currentCondition, desiredCondition, supportingDataBefore, supportingDataAfter } = params;
    
    return `
    Anda adalah seorang engineer senior yang membuat laporan Individual Project (IP) yang komprehensif, logis, dan terstruktur sesuai template standar perusahaan.
    
    Informasi Proyek:
    - Judul Proyek: "${theme}"
    - Problem Statement / Masalah: "${currentCondition}"
    - Goal Statement / Target: "${desiredCondition}"
    - Data Sebelum Perbaikan: "${supportingDataBefore || 'Tidak ada data spesifik sebelum perbaikan, mohon dianalisis dari konteks masalah.'}"
    - Data Target (Sesudah Perbaikan): "${supportingDataAfter || 'Tidak ada data target spesifik, mohon dianalisis dari goal statement.'}"
    
    Instruksi Detail per Bagian (WAJIB DIIKUTI SECARA URUT):
    1.  **Jadwal Kegiatan**: Buat jadwal kegiatan (Gantt Chart) yang realistis untuk proyek ini dari awal hingga akhir. Durasi adalah jumlah hari.
    2.  **Penentuan Tema**: Jelaskan data yang mendasari pemilihan tema (gunakan info "Data Sebelum Perbaikan" dan "Data Target"), analisa situasi saat ini (berdasarkan Problem Statement), dan rumuskan target yang jelas dan terukur (berdasarkan Goal Statement dan Data Target).
    3.  **Analisa Masalah**: Buat diagram Fishbone dengan kategori MAN, MATERIAL, MESIN, METHODE (minimal 2 penyebab per kategori). Identifikasi beberapa akar masalah (root cause) dari diagram tersebut. Untuk setiap akar masalah yang diidentifikasi, buat entri dalam tabel 'verifikasiAkarMasalah'. Pastikan kolom 'kategori' di tabel ini SAMA PERSIS dengan kategori Fishbone dari mana akar masalah tersebut berasal (e.g., jika penyebab ada di 'MESIN', 'kategori' harus 'MESIN').
    4.  **Alternatif Solusi**: Untuk setiap akar masalah utama, berikan 2 opsi solusi. Jelaskan ide, analisa (+/-), dan kesimpulannya.
    5.  **Desain Rencana Perbaikan**: Buat deskripsi visual/konseptual untuk 2 solusi terpilih. Buat rencana detail 5W2H (What/Activity, Why, How, Where, When, Who, How Much) untuk implementasi solusi.
    6.  **Implementasi Perbaikan**: Deskripsikan langkah-langkah implementasi dalam 4 tahap: Study & Final Design, Persiapan, Proses, dan Trial & Evaluasi. Cukup buat untuk satu "Perbaikan 1".
    7.  **Evaluasi**: Gunakan URL placeholder dari 'https://picsum.photos/400/300?random=1' dan 'https://picsum.photos/400/300?random=2' untuk foto sebelum dan sesudah. Isi tabel evaluasi QCDSM (Quality, Cost, Delivery, Safety, Morale) dengan data perbandingan yang logis.
    8.  **Standarisasi**: Jelaskan dokumen atau metode apa yang distandarisasi dan bagaimana perbaikan ini bisa diterapkan di area lain (Horizontal Development).

    Output HARUS berupa satu objek JSON valid tanpa markdown, sesuai skema yang diberikan. JANGAN membuat properti 'profil'.
    `;
}
    
const generationConfig: Record<GeneratorType, { schema: any; getPrompt: (params: ReportGenerationParams) => string }> = {
    QCC: { schema: qccReportSchema, getPrompt: getQCCPrompt },
    IP: { schema: ipReportSchema, getPrompt: getIPPrompt },
};


export const generateReport = async (
    generatorType: GeneratorType,
    params: ReportGenerationParams
): Promise<AnyReport> => {
    
    const config = generationConfig[generatorType];
    if (!config) {
        throw new Error(`Generator type "${generatorType}" tidak valid.`);
    }

    const prompt = config.getPrompt(params);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: config.schema,
        }
    });

    const text = response.text;
    try {
        const jsonData = JSON.parse(text);
        return jsonData as AnyReport;
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Gagal memproses respons dari AI. Format tidak valid.");
    }
};