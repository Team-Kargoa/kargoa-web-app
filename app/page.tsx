const TITLE = 'Kargoa Admin Dashboard';
const WELCOME_MESSAGE =
  'Manage driver onboarding, fleet verification, financial ledgers, ' +
  'and disputes.';

export default function HomePage(): JSX.Element {
  return (
    <main>
      <h1>{TITLE}</h1>
      <p>{WELCOME_MESSAGE}</p>
    </main>
  );
}
