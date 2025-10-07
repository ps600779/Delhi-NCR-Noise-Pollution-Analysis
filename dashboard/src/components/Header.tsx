/**
 * Header component for the dashboard
 */
export function Header() {
  return (
    <header className="bg-slate-900 text-white py-8 px-6 shadow-lg">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Delhi NCR Noise Pollution: A Spatiotemporal Analysis
        </h1>
        <p className="text-lg text-slate-300">
          An interactive dashboard presenting findings from 10 CPCB monitoring stations
        </p>
      </div>
    </header>
  );
}
