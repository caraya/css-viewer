import { useState, useMemo } from 'react';

export function BaselineByYear({ baselineFeatures = [] }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [scope, setScope] = useState('css'); // 'css' | 'all'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'high'
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [paginationEnabled, setPaginationEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Filter features based on scope (CSS vs All)
  const scopedFeatures = useMemo(() => {
    return baselineFeatures.filter(feat => {
      if (scope === 'css') {
        return feat.isCSS;
      }
      return true;
    });
  }, [baselineFeatures, scope]);

  // Extract all available years and counts
  const { years, yearCounts, totalWithBaseline } = useMemo(() => {
    const counts = {};
    let total = 0;

    scopedFeatures.forEach(feat => {
      if (feat.baseline_year) {
        counts[feat.baseline_year] = (counts[feat.baseline_year] || 0) + 1;
        total++;
      }
    });

    const sortedYears = Object.keys(counts).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });

    return {
      years: sortedYears,
      yearCounts: counts,
      totalWithBaseline: total
    };
  }, [scopedFeatures]);

  // Extract all unique group categories for the dropdown filter
  const availableGroups = useMemo(() => {
    const groupMap = new Map();
    scopedFeatures.forEach(feat => {
      if (feat.groups && feat.groupLabels) {
        feat.groups.forEach((groupId, idx) => {
          const label = feat.groupLabels[idx] || groupId;
          if (!groupMap.has(groupId)) {
            groupMap.set(groupId, label);
          }
        });
      }
    });
    return Array.from(groupMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [scopedFeatures]);

  // Filter features based on year, status, group, search
  const filteredFeatures = useMemo(() => {
    return scopedFeatures.filter(feat => {
      // Must have baseline status
      if (!feat.baseline || !feat.baseline_year) return false;

      // Year filter
      if (selectedYear !== 'all' && feat.baseline_year !== selectedYear) {
        return false;
      }

      // Status filter (low = newly available, high = widely available)
      if (statusFilter !== 'all' && feat.baseline !== statusFilter) {
        return false;
      }

      // Group filter
      if (selectedGroup !== 'all' && (!feat.groups || !feat.groups.includes(selectedGroup))) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = feat.name?.toLowerCase().includes(q);
        const matchesDesc = feat.description?.toLowerCase().includes(q);
        const matchesId = feat.id?.toLowerCase().includes(q);
        const matchesCompat = feat.compat_features?.some(cf => cf.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesId && !matchesCompat) {
          return false;
        }
      }

      return true;
    });
  }, [scopedFeatures, selectedYear, statusFilter, selectedGroup, search]);

  // Group features by year if "all" is selected
  const featuresByYearGrouped = useMemo(() => {
    if (selectedYear !== 'all') return null;

    const grouped = {};
    filteredFeatures.forEach(feat => {
      const y = feat.baseline_year || 'Unknown';
      if (!grouped[y]) grouped[y] = [];
      grouped[y].push(feat);
    });

    return grouped;
  }, [selectedYear, filteredFeatures]);

  // Pagination calculations (when not in "all years grouped" view, or for overall list)
  const totalPages = Math.ceil(filteredFeatures.length / ITEMS_PER_PAGE) || 1;
  const paginatedFeatures = useMemo(() => {
    if (!paginationEnabled || selectedYear === 'all') {
      return filteredFeatures;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFeatures.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFeatures, paginationEnabled, currentPage, selectedYear]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleGroupFilterChange = (newGroup) => {
    setSelectedGroup(newGroup);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Helper to render description safely highlighting <code>
  const renderDescription = (html, text) => {
    if (html) {
      return <p className="text-sm text-gray-700 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <p className="text-sm text-gray-700 leading-relaxed mb-3">{text}</p>;
  };

  // Card component for a single baseline feature
  const FeatureCard = ({ item }) => {
    const isNewlyAvailable = item.baseline === 'low';
    const isWidelyAvailable = item.baseline === 'high';

    return (
      <article
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          {/* Header & Badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-blue-700 break-words font-mono">
              {item.name}
            </h3>

            {isNewlyAvailable && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0"
                title={`Newly available as of ${item.baseline_low_date}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Newly Available
              </span>
            )}

            {isWidelyAvailable && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 shrink-0"
                title={`Widely available (Newly available: ${item.baseline_low_date}, Widely available: ${item.baseline_high_date})`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Widely Available
              </span>
            )}
          </div>

          {/* Baseline Date Pill */}
          {item.baseline_low_date && (
            <div className="text-xs text-gray-500 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-gray-700">
                Baseline {item.baseline_year}:
              </span>
              <span>Became newly available on <strong className="text-gray-800">{formatDate(item.baseline_low_date)}</strong></span>
              {item.baseline_high_date && (
                <span className="text-gray-400">
                  • Widely available since {formatDate(item.baseline_high_date)}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {renderDescription(item.description_html, item.description)}

          {/* Category / Group Badges */}
          {item.groupLabels && item.groupLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.groupLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {lbl}
                </span>
              ))}
              {item.isCSS && (
                <span className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  CSS
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Browser Support Row */}
          {item.support && (
            <div className="bg-gray-50 rounded p-2.5 border border-gray-200 mb-3">
              <div className="text-xs font-semibold text-gray-600 mb-1.5">Browser Version Added:</div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="bg-white p-1 rounded border border-gray-200 text-xs">
                  <div className="text-gray-500 text-[10px] uppercase font-bold">Chrome</div>
                  <div className="font-mono font-bold text-gray-800">{item.support.chrome || '—'}</div>
                </div>
                <div className="bg-white p-1 rounded border border-gray-200 text-xs">
                  <div className="text-gray-500 text-[10px] uppercase font-bold">Edge</div>
                  <div className="font-mono font-bold text-gray-800">{item.support.edge || '—'}</div>
                </div>
                <div className="bg-white p-1 rounded border border-gray-200 text-xs">
                  <div className="text-gray-500 text-[10px] uppercase font-bold">Firefox</div>
                  <div className="font-mono font-bold text-gray-800">{item.support.firefox || '—'}</div>
                </div>
                <div className="bg-white p-1 rounded border border-gray-200 text-xs">
                  <div className="text-gray-500 text-[10px] uppercase font-bold">Safari</div>
                  <div className="font-mono font-bold text-gray-800">{item.support.safari || '—'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Links: Spec, Can I Use */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex gap-3">
              {item.spec && item.spec.length > 0 && (
                <a
                  href={item.spec[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  Specification ↗
                </a>
              )}
              {item.caniuse && (
                <a
                  href={`https://caniuse.com/${Array.isArray(item.caniuse) ? item.caniuse[0] : item.caniuse}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:text-amber-900 hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  Can I Use ↗
                </a>
              )}
            </div>

            {item.compat_features && item.compat_features.length > 0 && (
              <span
                className="text-gray-400 font-mono text-[11px] truncate max-w-[160px]"
                title={item.compat_features.join(', ')}
              >
                {item.compat_features[0]}
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Informational Intro Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>🎯 Baseline Features by Year</span>
            </h2>
            <p className="text-sm text-gray-700 mt-1 max-w-3xl leading-relaxed">
              <strong>Baseline Newly Available</strong> identifies the exact point in time when a web platform feature becomes interoperable across all core modern browser engines (Chrome, Edge, Firefox, and Safari on desktop and mobile).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-blue-200 text-center shadow-xs">
              <div className="text-xl font-bold text-blue-700">
                {selectedYear === 'all' ? totalWithBaseline : (yearCounts[selectedYear] || 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {scope === 'css' ? 'CSS Features' : 'Total Features'} {selectedYear !== 'all' ? `(${selectedYear})` : ''}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-emerald-200 text-center shadow-xs">
              <div className="text-xl font-bold text-emerald-700">{years.length}</div>
              <div className="text-xs text-gray-600 font-medium">Recorded Years</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-200/60 flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span><strong>Newly Available:</strong> Supported across all core browser engines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span><strong>Widely Available:</strong> Baseline for 30+ months (safe for universal production use)</span>
          </div>
          <a
            href="https://web.dev/baseline"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline ml-auto font-medium"
          >
            Learn about Web Baseline ↗
          </a>
        </div>
      </div>

      {/* Year Selector Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Select Baseline Year:
          </label>
          <span className="text-xs text-gray-500">
            Click a year to view features that became interoperable in that year
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleYearChange('all')}
            className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              selectedYear === 'all'
                ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-700 ring-offset-1'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>All Years</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full ${selectedYear === 'all' ? 'bg-blue-900 text-blue-100' : 'bg-gray-200 text-gray-700'}`}>
              {totalWithBaseline}
            </span>
          </button>

          {years.map(year => {
            const count = yearCounts[year] || 0;
            const isSelected = selectedYear === year;
            return (
              <button
                key={year}
                type="button"
                onClick={() => handleYearChange(year)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{year}</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-gray-200 text-gray-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search baseline features (e.g. subgrid, :has, color-mix)..."
            value={search}
            onChange={handleSearchChange}
            className="w-full p-2 text-sm border border-gray-300 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Scope: CSS only vs All Web Features */}
        <select
          value={scope}
          onChange={(e) => handleScopeChange(e.target.value)}
          className="p-2 text-sm border border-gray-300 rounded bg-white font-medium text-gray-700"
          title="Filter by feature scope"
        >
          <option value="css">CSS Features Only</option>
          <option value="all">All Web Platform Features</option>
        </select>

        {/* Group / Subcategory */}
        <select
          value={selectedGroup}
          onChange={(e) => handleGroupFilterChange(e.target.value)}
          className="p-2 text-sm border border-gray-300 rounded bg-white text-gray-700 max-w-[200px]"
          title="Filter by feature category"
        >
          <option value="all">All Categories</option>
          {availableGroups.map(grp => (
            <option key={grp.id} value={grp.id}>
              {grp.label}
            </option>
          ))}
        </select>

        {/* Baseline Status */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="p-2 text-sm border border-gray-300 rounded bg-white text-gray-700"
          title="Filter by Baseline status"
        >
          <option value="all">All Baseline Statuses</option>
          <option value="low">Newly Available Only</option>
          <option value="high">Widely Available Only</option>
        </select>

        {/* Pagination Toggle (only when specific year selected) */}
        {selectedYear !== 'all' && (
          <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-gray-300 rounded shrink-0">
            <input
              type="checkbox"
              id="pagination-toggle-baseline"
              checked={paginationEnabled}
              onChange={(e) => setPaginationEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="pagination-toggle-baseline" className="text-xs text-gray-700 select-none cursor-pointer">
              Paginate
            </label>
          </div>
        )}
      </div>

      {/* Results Header / Active Filter Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
        <div>
          Showing <strong className="text-gray-900">{filteredFeatures.length}</strong> {scope === 'css' ? 'CSS' : 'web'} {filteredFeatures.length === 1 ? 'feature' : 'features'}
          {selectedYear !== 'all' && <span> that became baseline in <strong className="text-blue-700">{selectedYear}</strong></span>}
          {search && <span> matching "<strong>{search}</strong>"</span>}
          {selectedGroup !== 'all' && <span> in category "<strong>{availableGroups.find(g => g.id === selectedGroup)?.label}</strong>"</span>}
        </div>
      </div>

      {/* Feature Display */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-lg mb-2">No features found</p>
          <p className="text-gray-400 text-sm">
            Try adjusting your search query, selecting a different year, or switching categories.
          </p>
        </div>
      ) : selectedYear === 'all' && featuresByYearGrouped ? (
        /* Grouped view by year */
        <div className="space-y-10">
          {years.filter(year => featuresByYearGrouped[year] && featuresByYearGrouped[year].length > 0).map(year => {
            const yearList = featuresByYearGrouped[year];
            return (
              <section key={year} className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Baseline {year}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {yearList.length} {yearList.length === 1 ? 'feature' : 'features'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleYearChange(year)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    View only {year} →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearList.map(item => (
                    <FeatureCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Single Year Cards Grid */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedFeatures.map(item => (
              <FeatureCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {paginationEnabled && totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
