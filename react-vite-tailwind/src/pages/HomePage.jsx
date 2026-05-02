import { useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import HeroSlider from '../components/HeroSlider';
import CategoryCircles from '../components/CategoryCircles';
import TrendingInfluencers from '../components/TrendingInfluencers';
// import CategorySection from '../components/CategorySection';
import { categories } from '../data/mockData';

const HomePage = ({ config }) => {
  const { params } = useRouter();

  useEffect(() => {
    if (params.scroll) {
      const el = document.getElementById(params.scroll);
      if (el) {
        // Small delay to ensure rendering and avoid conflict with window.scrollTo(0,0) in navigate
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [params.scroll]);

  return (
    <>
      <HeroSlider config={config} />
      <CategoryCircles config={config} />
      <TrendingInfluencers config={config} />
      {/* {categories.slice(0, 4).map(category => (
        <CategorySection key={category.id} category={category} config={config} />
      ))} */}
    </>
  );
};

export default HomePage;
