export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="h-7 w-64 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded-xl animate-pulse mt-2" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="h-72 bg-white rounded-2xl animate-pulse shadow-soft" />
          <div className="h-44 bg-white rounded-2xl animate-pulse shadow-soft" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 bg-white rounded-2xl animate-pulse shadow-soft" />
          <div className="h-48 bg-white rounded-2xl animate-pulse shadow-soft" />
        </div>
      </div>
    </div>
  );
}
