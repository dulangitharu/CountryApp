// src/tests/SignInForm.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignInForm from '../components/auth/SignInForm';
import { AuthProvider } from '../context/AuthContext';

describe('SignInForm', () => {
  beforeEach(() => {
    localStorage.setItem('users', JSON.stringify([{ username: 'testuser', password: 'password123' }]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('shows error message on invalid login credentials', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Username'), 'wronguser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });
});