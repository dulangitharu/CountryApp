import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CountryExplorer from '../CountryExplorer';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

test('renders CountryExplorer and filters countries', async () => {
  render(
    <MemoryRouter>
      <CountryExplorer />
    </MemoryRouter>
  );

  expect(screen.getByRole('status')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Afghanistan/i)).toBeInTheDocument();
  });

  const searchInput = screen.getByPlaceholderText('Search...');
  fireEvent.change(searchInput, { target: { value: 'Canada' } });
  await waitFor(() => {
    expect(screen.getByText(/Canada/i)).toBeInTheDocument();
    expect(screen.queryByText(/Afghanistan/i)).not.toBeInTheDocument();
  });
});