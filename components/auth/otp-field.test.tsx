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
  expect(screen.getByLabelText(/digit 1 of 6/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/digit 6 of 6/i)).toBeInTheDocument();
});

it('rejects a non-digit character and does not advance focus', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();

  boxes[0].focus();
  fireEvent.change(boxes[0], { target: { value: 'a' } });

  expect(boxes[0]).toHaveValue('');
  expect(boxes[0]).toHaveFocus();
});

it('updates the hidden input when a filled box is cleared', () => {
  const { container } = render(<OtpField name="code" />);
  const boxes = getBoxes();
  const hidden = container.querySelector('input[type="hidden"]');

  fireEvent.change(boxes[0], { target: { value: '5' } });
  expect(hidden).toHaveValue('5');

  fireEvent.change(boxes[0], { target: { value: '' } });
  expect(hidden).toHaveValue('');
});

it('keeps each box independent when they are filled out of order', () => {
  render(<OtpField name="code" />);
  const boxes = getBoxes();

  fireEvent.change(boxes[2], { target: { value: '7' } });
  fireEvent.change(boxes[0], { target: { value: '3' } });
  fireEvent.change(boxes[1], { target: { value: '4' } });

  expect(boxes[0]).toHaveValue('3');
  expect(boxes[1]).toHaveValue('4');
  expect(boxes[2]).toHaveValue('7');
});

it('renders no divider by default', () => {
  const { container } = render(<OtpField name="code" />);
  expect(container.querySelector('[data-testid="otp-divider"]')).toBeNull();
});

it('renders a decorative divider between the given box index and the next one', () => {
  const { container } = render(<OtpField name="code" dividerAfterIndex={2} />);
  const boxes = getBoxes();
  const divider = container.querySelector('[data-testid="otp-divider"]');

  expect(divider).not.toBeNull();
  expect(divider).toHaveAttribute('aria-hidden', 'true');
  // Divider must sit in the DOM strictly between box 3 (index 2) and box 4 (index 3).
  expect(
    boxes[2].compareDocumentPosition(divider as Node) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    boxes[3].compareDocumentPosition(divider as Node) &
      Node.DOCUMENT_POSITION_PRECEDING,
  ).toBeTruthy();
});
