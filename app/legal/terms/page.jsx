import LegalLayout from "../LegalLayout";

export default function TermsOfUse() {
  return (
    <LegalLayout title="Terms of Use" date="October 1, 2024">
      <h3>1. Acceptance of Terms</h3>
      <p>
        By accessing and using Crescent, you accept and agree to be bound by the
        terms and provision of this agreement.
      </p>

      <h3>2. Description of Service</h3>
      <p>
        Crescent is an independent movie and series discovery platform. The
        content provided is sourced from third-party APIs (TMDB) and we do not
        claim ownership over the posters, descriptions, or ratings displayed.
      </p>

      <h3>3. User Conduct</h3>
      <p>
        You agree to use the service for lawful purposes only. Any automated
        scraping, hacking, or abuse of the platform will result in an immediate
        IP ban.
      </p>
    </LegalLayout>
  );
}
