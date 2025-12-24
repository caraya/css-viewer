import { useState } from 'react';
import { useCssData } from './hooks/useCssData';

const OFFICIAL_SPECS = [
  { 
    name: "CSS Level 2, latest revision", 
    url: "https://www.w3.org/TR/CSS2/", 
    code: "CSS2",
    description: "This defines the core of CSS, parts of which are overridden by later specifications. We recommend in particular reading Chapter 2, which introduces some of the basic concepts of CSS and its design principles."
  },
  { 
    name: "CSS Syntax Module Level 3", 
    url: "https://www.w3.org/TR/css-syntax-3/", 
    code: "CSS-SYNTAX-3",
    description: "Replaces CSS2§4.1, CSS2§4.2, CSS2§4.4, and CSS2§G, redefining how CSS is parsed."
  },
  { 
    name: "CSS Style Attributes", 
    url: "https://www.w3.org/TR/css-style-attr/", 
    code: "CSS-STYLE-ATTR",
    description: "Defines how CSS declarations can be embedded in markup attributes."
  },
  { 
    name: "Media Queries Level 3", 
    url: "https://www.w3.org/TR/css3-mediaqueries/", 
    code: "CSS3-MEDIAQUERIES",
    description: "Replaces CSS2§7.3 and expands on the syntax for media-specific styles."
  },
  { 
    name: "CSS Conditional Rules Module Level 3", 
    url: "https://www.w3.org/TR/css-conditional-3/", 
    code: "CSS-CONDITIONAL-3",
    description: "Extends and supersedes CSS2§7.2, updating the definition of ‘@media’ rules to allow nesting and introducing the ‘@supports’ rule for feature-support queries."
  },
  { 
    name: "Selectors Level 3", 
    url: "https://www.w3.org/TR/selectors-3/", 
    code: "SELECTORS-3",
    description: "Replaces CSS2§5 and CSS2§6.4.3, defining an extended range of selectors."
  },
  { 
    name: "CSS Namespaces Module Level 3", 
    url: "https://www.w3.org/TR/css-namespaces/", 
    code: "CSS3-NAMESPACE",
    description: "Introduces an ‘@namespace’ rule to allow namespace-prefixed selectors."
  },
  { 
    name: "CSS Cascading and Inheritance Level 4", 
    url: "https://www.w3.org/TR/css-cascade-4/", 
    code: "CSS-CASCADE-4",
    description: "Extends and supersedes CSS2§1.4.3 and CSS2§6, as well as [CSS-CASCADE-3]. Describes how to collate style rules and assign values to all properties on all elements. By way of cascading and inheritance, values are propagated for all properties on all elements."
  },
  { 
    name: "CSS Values and Units Module Level 3", 
    url: "https://www.w3.org/TR/css-values-3/", 
    code: "CSS-VALUES-3",
    description: "Extends and supersedes CSS2§1.4.2.1, CSS2§4.3, and CSS2§A.2.1–3, defining CSS’s property definition syntax and expanding its set of units."
  },
  { 
    name: "CSS Custom Properties for Cascading Variables Module Level 1", 
    url: "https://www.w3.org/TR/css-variables-1/", 
    code: "CSS-VARIABLES-1",
    description: "Introduces cascading variables as a new primitive value type that is accepted by all CSS properties, and custom properties for defining them."
  },
  { 
    name: "CSS Box Model Module Level 3", 
    url: "https://www.w3.org/TR/css-box-3/", 
    code: "CSS-BOX-3",
    description: "Replaces CSS2§8.1, §8.2, §8.3 (but not §8.3.1), and §8.4."
  },
  { 
    name: "CSS Color Module Level 4", 
    url: "https://www.w3.org/TR/css-color-4/", 
    code: "CSS-COLOR-4",
    description: "Extends and supersedes CSS2§4.3.6, CSS2§14.1, and CSS2§18.2, also extends and supersedes [CSS-COLOR-3], introducing an extended range of color spaces beyond sRGB, extended color values, and CSS Object Model extensions for color. Also defines the ‘opacity’ property."
  },
  { 
    name: "CSS Backgrounds and Borders Module Level 3", 
    url: "https://www.w3.org/TR/css-backgrounds-3/", 
    code: "CSS-BACKGROUNDS-3",
    description: "Extends and supersedes CSS2§8.5 and CSS2§14.2, providing more control of backgrounds and borders, including layered background images, image borders, and drop shadows."
  },
  { 
    name: "CSS Images Module Level 3", 
    url: "https://www.w3.org/TR/css-images-3/", 
    code: "CSS-IMAGES-3",
    description: "Redefines and incorporates the external 2D image value type, introduces native 2D gradients, and adds additional controls for replaced element sizing and rendering."
  },
  { 
    name: "CSS Fonts Module Level 3", 
    url: "https://www.w3.org/TR/css-fonts-3/", 
    code: "CSS-FONTS-3",
    description: "Extends and supersedes CSS2§15 and provides more control over font choice and feature selection."
  },
  { 
    name: "CSS Writing Modes Level 3", 
    url: "https://www.w3.org/TR/css-writing-modes-3/", 
    code: "CSS-WRITING-MODES-3",
    description: "Defines CSS support for various international writing modes, such as left-to-right (e.g. Latin or Indic), right-to-left (e.g. Hebrew or Arabic), bidirectional (e.g. mixed Latin and Arabic) and vertical (e.g. Asian scripts). Replaces and extends CSS2§8.6 and §9.10."
  },
  { 
    name: "CSS Multi-column Layout Module Level 1", 
    url: "https://www.w3.org/TR/css-multicol-1/", 
    code: "CSS-MULTICOL-1",
    description: "Introduces multi-column flows to CSS layout."
  },
  { 
    name: "CSS Flexible Box Layout Module Level 1", 
    url: "https://www.w3.org/TR/css-flexbox-1/", 
    code: "CSS-FLEXBOX-1",
    description: "Introduces a flexible linear layout model for CSS."
  },
  { 
    name: "CSS Basic User Interface Module Level 3", 
    url: "https://www.w3.org/TR/css-ui-3/", 
    code: "CSS-UI-3",
    description: "Extends and supersedes CSS2§18.1 and CSS2§18.4, defining ‘cursor’, ‘outline’, and several new CSS features that also enhance the user interface."
  },
  { 
    name: "CSS Containment Module Level 1", 
    url: "https://www.w3.org/TR/css-contain-1/", 
    code: "CSS-CONTAIN-1",
    description: "Introduces the ‘contain’ property, which enforces the independent CSS processing of an element’s subtree in order to enable heavy optimizations by user agents when used well."
  },
  { 
    name: "CSS Transforms Module Level 1", 
    url: "https://www.w3.org/TR/css-transforms-1/", 
    code: "CSS-TRANSFORMS-1",
    description: "Introduces coordinate-based graphical transformations to CSS."
  },
  { 
    name: "Compositing and Blending Level 1", 
    url: "https://www.w3.org/TR/compositing-1/", 
    code: "COMPOSITING",
    description: "Defines the compositing and blending of overlaid content and introduces features to control their modes."
  },
  { 
    name: "CSS Easing Functions Level 1", 
    url: "https://www.w3.org/TR/css-easing-1/", 
    code: "CSS-EASING-1",
    description: "Describes a way for authors to define a transformation that controls the rate of change of some value. Applied to animations, such transformations can be used to produce animations that mimic physical phenomena such as momentum or to cause the animation to move in discrete steps producing robot-like movement."
  },
  { 
    name: "CSS Counter Styles Level 3", 
    url: "https://www.w3.org/TR/css-counter-styles-3/", 
    code: "CSS-COUNTER-STYLES-3",
    description: "Introduces the ‘@counter-style’ rule, which allows authors to define their own custom counter styles for use with CSS list-marker and generated-content counters [CSS-LISTS-3]. It also predefines a set of common counter styles, including the ones present in CSS2 and CSS2.1."
  }
];

