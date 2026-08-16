document.addEventListener("DOMContentLoaded", () => {

  // ======================================
  // GOLDZILLA CALCULATORS
  // ======================================

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


  // 1.00 Gold move = 10 pips
  // Example: 2420 → 2425 = 50 pips

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


// ======================================
// SUPABASE CONNECTION
// ======================================

const SUPABASE_API_URL =
  "https://byytggaamrkumrzckkjo.supabase.co/rest/v1/";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_W8n5btVgWBtlnNe24GXiGw_YPb1ERgd";


// ======================================
// GOLDZILLA LIVE DAILY LEVELS
// LAST 24 HOURS ONLY
// ======================================

async function loadGoldzillaZones() {

  const levelsSection =
    document.querySelector("#levels .table-wrap");

  if (!levelsSection) return;


  const last24Hours =
    new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();


  const url =
    SUPABASE_API_URL +
    "Daily_Zones" +
    "?select=id,created_at,type,zone_from,zone_to" +
    "&created_at=gte." +
    encodeURIComponent(last24Hours) +
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

      const errorText =
        await response.text();

      throw new Error(
        "Supabase Daily Levels Error: "
        + response.status
        + " "
        + errorText
      );
    }


    const zones =
      await response.json();


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


    let rows = "";


    zones.forEach(zone => {

      const type =
        String(
          zone.type || ""
        ).toUpperCase();


      const typeClass =
        type === "BUY"
          ? "buy"
          : "sell";


      const date =
        new Date(
          zone.created_at
        );


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


// ======================================
// GOLDZILLA RESULTS / PERFORMANCE
// PERMANENT HISTORY
// ======================================

async function loadGoldzillaResults() {

  try {

    const url =
      SUPABASE_API_URL +
      "Daily_Zones" +
      "?select=id,created_at,type,zone_from,zone_to,result_pips,Results_Status,result_note" +
      "&order=created_at.desc";


    const response = await fetch(url, {

      method: "GET",

      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Accept": "application/json"
      }

    });


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        "Supabase Results Error: "
        + response.status
        + " "
        + errorText
      );
    }


    const allRows =
      await response.json();


    // Only rows where result has been entered
    const completedResults =
      allRows.filter(row => {

        return (
          row.result_pips !== null &&
          row.result_pips !== ""
        );

      });


    // ======================================
    // PERFORMANCE CALCULATION
    // ======================================

    const totalTrades =
      completedResults.length;


    const wins =
      completedResults.filter(row =>

        Number(row.result_pips) > 0

      ).length;


    const losses =
      completedResults.filter(row =>

        Number(row.result_pips) < 0

      ).length;


    const winRate =
      totalTrades > 0
        ? (
            (wins / totalTrades) * 100
          ).toFixed(2)
        : "0.00";


    // ======================================
    // UPDATE TOP CARDS
    // ======================================

    const metricValues =
      document.querySelectorAll(
        "#results .metric strong"
      );


    if (metricValues.length >= 4) {

      metricValues[0].textContent =
        totalTrades;

      metricValues[1].textContent =
        wins;

      metricValues[2].textContent =
        losses;

      metricValues[3].textContent =
        winRate + "%";

    }


    // ======================================
    // RESULTS HISTORY
    // ======================================

    const resultsSection =
      document.querySelector("#results");


    if (!resultsSection) return;


    let historyBox =
      document.querySelector(
        "#goldzillaResultsHistory"
      );


    if (!historyBox) {

      historyBox =
        document.createElement("div");

      historyBox.id =
        "goldzillaResultsHistory";

      historyBox.style.marginTop =
        "35px";

      resultsSection.appendChild(
        historyBox
      );

    }


    if (!completedResults.length) {

      historyBox.innerHTML = `

        <div class="table-wrap">

          <div style="
            padding:45px 20px;
            text-align:center;
            color:#9ca4b3;
          ">

            No completed results yet.

          </div>

        </div>
      `;

      return;
    }


    let rowsHTML = "";


    completedResults.forEach(row => {

      const pips =
        Number(
          row.result_pips
        );


      // Use saved status if available
      const savedStatus =
        String(
          row.Results_Status || ""
        ).toUpperCase();


      const status =
        savedStatus ||
        (
          pips > 0
            ? "WIN"
            : pips < 0
            ? "LOSS"
            : "BE"
        );


      const statusClass =
        status === "WIN"
          ? "green"
          : status === "LOSS"
          ? "red"
          : "muted";


      const type =
        String(
          row.type || ""
        ).toUpperCase();


      const typeClass =
        type === "BUY"
          ? "buy"
          : "sell";


      const date =
        new Date(
          row.created_at
        );


      const formattedDate =
        date.toLocaleString([], {

          day: "2-digit",

          month: "short",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit"

        });


      const pipsText =
        pips > 0
          ? "+" + pips + " pips"
          : pips + " pips";


      rowsHTML += `

        <tr>

          <td>
            ${formattedDate}
          </td>


          <td>

            <span class="badge ${typeClass}">

              ${type}

            </span>

          </td>


          <td>

            ${row.zone_from}
            -
            ${row.zone_to}

          </td>


          <td class="${statusClass}">

            <strong>

              ${status}

            </strong>

          </td>


          <td class="${statusClass}">

            <strong>

              ${pipsText}

            </strong>

          </td>


          <td>

            ${row.result_note || "—"}

          </td>

        </tr>
      `;

    });


    historyBox.innerHTML = `

      <div style="
        margin-bottom:18px;
      ">

        <div class="eyebrow">

          RESULT HISTORY

        </div>


        <h2 style="
          margin:8px 0;
          font-size:30px;
        ">

          Complete Level Results

        </h2>


        <p class="muted">

          Permanent history of Goldzilla
          BUY and SELL zones.

        </p>

      </div>


      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>DATE & TIME</th>

              <th>TYPE</th>

              <th>ZONE</th>

              <th>STATUS</th>

              <th>RESULT</th>

              <th>NOTE</th>

            </tr>

          </thead>


          <tbody>

            ${rowsHTML}

          </tbody>

        </table>

      </div>
    `;


  } catch (error) {

    console.error(
      "Goldzilla Results Error:",
      error
    );

  }

}


// ======================================
// LOAD EVERYTHING
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadGoldzillaZones();

    loadGoldzillaResults();

  }
);


// ======================================
// AUTO REFRESH EVERY 60 SECONDS
// ======================================

setInterval(
  () => {

    loadGoldzillaZones();

    loadGoldzillaResults();

  },
  60000
);
