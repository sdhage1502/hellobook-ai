import { Metadata } from 'next';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FloatingButtons } from './components/ui/FloatingButtons';



export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FloatingButtons />
    </div>
  );
}