import React from 'react';

// FIX: Made the 'lingkungan' property optional to accommodate different types of reports.
interface FishboneData {
  manusia: string[];
  mesin: string[];
  metode: string[];
  material: string[];
  lingkungan?: string[];
}

interface FishboneDiagramProps {
  data: FishboneData;
}

const FishboneDiagram: React.FC<FishboneDiagramProps> = ({ data }) => {
  // FIX: Dynamically construct the list of categories based on the provided data to avoid errors when a category is missing.
  const categories = [
    { name: 'Manusia', items: data.manusia },
    { name: 'Metode', items: data.metode },
    { name: 'Material', items: data.material },
    { name: 'Mesin', items: data.mesin },
  ];

  if (data.lingkungan) {
    categories.push({ name: 'Lingkungan', items: data.lingkungan });
  }

  // FIX: Dynamically split categories between top and bottom for balanced rendering regardless of the total number of categories.
  const midPoint = Math.ceil(categories.length / 2);
  const topCategories = categories.slice(0, midPoint);
  const bottomCategories = categories.slice(midPoint);

  const width = 900;
  const height = 500;
  const midY = height / 2;
  const headX = width - 50;
  const boneAngle = 45;

  return (
    <div className="w-full overflow-x-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="font-sans">
        {/* Spine */}
        <line x1="50" y1={midY} x2={headX} y2={midY} stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)" />
        {/* Head Arrow */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
          </marker>
        </defs>
        <text x={headX + 5} y={midY - 5} fontSize="16" fontWeight="bold" textAnchor="start" fill="#111827">EFEK</text>
        
        {/* Top Bones */}
        {topCategories.map((cat, i) => {
          const boneStartX = 150 + i * 250;
          return (
            <g key={cat.name} transform={`translate(${boneStartX}, ${midY})`}>
              <line x1="0" y1="0" x2="100" y2={-100} stroke="#6b7280" strokeWidth="2" />
              <text x="100" y={-110} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">{cat.name}</text>
              {cat.items.map((item, j) => (
                <g key={j} transform={`translate(${20 + j * 20}, ${-20 - j * 20})`}>
                  <line x1="0" y1="0" x2="30" y2="0" stroke="#9ca3af" strokeWidth="1" />
                  <text x="35" y="4" fontSize="12" fill="#4b5563">{item}</text>
                </g>
              ))}
            </g>
          )
        })}

        {/* Bottom Bones */}
        {bottomCategories.map((cat, i) => {
          const boneStartX = 200 + i * 280;
          return (
            <g key={cat.name} transform={`translate(${boneStartX}, ${midY})`}>
              <line x1="0" y1="0" x2="100" y2={100} stroke="#6b7280" strokeWidth="2" />
              <text x="100" y={115} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">{cat.name}</text>
               {cat.items.map((item, j) => (
                <g key={j} transform={`translate(${20 + j * 20}, ${20 + j * 20})`}>
                  <line x1="0" y1="0" x2="30" y2="0" stroke="#9ca3af" strokeWidth="1" />
                  <text x="35" y="4" fontSize="12" fill="#4b5563">{item}</text>
                </g>
              ))}
            </g>
          )
        })}

      </svg>
    </div>
  );
};

export default FishboneDiagram;
