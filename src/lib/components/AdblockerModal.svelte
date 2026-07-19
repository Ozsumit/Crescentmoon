<script>
  import { onMount } from "svelte";
  import { ShieldAlert, Info, ExternalLink } from "lucide-svelte";

  const adClassNames = [
    "adsbox",
    "ad-container",
    "advertisement",
    "banner-ad",
    "google-ad",
    "sponsored-content",
  ];

  let isVisible = $state(false);

  useEffect: {
    // We execute adblocker checks on mount
    onMount(() => {
      const createAdTrap = () => {
        const adElement = document.createElement("div");

        adClassNames.forEach((className) => {
          adElement.classList.add(className);
        });

        adElement.id = "ad-blocker-test";
        adElement.setAttribute("data-ad", "true");
        adElement.innerHTML = "&nbsp;";

        Object.assign(adElement.style, {
          position: "absolute",
          top: "-1px",
          left: "-1px",
          width: "1px",
          height: "1px",
          display: "block",
          background: "transparent",
          visibility: "visible",
        });

        document.body.appendChild(adElement);
      };

      createAdTrap();

      // Setup window flags
      window.AdBlock = true;
      window.uBlock = true;
      window.__adblockEnabled = true;

      if (window.chrome && window.chrome.runtime) {
        try {
          window.chrome.runtime.getManifest = () => ({
            name: "uBlock Origin",
            version: "1.0.0",
          });
        } catch {}
      }

      const hasAdBlocker = () => {
        const adBlockDetectionTests = [
          () => {
            if (window.chrome && window.chrome.runtime) {
              try {
                return Object.keys(
                  window.chrome.runtime.getManifest
                    ? window.chrome.runtime.getManifest()
                    : {},
                ).some((key) =>
                  /adblock|ublock|ghostery|privacy|adguard/i.test(key),
                );
              } catch (error) {
                return false;
              }
            }
            return false;
          },
          () => {
            const testAd = document.createElement("div");
            testAd.innerHTML = "&nbsp;";
            testAd.className = "adsbox";

            try {
              document.body.appendChild(testAd);
              const isHidden = window.getComputedStyle(testAd).display === "none";
              document.body.removeChild(testAd);
              return isHidden;
            } catch (error) {
              return false;
            }
          },
          () => {
            const globalAdBlockerChecks = [
              "AdBlock",
              "uBlock",
              "__adblockEnabled",
              "blockAdBlock",
            ];

            return globalAdBlockerChecks.some(
              (check) => window[check] || window[check] !== undefined,
            );
          },
        ];

        return adBlockDetectionTests.some((test) => test());
      };

      if (!hasAdBlocker()) {
        const storedVisitCount = localStorage.getItem("websiteVisitCount") || 0;
        const parsedCount = parseInt(storedVisitCount, 10);
        const newCount = parsedCount + 1;

        localStorage.setItem("websiteVisitCount", newCount.toString());

        if (newCount % 5 === 0) {
          isVisible = true;
          document.body.style.overflow = "hidden";
        }
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    });
  }

  function handleClose() {
    isVisible = false;
    document.body.style.overflow = "unset";
  }
</script>

{#if isVisible}
  <div class="ad-container adsbox banner-ad" data-ad="true">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div class="bg-card text-foreground rounded-2xl shadow-2xl border border-border w-full max-w-md mx-auto p-6 relative">
        <button
          onclick={handleClose}
          class="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div class="flex flex-col items-center text-center">
          <ShieldAlert class="text-primary mb-4" size={48} />
          <h2 class="text-2xl font-bold text-foreground mb-4">
            Enhance Your Browsing Experience
          </h2>

          <div class="bg-muted rounded-xl p-4 mb-4 text-left w-full border border-border">
            <div class="flex items-center mb-2">
              <Info class="text-primary mr-2" size={20} />
              <h3 class="text-lg font-semibold text-primary">
                Ad-Free Recommendation
              </h3>
            </div>
            <p class="text-muted-foreground text-sm">
              Our website is safe, but we recommend installing an adblocker to
              enhance your browsing experience and protect your privacy.
            </p>
          </div>

          <div class="flex flex-col space-y-3 w-full">
            <a
              href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center hover:opacity-90"
            >
              <ExternalLink class="mr-2" size={20} />
              Install uBlock Origin (Chrome)
            </a>

            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center hover:opacity-90"
            >
              <ExternalLink class="mr-2" size={20} />
              Install uBlock Origin (Firefox)
            </a>

            <a
              href="https://www.opera.com/mobile"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center hover:opacity-90"
            >
              <ExternalLink class="mr-2" size={20} />
              Download Opera Mobile
            </a>
          </div>

          <button
            onclick={handleClose}
            class="mt-4 text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            Close and Continue
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
