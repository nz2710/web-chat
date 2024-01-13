import { combineReducers } from "redux";

import authReducer from "./AuthReducer";
import postReducer from "./PostReducer";
import chatReducer from "./ChatUserReducer";
import themeReducer from "./ThemeReducer";

export const reducers = combineReducers({authReducer,postReducer, chatReducer, themeReducer})