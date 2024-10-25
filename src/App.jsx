import Footer from "./components/Footer";
import Header from "./components/Header";
import BlogSection from "./components/BlogSection";
// import FheDemo from './components/FheDemo'

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col top-0 text-white">
      <Header />
      <div >
        <BlogSection />
      </div>
      <Footer />
    </div>
  );
}

export default App;
