document.addEventListener("DOMContentLoaded", () => {

  const risk = () => {
    const balance =
      +document.querySelector("#riskBalance")?.value || 0;

    const percent =
      +document.querySelector("#riskPercent")?.value || 0;

    const output =
      document.querySelector("#riskOut");

    if (output) {
      output.textContent =
        "$" + (balance * percent / 100).toFixed(2);
    }
  };


  const rr = () => {
    const riskAmount =
      +document.querySelector("#rrRisk")?.value || 1;

    const rewardAmount =
      +document.querySelector("#rrReward")?.value || 0;

    const output =
      document.querySelector("#rrOut");

    if (output) {
      output.textContent =
        "1 : " + (rewardAmount / riskAmount).toFixed(2);
    }
  };


  // GOLD PIPS CALCULATOR
  // 1.00 Gold move = 10 pips
  // Example: 2420 to 2425 = 50 pips

  const pips = () => {
    const entry =
      +document.querySelector("#entry")?.value || 0;

    const exit =
      +document.querySelector("#exit")?.value || 0;

    const output =
      document.querySelector("#pipsOut");

    if (output) {
      const totalPips =
        Math.abs(exit - entry) * 10;

      output.textContent =
        Math.round(totalPips) + " pips";
    }
  };


  const positionSize = () => {
    const riskAmount =
      +document.querySelector("#posRisk")?.value || 0;

    const stopLoss =
      +document.querySelector("#posSL")?.value || 1;

    const output =
      document.querySelector("#posOut");

    if (output) {
      output.textContent =
        (riskAmount / (stopLoss * 10)).toFixed(2)
        + " lot";
    }
  };


  [
    ["riskBalance", risk],
    ["riskPercent", risk],

    ["rrRisk", rr],
    ["rrReward", rr],

    ["entry", pips],
    ["exit", pips],

    ["posRisk", positionSize],
    ["posSL", positionSize]

  ].forEach(([id, fn]) => {

    const element =
      document.querySelector("#" + id);

    if (element) {
      element.addEventListener("input", fn);
    }

  });


  risk();
  rr();
  pips();
  positionSize();

});
