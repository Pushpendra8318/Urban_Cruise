export default function EmptyState({ title = 'No data found', message = 'Nothing to display yet.', action, icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-4xl">
        {icon}
      </div>
      <h3 className="text-gray-800 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-5 max-w-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
