import React, { useState, useRef, UIEvent, useMemo } from 'react';
import { useVirtualizer } from './useVirtualizer';
interface RowData {
  id: number;
  name: string;
  role: string;
  status: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: keyof RowData;
  direction: SortDirection;
}

interface EditingCell {
  rowId: number;
  field: keyof RowData;
}
const generateData = (count: number): RowData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Employee ${i + 1}`,
    role: i % 3 === 0 ? 'Developer' : 'Manager',
    status: i % 2 === 0 ? 'Active' : 'Inactive',
  }));
};

export const DataGrid = () => {
  const [data, setData] = useState(() => generateData(50000));
  const [scrollTop, setScrollTop] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
 
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [tempValue, setTempValue] = useState(""); 
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;
  const containerHeight = 600;

 
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);


  const { virtualItems, totalHeight } = useVirtualizer({
    itemCount: sortedData.length,
    itemHeight,
    containerHeight,
    scrollTop,
  });

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleSort = (key: keyof RowData) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof RowData) => {
    if (sortConfig?.key !== key) return <span className="text-gray-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

 
  const startEditing = (row: RowData, field: keyof RowData) => {
    if (field === 'id' || field === 'status') return;
    setEditingCell({ rowId: row.id, field });
    setTempValue(String(row[field]));
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    setIsSaving(true);

    
    await new Promise(resolve => setTimeout(resolve, 600));

   
    setData(prev => prev.map(row => {
      if (row.id === editingCell.rowId) {
        return { ...row, [editingCell.field]: tempValue };
      }
      return row;
    }));

    setIsSaving(false);
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans text-gray-800">
      <div className="flex justify-between items-end mb-4">
        <h1 className="text-2xl font-bold">Uzence Grid (Editable)</h1>
        <div className="text-sm text-gray-500">
          Double-click Name or Role to edit • {data.length.toLocaleString()} rows
        </div>
      </div>
      
      <div className="border rounded-lg shadow-lg overflow-hidden bg-white relative">
        
     
        {isSaving && (
          <div className="absolute inset-0 z-50 bg-white/50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-black text-white px-4 py-2 rounded shadow-lg animate-pulse">
              Saving changes...
            </div>
          </div>
        )}

     
        <div className="flex bg-gray-100 font-bold border-b h-10 items-center select-none text-sm">
          {['id', 'name', 'role', 'status'].map((key) => (
            <div 
              key={key}
              className={`px-4 cursor-pointer hover:bg-gray-200 h-full flex items-center capitalize
                ${key === 'name' ? 'w-48' : key === 'role' ? 'w-32' : key === 'id' ? 'w-24' : 'w-32'}
              `}
              onClick={() => handleSort(key as keyof RowData)}
            >
              {key} {getSortIcon(key as keyof RowData)}
            </div>
          ))}
        </div>

   
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{ height: containerHeight }}
          className="overflow-auto relative"
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            
            {virtualItems.map((virtualRow) => {
              const row = sortedData[virtualRow.index];
              const isEditing = editingCell?.rowId === row.id;

              return (
                <div
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: itemHeight,
                    transform: `translateY(${virtualRow.offsetTop}px)`,
                  }}
                  className={`flex items-center border-b transition-colors text-sm
                    ${virtualRow.index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    ${isEditing ? 'bg-blue-50 z-10' : 'hover:bg-blue-50'}
                  `}
                >
               
                  <div className="w-24 px-4 text-gray-500">{row.id}</div>

               
                  <div 
                    className="w-48 px-4 font-medium truncate cursor-text"
                    onDoubleClick={() => startEditing(row, 'name')}
                  >
                    {isEditing && editingCell.field === 'name' ? (
                      <input 
                        autoFocus
                        className="w-full border-2 border-blue-500 rounded px-1 -ml-1 outline-none shadow-sm"
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                      />
                    ) : row.name}
                  </div>

                 
                  <div 
                    className="w-32 px-4 text-gray-600 cursor-text"
                    onDoubleClick={() => startEditing(row, 'role')}
                  >
                    {isEditing && editingCell.field === 'role' ? (
                      <input 
                        autoFocus
                        className="w-full border-2 border-blue-500 rounded px-1 -ml-1 outline-none shadow-sm"
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                      />
                    ) : row.role}
                  </div>

               
                  <div className="w-32 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      row.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm border border-blue-100">
        <strong>Instructions:</strong>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Scroll to see 50,000 rows (Virtualization).</li>
          <li>Click headers to Sort (Multi-sort logic).</li>
          <li><strong>Double-click</strong> a Name or Role to edit.</li>
          <li>Press <strong>Enter</strong> to save (simulates API call).</li>
        </ul>
      </div>
    </div>
  );
};