import React, { useState, useMemo } from 'react';

const SearchAndFilter = ({ students, onFilter, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterByCourse, setFilterByCourse] = useState('');

  // Get unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    return [...new Set(students.map(student => student.course))].sort();
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = filterByCourse === '' || student.course === filterByCourse;
      
      return matchesSearch && matchesCourse;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [students, searchTerm, sortBy, sortOrder, filterByCourse]);

  // Call the parent callback whenever filters change
  React.useEffect(() => {
    onFilter(filteredStudents);
  }, [filteredStudents, onFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('name');
    setSortOrder('asc');
    setFilterByCourse('');
  };

  return (
    <div className={`search-filter-container ${className}`}>
      <div className="search-filter-row">
        <div className="search-group">
          <label htmlFor="search">🔍 Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search by name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="course-filter">📚 Course</label>
          <select
            id="course-filter"
            value={filterByCourse}
            onChange={(e) => setFilterByCourse(e.target.value)}
            className="filter-select"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
        
        <div className="sort-group">
          <label htmlFor="sort-by">📊 Sort by</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="course">Course</option>
          </select>
        </div>
        
        <div className="order-group">
          <label htmlFor="sort-order">📈 Order</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="order-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        
        <button onClick={clearFilters} className="clear-filters-btn" title="Clear all filters">
          🗑️ Clear
        </button>
      </div>
      
      <div className="filter-summary">
        Showing {filteredStudents.length} of {students.length} students
        {(searchTerm || filterByCourse) && (
          <span className="active-filters">
            {searchTerm && <span className="filter-tag">Search: "{searchTerm}"</span>}
            {filterByCourse && <span className="filter-tag">Course: {filterByCourse}</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;