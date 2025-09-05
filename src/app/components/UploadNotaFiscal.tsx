'use client'

import { useState } from 'react'

export default function UploadNotaFiscal() {
  const [preview, setPreview] = useState(null)
  const [resultadoOCR, setResultadoOCR] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      // Simulação de leitura OCR (mock)
      setResultadoOCR([
        { item: 'Arroz 5kg', valor: '18.90' },
        { item: 'Feijão 1kg', valor: '6.80' },
        { item: 'Óleo 900ml', valor: '5.20' }
      ])
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white text-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload de Nota Fiscal (Simulado)</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4 w-full border border-gray-300 rounded px-4 py-2"
      />

      {preview && (
        <img
          src={preview}
          alt="Nota Fiscal"
          className="w-full mb-4 rounded border"
        />
      )}

      {resultadoOCR && (
        <div className="bg-gray-100 p-4 rounded-md text-sm">
          <p className="font-medium mb-2">Itens identificados:</p>
          <ul className="list-disc list-inside">
            {resultadoOCR.map((item, i) => (
              <li key={i}>{item.item} — R$ {item.valor}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        onClick={() => console.log(resultadoOCR)}
      >
        Ver dados no console
      </button>
    </div>
  )
}
