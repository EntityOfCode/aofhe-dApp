import { useEffect, useState } from "react";
import FheDemo from './FheDemo'
import axios from "axios";

const BlogSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MAX_RETRIES = 3; // Maximum number of retries
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds

  const fetchFeed = async (retryCount = 0) => {
    try {
      setLoading(false);
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => fetchFeed(retryCount + 1), RETRY_DELAY);
      } else {
        setError(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-200"></div>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-lg font-medium text-red-500">
        Error: {error.message}
      </p>
    );

  return (
    <section >
      <h2 className="text-2xl font-bold mt-10 mb-16 text-center uppercase">
        AO Run: Fully Homomorphic Encryption Demo
      </h2>
      <div >
        <FheDemo />
      </div>
    </section>
  );
};

export default BlogSection;
