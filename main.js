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
// ===============================
// GOLDZILLA LIVE DAILY ZONES
// ===============================

const SUPABASE_API_URL =
  "https://byytggaamrkumrzckkjo.supabase.co/rest/v1/";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_W8n5btVgWBtlnNe24GXiGw_YPb1ERgd";


async function loadGoldzillaZones() {

  const levelsSection =
    document.querySelector("#levels .table-wrap");

  if (!levelsSection) return;


  // Last 24 hours only
  const last24Hours =
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();


  const url =
    SUPABASE_API_URL +
    "Daily_Zones" +
    "?select=id,created_at,type,zone_from,zone_to" +
    "&created_at=gte." + encodeURIComponent(last24Hours) +
    "&order=created_at.desc";


  try {

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Accept": "application/json"
      }
    });


    if (!response.ok) {
      throw new Error(
        "Supabase error: " + response.status
      );
    }


    const zones = await response.json();


    // No active zones
    if (!zones.length) {

      levelsSection.innerHTML = `
        <div style="
          text-align:center;
          padding:50px 20px;
          color:#9ca4b3;
        ">
          <h3 style="
            color:white;
            margin-bottom:8px;
          ">
            No Active Levels
          </h3>

          <p>
            Today's Goldzilla BUY / SELL zones
            will appear here.
          </p>
        </div>
      `;

      return;
    }


    // Create table
    let rows = "";


    zones.forEach(zone => {

      const type =
        String(zone.type || "").toUpperCase();


      const typeClass =
        type === "BUY"
          ? "buy"
          : "sell";


      const date =
        new Date(zone.created_at);


      const updated =
        date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });


      rows += `
        <tr>

          <td>
            <span class="badge ${typeClass}">
              ${type}
            </span>
          </td>

          <td>
            <strong>
              ${zone.zone_from}
            </strong>
          </td>

          <td>
            <strong>
              ${zone.zone_to}
            </strong>
          </td>

          <td class="muted">
            ${updated}
          </td>

        </tr>
      `;

    });


    levelsSection.innerHTML = `
      <table>

        <thead>
          <tr>
            <th>TYPE</th>
            <th>ZONE FROM</th>
            <th>ZONE TO</th>
            <th>UPDATED</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>
    `;


  } catch (error) {

    console.error(
      "Goldzilla Daily Zones Error:",
      error
    );


    levelsSection.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        color:#ff6575;
      ">
        Unable to load Daily Levels.
      </div>
    `;

  }

}


// Load zones when website opens
document.addEventListener(
  "DOMContentLoaded",
  loadGoldzillaZones
);


// Refresh every 60 seconds
setInterval(
  loadGoldzillaZones,
  60000
);
