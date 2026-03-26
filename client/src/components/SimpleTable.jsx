const SimpleTable = ({ headers, data, onRowClick }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e0d4] bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-[#f5f1eb]">
          <tr className="border-b border-[#e8e0d4]">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#7a7570]">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#efe7dc]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-sm italic text-[#8c857d]">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr 
                key={index} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-[#faf8f4] transition-colors' : ''}
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-[#1a1814]">
                    {typeof row[header.toLowerCase()] === 'object' 
                      ? JSON.stringify(row[header.toLowerCase()]) 
                      : row[header.toLowerCase()] || '-'
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;