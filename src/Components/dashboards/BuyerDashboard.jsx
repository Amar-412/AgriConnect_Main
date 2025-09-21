import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import BuyerSearchBar from '../ui/BuyerSearchBar';
import ProductGrid from '../ui/ProductGrid';
import FloatingMiniCart from '../ui/FloatingMiniCart';
import ReviewPopup from '../ui/ReviewPopup';

const BuyerDashboard = () => {
  const { user, allUsers } = useAuth();
  const { products, reviews, addReview, addToCart, cartByUserId, clearCart, placeOrder, messages, sendMessage } = useData();
  const [quantityById, setQuantityById] = useState({});
  const [filters, setFilters] = useState({ category: '', min: '', max: '', location: '' });
  const [search, setSearch] = useState({ query: '', by: 'all' });
  const [reviewProduct, setReviewProduct] = useState(null);
  const myCart = cartByUserId[user?.id] || [];

  const handleOrder = (product) => {
    const quantity = Number(quantityById[product.id] || 1);
    if (!quantity || quantity < 1) return;
    placeOrder({ buyerId: user?.id, productId: product.id, productName: product.name, quantity });
    setQuantityById((prev) => ({ ...prev, [product.id]: '' }));
  };

  const idToName = useMemo(() => Object.fromEntries((allUsers || []).map((u) => [u.id, u.name])), [allUsers]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byText = String(search.query || '').toLowerCase();
      if (byText) {
        const matchesName = String(p.name || '').toLowerCase().includes(byText);
        const matchesCategory = String(p.category || '').toLowerCase().includes(byText);
        const farmerName = String(idToName[p.ownerId] || '').toLowerCase();
        const matchesFarmer = farmerName.includes(byText);
        const ok = search.by === 'name' ? matchesName : search.by === 'category' ? matchesCategory : search.by === 'farmer' ? matchesFarmer : (matchesName || matchesCategory || matchesFarmer);
        if (!ok) return false;
      }
      if (filters.category && String(p.category || '').toLowerCase().indexOf(filters.category.toLowerCase()) === -1) return false;
      if (filters.location && String(p.location || '').toLowerCase().indexOf(filters.location.toLowerCase()) === -1) return false;
      const price = Number(p.price || 0);
      if (filters.min && price < Number(filters.min)) return false;
      if (filters.max && price > Number(filters.max)) return false;
      return true;
    });
  }, [products, filters, search, idToName]);

  const handleAddToCart = (p) => {
    if (!user) return;
    const quantity = Number(quantityById[p.id] || 1);
    addToCart(user.id, { productId: p.id, productName: p.name, price: p.price, quantity });
  };

  const handleCheckout = () => {
    if (!user) return;
    myCart.forEach((item) => placeOrder({ buyerId: user.id, productId: item.productId, productName: item.productName, quantity: item.quantity }));
    clearCart(user.id);
  };

  const handleReview = (product) => {
    setReviewProduct(product);
  };

  const handleSubmitReview = (reviewData) => {
    if (!user) return;
    addReview({
      productId: reviewData.productId,
      farmerId: reviewProduct.ownerId,
      buyerId: user.id,
      buyerName: user.name,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    setReviewProduct(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Marketplace</h2>
      <BuyerSearchBar value={search} onChange={setSearch} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        <input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        <input placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <input placeholder="Min price" type="number" value={filters.min} onChange={(e) => setFilters({ ...filters, min: e.target.value })} />
        <input placeholder="Max price" type="number" value={filters.max} onChange={(e) => setFilters({ ...filters, max: e.target.value })} />
      </div>
      <ProductGrid
        products={filtered.map((p) => ({ ...p, ownerName: idToName[p.ownerId] || 'Unknown' }))}
        quantityById={quantityById}
        setQuantityById={setQuantityById}
        onAddToCart={handleAddToCart}
        onOrder={handleOrder}
        onMessage={(p) => user && sendMessage({ fromUserId: user.id, fromUserName: user.name, toUserId: p.ownerId, body: `Inquiry about ${p.name}` })}
        onReview={handleReview}
        isLoggedIn={!!user}
      />
      <FloatingMiniCart onCheckout={handleCheckout} />
      {user && (
        <div style={{ marginTop: 16 }}>
          <h3>Reviews</h3>
          {filtered.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <em>{p.name}</em>
              <button style={{ marginLeft: 8 }} onClick={() => addReview({ productId: p.id, farmerId: p.ownerId, buyerId: user.id, rating: 5, comment: 'Great quality!' })}>Give 5★</button>
              <ul>
                {reviews.filter((r) => r.productId === p.id).map((r) => (
                  <li key={r.id}>{r.rating}★ — {r.comment}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      {/* Review Popup */}
      {reviewProduct && (
        <ReviewPopup
          product={reviewProduct}
          onClose={() => setReviewProduct(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;


