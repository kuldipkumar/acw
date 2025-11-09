import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditImageModal from './EditImageModal';

describe('EditImageModal', () => {
  const mockImage = {
    id: '123',
    name: 'Test Cake',
    description: 'A delicious test cake',
    category: 'testing',
    tags: ['test', 'cake'],
    src: 'test.jpg',
    alt: 'A test cake',
  };

  it('renders correctly with image data', () => {
    render(<EditImageModal image={mockImage} onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByLabelText('Title')).toHaveValue('Test Cake');
    expect(screen.getByLabelText('Description')).toHaveValue('A delicious test cake');
    expect(screen.getByLabelText('Category')).toHaveValue('testing');
    expect(screen.getByLabelText('Tags (comma-separated)')).toHaveValue('test, cake');
  });

  it('calls onSave with updated data when save is clicked', () => {
    const handleSave = jest.fn();
    render(<EditImageModal image={mockImage} onClose={() => {}} onSave={handleSave} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Title' } });
    fireEvent.click(screen.getByText('Save'));

    expect(handleSave).toHaveBeenCalledWith('123', {
      title: 'New Title',
      description: 'A delicious test cake',
      category: 'testing',
      tags: ['test', 'cake'],
    });
  });

  it('calls onClose when cancel is clicked', () => {
    const handleClose = jest.fn();
    render(<EditImageModal image={mockImage} onClose={handleClose} onSave={() => {}} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });
});
