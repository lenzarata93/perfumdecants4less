
import "./BestSellers.css";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { API_URL } from "../config";

function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/orders/best-sellers`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Грешка при зареждане на най-продаваните продукти."
          );
        }

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error(
          "Best sellers error:",
          err
        );

        setError(
          "В момента не можем да заредим най-продаваните аромати."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBestSellers();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="best-sellers-section">
      <div className="section-container">

        <div className="best-sellers-heading">
          <div>
            <p className="section-eyebrow">
              BESTSELLERS
            </p>

            <h2>
              Най-продавани
            </h2>
          </div>

          <div className="best-sellers-heading-right">
            <a
              href="/shop"
              className="view-all-link"
            >
              Виж всички
              <span>→</span>
            </a>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="best-sellers-message">
            Зареждане на най-продаваните аромати...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="best-sellers-message">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="best-sellers-message">
              Все още няма достатъчно завършени
              поръчки за класация.
            </div>
          )}

        {/* PRODUCTS */}
        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="best-sellers-carousel">
              {products.map((product, index) => (
                <div
                  className="best-seller-item"
                  key={product._id}
                >
                  <ProductCard
                    product={product}
                    bestsellerRank={index + 1}
                  />
                </div>
              ))}
            </div>
          )}

      </div>
    </section>
  );
}

export default BestSellers;
