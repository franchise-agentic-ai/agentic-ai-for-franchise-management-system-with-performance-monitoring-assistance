import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileText, ArrowRight, Download, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface CSVImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  expectedColumns: { key: string; label: string; required: boolean }[];
  onImport: (mappedRows: Record<string, any>[]) => number;
}

export function CSVImporterModal({
  isOpen,
  onClose,
  entityName,
  expectedColumns,
  onImport,
}: CSVImporterModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'success'>('upload');
  const [fileName, setFileName] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
        setRawHeaders(headers);
        setRawRows(rows);

        // Auto-match headers by similarity
        const initialMapping: Record<string, string> = {};
        expectedColumns.forEach((col) => {
          const matched = headers.find(
            (h) => h.toLowerCase() === col.key.toLowerCase() || h.toLowerCase().includes(col.key.toLowerCase()) || col.label.toLowerCase().includes(h.toLowerCase())
          );
          if (matched) {
            initialMapping[col.key] = matched;
          }
        });
        setColumnMapping(initialMapping);
        setStep('mapping');
      }
    };
    reader.readAsText(file);
  };

  const handleProceedToPreview = () => {
    // Validate required mappings
    const missing = expectedColumns.filter((col) => col.required && !columnMapping[col.key]);
    if (missing.length > 0) {
      setValidationErrors(missing.map((m) => `Missing required column mapping: ${m.label}`));
      return;
    }
    setValidationErrors([]);

    // Check sample row validation
    const errors: string[] = [];
    rawRows.slice(0, 10).forEach((row, idx) => {
      expectedColumns.forEach((col) => {
        if (col.required && columnMapping[col.key]) {
          const colIdx = rawHeaders.indexOf(columnMapping[col.key]);
          if (colIdx >= 0 && (!row[colIdx] || row[colIdx].trim() === '')) {
            errors.push(`Row ${idx + 1}: Empty value for required field '${col.label}'`);
          }
        }
      });
    });

    setValidationErrors(errors);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const parsedData = rawRows.map((row) => {
      const obj: Record<string, any> = {};
      expectedColumns.forEach((col) => {
        const headerName = columnMapping[col.key];
        if (headerName) {
          const headerIdx = rawHeaders.indexOf(headerName);
          if (headerIdx >= 0) {
            const rawVal = row[headerIdx];
            // Format numbers if applicable
            if (col.key === 'revenue' || col.key === 'target_revenue' || col.key === 'orders' || col.key === 'customers' || col.key === 'current_stock' || col.key === 'min_stock' || col.key === 'spend' || col.key === 'budget' || col.key === 'compliance_score') {
              obj[col.key] = Number(rawVal.replace(/[^0-9.-]+/g, '')) || 0;
            } else {
              obj[col.key] = rawVal;
            }
          }
        }
      });
      return obj;
    });

    const count = onImport(parsedData);
    setImportedCount(count);
    setStep('success');
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + expectedColumns.map((c) => c.label).join(",") + "\n" +
      expectedColumns.map((c) => c.key === 'date' ? '2023-10-31' : c.key.includes('revenue') ? '2500000' : c.key === 'orders' ? '4200' : c.key === 'customers' ? '3800' : 'Sample Value').join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${entityName.toLowerCase().replace(/\s+/g, '_')}_template.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Upload className="w-5 h-5" /></span>
            <h3 className="text-xl font-bold text-slate-900">Import {entityName} via CSV</h3>
          </div>
          <p className="text-xs text-slate-500">
            Upload standard spreadsheets with automated column detection, validation, and Supabase mapping.
          </p>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl p-8 text-center cursor-pointer bg-indigo-50/20 hover:bg-indigo-50/50 transition-all"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".csv, .txt" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Click to select or drag and drop your CSV</h4>
              <p className="text-xs text-slate-500">Supports standard UTF-8 CSV exports from POS, ERP, or Excel</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">Need the correct column structure?</span>
              <Button size="sm" variant="outline" onClick={handleDownloadTemplate} className="text-xs flex items-center gap-1.5 bg-white">
                <Download className="w-3.5 h-3.5" /> Download Template CSV
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-700">File: <strong className="text-indigo-600">{fileName}</strong> ({rawRows.length} rows detected)</span>
              <span className="text-slate-500">Match CSV headers to database fields</span>
            </div>

            <div className="space-y-3">
              {expectedColumns.map((col) => (
                <div key={col.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    {col.required && <span className="ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">*Required</span>}
                  </div>
                  <select
                    value={columnMapping[col.key] || ''}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [col.key]: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-48 font-medium"
                  >
                    <option value="">-- Select Matching Header --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {validationErrors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 space-y-1">
                {validationErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {err}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleProceedToPreview} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                Validate & Preview Rows <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Validation */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900">Previewing First 5 Records ({rawRows.length} Total)</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Schema Validated
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-56">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    {expectedColumns.map((c) => (
                      <th key={c.key} className="px-3 py-2">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {expectedColumns.map((col) => {
                        const h = columnMapping[col.key];
                        const cellIdx = rawHeaders.indexOf(h);
                        return (
                          <td key={col.key} className="px-3 py-2 font-mono text-slate-700">
                            {cellIdx >= 0 ? row[cellIdx] : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Validation Warnings:</div>
                {validationErrors.slice(0, 3).map((w, i) => (
                  <div key={i} className="text-[11px]">• {w}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
              <Button onClick={handleConfirmImport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                Confirm & Ingest {rawRows.length} Records
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Import Completed Successfully</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              <strong>{importedCount} records</strong> have been ingested into your active business tenant. AI agent models and health scores have been dynamically updated.
            </p>
            <div className="pt-4">
              <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                Close & View Updated Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
