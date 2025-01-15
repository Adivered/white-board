import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  auth: null,
  setAuth: () => {},
  user: null,
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  // const { setSocketAuth } = useSocket();


  useEffect(() => {
    const isAuth = async () => {
        if (!auth) {
          if (!localStorage.getItem('session')) {
            return;
          }
        }
        try {
          //https://white-board-29h1.onrender.com/token
          //http://192.168.1.134:3000/
          fetch('/token', {
              method: 'GET',
              headers: {
              'x-auth': JSON.parse(localStorage.getItem('token')),
              'Content-Type': 'application/json',
              },
              credentials: 'include',
              })
              .then((res) => res.json().then(data => ({ status: res.status, body: data })))
              .then(({ status, body }) => {
              if (status === 200) {
                console.log('Response:', body);
                setUser(body.user);
                // setSocketAuth(true);
              }
          })
        }
        catch(err) {
            console.error('Error refreshing token:', err);
            setUser(null);
        };
    };

    isAuth();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;