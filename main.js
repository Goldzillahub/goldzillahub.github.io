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
// GOLDZILLA RESULTS SYSTEM
// ======================================

let goldzillaResultsData = [];

let goldzillaCurrentPage = 1;

const GOLDZILLA_RESULTS_PER_PAGE = 20;


// ======================================
// LOAD ALL COMPLETED RESULTS
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


    goldzillaResultsData =
      allRows.filter(row => {

        return (
          row.result_pips !== null &&
          row.result_pips !== ""
        );

      });


    createGoldzillaResultFilters();

    renderGoldzillaResults();


  } catch (error) {

    console.error(
      "Goldzilla Results Error:",
      error
    );

  }

}


// ======================================
// MONTH + YEAR FILTERS
// ======================================

function createGoldzillaResultFilters() {

  const resultsSection =
    document.querySelector("#results");

  if (!resultsSection) return;


  let filterBox =
    document.querySelector(
      "#goldzillaResultFilters"
    );


  const currentMonth =
    document.querySelector(
      "#goldzillaMonthFilter"
    )?.value || "all";


  const currentYear =
    document.querySelector(
      "#goldzillaYearFilter"
    )?.value || "all";


  if (!filterBox) {

    filterBox =
      document.createElement("div");

    filterBox.id =
      "goldzillaResultFilters";


    const metrics =
      resultsSection.querySelector(".metrics");


    if (metrics) {

      metrics.insertAdjacentElement(
        "afterend",
        filterBox
      );

    }

  }


  filterBox.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:15px;
    flex-wrap:wrap;
    margin:25px 0;
    padding:15px 18px;
    background:#0d1018;
    border:1px solid #252b39;
    border-radius:12px;
  `;


  const years = [

    ...new Set(

      goldzillaResultsData.map(row =>

        new Date(
          row.created_at
        ).getFullYear()

      )

    )

  ].sort(
    (a, b) => b - a
  );


  let yearOptions =
    `<option value="all">All Years</option>`;


  years.forEach(year => {

    yearOptions += `

      <option value="${year}">
        ${year}
      </option>

    `;

  });


  filterBox.innerHTML = `

    <div>

      <strong style="
        display:block;
        font-size:12px;
        margin-bottom:4px;
      ">
        Results Archive
      </strong>

      <span style="
        color:#9ca4b3;
        font-size:10px;
      ">
        Filter performance by month or year
      </span>

    </div>


    <div style="
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    ">

      <select
        id="goldzillaMonthFilter"
        style="
          background:#080b12;
          color:white;
          border:1px solid #252b39;
          border-radius:8px;
          padding:10px 14px;
          min-width:150px;
          cursor:pointer;
        "
      >

        <option value="all">
          All Months
        </option>

        <option value="0">January</option>
        <option value="1">February</option>
        <option value="2">March</option>
        <option value="3">April</option>
        <option value="4">May</option>
        <option value="5">June</option>
        <option value="6">July</option>
        <option value="7">August</option>
        <option value="8">September</option>
        <option value="9">October</option>
        <option value="10">November</option>
        <option value="11">December</option>

      </select>


      <select
        id="goldzillaYearFilter"
        style="
          background:#080b12;
          color:white;
          border:1px solid #252b39;
          border-radius:8px;
          padding:10px 14px;
          min-width:130px;
          cursor:pointer;
        "
      >

        ${yearOptions}

      </select>

    </div>
  `;


  const monthFilter =
    document.querySelector(
      "#goldzillaMonthFilter"
    );


  const yearFilter =
    document.querySelector(
      "#goldzillaYearFilter"
    );


  monthFilter.value =
    currentMonth;


  if (
    [...yearFilter.options]
      .some(option =>
        option.value === currentYear
      )
  ) {

    yearFilter.value =
      currentYear;

  }


  monthFilter.addEventListener(
    "change",
    () => {

      goldzillaCurrentPage = 1;

      renderGoldzillaResults();

    }
  );


  yearFilter.addEventListener(
    "change",
    () => {

      goldzillaCurrentPage = 1;

      renderGoldzillaResults();

    }
  );

}


// ======================================
// FILTER RESULT DATA
// ======================================

function getGoldzillaFilteredResults() {

  const monthValue =
    document.querySelector(
      "#goldzillaMonthFilter"
    )?.value || "all";


  const yearValue =
    document.querySelector(
      "#goldzillaYearFilter"
    )?.value || "all";


  return goldzillaResultsData.filter(row => {

    const date =
      new Date(
        row.created_at
      );


    const monthMatch =
      monthValue === "all" ||
      date.getMonth() ===
        Number(monthValue);


    const yearMatch =
      yearValue === "all" ||
      date.getFullYear() ===
        Number(yearValue);


    return (
      monthMatch &&
      yearMatch
    );

  });

}


// ======================================
// RENDER RESULTS
// ======================================

function renderGoldzillaResults() {

  const completedResults =
    getGoldzillaFilteredResults();


  // ======================================
  // PERFORMANCE CARDS
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
  // HISTORY BOX
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
      "30px";

    resultsSection.appendChild(
      historyBox
    );

  }


  if (!completedResults.length) {

    historyBox.innerHTML = `

      <div class="table-wrap">

        <div style="
          padding:50px 20px;
          text-align:center;
          color:#9ca4b3;
        ">

          <h3 style="
            margin:0 0 8px;
            color:white;
          ">
            No Results Found
          </h3>

          No completed results found
          for the selected period.

        </div>

      </div>
    `;

    return;
  }


  // ======================================
  // PAGINATION
  // ======================================

  const totalPages =
    Math.ceil(
      completedResults.length /
      GOLDZILLA_RESULTS_PER_PAGE
    );


  if (
    goldzillaCurrentPage >
    totalPages
  ) {

    goldzillaCurrentPage =
      totalPages;

  }


  if (
    goldzillaCurrentPage < 1
  ) {

    goldzillaCurrentPage = 1;

  }


  const startIndex =
    (
      goldzillaCurrentPage - 1
    ) *
    GOLDZILLA_RESULTS_PER_PAGE;


  const endIndex =
    startIndex +
    GOLDZILLA_RESULTS_PER_PAGE;


  const pageResults =
    completedResults.slice(
      startIndex,
      endIndex
    );


  // ======================================
  // RESULTS ROWS
  // ======================================

  let rowsHTML = "";


  pageResults.forEach(row => {

    const pips =
      Number(
        row.result_pips
      );


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


  // ======================================
  // PAGE NUMBER BUTTONS
  // ======================================

  let pageButtons = "";


  const addPageButton =
    page => {

      pageButtons += `

        <button
          onclick="goToGoldzillaPage(${page})"
          style="
            min-width:38px;
            height:38px;
            padding:0 10px;
            border-radius:8px;

            border:1px solid ${
              page === goldzillaCurrentPage
                ? "#8b5cf6"
                : "#252b39"
            };

            background:${
              page === goldzillaCurrentPage
                ? "#8b5cf6"
                : "#0d1018"
            };

            color:white;

            cursor:pointer;

            font-weight:700;
          "
        >

          ${page}

        </button>
      `;

    };


  if (totalPages <= 7) {

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {

      addPageButton(page);

    }

  } else {

    addPageButton(1);


    if (
      goldzillaCurrentPage > 4
    ) {

      pageButtons += `

        <span style="
          color:#777;
          padding:8px 4px;
        ">
          ...
        </span>
      `;

    }


    const startPage =
      Math.max(
        2,
        goldzillaCurrentPage - 2
      );


    const endPage =
      Math.min(
        totalPages - 1,
        goldzillaCurrentPage + 2
      );


    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {

      addPageButton(page);

    }


    if (
      goldzillaCurrentPage <
      totalPages - 3
    ) {

      pageButtons += `

        <span style="
          color:#777;
          padding:8px 4px;
        ">
          ...
        </span>
      `;

    }


    addPageButton(
      totalPages
    );

  }


  // ======================================
  // FINAL RESULT HISTORY HTML
  // ======================================

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

        Showing

        ${startIndex + 1}

        -

        ${Math.min(
          endIndex,
          completedResults.length
        )}

        of

        ${completedResults.length}

        results

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


    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      gap:7px;
      flex-wrap:wrap;
      margin-top:25px;
    ">


      <button
        onclick="previousGoldzillaPage()"
        ${goldzillaCurrentPage === 1
          ? "disabled"
          : ""}
        style="
          padding:10px 15px;

          background:#0d1018;

          color:${
            goldzillaCurrentPage === 1
              ? "#555"
              : "white"
          };

          border:1px solid #252b39;

          border-radius:8px;

          cursor:${
            goldzillaCurrentPage === 1
              ? "not-allowed"
              : "pointer"
          };
        "
      >

        ← Previous

      </button>


      ${pageButtons}


      <button
        onclick="nextGoldzillaPage()"
        ${goldzillaCurrentPage === totalPages
          ? "disabled"
          : ""}
        style="
          padding:10px 15px;

          background:#0d1018;

          color:${
            goldzillaCurrentPage === totalPages
              ? "#555"
              : "white"
          };

          border:1px solid #252b39;

          border-radius:8px;

          cursor:${
            goldzillaCurrentPage === totalPages
              ? "not-allowed"
              : "pointer"
          };
        "
      >

        Next →

      </button>

    </div>


    <div style="
      text-align:center;
      color:#777;
      font-size:11px;
      margin-top:12px;
    ">

      Page

      ${goldzillaCurrentPage}

      of

      ${totalPages}

    </div>
  `;

}


// ======================================
// PAGE CONTROLS
// ======================================

function goToGoldzillaPage(page) {

  const filteredResults =
    getGoldzillaFilteredResults();


  const totalPages =
    Math.ceil(
      filteredResults.length /
      GOLDZILLA_RESULTS_PER_PAGE
    );


  if (
    page < 1 ||
    page > totalPages
  ) {

    return;

  }


  goldzillaCurrentPage =
    page;


  renderGoldzillaResults();


  document
    .querySelector(
      "#goldzillaResultsHistory"
    )
    ?.scrollIntoView({

      behavior: "smooth",

      block: "start"

    });

}


function nextGoldzillaPage() {

  const filteredResults =
    getGoldzillaFilteredResults();


  const totalPages =
    Math.ceil(
      filteredResults.length /
      GOLDZILLA_RESULTS_PER_PAGE
    );


  if (
    goldzillaCurrentPage <
    totalPages
  ) {

    goldzillaCurrentPage++;

    renderGoldzillaResults();

  }

}


function previousGoldzillaPage() {

  if (
    goldzillaCurrentPage > 1
  ) {

    goldzillaCurrentPage--;

    renderGoldzillaResults();

  }

}


// ======================================
// INITIAL LOAD
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
