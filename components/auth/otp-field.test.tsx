import { fireEvent, render, screen } from '@testing-library/react';
import { OtpField } from './otp-field';

function getBoxes() {
  return screen.getAllByRole('textbox');
}

it('renders six single-character boxes', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();
  expect(boxes).toHaveLength(6);
  boxes.forEach((box) => {
    expect(box).toHaveAttribute('maxLength', '1');
  });
});

it('renders one hidden input under the given name, starting empty', () => {
  const { container } = render(<OtpField name="code" />);
  const hidden = container.querySelector('input[type="hidden"]');
  expect(hidden).toHaveAttribute('name', 'code');
  expect(hidden).toHaveValue('');
});

it('moves focus to the next box after typing a digit', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();

  fireEvent.change(boxes[0], { target: { value: '1' } });

  expect(boxes[1]).toHaveFocus();
});

it('does not advance focus past the last box', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();

  boxes[5].focus();
  fireEvent.change(boxes[5], { target: { value: '9' } });

  expect(boxes[5]).toHaveFocus();
});

it('moves focus back to the previous box on Backspace when the current box is empty', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();

  fireEvent.change(boxes[0], { target: { value: '1' } });
  boxes[1].focus();
  fireEvent.keyDown(boxes[1], { key: 'Backspace' });

  expect(boxes[0]).toHaveFocus();
});

it('does not move focus back on Backspace when the current box still has a value', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();

  fireEvent.change(boxes[1], { target: { value: '5' } });
  // Typing auto-advanced focus to box 2; move back to the still-filled box 1
  // to simulate a user pressing Backspace there before the value is cleared.
  boxes[1].focus();
  fireEvent.keyDown(boxes[1], { key: 'Backspace' });

  expect(boxes[1]).toHaveFocus();
});

it('joins six typed digits into the hidden input value', () => {
  const { container } = render(<OtpField name="code" />);
  const boxes = getBoxes();
  const code = ['4', '8', '2', '9', '1', '5'];

  code.forEach((digit, index) => {
    fireEvent.change(boxes[index], { target: { value: digit } });
  });

  const hidden = container.querySelector('input[type="hidden"]');
  expect(hidden).toHaveValue('482915');
});

it('labels each box for screen reader users', () => {
  render(<OtpField name="code" />);
  expect(
    screen.getByLabelText(/digit 1 of 6/i),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText(/digit 6 of 6/i),
  ).toBeInTheDocument();
});
