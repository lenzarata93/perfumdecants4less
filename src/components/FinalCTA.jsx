import "./FinalCTA.css";

function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-background"></div>

      <div className="final-cta-content">

        <div className="final-cta-label">
          <span></span>
          FIND YOUR SIGNATURE
          <span></span>
        </div>

        <h2>
          Не търси
          <br />
          <span>перфектния.</span>
          <br />
          Намери твоя.
        </h2>

        <p>
          Открий следващия си любим аромат.
          Избери размера и го направи част от твоята колекция.
        </p>

        <a
          href="/shop"
          className="final-cta-button"
        >
          Разгледай парфюмите

          <span className="final-cta-arrow">
            →
          </span>
        </a>

        <div className="final-cta-meta">
          <span>5 ML</span>
          <i></i>
          <span>10 ML</span>
          <i></i>
          <span>20 ML</span>
        </div>

      </div>
    </section>
  );
}

export default FinalCTA;