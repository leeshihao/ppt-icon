'use client';

interface IconPreviewProps {
  svg: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export default function IconPreview({ svg, selectedColor, onColorChange }: IconPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Icon</h2>
      
      <div className="flex justify-center">
        <div 
          className="bg-gray-100 p-8 rounded-lg"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          <div 
            className="w-32 h-32 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Preview at 128px (actual size: 32x32)
      </div>
      
      <div className="mt-6">
        <label htmlFor="color-picker" className="block text-sm font-medium text-gray-700 mb-2">
          Change Color
        </label>
        <div className="flex space-x-2">
          {[
            { value: '#000000', label: 'Black', bg: 'bg-black' },
            { value: '#FFFFFF', label: 'White', bg: 'bg-white border border-gray-300' },
            { value: '#808080', label: 'Grey', bg: 'bg-gray-500' }
          ].map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`w-8 h-8 rounded-full ${color.bg} border-2 ${
                selectedColor === color.value ? 'border-blue-500' : 'border-gray-300'
              } hover:border-blue-400 transition-colors`}
              title={color.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
