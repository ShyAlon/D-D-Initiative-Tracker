// Location: client/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainPage from "./MainPage";
import FightPage from "./FightPage";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence  mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MainPage />
            </motion.div>
          }
        />
        <Route
          path="/fight/:id"
          element={
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FightPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;
