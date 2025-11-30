// ====== FUNÇÃO AUXILIAR ======
function getUsers() {
  const usersJSON = localStorage.getItem('vh_users');
  return usersJSON ? JSON.parse(usersJSON) : [];
}

// ====== LÓGICA DO LOGIN ======
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value.trim();
    const senha = form.querySelector('input[type="password"]').value;

    const raw = localStorage.getItem('vh_users');
    const usuarios = raw ? JSON.parse(raw) : [];

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
      alert('E-mail ou senha inválidos.');
      return;
    }

    localStorage.setItem('vh_loggedUser', JSON.stringify(usuario));

    alert('Login realizado com sucesso!');
    window.location.href = '/pagina_inicial/index.html';
  });
});
