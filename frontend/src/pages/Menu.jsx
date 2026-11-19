import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMenu, reset } from '../features/menu/menuSlice';
import { CATEGORIES } from '../constants/categories';
import MenuItemCard from '../components/MenuItemCard';
import './Menu.css';

function Menu() {
  const dispatch = useDispatch();
  const { items, isLoading, isError, message } = useSelector(state => state.menu);
  const [selectedCategory, setSelectedCategory] = useState('Specials');

  useEffect(() => {
    dispatch(getMenu());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (isLoading) return <p>Loading menu...</p>;
  if (isError) return <p>Couldn't load the menu: {message}</p>;
  if (items.length === 0) return <p>The menu is empty right now. Check back soon!</p>;

  const specials = items.filter(item => item.isSpecial);

  const getDisplayedItems = () => {
    if (selectedCategory === 'Specials') {
      return specials;
    }
    return items.filter(item => item.category === selectedCategory);
  };

  const displayedItems = getDisplayedItems();

  return (
    <>
      <header className="menu-hero">
        <h1>Our Menu</h1>
        <p>Fresh roasted. Made to order.</p>
      </header>

      <div className="menu-container">
        {/* Sidebar */}
        <aside className="menu-sidebar">
          <nav className="category-nav">
            <button
              className={`category-btn ${selectedCategory === 'Specials' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Specials')}
            >
              <span className="category-icon">⭐</span>
              Specials
            </button>

            {CATEGORIES.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-icon">
                  {category === 'Espresso' && '☕'}
                  {category === 'Hot' && '🔥'}
                  {category === 'Iced' && '🧊'}
                  {category === 'Tea' && '🫖'}
                  {category === 'Protein' && '💪'}
                  {category === 'Caffeine Free' && '☘️'}
                  {category === 'Pastry' && '🧁'}
                </span>
                {category}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="menu-content">
          <div className="menu-header">
            <h2>{selectedCategory}</h2>
            <p>{displayedItems.length} items</p>
          </div>

          {displayedItems.length > 0 ? (
            <div className="menu-items">
              {displayedItems.map(item => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty-message">
              <p>No items available in this category</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Menu;
