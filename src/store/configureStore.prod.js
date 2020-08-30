import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';

const router = routerMiddleware(createHashHistory());

export default function configureStore() {
  return createStore(
    rootReducer,
    applyMiddleware(
      thunk,
      router
    )
  );
};
