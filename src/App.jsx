import { useState } from 'react';
import { useCssData } from './hooks/useCssData';

function App() {
  const { data, loading, error } = useCssData();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('properties'); // 'properties', 'specs', 'browser-support'
  const [category, setCategory] = useState('all'); // 'all', 'property', 'value', 'function', 'at-rule'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  if (loading) return <div className="p-4">Loading CSS data...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading data: {error.message}</div>;

  const allItems = [
      ...data.properties,
      ...data.atRules,
      ...data.values
  ];

  // Filter for Properties View
  const filteredItems = allItems.filter(item => {
    if (view !== 'properties') return false;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.type === category;
    return matchesSearch && matchesCategory;
  });

  // Filter for Browser Support View
  const supportedItems = allItems.filter(item => {
    if (view !== 'browser-support') return false;
    if (!item.compatibility || !item.compatibility.supported) return false;
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const itemsToDisplay = view === 'properties' ? filteredItems : supportedItems;
  const totalPages = Math.ceil(itemsToDisplay.length / ITEMS_PER_PAGE);
  const currentItems = itemsToDisplay.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
  };

  const handleViewChange = (newView) => {
      setView(newView);
      setSearch('');
      setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory) => {
      setCategory(newCategory);
      setCurrentPage(1);
  };

  const completedSpecs = data.specsData.results.filter(spec => 
      spec.release && 
      spec.release.status === 'Recommendation' &&
      spec.groups &&
      spec.groups.some(g => g.name === 'Cascading Style Sheets (CSS) Working Group')
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">CSS Reference</h1>
        <div className="space-x-2">
            <button 
                className={`px-4 py-2 rounded ${view === 'properties' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleViewChange('properties')}
            >
                Properties
            </button>
            <button 
                className={`px-4 py-2 rounded ${view === 'browser-support' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleViewChange('browser-support')}
            >
                Browser Support
            </button>
            <button 
                className={`px-4 py-2 rounded ${view === 'specs' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleViewChange('specs')}
            >
                Completed Specs
            </button>
        </div>
      </div>
      
      {view === 'properties' && (
        <>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 text-sm text-gray-700">
                <h3 className="font-semibold mb-2 text-gray-900">Definitions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold mb-1">Property</span>
                        <p>A specific stylistic feature that you can modify (e.g., <code>color</code>, <code>font-size</code>).</p>
                    </div>
                    <div>
                        <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-bold mb-1">Value</span>
                        <p>The setting or parameter applied to a property (e.g., <code>red</code>, <code>10px</code>, <code>bold</code>).</p>
                    </div>
                    <div>
                        <span className="inline-block px-2 py-1 rounded bg-pink-100 text-pink-800 text-xs font-bold mb-1">Function</span>
                        <p>A value that takes arguments to compute a result (e.g., <code>rgb()</code>, <code>calc()</code>).</p>
                    </div>
                    <div>
                        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold mb-1">At-Rule</span>
                        <p>A statement that instructs CSS how to behave (e.g., <code>@media</code>, <code>@keyframes</code>).</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search properties..."
                    className="flex-grow p-2 border rounded"
                    value={search}
                    onChange={handleSearchChange}
                />
                <select 
                    value={category} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="p-2 border rounded bg-white"
                >
                    <option value="all">All Categories</option>
                    <option value="property">Properties</option>
                    <option value="value">Values</option>
                    <option value="function">Functions</option>
                    <option value="at-rule">At-Rules</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((item, index) => (
                <div key={`${item.spec}-${item.name}-${index}`} className="border p-4 rounded shadow hover:shadow-lg transition relative">
                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                        item.type === 'property' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'at-rule' ? 'bg-green-100 text-green-800' :
                        item.type === 'function' ? 'bg-pink-100 text-pink-800' :
                        'bg-purple-100 text-purple-800'
                    }`}>
                        {item.type}
                    </span>
                    <h2 className="text-xl font-semibold text-blue-600 pr-16">{item.name}</h2>
                    <p className="text-sm text-gray-500 mb-2">
                        Defined in: <a href={item.sourceSpec.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.sourceSpec.title}</a>
                    </p>
                    {item.note && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-2 border border-amber-200">
                            <strong>Note:</strong> {item.note}
                        </p>
                    )}
                    {item.value && (
                        <p className="text-sm font-mono bg-gray-100 p-1 rounded truncate" title={item.value}>
                            {item.value}
                        </p>
                    )}
                    {item.compatibility && item.compatibility.flagged && (
                        <p className="text-xs text-orange-600 bg-orange-50 p-1 rounded mt-2 border border-orange-200">
                            ⚠️ Implemented behind a flag
                        </p>
                    )}
                    {item.href ? (
                        <a 
                            href={item.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm mt-2 block"
                        >
                            View in Spec
                        </a>
                    ) : (
                        <span className="text-gray-400 text-sm mt-2 block cursor-not-allowed" title="Link not available">
                            View in Spec (Not Available)
                        </span>
                    )}
                </div>
                ))}
            </div>
            
            {filteredItems.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No items found matching "{search}"</p>
            )}

            {filteredItems.length > 0 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
      )}

      {view === 'browser-support' && (
        <>  
            
            <div className="border border-200 rounded p-4 mb-6 text-sm text-900">
              <h2 class="text-2xl mb-4">Browser Support</h2>
                <p className="mb-4">This list shows CSS features that are implemented in at least 2 major browsers (Chrome, Firefox, Safari).</p>
                <p className="mb-4">This may be a more rational place to begin analyzing what CSS4 (and follow on versions) should be like. Use the features that are supported as the starting point and then build from there.</p>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search supported features..."
                    className="w-full p-2 border rounded"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((item, index) => (
                <div key={`${item.spec}-${item.name}-${index}`} className="border p-4 rounded shadow hover:shadow-lg transition relative">
                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                        item.type === 'property' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'at-rule' ? 'bg-green-100 text-green-800' :
                        item.type === 'function' ? 'bg-pink-100 text-pink-800' :
                        'bg-purple-100 text-purple-800'
                    }`}>
                        {item.type}
                    </span>
                    <h2 className="text-xl font-semibold text-blue-600 pr-16">{item.name}</h2>
                    
                    <div className="mt-4 flex space-x-2">
                        {['chrome', 'firefox', 'safari'].map(browser => {
                            const isSupported = item.compatibility.support[browser];
                            return (
                                <div key={browser} className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold ${isSupported ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                    <span className="capitalize">{browser}</span>
                                    <span>{isSupported ? '✓' : '✗'}</span>
                                </div>
                            );
                        })}
                    </div>

                    {item.compatibility.flagged && (
                        <p className="text-xs text-orange-600 bg-orange-50 p-1 rounded mt-2 border border-orange-200">
                            ⚠️ Implemented behind a flag
                        </p>
                    )}
                    
                    <a 
                        href={item.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm mt-4 block"
                    >
                        View in Spec
                    </a>
                </div>
                ))}
            </div>

            {itemsToDisplay.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No supported items found matching "{search}"</p>
            )}

            {itemsToDisplay.length > 0 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
      )}

      {view === 'specs' && (
          <div>
              <h2 className="text-2xl mb-4">Completed Specifications</h2>
              <p className="mb-4 text-gray-700">
                  The following specifications have reached "Recommendation" status, meaning they are considered completed.
                  Note that the search results above may show properties from newer drafts (e.g. Level 4) that extend these recommendations.
              </p>
              <p className="mb-4 text-gray-700">
                This is naive starting point to understanding the current state of CSS. All specifications approved as recommendations by the W3C are ready to use an implement.
              </p>
              <p className="mb-4 text-gray-700">
                However, the landscape of CSS is constantly evolving, with new drafts and proposals emerging regularly and features from editor drafts or candidate recommendations being implemented in browsers before specifications reach full recommendation status so this list is icomplete in terms of practical usage
              </p>
              <p className="mb-4 text-gray-700">
                Even if the list was complete, asking developers to read each specification is not only unrealistic but also inefficient. Many specifications build upon or reference others, leading to redundancy and overlap. A more effective approach would be to provide curated guides or summaries that distill the essential information from these specifications, making it easier for developers to grasp the key concepts and best practices without wading through extensive documentation.
              </p>
              <p className="mb-4 text-gray-700">It is also worth noting that W3C specifications are not meant for developers to read but for browser implementers to use when adding features to their engines and for the CSS working group to track progress on standardization.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedSpecs.map((spec, index) => (
                      <div key={index} className="border p-4 rounded shadow">
                          <h2 className="text-xl font-semibold">{spec.title || spec.shortname}</h2>
                          <p className="text-sm text-gray-500 mb-2">{spec.release.status}</p>
                          <a 
                              href={spec.release.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                          >
                              Read Specification
                          </a>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}

export default App;
