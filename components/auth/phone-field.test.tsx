import { fireEvent, render, screen } from '@testing-library/react';
import { PhoneField } from './phone-field';

it('renders a labelled input', () => {
  render(<PhoneField name="phone_number" />);
  expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
});

it('carries the given name on the visible input', () => {
  render(<PhoneField name="phone_number" />);
  expect(screen.getByLabelText(/phone number/i)).toHaveAttribute(
    'name',
    'phone_number',
  );
});

it('sets inputMode to tel and applies the mono font for the phone value', () => {
  render(<PhoneField name="phone_number" />);
  const input = screen.getByLabelText(/phone number/i);
  expect(input).toHaveAttribute('inputMode', 'tel');
  expect(input).toHaveClass('font-mono');
});

it('shows the +237 country prefix as part of the input value', () => {
  render(<PhoneField name="phone_number" />);
  const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
  expect(input.value).toBe('+237');
});

it('submits the complete +237-prefixed number when the user types local digits', () => {
  render(<PhoneField name="phone_number" />);
  const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;

  fireEvent.change(input, { target: { value: '+237699887766' } });

  expect(input.value).toBe('+237699887766');
});

it('keeps the +237 prefix even if the user manages to clear the field', () => {
  render(<PhoneField name="phone_number" />);
  const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;

  fireEvent.change(input, { target: { value: '' } });

  expect(input.value).toBe('+237');
});

it('caps the local portion at 9 digits so the field cannot exceed a valid number', () => {
  render(<PhoneField name="phone_number" />);
  const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;

  fireEvent.change(input, { target: { value: '+2376998877661234' } });

  expect(input.value).toBe('+237699887766');
});
