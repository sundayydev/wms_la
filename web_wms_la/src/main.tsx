import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ConfigProvider } from 'antd';

createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={{
    token: {
      // Setup font chữ toàn cục cho Ant Design
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
    },
  }}>
    <RouterProvider router={router} />
  </ConfigProvider>
)
