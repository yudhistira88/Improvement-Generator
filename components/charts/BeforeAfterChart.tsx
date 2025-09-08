
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  name: string;
  sebelum: number;
  sesudah: number;
  unit: string;
}

interface BeforeAfterChartProps {
  data: ChartData[];
}

const BeforeAfterChart: React.FC<BeforeAfterChartProps> = ({ data }) => {
  const unit = data[0]?.unit || '';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="label font-bold">{`${label}`}</p>
          <p className="text-indigo-500">{`Sebelum: ${payload[0].value} ${unit}`}</p>
          <p className="text-emerald-500">{`Sesudah: ${payload[1].value} ${unit}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="sebelum" name="Sebelum" fill="#6366f1" />
        <Bar dataKey="sesudah" name="Sesudah" fill="#34d399" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BeforeAfterChart;
