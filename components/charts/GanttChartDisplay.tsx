import React from 'react';
import { GanttChartTask } from '../../types';

interface GanttChartDisplayProps {
  data: GanttChartTask[];
  isEditing?: boolean;
  onTaskChange?: (index: number, field: keyof GanttChartTask, value: string | number) => void;
}

const GanttChartDisplay: React.FC<GanttChartDisplayProps> = ({ data, isEditing = false, onTaskChange }) => {
  if (!data || data.length === 0) return <p>Data Gantt Chart tidak tersedia.</p>;

  const handleInputChange = (index: number, field: keyof GanttChartTask, value: string) => {
      if (onTaskChange) {
          const isNumeric = ['duration'].includes(field);
          onTaskChange(index, field, isNumeric ? Number(value) : value);
      }
  };

  return (
    <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th scope="col" className="px-6 py-3">Tugas</th>
            <th scope="col" className="px-6 py-3">Mulai</th>
            <th scope="col" className="px-6 py-3">Selesai</th>
            <th scope="col" className="px-6 py-3">Durasi (Hari)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((task, index) => (
            <tr key={index} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                {isEditing ? (
                  <input type="text" value={task.task} onChange={e => handleInputChange(index, 'task', e.target.value)} className="w-full p-1 bg-white border border-gray-300 rounded" />
                ) : (
                  task.task
                )}
              </td>
              <td className="px-6 py-4">
                {isEditing ? (
                   <input type="date" value={task.start} onChange={e => handleInputChange(index, 'start', e.target.value)} className="w-full p-1 bg-white border border-gray-300 rounded" />
                ) : (
                  new Date(task.start).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                )}
              </td>
              <td className="px-6 py-4">
                 {isEditing ? (
                   <input type="date" value={task.end} onChange={e => handleInputChange(index, 'end', e.target.value)} className="w-full p-1 bg-white border border-gray-300 rounded" />
                ) : (
                  new Date(task.end).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                )}
              </td>
              <td className="px-6 py-4">
                 {isEditing ? (
                   <input type="number" value={task.duration} onChange={e => handleInputChange(index, 'duration', e.target.value)} className="w-20 p-1 bg-white border border-gray-300 rounded" />
                ) : (
                  task.duration
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GanttChartDisplay;
