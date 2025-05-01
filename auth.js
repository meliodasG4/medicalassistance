class Auth {
  static checkSession() {
      return fetch('check_session.php')
          .then(response => response.json())
          .then(data => data.authenticated);
  }

  static logout() {
      return fetch('logout.php')
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  sessionStorage.clear();
              }
              return data;
          });
  }
}