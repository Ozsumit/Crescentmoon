<script>
  import { onMount } from "svelte";
  import { fade, fly, scale } from "svelte/transition";

  let isVisible = $state(false);
  const particles = Array.from({ length: 12 });
  const title = "CRESCENT MOON";

  onMount(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (!hasSeenSplash) {
      isVisible = true;
      const timer = setTimeout(() => {
        isVisible = false;
        sessionStorage.setItem("hasSeenSplash", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  // Calculate coordinates for burst particles
  function getCoordinates(i) {
    const angle = (i * 360) / particles.length;
    const radians = (angle * Math.PI) / 180;
    const distance = 75;
    return {
      x: Math.cos(radians) * distance - 3,
      y: Math.sin(radians) * distance - 3,
    };
  }
</script>

{#if isVisible}
  <div
    out:fade={{ duration: 500 }}
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden select-none"
  >
    <!-- Ambient Background Glow -->
    <div class="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
      <div class="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/30 blur-[120px]" />
      <div class="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-secondary/30 blur-[120px]" />
    </div>

    <div class="relative flex flex-col items-center z-10 p-4">
      <!-- Interactive Logo Wrapper -->
      <div
        in:scale={{ start: 0.8, duration: 800 }}
        class="relative mb-8 cursor-pointer group"
      >
        <!-- Radial Particle Burst -->
        {#each particles as _, i}
          {@const coords = getCoordinates(i)}
          <div
            class="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-secondary particle-burst"
            style="--target-x: {coords.x}px; --target-y: {coords.y}px; animation-delay: 1.4s;"
          />
        {/each}

        <!-- Animated SVG Logo -->
        <svg
          class="w-24 h-24 text-primary filter drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] stroke-animation"
          viewBox="0 0 62 78"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="draw-path"
              d="m42.3281 11.8086c.0095.007.0291.026.0576.067.0549.081.1201.218.1836.437.3853 1.327.3158 2.67.4014 4.173.0327.575.152 1.123.372 1.66.3469.847.4865 1.646.3985 2.385-.0873.731-.4016 1.435-1.0166 2.096-.6024.648-.9436 1.337-1.0625 2.078-.1175.734-.0123 1.482.2148 2.244.4912 1.646 1.0504 3.174 1.3555 4.8.4637 2.473-.0858 4.757-1.2764 6.973-.8723 1.624-1.884 3.369-2.0596 5.405-.2617 3.036-.2696 6.104.4268 9.147.0987.431.2648.843.5527 1.184.2931.348.6867.592 1.1866.726.7446.199 1.1839.746 1.416 1.684l.1123.454.4609-.082c6.98-1.235 12.6268-4.397 17.0186-9.465-3.274 6.3-8.4217 10.823-15.168 13.763-8.0765 3.521-16.2948 3.368-24.6602.218l-.6904-.259.0147.737c.0625 3.202 1.0586 5.883 2.8847 8.328l.0049.008.0059.007c1.8139 2.249 3.9817 4.009 6.9619 4.504 2.5927.432 4.9158-.184 6.6709-2.359.4184-.519.7591-.769 1.0244-.859.228-.078.4446-.053.706.127.3849.265.5843.981-.0468 1.97-1.2426 1.948-3.1074 2.965-5.3731 3.248-4.31.54-7.7198-1.304-10.6611-4.384-2.9075-3.045-4.415-6.773-5.041-10.936-.4177-2.777-.6901-5.56-.7041-8.355-.022-4.372.347-8.626 2.082-12.633 1.7791-4.11 4.7834-7.017 8.7813-9.006 1.2576-.626 2.5804-1.293 3.7109-2.282 1.0917-.956 1.8968-2.119 2.1719-3.642.1615-.895-.016-1.724-.6602-2.391-1.3703-1.419-1.9944-2.964-1.5498-4.878.0827-.357.0251-.689-.0391-.952-.0746-.305-.1355-.46-.1709-.679-.2092-1.301-.4637-2.453-.2753-3.636.0306-.192.0668-.31.0986-.378.0041-.009.0084-.015.0117-.021.0076 0 .0172 0 .0283.003.0757.014.1938.055.3701.144.8669.436 1.6063 1.072 2.4092 1.746.2175.183.4571.332.7403.406.2869.076.5765.063.8779-.012.9662-.241 1.9397-.362 2.9053-.28.3709.032.7168-.019 1.0273-.187.3073-.166.5344-.422.7139-.719.461-.762.9943-1.456 1.6406-2.037.1667-.15.2914-.23.377-.267.0428-.018.0674-.022.0781-.023zm-10.3272 31.681c.2982.317.4953.54.6944.737 1.6044 1.589 2.1789 3.514 1.8935 5.745-.2155 1.685-.9347 3.18-1.9804 4.559-.227.299-.4425.628-.7178 1.021l-.6436.919 1.1133-.137c.409-.05.7717-.07 1.0859-.137.7994-.171 1.5002-.272 2.1123-.162.5771.103 1.1055.399 1.5596 1.112.1809.284.462.44.7832.441.282.001.5429-.118.751-.251l.334-.213-.1319-.374-.4609-1.324c-.7775-2.421-1.2973-4.91-1.7822-7.432-.3313-1.724-.9897-3.363-2.4805-4.569-.4119-.333-.8993-.671-1.7012-.773l-1.3798-.176z"
            />
            <path
              class="draw-path"
              d="m12.5555 6.58655c6.3407-4.841 13.334-7.093001 20.9951-6.4910009-6.2696 1.0660009-11.7316 3.9620009-16.2783 8.7400009-5.3775 5.65095-7.93643 12.44895-7.81253 20.25795l.0205.7591c.1854 5.726 1.90173 10.8779 5.11913 15.5109.1909.275.2942.514.3418.749.0479.237.0458.501-.0146.836-.7401 4.105-.7794 8.226-.2715 12.346-.2336-.083-.4953-.2029-.7832-.3669-.5464-.312-1.1567-.758-1.8096-1.319-1.3054-1.121-2.74763-2.671-4.15043-4.437-2.8121-3.54-5.4094-7.871-6.4296-11.224-4.0188-13.205.286-27.1251 11.07323-35.36105z"
            />
          </g>
        </svg>
      </div>

      <!-- Letter-by-letter introduction -->
      <h1 class="text-3xl md:text-4xl font-black tracking-widest text-foreground mb-6 flex select-none overflow-hidden h-12 items-center justify-center">
        {#each title.split("") as letter, index}
          <span
            in:fly={{ y: 50, duration: 600, delay: 500 + index * 60 }}
            class="inline-block"
            style="min-width: {letter === ' ' ? '0.6em' : 'auto'};"
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        {/each}
      </h1>

      <!-- Linear Progress Sync -->
      <div class="w-32 h-[3px] bg-muted/30 rounded-full overflow-hidden relative">
        <div class="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full loading-bar" />
      </div>
    </div>
  </div>
{/if}

<style>
  .particle-burst {
    transform: translate(-3px, -3px) scale(0);
    opacity: 0;
    animation: burst 0.7s ease-out forwards;
  }

  @keyframes burst {
    0% {
      transform: translate(-3px, -3px) scale(0);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translate(var(--target-x), var(--target-y)) scale(1);
      opacity: 0;
    }
  }

  .loading-bar {
    width: 100%;
    animation: load 2.3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }

  @keyframes load {
    0% {
      left: -100%;
    }
    100% {
      left: 0;
    }
  }

  .draw-path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw 1.4s ease-in-out forwards;
    fill-opacity: 0;
  }

  @keyframes draw {
    to {
      stroke-dashoffset: 0;
      fill-opacity: 1;
    }
  }
</style>
