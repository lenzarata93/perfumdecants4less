import "./BestSellers.css";
import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    brand: "MANCERA",
    name: "Red Tobacco",
    description: "Intense · Spicy · Woody",
    image: null,
    prices: {
      5: 5.25,
      10: 9.35,
      20: 17.3,
    },
    badge: "BESTSELLER",
  },
  {
    id: 2,
    brand: "MAISON FRANCIS KURKDJIAN",
    name: "Baccarat Rouge 540",
    description: "Amber · Woody · Floral",
    image: null,
    prices: {
      5: 30.65,
      10: 55.45,
      20: 101.8,
    },
    badge: "POPULAR",
  },
  {
    id: 3,
    brand: "VALENTINO",
    name: "Purple Melancholia",
    description: "Woody · Amber · Floral",
    image: null,
    prices: {
      5: 6,
      10: 11,
      20: 20,
    },
  },
  {
    id: 4,
    brand: "XERJOFF",
    name: "Naxos",
    description: "Honey · Tobacco · Vanilla",
    image: null,
    prices: {
      5: 12,
      10: 22,
      20: 40,
    },
    badge: "BESTSELLER",
  },
];

function BestSellers() {
  return (
    <section className="best-sellers-section">
      <div className="section-container">

        <div className="best-sellers-heading">
          <div>
            <p className="section-eyebrow">BESTSELLERS</p>

            <h2>
              Аромати, които
              <br />
              <span>говорят сами.</span>
            </h2>
          </div>

          <div className="best-sellers-heading-right">
            <p>
              Разгледай едни от най-търсените аромати
              в колекцията на PerfumDecants4Less.
            </p>

            <a href="/shop" className="view-all-link">
              Виж всички
              <span>→</span>
            </a>
          </div>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default BestSellers;