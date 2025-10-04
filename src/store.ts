import { createStore, StoreEnhancer } from 'redux';
import reducer from './reducers';

type WindowWithDevTools = Window & {
  __REDUX_DEVTOOLS_EXTENSION__: () => StoreEnhancer<unknown, {}>
}

const isReduxDevtoolsExtenstionExist = (arg: Window | WindowWithDevTools):  arg is WindowWithDevTools  => {
  return  '__REDUX_DEVTOOLS_EXTENSION__' in arg;
}

const store = createStore(
  reducer,
  isReduxDevtoolsExtenstionExist(window) ? window.__REDUX_DEVTOOLS_EXTENSION__() : undefined
);

export { store };
