import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMenu, reset } from '../features/menu/menuSlice';
import { CATEGORIES } from '../constants/categories';
import MenuItemCard from '../components/MenuItemCard';

function Menu() {
  const dispatch = useDispatch();
  const { items, isLoading, isError, message } = useSelector(state => state.menu);

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

  const byCategory = CATEGORIES.map(category => ({
    category,
    items: items.filter(item => item.category === category),
  })).filter(group => group.items.length > 0);
  return (
    <>
      <header className="menu-hero">
        <h1>Kettle and Fire Coffee Co</h1>
        <p>Fresh roasted. Made to order.</p>
      </header>

      <div className="menu">
        {specials.length > 0 && (
          <div className="specials-section">
            <h2>Today's Specials</h2>
            {specials.map(item => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {byCategory.map(group => (
          <section key={group.category}>
            <h2>{group.category}</h2>
            {group.items.map(item => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export default Menu;
