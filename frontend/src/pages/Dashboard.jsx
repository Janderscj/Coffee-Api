import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reset,
} from '../features/menu/menuSlice.js';
import { CATEGORIES } from '../constants/categories.js';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: CATEGORIES[0],
  isSpecial: false,
  available: true,
};

const formatPrice = price => `$${Number(price).toFixed(2)}`;

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const { items, isLoading, isError, message } = useSelector(state => state.menu);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // Guard: only admins belong here (the server enforces this too)
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load everything, including unavailable items
  useEffect(() => {
    if (user && user.role === 'admin') {
      dispatch(getAllMenu());
    }
    return () => {
      dispatch(reset());
    };
  }, [user, dispatch]);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async e => {
    e.preventDefault();

    const itemData = { ...formData, price: Number(formData.price) };

    if (editingId) {
      await dispatch(updateMenuItem({ id: editingId, itemData }));
    } else {
      await dispatch(createMenuItem(itemData));
    }

    setFormData(emptyForm);
    setEditingId(null);
  };

  const startEdit = item => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isSpecial: item.isSpecial,
      available: item.available,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const toggleAvailable = item => {
    dispatch(updateMenuItem({ id: item._id, itemData: { available: !item.available } }));
  };

  const onDelete = item => {
    if (window.confirm(`Delete "${item.name}"?`)) {
      dispatch(deleteMenuItem(item._id));
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="dashboard">
      <h1>Menu Admin</h1>

      <form onSubmit={onSubmit} className="menu-form">
        <h2>{editingId ? 'Edit item' : 'Add item'}</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={onChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={onChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={onChange}
          required
        />

        <select name="category" value={formData.category} onChange={onChange}>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            name="isSpecial"
            checked={formData.isSpecial}
            onChange={onChange}
          />
          Today's special
        </label>

        <label>
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={onChange}
          />
          Available
        </label>

        <button type="submit">{editingId ? 'Save changes' : 'Add item'}</button>
        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {isError && <p className="error">{message}</p>}

      <h2>Current menu</h2>
      {isLoading && items.length === 0 ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No menu items yet. Add your first one above.</p>
      ) : (
        <div className="table-wrap">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Special</th>
                <th>Available</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className={item.available ? '' : 'unavailable'}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.isSpecial ? '★' : ''}</td>
                  <td>
                    <button onClick={() => toggleAvailable(item)}>
                      {item.available ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => startEdit(item)}>Edit</button>
                    <button className="danger" onClick={() => onDelete(item)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
