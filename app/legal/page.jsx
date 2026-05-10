import LegalLayout from "./LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" date="October 1, 2024">
      <h3>1. Information We Collect</h3>
      <p>
        As a solo-developed application, Crescent prioritizes your privacy. We
        only collect the bare minimum data required to make the application
        function (such as saved movies, watchlists, and basic account details if
        you create an account).
      </p>

      <h3>2. How We Use Your Information</h3>
      <p>
        We do not sell, rent, or trade your personal information to third
        parties. Your data is strictly used to provide and improve your
        experience on Crescent.
      </p>

      <h3>3. Third-Party Services</h3>
      <p>
        We use the TMDB API to fetch movie data. TMDB may have its own privacy
        policies regarding how they handle API requests. Please refer to their
        respective documentation for more details.
      </p>
    </LegalLayout>
  );
}
