// race-flags/dom.js
export const DOM = {
  animatedFlagEl: document.getElementById("animated-flags"),
  trafficLightEl: document.getElementById("traffic-light"),
  goMessageEl: document.getElementById("go-message"),
  getLights: () => document.querySelectorAll("#traffic-light .light"),
  getFlagUnits: () => document.querySelectorAll(".flag-unit"),
};

export function createFlagStructure(
  rows,
  columns,
  animationDelayFactor,
  displacementFactor
) {
  for (let i = 0; i < columns; i++) {
    const column = document.createElement("div");
    column.classList.add("column");
    column.id = `column-${i}`;
    DOM.animatedFlagEl.appendChild(column);

    for (let j = 0; j < rows; j++) {
      const flagUnit = document.createElement("div");
      flagUnit.classList.add("flag-unit");
      flagUnit.style.setProperty(
        "animation-delay",
        `${i * animationDelayFactor}ms`
      );
      flagUnit.style.setProperty(
        "--displacement",
        `${i * displacementFactor}px`
      );
      column.appendChild(flagUnit);
    }
  }
}
