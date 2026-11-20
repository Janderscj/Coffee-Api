import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMenu, reset } from '../features/menu/menuSlice';
import { CATEGORIES } from '../constants/categories';
import MenuItemCard from '../components/MenuItemCard';
import './Menu.css';

const CATEGORY_ICONS = {
  Specials: '⭐',
  Espresso: '☕',
  Hot: '🔥',
  Iced: '🧊',
  Tea: '🫖',
  Protein: '💪',
  'Caffeine Free': '☘️',
  Pastry: '🧁',
};

function Menu() {
  const dispatch = useDispatch();
  const { items, isLoading, isError, message } = useSelector(state => state.menu);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(getMenu());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const query = searchQuery.trim().toLowerCase();
  const hasSpecials = items.some(item => item.isSpecial);

  const displayedItems = useMemo(() => {
    // Searching looks at the whole menu; otherwise show the selected tab
    if (query) {
      return items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          (item.description || '').toLowerCase().includes(query)
      );
    }
    if (selectedCategory === 'All') return items;
    if (selectedCategory === 'Specials') return items.filter(item => item.isSpecial);
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory, query]);

  if (isLoading) return <p>Loading menu...</p>;
  if (isError) return <p>Couldn't load the menu: {message}</p>;
  if (items.length === 0) return <p>The menu is empty right now. Check back soon!</p>;

  const tabs = ['All', ...(hasSpecials ? ['Specials'] : []), ...CATEGORIES];

  return (
    <>
      <header className="menu-hero">
        <h1>Our Menu</h1>
        <p>Fresh roasted. Made to order.</p>
      </header>

      <div className="menu-container">
        <aside className="menu-sidebar">
          <nav className="category-nav">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`category-btn ${selectedCategory === tab && !query ? 'active' : ''}`}
                aria-pressed={selectedCategory === tab && !query}
                onClick={() => {
                  setSelectedCategory(tab);
                  setSearchQuery('');
                }}
              >
                {CATEGORY_ICONS[tab] && (
                  <span className="category-icon">{CATEGORY_ICONS[tab]}</span>
                )}
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <main className="menu-content">
          <div className="menu-header">
            <h2>{query ? `Results for "${searchQuery.trim()}"` : selectedCategory}</h2>
            <p>{displayedItems.length} items</p>
          </div>

          <div className="menu-search">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {displayedItems.length > 0 ? (
            <div className="menu-items">
              {displayedItems.map(item => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty-message">
              <p>{query ? 'No items match your search' : 'No items available in this category'}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Menu;
