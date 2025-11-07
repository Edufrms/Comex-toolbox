import { useState } from 'react'
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import FileUpload from './components/FileUpload'
import ProgressBar from './components/ProgressBar'
import ResultsTable from './components/ResultsTable'

// URL del backend - cambiar según el entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setError(null)
    setResults(null)
    setDownloadUrl(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo')
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setResults(null)
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simular progreso (el backend no tiene endpoint de progreso real)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 500)

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }))
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`)
      }

      // Obtener el archivo Excel de la respuesta
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)

      // Obtener nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'resultado.xlsx'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Leer el Excel para mostrar previsualización
      try {
        // Nota: Para leer Excel en el navegador necesitarías una librería como xlsx
        // Por ahora, solo mostramos el botón de descarga
        setResults({
          filename,
          message: 'Archivo procesado correctamente. Descarga el Excel con los resultados.',
        })
      } catch (e) {
        console.warn('No se pudo leer el Excel para previsualización:', e)
        setResults({
          filename,
          message: 'Archivo procesado correctamente.',
        })
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = results?.filename || 'resultado.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Email Scraper
          </h1>
          <p className="text-gray-600 text-lg">
            Extrae correos de contacto de URLs automáticamente
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          {/* Upload Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir archivo
            </h2>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes=".xlsx,.xls,.csv"
            />
            {file && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">
                  Archivo seleccionado: <strong>{file.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mb-6">
              <ProgressBar progress={progress} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {results && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Procesamiento completado</p>
                <p className="text-sm text-green-600 mt-1">{results.message}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Procesar archivo
              </>
            )}
          </button>

          {/* Download Button */}
          {downloadUrl && results && (
            <button
              onClick={handleDownload}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar Excel con resultados
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Instrucciones
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">1.</span>
              <span>Sube un archivo Excel (.xlsx, .xls) o CSV con una columna de URLs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">2.</span>
              <span>El sistema buscará automáticamente correos en cada página web</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">3.</span>
              <span>Se revisarán rutas comunes como /contact, /about, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">4.</span>
              <span>Descarga el Excel actualizado con la columna de correos encontrados</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App

