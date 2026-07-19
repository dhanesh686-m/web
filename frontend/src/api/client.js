export async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const session = localStorage.getItem('swift_session_user');
  if (session) {
    const currentUser = JSON.parse(session);
    headers['X-User-Id'] = currentUser.id;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(endpoint, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    return data;
  } catch (err) {
    alert(`API Error: ${err.message}`);
    throw err;
  }
}
