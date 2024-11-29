import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [selectedOption, setSelectedOption] = useState('excel');
  const [excelData, setExcelData] = useState(null);

  // Function to process the uploaded Excel file
  const processExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const abuf = e.target.result;
      const wb = XLSX.read(abuf, { type: 'array' });

      // Read the first sheet
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Read as array of arrays

      const nomeIndex = data.findIndex((row) => row[2] === 'White');

      const firstNaNAfterNome = data
        .slice(nomeIndex)
        .findIndex((row) => row[2] === undefined || row[2] === null);
      const firstNaNIndex = nomeIndex + firstNaNAfterNome;

      const relevantData = data.slice(nomeIndex + 1, firstNaNIndex);

      const headers = ['Tab.', 'White', 'Resultado', 'Black'];
      const relevantHeaders = data[nomeIndex];
      const filteredData = relevantData.map((row) => ({
        'Tab.': row[relevantHeaders.indexOf('Tab.')],
        White: row[relevantHeaders.indexOf('White')],
        Resultado: row[relevantHeaders.indexOf('Resultado')] || '', // Default empty
        Black: row[relevantHeaders.indexOf('Black')],
      }));

      setExcelData(filteredData);
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to handle XML download
  const handleDownloadXML = () => {
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput?.files[0];
    if (!file) return alert('Please upload a file first.');

    const reader = new FileReader();
    reader.onload = (e) => {
      const abuf = e.target.result;
      const wb = XLSX.read(abuf, { type: 'array' });

      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
      const matches = data
        .map(
          (row) =>
            `  <Match>\n    <Tab>${row['Tab.']}</Tab>\n    <White>${row['White']}</White>\n    <Resultado>${row['Resultado']}</Resultado>\n    <Black>${row['Black']}</Black>\n  </Match>`
        )
        .join('\n');
      const xmlContent = `${xmlHeader}<Matches>\n${matches}\n</Matches>`;

      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'matches.xml';
      link.click();
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to handle Excel download
  const handleDownloadExcel = () => {
    if (!excelData) return alert('Please upload a file first.');

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ProcessedData');
    XLSX.writeFile(workbook, 'processed_data.xlsx');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Gerador de Planilha de Emparceiramentos do Chess-Results
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="radio"
            value="excel"
            checked={selectedOption === 'excel'}
            onChange={() => setSelectedOption('excel')}
          />
          Gerar Excel
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="xml"
            checked={selectedOption === 'xml'}
            onChange={() => setSelectedOption('xml')}
          />
          Gerar XML
        </label>
      </div>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) processExcel(file);
        }}
        style={{
          display: 'block',
          margin: '0 auto 20px',
          padding: '10px',
          border: '1px solid #DDDDDD',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          fontSize: '16px',
        }}
      />

      <button
        onClick={selectedOption === 'excel' ? handleDownloadExcel : handleDownloadXML}
        style={{
          padding: '12px 20px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
      >
        Processar e Baixar
      </button>
    </div>
  );
}

export default App;
