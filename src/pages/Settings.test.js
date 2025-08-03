import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../store';
import Settings from './Settings';
import { MemoryRouter } from 'react-router-dom';

test('toggles sound option', async () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    </Provider>
  );
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeChecked();
  await userEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
});

test('changes difficulty selection', async () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    </Provider>
  );
  const select = screen.getByRole('combobox');
  await userEvent.selectOptions(select, 'hard');
  expect(select).toHaveValue('hard');
});
