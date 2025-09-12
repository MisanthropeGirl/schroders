import React from 'react';
import { render, screen } from '@testing-library/react';
import StockList from './StockList';
import { Table, TableHead, TableCell, TableRow, TableBody } from '@mui/material';
import { dataFetch } from '../../utilities';

describe('StockList', () => {
  it('it renders content', () => {
    render(<StockList/>);
  });
});
