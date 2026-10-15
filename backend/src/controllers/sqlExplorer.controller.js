const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'Basic SQL',
  'CRUD',
  'Joins',
  'Aggregates',
  'GROUP BY/HAVING',
  'Subqueries',
  'Constraints',
  'Transactions',
  'Views',
  'Indexes',
  'Customer Reports',
  'Driver Reports',
  'Booking Reports',
  'Revenue Reports'
];

/**
 * Loads queries from backend/src/data/sqlQueries.json
 */
function loadQueries() {
  const filePath = path.resolve(__dirname, '../data/sqlQueries.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * GET /api/admin/sql-queries?search=&category=
 * Read-only educational query catalog search and category filtering
 */
function getSqlQueries(req, res) {
  try {
    const { search = '', category = '' } = req.query;
    const queries = loadQueries();

    // Category counts for quick chip badges
    const categoryCounts = {};
    CATEGORIES.forEach(cat => {
      categoryCounts[cat] = queries.filter(q => q.category === cat).length;
    });

    let filtered = [...queries];

    // Category filter
    if (category && category !== 'All') {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }

    // Debounced search term filtering across title, SQL, tags, dbmsConcept, tablesInvolved
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(q => {
        const matchTitle = (q.title || '').toLowerCase().includes(term);
        const matchSql = (q.sql || '').toLowerCase().includes(term);
        const matchConcept = (q.dbmsConcept || '').toLowerCase().includes(term);
        const matchUseCase = (q.useCase || '').toLowerCase().includes(term);
        const matchTags = Array.isArray(q.tags) && q.tags.some(t => t.toLowerCase().includes(term));
        const matchTables = Array.isArray(q.tablesInvolved) && q.tablesInvolved.some(t => t.toLowerCase().includes(term));
        const matchExplanation = Array.isArray(q.explanation) && q.explanation.some(e => 
          (e.line || '').toLowerCase().includes(term) || (e.text || '').toLowerCase().includes(term)
        );
        return matchTitle || matchSql || matchConcept || matchUseCase || matchTags || matchTables || matchExplanation;
      });
    }

    res.json({
      success: true,
      total: filtered.length,
      catalogTotal: queries.length,
      categories: CATEGORIES,
      categoryCounts,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load SQL Query catalog.', error: error.message });
  }
}

/**
 * GET /api/admin/sql-queries/:id
 * Retrieve full query detail by id
 */
function getSqlQueryById(req, res) {
  try {
    const identifier = req.params.id;
    const queries = loadQueries();
    const query = queries.find(q => q.id.toString() === identifier);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: `SQL Query with ID '${identifier}' not found in educational catalog.`
      });
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve query details.', error: error.message });
  }
}

module.exports = {
  CATEGORIES,
  getSqlQueries,
  getSqlQueryById
};
