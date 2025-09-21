import React from 'react';

const BuyerSearchBar = ({ value, onChange }) => {
  const handleQuery = (e) => onChange({ ...value, query: e.target.value });
  const handleBy = (e) => onChange({ ...value, by: e.target.value });
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
      <input
        style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
        placeholder="Search by name, category, or farmer"
        value={value.query}
        onChange={handleQuery}
      />
      <select style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }} value={value.by} onChange={handleBy}>
        <option value="all">All</option>
        <option value="name">Name</option>
        <option value="category">Category</option>
        <option value="farmer">Farmer</option>
      </select>
    </div>
  );
};

export default BuyerSearchBar;


