const TITLE = 'Kargoa Admin Dashboard';
const WELCOME_MESSAGE =
  'Manage driver onboarding, fleet verification, financial ledgers, ' +
  'and disputes.';

export default function HomePage() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-primary">{TITLE}</h1>
      <p>{WELCOME_MESSAGE}</p>
    </main>
  );
}
