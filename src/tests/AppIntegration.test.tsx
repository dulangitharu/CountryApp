// src/tests/AppIntegration.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../App';

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.setItem('users', JSON.stringify([{ username: 'testuser', password: 'password123' }]));
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', token: 'fake-token' }));
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('logs in, searches for a country, and preserves search state on refresh', async () => {
    render(
      <MemoryRouter initialEntries={['/signin']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText('Search countries by name...'), 'France');
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
    });

    expect(sessionStorage.getItem('countriesSearchTerm')).toBe('France');

    render(
      <MemoryRouter initialEntries={['/countries']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search countries by name...')).toHaveValue('France');
    });
  });
});