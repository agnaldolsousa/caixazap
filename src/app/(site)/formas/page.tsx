'use client'
import { useEffect, useState } from 'react'

export default function FormasPage() {
  const [formas, setFormas] = useState([])

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/formas_recebimento')
      const data = await res.json()
      setFormas(data)
    }
    fetchData()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Formas de Recebimento</h1>
      <ul className="space-y-2">
        {formas.map((item, index) => (
          <li key={index} className="bg-gray-100 p-3 rounded">
            {item.nome}
          </li>
        ))}
      </ul>
    </div>
  )
}
