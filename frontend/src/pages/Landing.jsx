import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ArrowRight } from 'lucide-react';
import { Art, Spark } from '../components/Art';
import { Board } from '../components/Board';
const sample = [
  { _id: 1, title: 'A slow morning', icon: 'sun', color: 'cream', completed: true },
  { _id: 2, title: 'Read a few pages', icon: 'book', color: 'pink', completed: true },
  { _id: 3, title: 'A little fresh air', icon: 'leaf', color: 'green' },
];
export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link className="brand" to="/">
          fais<span>✳</span>
        </Link>
        <a href="#little-things">The little things</a>
        <div>
          <Link to="/login">Log in</Link>
          <Link className="button dark" to="/register">
            Get started <ArrowUpRight size={17} />
          </Link>
        </div>
      </nav>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <i /> A LITTLE STRUCTURE. A LOT MORE YOU.
            </span>
            <h1>
              Make today
              <br />
              <span>yours.</span>
              <span className="hero-spark">
                <Spark />
              </span>
            </h1>
            <p>
              Big plans start with little things.
              <br />A playful home for your tasks, routines,
              <br className="desktop-break" /> and the progress you make along the way.
            </p>
            <Link className="button yellow large" to="/register">
              Let’s make a little progress <ArrowUpRight size={20} />
            </Link>
            <span className="hero-footnote">Your pace. Your priorities. Your next small step.</span>
          </div>
          <div className="hero-board">
            <div className="paper-top">
              <span>YOUR DAILY DOSE OF DONE</span>
              <span>✳</span>
            </div>
            <div className="paper-title">
              <h2>
                One thing
                <br />
                at a time.
              </h2>
              <Art kind="plant" />
            </div>
            <div className="sample-label">SAMPLE PREVIEW</div>
            <Board routines={sample} compact />
            <div className="sample-task">
              <span className="check-button">
                <Check size={17} />
              </span>
              <span>Make time for what matters</span>
              <span>↗</span>
            </div>
            <div className="paper-bottom">
              <span>2 little wins. Keep going.</span>
              <span className="hand-note">you’ve got this ↗</span>
            </div>
            <span className="sticker">
              Small steps.
              <br />
              Good days.
            </span>
          </div>
        </section>
        <div className="ticker">
          <span>LESS OVERWHELM</span>
          <span>✳</span>
          <span>MORE LITTLE WINS</span>
          <span>✳</span>
          <span>A ROUTINE THAT FEELS LIKE YOU</span>
          <span>✳</span>
          <span>MAKE SPACE FOR LIFE</span>
        </div>
        <section id="little-things" className="landing-features">
          <div>
            <span className="eyebrow">A SOFTER WAY TO GET THINGS DONE</span>
            <h2>
              Good days are made
              <br />
              of little things.
            </h2>
          </div>
          <div className="feature-grid">
            {[
              [
                '01',
                'Find your focus',
                'Give your tasks a home. Choose what matters and take it one thing at a time.',
                'book',
              ],
              [
                '02',
                'Build your rhythm',
                'Turn everyday rituals into a playful board. Show up, check in, move forward.',
                'sun',
              ],
              [
                '03',
                'See how far you’ve come',
                'Your calendar and statistics make every small step visible.',
                'leaf',
              ],
            ].map(([n, title, copy, icon]) => (
              <article key={n}>
                <span className="eyebrow">{n}</span>
                <Art kind={icon} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <Art kind="cup" />
          <h2>A fresh page is waiting.</h2>
          <p>Create your account. Add a task. Make your first little move.</p>
          <Link className="button dark" to="/register">
            Start your day with Fais <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <Link className="brand" to="/">
          fais<span>✳</span>
        </Link>
        <span>To do. To make. To make it yours.</span>
        <span>A little progress, every day.</span>
      </footer>
    </div>
  );
}
