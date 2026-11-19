import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMenu, reset } from '../features/menu/menuSlice';
import MenuItemCard from '../components/MenuItemCard';
import './Home.css';

function Home() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector(state => state.menu);

  useEffect(() => {
    dispatch(getMenu());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const specials = items.filter(item => item.isSpecial);
  const hotDrinks = items.filter(item => item.category === 'Hot');
  const pastries = items.filter(item => item.category === 'Pastry');

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Kettle and Fire Coffee Co</h1>
          <p>Fresh roasted. Made to order.</p>
          <Link to="/menu" className="btn btn-hero">
            Order Now
          </Link>
        </div>
      </section>

      {/* Featured Section */}
      {specials.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Featured</span>
              <h2>Today's Specials</h2>
              <p>Limited time favorites, made fresh daily</p>
            </div>
            <div className="featured-grid">
              {specials.slice(0, 3).map(item => (
                <div key={item._id} className="featured-card">
                  <div className="featured-badge">Special</div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="featured-price">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Our Menu</span>
            <h2>Browse by Category</h2>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">☕</div>
              <h3>Espresso</h3>
              <p>Bold and smooth shots</p>
              <Link to="/menu" className="category-link">
                Shop Now →
              </Link>
            </div>
            <div className="category-card">
              <div className="category-icon">🔥</div>
              <h3>Hot Drinks</h3>
              <p>Warm and comforting</p>
              <Link to="/menu" className="category-link">
                Shop Now →
              </Link>
            </div>
            <div className="category-card">
              <div className="category-icon">🧊</div>
              <h3>Iced Drinks</h3>
              <p>Cool and refreshing</p>
              <Link to="/menu" className="category-link">
                Shop Now →
              </Link>
            </div>
            <div className="category-card">
              <div className="category-icon">🧁</div>
              <h3>Pastries</h3>
              <p>Fresh baked daily</p>
              <Link to="/menu" className="category-link">
                Shop Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Drinks Showcase */}
      {hotDrinks.length > 0 && (
        <section className="showcase-section">
          <div className="container">
            <div className="showcase-header">
              <h2>Our Hot Favorites</h2>
              <p>Handcrafted hot beverages made with passion</p>
            </div>
            <div className="menu-grid">
              {hotDrinks.slice(0, 6).map(item => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>
            <div className="section-cta">
              <Link to="/menu" className="btn btn-secondary">
                See Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why Choose Us</span>
            <h2>Crafted with Care</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌾</div>
              <h3>Fresh Roasted</h3>
              <p>All our beans are roasted fresh in small batches for maximum flavor</p>
            </div>
            <div className="value-card">
              <div className="value-icon">👨‍🍳</div>
              <h3>Made to Order</h3>
              <p>Every drink is prepared individually for quality and customization</p>
            </div>
            <div className="value-card">
              <div className="value-icon">♻️</div>
              <h3>Sustainable</h3>
              <p>We source ethically and use eco-friendly practices throughout</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready for Your Next Cup?</h2>
          <p>Visit our menu and discover your new favorite drink</p>
          <Link to="/menu" className="btn btn-primary">
            Start Ordering
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
