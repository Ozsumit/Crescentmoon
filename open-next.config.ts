import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  cloudflare: {
    useWorkerdCondition: false,
  },
  minify: true,
});
