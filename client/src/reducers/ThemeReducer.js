const themeReducer = (
  state = { darkMode: localStorage.getItem('theme') ? true : false },
  action
) => {
  switch (action.type) {
    case "SWITCH_MODE":
      localStorage.setItem('theme', !state.darkMode);
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
};

export default themeReducer;
