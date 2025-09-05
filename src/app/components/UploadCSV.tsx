'use client'

import { useState } from 'react'
import Papa from 'papaparse'

export default function UploadCSV() {
  const [data, setData] = useState([])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsed = results.data.map(row => {
          return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key.trim(),
              String(value)
                .replace('R$', '')
                .replace('%', '')
                .replace(',', '.')
                .trim()
            ])
          )
        })
        setData(parsed)
        console.log(parsed)
      }
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white text-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload de CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 w-full border border-gray-300 rounded px-4 py-2"
      />
      {data.length > 0 && (
        <div className="text-sm text-gray-700">
          {data.length} linhas processadas com sucesso.
        </div>
      )}
      <button
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        onClick={() => console.log(data)}
      >
        Ver dados no console
      </button>
    </div>
  )
}
