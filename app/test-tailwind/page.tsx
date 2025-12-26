export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Tailwind Test</h1>
        <p className="text-green-600">If you see colors and styles, Tailwind is working!</p>
        <div className="mt-4 p-4 bg-yellow-200 rounded">
          <p className="text-purple-700 font-semibold">This should be yellow background with purple text</p>
        </div>
      </div>
    </div>
  );
}
