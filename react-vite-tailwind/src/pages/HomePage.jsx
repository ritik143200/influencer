import HeroSlider from '../components/HeroSlider';
import CategoryCircles from '../components/CategoryCircles';
import TrendingInfluencers from '../components/TrendingInfluencers';
import CategorySection from '../components/CategorySection';
import { categories } from '../data/mockData';

const HomePage = ({ config }) => {
  return (
    <>
      <HeroSlider config={config} />
      <CategoryCircles config={config} />
      <TrendingInfluencers config={config} />
      {categories.slice(0, 4).map(category => (
        <CategorySection key={category.id} category={category} config={config} />
      ))}
    </>
  );
};

export default HomePage;
