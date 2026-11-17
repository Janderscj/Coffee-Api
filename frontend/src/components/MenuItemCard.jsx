const formatPrice = price => `$${Number(price).toFixed(2)}`;

function MenuItemCard({ item }) {
  return (
    <div className="menu-item">
      <div className="menu-item-header">
        <h4>{item.name}</h4>
        {item.isSpecial && <span className="badge">Special</span>}
        <span className="dots" />
        <span className="price">{formatPrice(item.price)}</span>
      </div>
      {item.description && <p>{item.description}</p>}
    </div>
  );
}
export default MenuItemCard;
