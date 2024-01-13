import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth/Auth";
import { useSelector } from "react-redux";
import { ThemeProvider, createGlobalStyle } from "styled-components";

function App() {
  const user = useSelector((state) => state.authReducer.authData);
  const { darkMode } = useSelector((state) => {
    return state.themeReducer
  });

  const lightTheme = {
    textColor: "#000",
    background: "#f3f3f3",
    cardBg: '#fff',
    ant: '#f3f3f3'
  };

  const darkTheme = {
    textColor: "#fff",
    background: "#000",
    cardBg: '#18191a',
    ant: '#f3f3f3'
  };

  const Global = createGlobalStyle`
    .App {
      background-color: ${({ theme }) => theme.background};
      transition: all 200ms;
      color: ${({ theme }) => theme.textColor};
    }
    .Chat-container, .ChatBox-container {
      background-color: ${({ theme }) => theme.cardBg};
    }
    hr {
      border: 0.1px solid ${({ theme }) => theme.background};
    }
    .conversation:hover {
      background: ${({ theme }) => theme.background};
    }
    .hoverDiv {
      background: ${({ theme }) => theme.background};
    }
    .chat-sender {
      background: ${({ theme }) => theme.cardBg};
    }
    .ant-upload-text {
      color: ${({ theme }) => theme.textColor} !important;
    }
    .ant-btn-primary:disabled {
      color: ${({ theme }) => theme.textColor} !important;
    }
    .authForm {
      background: ${({ theme }) => theme.cardBg};
    }
    .infoInput {
      background: ${({ theme }) => theme.background};
      color: ${({ theme }) => theme.textColor} !important;
    }
  `;

  return (
    <ThemeProvider theme={!darkMode ? lightTheme : darkTheme}>
      <Global />
      <div className="App">
        <div>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="home" /> : <Navigate to="auth" />}
            />
            <Route
              path="/home"
              element={user ? <Home /> : <Navigate to="../auth" />}
            />
            <Route
              path="/auth"
              element={user ? <Navigate to="../home" /> : <Auth />}
            />
            <Route
              path="*"
              element={
                <main style={{ padding: "1rem" }}>
                  <p>There's nothing here!</p>
                </main>
              }
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
