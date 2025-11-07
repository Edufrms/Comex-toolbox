function ResultsTable({ data }) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Correos encontrados
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row.url}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {row.emails || 'No se encontraron correos'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResultsTable

