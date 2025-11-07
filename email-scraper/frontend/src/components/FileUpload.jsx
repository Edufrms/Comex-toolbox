import { useRef } from 'react'
import { Upload as UploadIcon } from 'lucide-react'

function FileUpload({ onFileSelect, acceptedTypes = '.xlsx,.xls,.csv' }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
      >
        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium mb-1">
          Haz clic para seleccionar un archivo
        </p>
        <p className="text-sm text-gray-500">
          Formatos soportados: Excel (.xlsx, .xls) o CSV
        </p>
      </div>
    </div>
  )
}

export default FileUpload

