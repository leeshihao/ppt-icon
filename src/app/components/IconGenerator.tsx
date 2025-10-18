'use client';

import { useState } from 'react';
import IconPreview from './IconPreview';
import IconControls from './IconControls';
import TestExamples from './TestExamples';
import { transformSVGColor } from '../../utils/svgValidator';

interface IconGeneratorProps {}

export default function IconGenerator() {
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [generatedSVG, setGeneratedSVG] = useState<string | null>(null);
  const [originalSVG, setOriginalSVG] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleGenerate = async (customDescription?: string) => {
    const descToUse = customDescription || description;
    if (!descToUse) {
      setError('Please enter a description');
      return;
    }

    // Ensure we have a string and not a DOM element
    const descriptionString = String(descToUse);
    if (!descriptionString || descriptionString === '[object Object]') {
      setError('Please enter a valid description');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await fetch('/api/generate-icon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: descriptionString }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to generate icon';
        const errorDetails = data.details ? `\n\nDetails: ${data.details.join(', ')}` : '';
        throw new Error(errorMessage + errorDetails);
      }

      setOriginalSVG(data.svg);
      setGeneratedSVG(data.svg);
      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleDownload = () => {
    if (!generatedSVG) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `icon-${timestamp}.svg`;
    
    const blob = new Blob([generatedSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleColorChange = (newColor: string) => {
    if (originalSVG) {
      try {
        const transformedSVG = transformSVGColor(originalSVG, newColor);
        setGeneratedSVG(transformedSVG);
        setSelectedColor(newColor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid color');
      }
    }
  };

  const handleSelectExample = (exampleDescription: string) => {
    setDescription(exampleDescription);
    setError(null);
    setWarnings([]);
    // Automatically start generating with the new description
    setTimeout(() => {
      handleGenerate(exampleDescription);
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Icon Builder
        </h1>
        <p className="text-gray-600">
          Generate minimalist icons from text descriptions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Icon Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., home icon, settings gear, user profile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>


        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !description.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Icon'
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
            <div className="font-medium mb-1">Generation Warnings:</div>
            <ul className="list-disc list-inside text-sm">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {generatedSVG && (
        <IconPreview 
          svg={generatedSVG} 
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
        />
      )}

      {generatedSVG && (
        <IconControls
          onRegenerate={handleRegenerate}
          onDownload={handleDownload}
          isLoading={isLoading}
        />
      )}

      <TestExamples onSelectExample={handleSelectExample} />
    </div>
  );
}