function App() {
  const { data, loading, error } = useCssData();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('properties'); // 'properties', 'specs', 'browser-support', 'definition'
  const [category, setCategory] = useState('all'); // 'all', 'property', 'value', 'function', 'at-rule'
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationEnabled, setPaginationEnabled] = useState(true);
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
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.type === category;
    return matchesSearch && matchesCategory;
  });

  const itemsToDisplay = view === 'properties' ? filteredItems : supportedItems;
  const totalPages = Math.ceil(itemsToDisplay.length / ITEMS_PER_PAGE);
  const currentItems = paginationEnabled 
      ? itemsToDisplay.slice(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE
      )
      : itemsToDisplay;

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
            <button 
                className={`px-4 py-2 rounded ${view === 'definition' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleViewChange('definition')}
            >
                Official Definition
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
                <div className="flex items-center space-x-2 bg-white p-2 border rounded">
                    <input
                        type="checkbox"
                        id="pagination-toggle-props"
                        checked={paginationEnabled}
                        onChange={(e) => setPaginationEnabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="pagination-toggle-props" className="text-sm text-gray-700 select-none cursor-pointer">
                        Pagination
                    </label>
                </div>
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

            {filteredItems.length > 0 && paginationEnabled && (
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
            
            <div>
              <h2 className="text-2xl mb-4">Browser Supported Features</h2>
              <p className="mb-4 text-gray-700">
                This list shows CSS features that are implemented in at least 2 major browsers (Chrome, Firefox, Safari).
              </p>
              <p className="mb-4 text-gray-700">
                This may be a more rational place to begin analyzing what CSS4 (and follow on versions) should be like. Use the features that are supported as the starting point and then build from there.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search supported features..."
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
                <div className="flex items-center space-x-2 bg-white p-2 border rounded">
                    <input
                        type="checkbox"
                        id="pagination-toggle-support"
                        checked={paginationEnabled}
                        onChange={(e) => setPaginationEnabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="pagination-toggle-support" className="text-sm text-gray-700 select-none cursor-pointer">
                        Pagination
                    </label>
                </div>
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

            {itemsToDisplay.length > 0 && paginationEnabled && (
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

      {view === 'definition' && (
          <div>
              <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-8">
                  <h3 className="text-xl font-bold mb-4 text-blue-900">Cascading Style Sheets (CSS) — The Official Definition</h3>
                  <p className="mb-4 text-blue-800">
                      According to the <a href="https://www.w3.org/TR/css-2025/#css-official" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">CSS Snapshot 2025</a>:
                  </p>
                  <blockquote className="border-l-4 border-blue-300 pl-4 italic text-blue-800 mb-4">
                      <p className="mb-2">
                          This profile includes only specifications that the CSS Working Group considers stable and for which they have enough implementation experience that they are sure of that stability.
                      </p>
                  </blockquote>
                  <p className="text-blue-800">
                      As of 2025, Cascading Style Sheets (CSS) is defined by the specifications listed in the official snapshot.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OFFICIAL_SPECS.map((spec, index) => (
                      <div key={index} className="border p-4 rounded shadow bg-white hover:shadow-md transition">
                          <h4 className="font-semibold text-lg mb-1">{spec.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{spec.description}</p>
                          <div className="flex justify-between items-center mt-2">
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                  {spec.code}
                              </span>
                              <a 
                                  href={spec.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                              >
                                  Read Spec
                              </a>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}

export default App;
