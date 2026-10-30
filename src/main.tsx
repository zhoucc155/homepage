import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 关闭浏览器的刷新滚动位置恢复（默认 auto）：刷新后回到页面顶部，而不是停留在刷新前的位置
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(<App />);
