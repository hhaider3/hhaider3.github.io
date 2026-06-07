import React from 'react';
import { BookOpen, ArrowUpRight, Lock } from 'lucide-react';

const Publications = () => {
  return (
    <section id="publications" className="section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Journal Publications</h2>
          <div className="title-underline"></div>
        </div>

        <div className="publications-grid">
          {/* Publication 1 */}
          <div className="pub-card card scroll-animate fade-in-up">
            <div className="pub-badge"><BookOpen size={14} /> Mathematics (Journal)</div>
            <h3 className="pub-title">Neural network approaches for computation of soil thermal conductivity</h3>
            <p className="pub-authors">
              Rizvi Z.H., Akhtar S.J., Husain S.M.B., Khan M., <strong>Haider, H.</strong>, Naqvi S., Tirth V., Wuttke F. (2022).
            </p>
            <div className="pub-footer">
              <span className="pub-citation">Mathematics, 10(21), 3957</span>
              <a href="https://doi.org/10.3390/math10213957" target="_blank" rel="noreferrer" className="pub-link">
                Read Journal <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {/* Publication 2 */}
          <div className="pub-card card scroll-animate fade-in-up delay-1">
            <div className="pub-badge"><BookOpen size={14} /> Materials Today</div>
            <h3 className="pub-title">Effective thermal conductivity of sands estimated by Group Method of Data Handling</h3>
            <p className="pub-authors">
              Rizvi, Z.H., Baqir Husain, S.M., <strong>Haider, H.</strong>, Wuttke, F. (2020).
            </p>
            <div className="pub-footer">
              <span className="pub-citation">Materials Today: Proceedings, 26(2), 2103–2107</span>
              <span className="pub-link disabled">
                Proceedings <Lock size={16} />
              </span>
            </div>
          </div>

          {/* Publication 3 */}
          <div className="pub-card card scroll-animate fade-in-up delay-2">
            <div className="pub-badge"><BookOpen size={14} /> Materials Today</div>
            <h3 className="pub-title">Estimation of seismic wave velocities of metamorphic rocks using artificial neural network</h3>
            <p className="pub-authors">
              Rizvi, Z.H., Akhtar, S.J., <strong>Haider, H.</strong>, Follmann, J., Wuttke, F. (2019).
            </p>
            <div className="pub-footer">
              <span className="pub-citation">Materials Today: Proceedings, 26(2), 324–330</span>
              <span className="pub-link disabled">
                Proceedings <Lock size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Publications;
