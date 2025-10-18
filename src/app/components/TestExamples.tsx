'use client';

interface TestExamplesProps {
  onSelectExample: (description: string) => void;
}

const TEST_EXAMPLES = [
  "home icon",
  "settings gear", 
  "user profile",
  "save/download",
  "notification bell",
  "search magnifying glass",
  "growth",
  "connection between people",
  "heart",
  "star",
  "shopping cart",
  "email envelope",
];

export default function TestExamples({ onSelectExample }: TestExamplesProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Examples</h2>
      <p className="text-sm text-gray-600 mb-4">
        Click any example to quickly test the icon generation:
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TEST_EXAMPLES.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(example)}
            className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="font-medium text-gray-900">{example}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
