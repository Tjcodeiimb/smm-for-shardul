export default function LandingPage() {
  return (
    <section className="hero">
      <video className="hero-video" src="/hero.mp4" autoPlay muted loop playsInline />
      <a className="signup" href="/signup">Sign Up</a>
      <div className="hero-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="logo" src="/logo.png" alt="UpCreate" />
        <h1 className="tagline">
          <span className="t-sans">Define Your</span> <span className="t-serif">Brand</span>
        </h1>
        <div className="hero-cta">
          <a className="hero-signin" href="/login">Sign In</a>
          <a className="hero-signup" href="/signup">Create an account</a>
        </div>
      </div>
    </section>
  );
}
