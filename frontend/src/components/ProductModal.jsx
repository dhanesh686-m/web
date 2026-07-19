import React, { useState, useEffect } from 'react';

export default function ProductModal({ isOpen, item, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setDescription(item.description || '');
      setPrice(item.price || '');
      setQuantity(item.quantity || '');
      setImage(item.image || '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setImage('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: item ? item._id || item.id : null,
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      image: image.trim()
    });
  };

  return (
    <div className="modal-backdrop active" id="item-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="item-modal-title">{item ? 'Edit Catalog Product' : 'Create Catalog Entry'}</h3>
          <button className="close-modal" onClick={onClose} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="item-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-item-name">Product Name</label>
            <input 
              type="text" 
              id="modal-item-name" 
              className="form-control" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-item-desc">Product Description</label>
            <textarea 
              id="modal-item-desc" 
              rows="2" 
              className="form-control" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-row flex gap-4 w-full" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group flex-1" style={{ flex: 1 }}>
              <label htmlFor="modal-item-price">Price ($)</label>
              <input 
                type="number" 
                id="modal-item-price" 
                className="form-control" 
                step="0.01" 
                min="0.01" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
            </div>
            <div className="form-group flex-1" style={{ flex: 1 }}>
              <label htmlFor="modal-item-qty">Inventory Qty</label>
              <input 
                type="number" 
                id="modal-item-qty" 
                className="form-control" 
                min="0" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="modal-item-image">Image URL</label>
            <input 
              type="url" 
              id="modal-item-image" 
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full mt-4">Save Product</button>
        </form>
      </div>
    </div>
  );
}
