import { PropsWithChildren, useEffect } from 'react';
import { LucideTaroProvider } from 'lucide-react-taro';
import '@/app.css';
import { Toaster } from '@/components/ui/toast';
import { Preset } from './presets';
import { startBGM, preloadSounds } from '@/lib/sound';

const App = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    preloadSounds()
    startBGM()
    // 登录守卫：未登录时跳转
    const token = localStorage.getItem('token')
    const hash = window.location.hash
    const isAuthPage = hash.includes('signin') || hash.includes('register')
    if (!token && !isAuthPage) {
      window.location.hash = '#/pages/signin/index'
    }
  }, [])

  return (
    <LucideTaroProvider defaultColor="#000" defaultSize={24}>
      <Preset>{children}</Preset>
      <Toaster />
    </LucideTaroProvider>
  );
};

export default App;
