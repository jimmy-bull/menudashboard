// NOUVEAU FRONT-END POUR L'UPLOAD ET L'AFFICHAGE DES PDFS DE LA SEMAINE
import React, { useState, useEffect, ChangeEvent } from "react";
import { Loader, Upload, Trash } from "lucide-react";

interface WeekPdf {
  id: number;
  pdf_path: string;
}

export default function WeeklyMenuSection() {
  const [pdfs, setPdfs] = useState<WeekPdf[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Remplacez par votre base_uri si besoin
  const base_uri = process.env.NEXT_PUBLIC_BASE_URI || "";

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${base_uri}/api/week_pdfs`);
      const data = await res.json();
      setPdfs(data);
    } catch (e) {
      setPdfs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload réel sur Cloudinary et retourne l'URL sécurisée
  const uploadToCloudflare = async (file: File): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/dcjfeebzi/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "iwafolder");

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; // L'URL Cloudinary réelle du PDF
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      // 1. Upload vers Cloudflare (ou autre)
      const pdf_path = await uploadToCloudflare(selectedFile);
      // 2. Enregistrer le chemin dans la BDD via l'API Laravel
      const res = await fetch(`${base_uri}/api/add_week_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_path }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.errors?.pdf_path?.[0] || "Erreur d'upload");
      }
      setSelectedFile(null);
      fetchPdfs();
    } catch (e: any) {
      setUploadError(e.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Suppression d'un PDF (optionnel, nécessite une route backend)
  // const handleDelete = async (id: number) => {
  //   // À implémenter côté backend si besoin
  // };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">PDF du menu de la semaine</h1>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Uploader un PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isUploading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {isUploading ? "Upload en cours..." : "Uploader"}
        </button>
        {uploadError && <div className="text-red-600 mt-2">{uploadError}</div>}
      </div>
      <hr className="my-6" />
      <h2 className="text-lg font-semibold mb-2">PDFs existants</h2>
      {isLoading ? (
        <div className="flex items-center"><Loader className="h-4 w-4 animate-spin mr-2" /> Chargement...</div>
      ) : pdfs.length === 0 ? (
        <div className="text-gray-500">Aucun PDF disponible.</div>
      ) : (
        <ul className="space-y-2">
          {pdfs.map((pdf) => (
            <li key={pdf.id} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded">
              <a href={pdf.pdf_path} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {pdf.pdf_path.split("/").pop()}
              </a>
              {/* <button onClick={() => handleDelete(pdf.id)} className="text-red-600 hover:text-red-800"><Trash className="h-4 w-4" /></button> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
