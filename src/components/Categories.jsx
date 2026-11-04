
import "./Categories.css";

const sizes = [
  {
    number: "01",
    size: "5",
    title: "Опитай",
    description:
      "Идеален размер за откриване на нов аромат.",
    tag: "DISCOVER",
  },
  {
    number: "02",
    size: "10",
    title: "Носи го",
    description:
      "Перфектният баланс за ежедневно носене.",
    tag: "EVERYDAY",
  },
  {
    number: "03",
    size: "20",
    title: "Запаси се",
    description:
      "За ароматите, които вече са сред любимите ти.",
    tag: "FAVORITE",
  },
];

function Categories() {
  return (
    <section id="categories" className="categories-section">
      <div className="section-container">

        <div className="categories-heading">

          <div>
            <p className="section-eyebrow">
              CHOOSE YOUR SIZE
            </p>

            <h2>
              Един аромат.
              <br />
              <span>Твоят размер.</span>
            </h2>
          </div>

          <p className="categories-intro">
            Не е нужно да купуваш цяла бутилка.
            Избери количеството, което отговаря
            на начина, по който носиш ароматите си.
          </p>

        </div>

        <div className="sizes-list">

          {sizes.map((item) => (
            <a
              href={`/shop?size=${item.size}`}
              className="size-row"
              key={item.size}
            >

              <div className="size-row-number">
                {item.number}
              </div>

              <div className="size-row-size">
                <strong>{item.size}</strong>
                <span>ML</span>
              </div>

              <div className="size-row-main">

                <span className="size-row-tag">
                  {item.tag}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

              </div>

              <div className="size-row-action">
                <span>Разгледай</span>
                <strong>→</strong>
              </div>

            </a>
          ))}

        </div>

        <div className="categories-note">

          <span className="categories-note-line"></span>

          <p>
            Всички размери са налични за избраните аромати
          </p>

          <span className="categories-note-line"></span>

        </div>

      </div>
    </section>
  );
}

export default Categories;
