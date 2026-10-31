import "./Benefits.css";

const benefits = [
  {
    number: "01",
    title: "Оригинални аромати",
    description:
      "Всеки аромат е оригинален парфюм, разливан в удобни за теб размери.",
  },
  {
    number: "02",
    title: "Точно колкото искаш",
    description:
      "Избираш 5, 10 или 20 ml и плащаш само за количеството, което ти е необходимо.",
  },
  {
    number: "03",
    title: "По-малък разход",
    description:
      "Опитай нишови и дизайнерски аромати, без да инвестираш в цяла бутилка.",
  },
  {
    number: "04",
    title: "Rewards",
    description:
      "С покупките си събираш точки, които ти дават участия за специални награди.",
  },
];

function Benefits() {
  return (
    <section className="benefits-section">
      <div className="section-container">

        <div className="benefits-heading">
          <div>
            <p className="section-eyebrow">WHY PERFUMDECANTS4LESS</p>

            <h2>
              Повече аромат.
              <br />
              <span>Повече стойност.</span>
            </h2>
          </div>

          <p>
            Създадохме PerfumDecants4Less за хора, които обичат
            парфюмите и искат свободата да откриват нови аромати.
          </p>
        </div>

        <div className="benefits-list">
          {benefits.map((benefit) => (
            <div
              className="benefit-item"
              key={benefit.number}
            >
              <span className="benefit-number">
                {benefit.number}
              </span>

              <div className="benefit-main">
                <h3>{benefit.title}</h3>

                <p>{benefit.description}</p>
              </div>

              <span className="benefit-arrow">↗</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Benefits;