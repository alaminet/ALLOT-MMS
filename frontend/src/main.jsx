import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ant-design/v5-patch-for-react-19';
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import store from "./features/store.js";
import 'ckeditor5/ckeditor5.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
    <App />
    </Provider>
  </StrictMode>,
)
