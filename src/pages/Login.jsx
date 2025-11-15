export default function Login() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || '/';

  const handleLogin = () => {
    // For now, just redirect back
    window.location.assign(redirect);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Login</h1>
      <p>Local auth stub — click to proceed</p>
      <button onClick={handleLogin} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Continue to {redirect}
      </button>
    </div>
  );
}