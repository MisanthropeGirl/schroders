import React from 'react';
import { render, screen } from '@testing-library/react';
import StockList from './StockList';

describe('StockList', () => {
  const selectedTickers: string[] = [];
  const changeSelectedTickers = (e: React.ChangeEvent<HTMLInputElement>): void => {};

  it('it renders content', () => {
    render(<StockList selectedTickers={selectedTickers} changeSelectedTickers={changeSelectedTickers} />);
  });

  it('Table body has children', () => {
    render(<StockList selectedTickers={selectedTickers} changeSelectedTickers={changeSelectedTickers} />);
    const tbody = document.getElementsByName('tbody')[0];
    expect(tbody.children).toBeGreaterThan(0);
  })
});
