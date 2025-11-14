import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { adminAPI } from '../../services/api';

// Blog Form Modal Component
const BlogFormModal = ({ isOpen, onClose, blog, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    category: '',
    publishDate: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        image: blog.image || '',
        category: blog.category || '',
        publishDate: blog.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        content: '',
        image: '',
        category: '',
        publishDate: new Date().toISOString().split('T')[0] // Default to today's date
      });
    }
    setErrors({});
  }, [blog, isOpen]);

  useEffect(() => {
    if (isOpen && quillRef.current && !quillInstance.current) {
      // Initialize Quill
      const options = {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              ['link', 'image', 'video'],
              ['table'],
              ['blockquote', 'code-block'],
              ['clean']
            ],
            handlers: {
              table: function() {
                const tableHTML = `
                  <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 1</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 2</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">Row 1, Col 1</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Row 1, Col 2</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Row 1, Col 3</td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">Row 2, Col 1</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Row 2, Col 2</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Row 2, Col 3</td>
                      </tr>
                    </tbody>
                  </table>
                `;
                const range = this.quill.getSelection();
                this.quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
              }
            }
          }
        },
        placeholder: 'Write your blog content here...'
      };

      quillInstance.current = new Quill(quillRef.current, options);

      // Set initial content
      if (blog?.content) {
        quillInstance.current.root.innerHTML = blog.content;
      }

      // Listen for content changes
      quillInstance.current.on('text-change', () => {
        const content = quillInstance.current.root.innerHTML;
        setFormData(prev => ({ ...prev, content }));
      });
    } else if (!isOpen && quillInstance.current) {
      // Cleanup
      quillInstance.current = null;
    }
  }, [isOpen, blog]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Image must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category.trim() || null,
        publishDate: formData.publishDate
      };

      if (formData.image.trim()) {
        dataToSend.image = formData.image.trim();
      }

      if (blog) {
        await adminAPI.updateBlog(blog.id, dataToSend);
      } else {
        await adminAPI.createBlog(dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving blog. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const errorStyle = {
    color: '#f44336',
    fontSize: '12px',
    marginTop: '4px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  const quillContainerStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    minHeight: '300px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {blog ? 'Edit Blog' : 'Create Blog'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: errors.title ? '#f44336' : '#d1d5db'
                }}
                placeholder="Enter blog title"
                required
              />
              {errors.title && <div style={errorStyle}>{errors.title}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={inputStyle}
                placeholder="e.g., Technology, News, Lifestyle"
              />
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Publish Date *</label>
            <input
              type="date"
              value={formData.publishDate}
              onChange={(e) => handleInputChange('publishDate', e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.publishDate ? '#f44336' : '#d1d5db'
              }}
              required
            />
            {errors.publishDate && <div style={errorStyle}>{errors.publishDate}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.image ? '#f44336' : '#d1d5db'
              }}
              placeholder="https://example.com/image.jpg"
            />
            {errors.image && <div style={errorStyle}>{errors.image}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Content *</label>
            <div style={quillContainerStyle}>
              <div ref={quillRef} style={{ minHeight: '250px' }}></div>
            </div>
            {errors.content && <div style={errorStyle}>{errors.content}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (blog ? 'Update Blog' : 'Create Blog')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogFormModal;