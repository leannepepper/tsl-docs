import Link from "next/link";

export default function Page() {
  return (
    <main className="home-hero">
      <div className="home-hero__content">
        <p className="home-hero__kicker">unofficial</p>
        <div
          className="home-hero__words"
          aria-label="Three Shader Language Docs"
        >
          <div>
            <span>T</span>
            hree
          </div>
          <div>
            <span>S</span>
            hader
          </div>
          <div>
            <span>L</span>
            anguage
          </div>
          <div>Docs</div>
        </div>
        <Link href="/api/tsl" className="home-hero__cta">
          Go to Docs
        </Link>
      </div>
    </main>
  );
}
