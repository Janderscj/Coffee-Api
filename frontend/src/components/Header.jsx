import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);

  const onLogin = () => {
    navigate('/login');
  };
  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Home</Link>
      </div>
      <ul>
        {user ? (
          <>
            {user.role === 'admin' && (
              <li>
                <button className="btn" onClick={() => navigate('/admin')}>
                  Admin
                </button>
              </li>
            )}
            <li>
              <button className="btn btn-reverse" onClick={onLogout}>
                {' '}
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <button className="btn" onClick={onLogin}>
              Staff login
            </button>
          </li>
        )}
      </ul>
    </header>
  );
}

export default Header;
