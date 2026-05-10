import LegalLayout from "../LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" date="October 1, 2024">
      <h3>1. What Are Cookies?</h3>
      <p>
        Cookies are small text files that are stored on your computer or mobile
        device when you visit a website. They allow the website to recognize
        your device and remember if you've been there before.
      </p>

      <h3>2. How We Use Cookies</h3>
      <p>
        We use essential cookies to keep you logged in and to save your local UI
        preferences (like dark mode or recent searches). We do not use intrusive
        third-party tracking cookies.
      </p>

      <h3>3. Managing Cookies</h3>
      <p>
        You can set your browser to refuse all or some browser cookies, or to
        alert you when websites set or access cookies. If you disable or refuse
        cookies, please note that some parts of this website may become
        inaccessible or not function properly.
      </p>
    </LegalLayout>
  );
}
