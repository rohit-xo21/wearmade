const SimpleTable = ({ headers, data, onRowClick }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr 
                key={index} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>
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